import { getProductById } from '@/data/products';

export type CartRequestItem = {
  productId: string;
  quantity: number;
};

export function normaliseCartItems(items: CartRequestItem[]) {
  return items.flatMap((item) => {
    const product = getProductById(item.productId);
    const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, 9));

    if (!product) return [];

    return {
      productId: item.productId,
      quantity,
      product,
      lineTotal: product.price * quantity,
    };
  });
}

export function calculateCartSummary(items: CartRequestItem[]) {
  const lineItems = normaliseCartItems(items);
  const totalItems = lineItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = lineItems.reduce((total, item) => total + item.lineTotal, 0);

  return {
    items: lineItems,
    totalItems,
    subtotal,
    currency: 'GBP',
  };
}
