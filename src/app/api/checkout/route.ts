import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { getCurrentSession } from '@/server/auth';
import { checkoutRequestSchema, formatCheckoutValidationErrors } from '@/server/checkout';
import { prisma } from '@/server/db';
import { releaseOrderStock, reserveOrderStock, StockUnavailableError } from '@/server/order-stock';
import { getAppUrl, getStripe } from '@/server/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown checkout error';
}

async function cancelPendingOrder(orderId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      });
      const cancelled = await tx.order.updateMany({
        where: {
          id: orderId,
          status: OrderStatus.PENDING,
        },
        data: { status: OrderStatus.CANCELLED },
      });

      if (cancelled.count > 0 && order) {
        await releaseOrderStock(tx, order.items);
      }
    });
  } catch (error) {
    console.error('Failed to cancel pending checkout order.', {
      orderId,
      error: getErrorMessage(error),
    });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Please sign in before checkout.' }, { status: 401 });
  }

  const checkoutDetails = checkoutRequestSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!checkoutDetails.success) {
    return NextResponse.json(
      {
        message: 'Please review your billing details.',
        errors: formatCheckoutValidationErrors(checkoutDetails.error),
      },
      { status: 400 },
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

  const invalidCartItems = cartItems.filter(
    (item) =>
      item.quantity < 1 ||
      item.quantity > 9 ||
      !item.product.active ||
      item.product.stockQuantity < item.quantity,
  );

  if (invalidCartItems.length > 0) {
    console.warn('Checkout blocked because the persisted cart contains invalid items.', {
      userId: session.user.id,
      invalidItemCount: invalidCartItems.length,
    });

    return NextResponse.json(
      { message: 'Please refresh your bag before checkout.' },
      { status: 409 },
    );
  }

  const subtotalPence = cartItems.reduce(
    (total, item) => total + item.product.pricePence * item.quantity,
    0,
  );
  const { billing, paymentMethod, saveBillingInfo } = checkoutDetails.data;
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { message: 'Stripe checkout is not configured yet.' },
      { status: 503 },
    );
  }

  let order: { id: string };

  try {
    order = await prisma.$transaction(async (tx) => {
      await reserveOrderStock(
        tx,
        cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );

      if (saveBillingInfo) {
        await tx.billingProfile.updateMany({
          where: {
            userId: session.user.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });

        await tx.billingProfile.create({
          data: {
            userId: session.user.id,
            fullName: billing.fullName,
            email: billing.email,
            phone: billing.phone,
            country: billing.country,
            line1: billing.line1,
            line2: billing.line2,
            city: billing.city,
            region: billing.region,
            postcode: billing.postcode,
            isDefault: true,
          },
        });
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          subtotalPence,
          totalPence: subtotalPence,
          currency: 'GBP',
          billingName: billing.fullName,
          billingEmail: billing.email,
          billingPhoneNumber: billing.phone,
          billingCountry: billing.country,
          billingLine1: billing.line1,
          billingLine2: billing.line2,
          billingCity: billing.city,
          billingState: billing.region,
          billingPostcode: billing.postcode,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              pricePence: item.product.pricePence,
              quantity: item.quantity,
            })),
          },
        },
        select: {
          id: true,
        },
      });
    });
  } catch (error) {
    if (error instanceof StockUnavailableError) {
      return NextResponse.json(
        { message: 'One or more products in your bag are no longer available in that quantity.' },
        { status: 409 },
      );
    }

    console.error('Checkout order creation failed.', {
      userId: session.user.id,
      error: getErrorMessage(error),
    });

    return NextResponse.json(
      { message: 'Checkout could not be prepared. Please try again.' },
      { status: 500 },
    );
  }

  try {
    const appUrl = getAppUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: [paymentMethod],
      customer_email: billing.email,
      client_reference_id: order.id,
      billing_address_collection: 'auto',
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
        billingEmail: billing.email,
        paymentMethod,
      },
      payment_intent_data: {
        receipt_email: billing.email,
        metadata: {
          orderId: order.id,
          userId: session.user.id,
          billingEmail: billing.email,
        },
      },
      success_url: `${appUrl}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?checkout=cancelled`,
    }, {
      idempotencyKey: `checkout-session:${order.id}`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    });

    if (!checkoutSession.url) {
      throw new Error('Stripe Checkout session did not return a redirect URL.');
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout session creation failed.', {
      userId: session.user.id,
      orderId: order.id,
      error: getErrorMessage(error),
    });

    await cancelPendingOrder(order.id);

    return NextResponse.json(
      { message: 'Checkout could not be started. Please try again.' },
      { status: 502 },
    );
  }
}
