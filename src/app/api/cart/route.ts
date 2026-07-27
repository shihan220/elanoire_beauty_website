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

    const product = await prisma.product.findFirst({
      where: {
        id: body.productId,
        active: true,
        stockQuantity: { gt: 0 },
      },
      select: { stockQuantity: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'This product is not available right now.' },
        { status: 409 },
      );
    }

    const quantity = Math.max(1, Math.min(Number(body.quantity) || 1, 9, product.stockQuantity));

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

    const maxQuantity = Math.min(9, product.stockQuantity);

    if (item && item.quantity > maxQuantity) {
      await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId: body.productId,
          },
        },
        data: { quantity: maxQuantity },
      });
    }

    return NextResponse.json(await getUserCart(userId));
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const userId = await requireUserId();

  if (userId && items.length > 0) {
    const quantitiesByProductId = items.reduce<Map<string, number>>((quantities, item) => {
      if (!item.productId) return quantities;

      const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, 9));
      quantities.set(item.productId, quantity);

      return quantities;
    }, new Map<string, number>());
    const productIds = [...quantitiesByProductId.keys()];
    const activeProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        active: true,
        stockQuantity: { gt: 0 },
      },
      select: { id: true, stockQuantity: true },
    });
    const stockByProductId = new Map(
      activeProducts.map((product) => [product.id, product.stockQuantity]),
    );
    const validProductIds = productIds.filter((productId) => stockByProductId.has(productId));

    if (validProductIds.length > 0) {
      await prisma.$transaction(
        validProductIds.map((productId) => {
          const quantity = Math.min(
            quantitiesByProductId.get(productId) ?? 1,
            stockByProductId.get(productId) ?? 1,
          );

          return prisma.cartItem.upsert({
            where: {
              userId_productId: {
                userId,
                productId,
              },
            },
            update: { quantity },
            create: {
              userId,
              productId,
              quantity,
            },
          });
        }),
      );
    }

    return NextResponse.json(await getUserCart(userId));
  }

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
    const product = await prisma.product.findFirst({
      where: {
        id: body.productId,
        active: true,
        stockQuantity: { gt: 0 },
      },
      select: { stockQuantity: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'This product is not available right now.' },
        { status: 409 },
      );
    }

    const nextQuantity = Math.min(quantity, product.stockQuantity);

    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: body.productId,
        },
      },
      update: { quantity: nextQuantity },
      create: {
        userId,
        productId: body.productId,
        quantity: nextQuantity,
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
