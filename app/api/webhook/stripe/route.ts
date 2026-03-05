import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1/receipts';

const TRACKED_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
]);

async function notifyRevenueCat(appUserId: string, fetchToken: string) {
  const res = await fetch(REVENUECAT_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_REVENUECAT_API_KEY}`,
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

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      subscriptionId = subscription.id;
      customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscriptionId = (invoice as any).subscription as string | undefined;
      customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;
    }

    if (!subscriptionId || !customerId) {
      console.warn(`[Webhook] Evento ${event.type} sem subscriptionId ou customerId`);
      return NextResponse.json({ received: true, skipped: true });
    }

    // Busca o email do customer no Stripe para usar como appUserId
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.warn(`[Webhook] Customer ${customerId} foi deletado`);
      return NextResponse.json({ received: true, skipped: true });
    }

    const appUserId = customer.email ?? customerId;

    await notifyRevenueCat(appUserId, subscriptionId);

    console.log(`[Webhook] RevenueCat notificado — evento: ${event.type}, userId: ${appUserId}, sub: ${subscriptionId}`);
    return NextResponse.json({ received: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] Erro ao processar evento ${event.type}:`, message);
    // Retorna 200 para o Stripe não retentar — o erro foi interno nosso
    return NextResponse.json({ received: true, error: message });
  }
}
