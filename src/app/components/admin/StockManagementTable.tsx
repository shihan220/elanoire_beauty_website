'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminProductRecord } from '@/types/admin';
import { formatCategoryLabel, formatCurrencyFromPence, getStockStatus } from './admin-helpers';

type StockMutationResult = {
  error?: string;
};

export function StockManagementTable({
  products,
  savingProductId,
  onUpdateStock,
}: {
  products: AdminProductRecord[];
  savingProductId: string | null;
  onUpdateStock: (productId: string, stockQuantity: number) => Promise<StockMutationResult>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDrafts(
      Object.fromEntries(products.map((product) => [product.id, String(product.stockQuantity)])),
    );
  }, [products]);

  const sortedProducts = useMemo(
    () => [...products].sort((left, right) => {
      if (left.active !== right.active) return left.active ? -1 : 1;
      if (left.stockQuantity !== right.stockQuantity) return left.stockQuantity - right.stockQuantity;
      return left.name.localeCompare(right.name);
    }),
    [products],
  );

  async function handleSave(product: AdminProductRecord) {
    const nextValue = Number.parseInt(drafts[product.id] ?? String(product.stockQuantity), 10);

    if (!Number.isFinite(nextValue) || nextValue < 0) {
      setRowErrors((current) => ({
        ...current,
        [product.id]: 'Enter a stock quantity of zero or more.',
      }));
      return;
    }

    const result = await onUpdateStock(product.id, nextValue);

    if (result.error) {
      setRowErrors((current) => ({
        ...current,
        [product.id]: result.error ?? 'Stock could not be updated.',
      }));
      return;
    }

    setRowErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[product.id];
      return nextErrors;
    });
  }

  return (
    <section className="border border-stone-200 bg-white/80 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
            Stock Updates
          </span>
          <h3 className="text-2xl font-serif text-stone-900">Inventory visibility at a glance</h3>
        </div>
        <p className="text-sm text-stone-500">Update stock inline without leaving the dashboard.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-stone-200 text-[11px] tracking-[0.24em] uppercase text-stone-500">
              <th className="py-4 pr-6 font-medium">Product</th>
              <th className="py-4 pr-6 font-medium">Category</th>
              <th className="py-4 pr-6 font-medium">Price</th>
              <th className="py-4 pr-6 font-medium">Stock</th>
              <th className="py-4 pr-6 font-medium">Status</th>
              <th className="py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => {
              const status = getStockStatus(product.stockQuantity, product.active);
              const isSaving = savingProductId === product.id;

              return (
                <tr key={product.id} className="border-b border-stone-100 align-top">
                  <td className="py-5 pr-6">
                    <p className="text-sm text-stone-900">{product.name}</p>
                    <p className="mt-2 text-xs text-stone-500">{product.slug}</p>
                  </td>
                  <td className="py-5 pr-6 text-sm text-stone-600">{formatCategoryLabel(product.category)}</td>
                  <td className="py-5 pr-6 text-sm text-stone-600">{formatCurrencyFromPence(product.pricePence)}</td>
                  <td className="py-5 pr-6">
                    <input
                      type="number"
                      min={0}
                      value={drafts[product.id] ?? String(product.stockQuantity)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDrafts((current) => ({ ...current, [product.id]: value }));
                      }}
                      className="w-24 border border-stone-300 bg-transparent px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
                      aria-label={`Stock quantity for ${product.name}`}
                    />
                    {rowErrors[product.id] ? (
                      <p className="mt-2 text-xs text-[var(--elanoire-color-destructive)]">
                        {rowErrors[product.id]}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-5 pr-6">
                    <span className={`inline-flex items-center border px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${status.toneClassName}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleSave(product)}
                      disabled={isSaving}
                      className="text-xs tracking-[0.22em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? 'Saving' : 'Save'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
