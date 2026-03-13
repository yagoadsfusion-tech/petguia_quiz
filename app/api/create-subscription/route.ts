import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function parseCookie(cookieHeader: string | null, name: string): string {
  if (!cookieHeader) return '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

// Mapeamento dos preços introdutórios → preço de renovação
// Preços que NÃO estão aqui usam o fluxo de subscription simples (planos antigos)
const INTRODUCTORY_PRICE_MAP: Record<string, string> = {
  // Pay page (STRIPE_PRICES_SEMANAL) — PRODUÇÃO:
  'price_1T7ys66oqWcsG0cdnODbhaHM': 'price_1TAay26oqWcsG0cd3RZYTmbA', // 7 dias → quinzenal
  'price_1TAazj6oqWcsG0cdHEz2R0qo': 'price_1TAb1r6oqWcsG0cdtrhr2XyQ', // 28 dias → mensal
  'price_1TAb2W6oqWcsG0cdDaloEyKi': 'price_1TAb3C6oqWcsG0cdHn1h4fxL', // 84 dias → trimestral
  // Pay page (STRIPE_PRICES_SEMANAL) — TESTE:
  // 'price_1T82ry6oqWcsG0cdTqbgNVHZ': 'price_1TAckE6oqWcsG0cdfK11DZSA', // teste → fase 2 teste
  // Offer page
  'price_1TAbDP6oqWcsG0cd8GdA1SDg': 'price_1TAay26oqWcsG0cd3RZYTmbA', // 7 dias → quinzenal
  'price_1TAbEO6oqWcsG0cdW8u6CRSg': 'price_1TAb1r6oqWcsG0cdtrhr2XyQ', // 28 dias → mensal
  'price_1TAcQZ6oqWcsG0cdENFYCbaD': 'price_1TAb3C6oqWcsG0cdHn1h4fxL', // 84 dias → trimestral (offer)
  // Pay page — new week12
  'price_1TAcPF6oqWcsG0cdhNetZIYf': 'price_1TAb3C6oqWcsG0cdHn1h4fxL', // 84 dias → trimestral (pay)
};

// Duração da fase 1 em segundos (para calcular o end_date)
// A API clover não suporta "iterations" — usa-se end_date no lugar
const PHASE1_DURATION_SECONDS: Record<string, number> = {
  // PRODUÇÃO — Pay page:
  'price_1T7ys66oqWcsG0cdnODbhaHM': 7  * 86400, // 7 dias
  'price_1TAazj6oqWcsG0cdHEz2R0qo': 28 * 86400, // 4 semanas
  'price_1TAb2W6oqWcsG0cdDaloEyKi': 84 * 86400, // 12 semanas
  'price_1TAcPF6oqWcsG0cdhNetZIYf': 84 * 86400, // 84 dias (week12)
  // TESTE — Pay page:
  // 'price_1T82ry6oqWcsG0cdTqbgNVHZ': 3  * 60, // 3 minutos (teste de renovação)
  // Offer page (sempre produção):
  'price_1TAbDP6oqWcsG0cd8GdA1SDg': 7  * 86400,
  'price_1TAbEO6oqWcsG0cdW8u6CRSg': 28 * 86400,
  'price_1TAbF86oqWcsG0cdXOPPCIpC': 84 * 86400,
};

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });

  try {
    const { priceId, email } = await req.json();

    const cookieHeader = req.headers.get('cookie');
    const fbc = parseCookie(cookieHeader, '_fbc');
    const fbp = parseCookie(cookieHeader, '_fbp');
    const userAgent = req.headers.get('user-agent') ?? '';
    const ip = req.headers.get('x-forwarded-for') ?? '';
    const eventSourceUrl = req.headers.get('referer') ?? '';

    if (!priceId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Find or create customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : null;

    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    const renewalPriceId = INTRODUCTORY_PRICE_MAP[priceId];

    if (renewalPriceId) {
      // 2a. Subscription Schedule com 2 fases para preços introdutórios
      // Fase 1: preço introdutório (1 ciclo de cobrança)
      // Fase 2: preço de renovação (indefinido)
      // NOTE: payment_method_types omitido para suportar Apple Pay / Google Pay
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const phase1End = Math.floor(Date.now() / 1000) + (PHASE1_DURATION_SECONDS[priceId] ?? 30 * 86400);

      const schedule = await (stripe.subscriptionSchedules.create as any)({
        customer: customerId,
        start_date: 'now',
        end_behavior: 'release',
        phases: [
          {
            items: [{ price: priceId }],
            end_date: phase1End,
          },
          {
            items: [{ price: renewalPriceId }],
          },
        ],
      });

      const scheduleSubscriptionId = typeof schedule.subscription === 'string'
        ? schedule.subscription
        : schedule.subscription?.id;

      if (!scheduleSubscriptionId) {
        throw new Error('Subscription schedule did not generate a subscription');
      }

      // Recupera a subscription para obter a invoice gerada pelo schedule
      const subWithInvoice = await stripe.subscriptions.retrieve(scheduleSubscriptionId, {
        expand: ['latest_invoice'],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const draftInvoice = subWithInvoice.latest_invoice as any;

      // Schedules criam a invoice em estado 'draft' — precisa finalizar para gerar o PaymentIntent
      if (draftInvoice?.status === 'draft') {
        await stripe.invoices.finalizeInvoice(draftInvoice.id);
      }

      // Atualiza metadata e payment_settings na subscription
      await stripe.subscriptions.update(scheduleSubscriptionId, {
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        metadata: { fbc, fbp, user_agent: userAgent, ip, event_source_url: eventSourceUrl },
      });

      // Recupera novamente com o confirmation_secret expandido
      const subscription = await stripe.subscriptions.retrieve(scheduleSubscriptionId, {
        expand: ['latest_invoice.confirmation_secret'],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const latestInvoice = subscription.latest_invoice as any;
      const clientSecret = latestInvoice?.confirmation_secret?.client_secret;

      if (!clientSecret) {
        throw new Error('Failed to retrieve confirmation_secret from subscription schedule');
      }

      console.log(`[create-subscription] Schedule criado — sub: ${scheduleSubscriptionId}, fase1: ${priceId}, fase2: ${renewalPriceId}`);

      return NextResponse.json({
        subscriptionId: subscription.id,
        clientSecret,
      });
    }

    // 2b. Subscription simples para planos existentes (anual/semestral/mensal)
    // NOTE: payment_method_types omitido para suportar Apple Pay / Google Pay
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.confirmation_secret'],
      metadata: {
        fbc,
        fbp,
        user_agent: userAgent,
        ip,
        event_source_url: eventSourceUrl,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestInvoice = subscription.latest_invoice as any;
    const clientSecret = latestInvoice?.confirmation_secret?.client_secret;

    if (!clientSecret) {
      throw new Error('Failed to retrieve confirmation_secret from subscription');
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
