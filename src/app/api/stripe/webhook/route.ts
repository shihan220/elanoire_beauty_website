import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import type Stripe from 'stripe';
import { prisma } from '@/server/db';
import { getStripe } from '@/server/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown Stripe webhook error';
}

async function getOrderForCheckoutSession(checkoutSession: Stripe.Checkout.Session) {
  const order = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: checkoutSession.id },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!order) {
    console.warn('Stripe webhook received for an unknown checkout session.', {
      checkoutSessionId: checkoutSession.id,
    });
  }

  return order;
}

async function markCheckoutSessionPaid(checkoutSession: Stripe.Checkout.Session) {
  const order = await getOrderForCheckoutSession(checkoutSession);

  if (!order) return;

  if (checkoutSession.metadata?.userId && checkoutSession.metadata.userId !== order.userId) {
    console.warn('Stripe checkout session metadata did not match the order user.', {
      checkoutSessionId: checkoutSession.id,
      orderId: order.id,
    });
    return;
  }

  if (checkoutSession.payment_status !== 'paid') {
    console.warn('Stripe checkout session completed before payment was paid.', {
      checkoutSessionId: checkoutSession.id,
      orderId: order.id,
      paymentStatus: checkoutSession.payment_status,
    });
    return;
  }

  if (order.status === OrderStatus.FULFILLED) {
    return;
  }

  await prisma.order.updateMany({
    where: {
      id: order.id,
      status: {
        in: [OrderStatus.PENDING, OrderStatus.CANCELLED, OrderStatus.PAID],
      },
    },
    data: { status: OrderStatus.PAID },
  });

  await prisma.cartItem.deleteMany({
    where: { userId: order.userId },
  });
}

async function cancelPendingCheckoutSession(checkoutSession: Stripe.Checkout.Session) {
  const order = await getOrderForCheckoutSession(checkoutSession);

  if (!order) return;

  await prisma.order.updateMany({
    where: {
      id: order.id,
      status: OrderStatus.PENDING,
    },
    data: { status: OrderStatus.CANCELLED },
  });
}

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
  } catch (error) {
    console.warn('Stripe webhook signature verification failed.', {
      error: getErrorMessage(error),
    });
    return NextResponse.json({ message: 'Invalid Stripe signature.' }, { status: 400 });
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await markCheckoutSessionPaid(event.data.object as Stripe.Checkout.Session);
    }

    if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      await cancelPendingCheckoutSession(event.data.object as Stripe.Checkout.Session);
    }
  } catch (error) {
    console.error('Stripe webhook processing failed.', {
      eventId: event.id,
      eventType: event.type,
      error: getErrorMessage(error),
    });

    return NextResponse.json({ message: 'Webhook processing failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
