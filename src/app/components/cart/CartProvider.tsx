'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProductById, type Product } from '@/data/products';

type StoredCartItem = {
  productId: string;
  quantity: number;
};

export type CartLineItem = StoredCartItem & {
  product: Product;
  lineTotal: number;
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

// TODO(cart): move cart persistence to a session-aware backend once checkout authentication is available.

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [storedItems, setStoredItems] = useState<StoredCartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    const rawCart = window.localStorage.getItem(storageKey);
    if (!rawCart) {
      setHasLoadedCart(true);
      return;
    }

    try {
      const parsedCart = JSON.parse(rawCart) as StoredCartItem[];
      setStoredItems(parsedCart.filter((item) => getProductById(item.productId)));
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setHasLoadedCart(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;
    window.localStorage.setItem(storageKey, JSON.stringify(storedItems));
  }, [hasLoadedCart, storedItems]);

  const items = useMemo<CartLineItem[]>(() => {
    return storedItems.flatMap((item) => {
      const product = getProductById(item.productId);
      if (!product) return [];

      return {
        ...item,
        product,
        lineTotal: product.price * item.quantity,
      };
    });
  }, [storedItems]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  function addItem(productId: string) {
    setStoredItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === productId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + 1, 9) }
            : item,
        );
      }

      return [...currentItems, { productId, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setStoredItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, 9) }
          : item,
      ),
    );
  }

  function removeItem(productId: string) {
    setStoredItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    setStoredItems([]);
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
