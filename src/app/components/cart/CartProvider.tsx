'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getProductById, type Product } from '@/data/products';

type StoredCartItem = {
  productId: string;
  quantity: number;
};

export type CartLineItem = StoredCartItem & {
  product: Product;
  lineTotal: number;
};

type CartSummary = {
  items: CartLineItem[];
};

type CartContextValue = {
  items: CartLineItem[];
  totalItems: number;
  subtotal: number;
  addItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = 'elanoire-cart';

function buildLineItems(items: StoredCartItem[]) {
  return items.flatMap((item) => {
    const product = getProductById(item.productId);
    if (!product) return [];

    return {
      ...item,
      product,
      lineTotal: product.price * item.quantity,
    };
  });
}

function normaliseItems(items: CartLineItem[]) {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));
}

async function syncCart(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>) {
  const response = await fetch('/api/cart', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) return null;

  return (await response.json()) as CartSummary;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    const rawCart = window.localStorage.getItem(storageKey);
    let localItems: StoredCartItem[] = [];

    try {
      localItems = rawCart ? (JSON.parse(rawCart) as StoredCartItem[]) : [];
    } catch {
      window.localStorage.removeItem(storageKey);
    }

    setItems(buildLineItems(localItems));
    setHasLoadedCart(true);

    syncCart('GET').then(async (serverCart) => {
      if (!serverCart) return;

      if (serverCart.items.length === 0 && localItems.length > 0) {
        const syncedCart = await syncCart('POST', { items: localItems });

        if (syncedCart) {
          setItems(syncedCart.items);
          return;
        }
      }

      setItems(serverCart.items);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;
    window.localStorage.setItem(storageKey, JSON.stringify(normaliseItems(items)));
  }, [hasLoadedCart, items]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  function addItem(productId: string) {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === productId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + 1, 9), lineTotal: item.product.price * Math.min(item.quantity + 1, 9) }
            : item,
        );
      }

      return [...currentItems, ...buildLineItems([{ productId, quantity: 1 }])];
    });

    syncCart('POST', { productId, quantity: 1 }).then((serverCart) => {
      if (serverCart) setItems(serverCart.items);
    }).catch(() => undefined);
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    const nextQuantity = Math.min(quantity, 9);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: nextQuantity, lineTotal: item.product.price * nextQuantity }
          : item,
      ),
    );

    syncCart('PATCH', { productId, quantity: nextQuantity }).then((serverCart) => {
      if (serverCart) setItems(serverCart.items);
    }).catch(() => undefined);
  }

  function removeItem(productId: string) {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));

    syncCart('DELETE', { productId }).then((serverCart) => {
      if (serverCart) setItems(serverCart.items);
    }).catch(() => undefined);
  }

  function clearCart() {
    setItems([]);

    syncCart('DELETE').then((serverCart) => {
      if (serverCart) setItems(serverCart.items);
    }).catch(() => undefined);
  }

  const value = {
    items,
    totalItems,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
