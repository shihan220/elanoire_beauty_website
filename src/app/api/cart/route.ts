import { NextResponse } from 'next/server';
import { calculateCartSummary, calculateDatabaseCartSummary, type CartRequestItem } from '@/server/cart';
import { getCurrentSession } from '@/server/auth';
import { prisma } from '@/server/db';

type CartRequestBody = {
  items?: CartRequestItem[];
  productId?: string;
  quantity?: number;
};

async function requireUserId() {
  const session = await getCurrentSession();

  return session?.user?.id ?? null;
}

async function getUserCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: { product: true },
  });

  return calculateDatabaseCartSummary(items);
}

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json(await getUserCart(userId));
}

export async function POST(request: Request) {
  const body = (await request.json()) as CartRequestBody;

  if (body.productId) {
    const userId = await requireUserId();

    if (!userId) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const quantity = Math.max(1, Math.min(Number(body.quantity) || 1, 9));

    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: body.productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        productId: body.productId,
        quantity,
      },
    });

    const item = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: body.productId,
        },
      },
      select: { quantity: true },
    });

    if (item && item.quantity > 9) {
      await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId: body.productId,
          },
        },
        data: { quantity: 9 },
      });
    }

    return NextResponse.json(await getUserCart(userId));
  }

  const items = Array.isArray(body.items) ? body.items : [];

  return NextResponse.json(calculateCartSummary(items));
}

export async function PATCH(request: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const body = (await request.json()) as CartRequestBody;

  if (!body.productId) {
    return NextResponse.json({ message: 'Product id is required.' }, { status: 400 });
  }

  const quantity = Math.max(0, Math.min(Number(body.quantity) || 0, 9));

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId: body.productId,
      },
    });
  } else {
    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: body.productId,
        },
      },
      update: { quantity },
      create: {
        userId,
        productId: body.productId,
        quantity,
      },
    });
  }

  return NextResponse.json(await getUserCart(userId));
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CartRequestBody;

  await prisma.cartItem.deleteMany({
    where: {
      userId,
      ...(body.productId ? { productId: body.productId } : {}),
    },
  });

  return NextResponse.json(await getUserCart(userId));
}
