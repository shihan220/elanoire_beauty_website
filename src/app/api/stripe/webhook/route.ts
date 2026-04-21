import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/server/db';
import { getStripe } from '@/server/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ message: 'Stripe webhook is not configured.' }, { status: 503 });
  }

  if (!signature) {
    return NextResponse.json({ message: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ message: 'Invalid Stripe signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const userId = checkoutSession.metadata?.userId;

    await prisma.order.updateMany({
      where: {
        stripeCheckoutSessionId: checkoutSession.id,
        ...(userId ? { userId } : {}),
      },
      data: { status: 'PAID' },
    });

    if (userId) {
      await prisma.cartItem.deleteMany({
        where: { userId },
      });
    }
  }

  if (event.type === 'checkout.session.expired') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    await prisma.order.updateMany({
      where: {
        stripeCheckoutSessionId: checkoutSession.id,
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' },
    });
  }

  return NextResponse.json({ received: true });
}
