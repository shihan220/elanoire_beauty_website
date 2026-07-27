import type { Prisma } from '@prisma/client';

type StockLineItem = {
  productId: string | null;
  quantity: number;
};

export class StockUnavailableError extends Error {
  constructor() {
    super('One or more products are no longer available in the requested quantity.');
    this.name = 'StockUnavailableError';
  }
}

function buildProductQuantities(items: StockLineItem[]) {
  return items.reduce<Map<string, number>>((quantities, item) => {
    if (!item.productId) return quantities;

    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity,
    );

    return quantities;
  }, new Map<string, number>());
}

export async function reserveOrderStock(
  tx: Prisma.TransactionClient,
  items: StockLineItem[],
) {
  const productQuantities = buildProductQuantities(items);

  for (const [productId, quantity] of productQuantities) {
    const reserved = await tx.product.updateMany({
      where: {
        id: productId,
        active: true,
        stockQuantity: { gte: quantity },
      },
      data: {
        stockQuantity: { decrement: quantity },
      },
    });

    if (reserved.count !== 1) {
      throw new StockUnavailableError();
    }
  }
}

export async function releaseOrderStock(
  tx: Prisma.TransactionClient,
  items: StockLineItem[],
) {
  const productQuantities = buildProductQuantities(items);

  for (const [productId, quantity] of productQuantities) {
    await tx.product.updateMany({
      where: { id: productId },
      data: {
        stockQuantity: { increment: quantity },
      },
    });
  }
}

export async function removePurchasedCartItems(
  tx: Prisma.TransactionClient,
  userId: string,
  items: StockLineItem[],
) {
  const productQuantities = buildProductQuantities(items);

  for (const [productId, quantity] of productQuantities) {
    const cartItem = await tx.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: { quantity: true },
    });

    if (!cartItem) continue;

    const nextQuantity = cartItem.quantity - quantity;

    if (nextQuantity <= 0) {
      await tx.cartItem.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      continue;
    }

    await tx.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: { quantity: nextQuantity },
    });
  }
}
