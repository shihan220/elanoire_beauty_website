'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '../cart/CartProvider';

export function ProductAddButton({
  productId,
  label = 'Add to Bag',
  fullWidth = false,
}: {
  productId: string;
  label?: string;
  fullWidth?: boolean;
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem(productId)}
      className={`${fullWidth ? 'w-full' : 'w-max'} bg-stone-900 text-[#faf9f6] py-4 px-8 flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors`}
    >
      <ShoppingBag size={17} strokeWidth={1.5} />
      {label}
    </button>
  );
}
