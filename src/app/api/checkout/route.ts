import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/server/auth';
import { prisma } from '@/server/db';
import { getAppUrl, getStripe } from '@/server/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Please sign in before checkout.' }, { status: 401 });
  }

  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { message: 'Stripe checkout is not configured yet.' },
      { status: 503 },
    );
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ message: 'Your bag is empty.' }, { status: 400 });
  }

  const subtotalPence = cartItems.reduce(
    (total, item) => total + item.product.pricePence * item.quantity,
    0,
  );

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      subtotalPence,
      totalPence: subtotalPence,
      currency: 'GBP',
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          pricePence: item.product.pricePence,
          quantity: item.quantity,
        })),
      },
    },
  });

  try {
    const appUrl = getAppUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: session.user.email ?? undefined,
      line_items: cartItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.product.name,
            description: item.product.description,
            images: item.product.image.startsWith('http') ? [item.product.image] : undefined,
          },
          unit_amount: item.product.pricePence,
        },
      })),
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      success_url: `${appUrl}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart?checkout=cancelled`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    });

    if (!checkoutSession.url) {
      throw new Error('Stripe Checkout session did not return a redirect URL.');
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json(
      { message: 'Checkout could not be started. Please try again.' },
      { status: 502 },
    );
  }
}
