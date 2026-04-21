'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { useCart } from '../components/cart/CartProvider';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value);
}

export default function CartPage() {
  const { items, subtotal, totalItems, updateQuantity, removeItem, clearCart } = useCart();
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function handleCheckout() {
    setCheckoutError('');
    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string; url?: string };

      if (!response.ok || !body.url) {
        setCheckoutError(body.message ?? 'Checkout could not be started. Please try again.');
        return;
      }

      window.location.href = body.url;
    } catch {
      setCheckoutError('Checkout could not be started. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <Navbar />
      <main className="pt-36 md:pt-44">
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-16 lg:gap-24 items-start mb-20">
            <div>
              <span className="text-xs font-medium tracking-[0.35em] uppercase text-stone-500 mb-6 block">
                Shopping Bag
              </span>
              <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-wide text-stone-900 mb-8">
                Your considered edit.
              </h1>
              <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                Review your selected skincare and makeup before moving into a secure checkout flow.
              </p>
            </div>

            <div className="border-t border-stone-300 pt-10">
              <div className="flex items-center justify-between gap-8">
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-3">
                    Items
                  </span>
                  <p className="text-3xl font-serif text-stone-900">{totalItems}</p>
                </div>
                <ShoppingBag size={42} strokeWidth={1.2} className="text-stone-900" />
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="border border-stone-200 bg-[#faf9f6] p-8 md:p-12 max-w-3xl">
              <h2 className="text-3xl font-serif text-stone-900 mb-4">
                Your bag is waiting.
              </h2>
              <p className="text-stone-600 font-light leading-relaxed mb-10 max-w-xl">
                Add products from the collection to begin building your ritual.
              </p>
              <Link href="/" className="inline-flex items-center justify-center px-10 py-4 bg-stone-900 text-[#faf9f6] text-sm tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 lg:gap-24 items-start">
              <div className="divide-y divide-stone-200 border-y border-stone-200">
                {items.map((item) => (
                  <article key={item.productId} className="py-8 grid grid-cols-[104px_1fr] sm:grid-cols-[132px_1fr_auto] gap-6 sm:gap-8 items-start">
                    <div className="aspect-[3/4] bg-stone-200 overflow-hidden">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-2">
                        {item.product.category}
                      </span>
                      <h2 className="text-xl md:text-2xl font-serif text-stone-900 mb-3">
                        {item.product.name}
                      </h2>
                      <p className="text-sm text-stone-600 font-light leading-relaxed max-w-md mb-6">
                        {item.product.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-stone-300">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.product.name}`}
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-10 w-10 flex items-center justify-center text-stone-900 hover:bg-stone-100 transition-colors"
                          >
                            <Minus size={14} strokeWidth={1.5} />
                          </button>
                          <span className="w-10 text-center text-sm text-stone-900">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.product.name}`}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-10 w-10 flex items-center justify-center text-stone-900 hover:bg-stone-100 transition-colors"
                          >
                            <Plus size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="col-start-2 sm:col-start-auto text-left sm:text-right">
                      <span className="text-sm text-stone-500 block mb-2">Line total</span>
                      <p className="text-stone-900 font-medium">{formatCurrency(item.lineTotal)}</p>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="border-t border-stone-300 pt-8 lg:sticky lg:top-32">
                <h2 className="text-3xl font-serif text-stone-900 mb-8">
                  Order Summary
                </h2>
                <div className="space-y-5 pb-8 border-b border-stone-200">
                  <div className="flex items-center justify-between gap-8 text-stone-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-8 text-stone-600">
                    <span>Estimated delivery</span>
                    <span>Calculated later</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-8 py-8">
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-500">Total</span>
                  <span className="text-2xl font-serif text-stone-900">{formatCurrency(subtotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-stone-900 text-[#faf9f6] py-4 px-8 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors"
                >
                  {isCheckingOut ? 'Opening Checkout' : 'Checkout'}
                </button>
                {checkoutError ? (
                  <p className="text-sm text-stone-600 font-light leading-relaxed mt-5" role="alert">
                    {checkoutError}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full mt-5 text-sm tracking-[0.2em] uppercase text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Clear Bag
                </button>
                <p className="text-sm text-stone-500 font-light leading-relaxed mt-8">
                  Checkout opens a secure Stripe session once payment keys are configured.
                </p>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
