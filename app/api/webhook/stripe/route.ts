import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendTikTokEvent } from '@/lib/tiktokEvents';
import { sendMetaPurchaseEvent } from '@/lib/metaEvents';

const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1/receipts';

const TRACKED_EVENTS = new Set([
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function notifyRevenueCat(appUserId: string, fetchToken: string) {
  const res = await fetch(REVENUECAT_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REVENUECAT_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Platform': 'stripe',
    },
    body: JSON.stringify({
      app_user_id: appUserId,
      fetch_token: fetchToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RevenueCat responded ${res.status}: ${body}`);
  }
}

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET não configurado');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Webhook] Assinatura inválida:', message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (!TRACKED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    let subscriptionId: string | undefined;
    let customerId: string | undefined;
    let invoicePriceId: string | undefined;
    let invoice: Stripe.Invoice | undefined;

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      subscriptionId = subscription.id;
      customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    } else if (event.type === 'invoice.payment_succeeded') {
      invoice = event.data.object as Stripe.Invoice;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inv = invoice as any;

      // Na API 2026-02-25.clover, invoice.subscription foi depreciado.
      // O campo migrou para invoice.parent.subscription_details.subscription.
      const subFromParent =
        inv.parent?.type === 'subscription_details'
          ? inv.parent?.subscription_details?.subscription
          : undefined;
      const subLegacy = inv.subscription;
      subscriptionId = (typeof subFromParent === 'string' ? subFromParent : subFromParent?.id)
        ?? (typeof subLegacy === 'string' ? subLegacy : subLegacy?.id);

      customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;
      invoicePriceId = inv.lines?.data?.[0]?.price?.id;
    }

    if (!subscriptionId || !customerId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inv = invoice as any;
      console.warn('[Webhook] invoice.payment_succeeded sem subscriptionId ou customerId — diagnóstico:', {
        invoiceId:       inv?.id,
        customerId:      inv?.customer,
        subscription:    inv?.subscription,
        parentType:      inv?.parent?.type,
        parentSubId:     inv?.parent?.subscription_details?.subscription,
        paymentIntent:   inv?.payment_intent,
        amountPaid:      inv?.amount_paid,
      });
      return NextResponse.json({ received: true, skipped: true });
    }

    // Busca o email do customer no Stripe para usar como appUserId
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.warn(`[Webhook] Customer ${customerId} foi deletado`);
      return NextResponse.json({ received: true, skipped: true });
    }

    // Para pagamentos: sincroniza customer.email com o email de cobrança real,
    // pois o usuário pode ter alterado o email no checkout (PaymentElement).
    let customerEmail = customer.email;
    if (event.type === 'invoice.payment_succeeded' && invoice) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawPi = (invoice as any).payment_intent;
      const paymentIntentId = typeof rawPi === 'string' ? rawPi : rawPi?.id;
      if (paymentIntentId) {
        try {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ['latest_charge'],
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const charge = (pi as any).latest_charge;
          const billingEmail = typeof charge === 'object' ? (charge?.billing_details?.email as string | null) : null;
          if (billingEmail && billingEmail !== customerEmail) {
            await stripe.customers.update(customerId, { email: billingEmail });
            customerEmail = billingEmail;
          }
        } catch (err) {
          console.warn('[Webhook] Não foi possível sincronizar email do customer (não bloqueia):', err);
        }
      }
    }

    const appUserId = customerEmail ?? customerId;

    // Envia eventos de compra ao TikTok e Meta apenas em pagamentos confirmados
    if (event.type === 'invoice.payment_succeeded' && invoice) {
      await notifyRevenueCat(appUserId, subscriptionId);
      if (customer.email && invoicePriceId) {
        await sendTikTokEvent({
          event: 'CompletePayment',
          email: customer.email,
          priceId: invoicePriceId,
        });
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const meta = subscription.metadata ?? {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawPi = (invoice as any).payment_intent;
        const paymentIntentId = typeof rawPi === 'string' ? rawPi : rawPi?.id;

        await sendMetaPurchaseEvent({
          eventId: paymentIntentId ?? invoice.id,
          value: (invoice.amount_paid ?? 0) / 100,
          email: customer.email ?? undefined,
          fbc: meta.fbc || undefined,
          fbp: meta.fbp || undefined,
          userAgent: meta.user_agent || undefined,
          ip: meta.ip || undefined,
          eventSourceUrl: meta.event_source_url || undefined,
          numItems: 1,
        });

        // Sincroniza subscription ativa no Supabase
        try {
          const supabase = getSupabaseAdmin();
          if (supabase) {
            const { error } = await supabase
              .from('subscriptions')
              .update({
                status: 'active',
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                will_renew: !subscription.cancel_at_period_end,
                last_webhook_event: 'invoice.payment_succeeded',
                webhook_updated_at: new Date().toISOString(),
              })
              .eq('external_id', subscriptionId);
            if (error) {
              console.error('[Supabase] Erro ao atualizar subscription:', error.message);
            } else {
              console.log(`[Supabase] subscription atualizada: ${subscriptionId}`);
            }
          }
        } catch (supabaseErr: unknown) {
          const msg = supabaseErr instanceof Error ? supabaseErr.message : 'Unknown error';
          console.error('[Supabase] Exceção ao atualizar subscription (não bloqueia webhook):', msg);
        }
      } catch (metaErr: unknown) {
        const msg = metaErr instanceof Error ? metaErr.message : 'Unknown error';
        console.error('[Meta] Falha ao enviar evento Purchase (não bloqueia webhook):', msg);
      }
    }

    // Sincroniza subscription cancelada no Supabase
    if (event.type === 'customer.subscription.deleted') {
      try {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'expired',
              will_renew: false,
              last_webhook_event: 'customer.subscription.deleted',
              webhook_updated_at: new Date().toISOString(),
            })
            .eq('external_id', subscriptionId);
          if (error) {
            console.error('[Supabase] Erro ao cancelar subscription:', error.message);
          } else {
            console.log(`[Supabase] subscription atualizada: ${subscriptionId}`);
          }
        }
      } catch (supabaseErr: unknown) {
        const msg = supabaseErr instanceof Error ? supabaseErr.message : 'Unknown error';
        console.error('[Supabase] Exceção ao cancelar subscription (não bloqueia webhook):', msg);
      }
    }

    console.log(`[Webhook] RevenueCat notificado — evento: ${event.type}, userId: ${appUserId}, sub: ${subscriptionId}`);
    return NextResponse.json({ received: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] Erro ao processar evento ${event.type}:`, message);
    // Retorna 200 para o Stripe não retentar — o erro foi interno nosso
    return NextResponse.json({ received: true, error: message });
  }
}
