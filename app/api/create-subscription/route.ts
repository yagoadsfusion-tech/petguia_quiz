import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });

  try {
    const { priceId, email } = await req.json();

    if (!priceId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Find or create customer
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let customerId = customers.data.length > 0 ? customers.data[0].id : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
      });
      customerId = customer.id;
    }

    // 2. Create subscription with correct expansion for confirmation_secret
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.confirmation_secret'],
    });

    // 3. Extract the client_secret from the expanded confirmation_secret
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestInvoice = subscription.latest_invoice as any;
    
    // Check if confirmation_secret exists and has a client_secret
    const clientSecret = latestInvoice?.confirmation_secret?.client_secret;

    if (!clientSecret) {
      throw new Error('Failed to retrieve confirmation_secret from subscription');
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
