'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AdminProductPayload, AdminProductRecord } from '@/types/admin';
import { adminCategoryOptions, formatCategoryLabel, formatCurrencyFromPence, getStockStatus } from './admin-helpers';

type ProductMutationResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type EditableProductDraft = {
  name: string;
  category: AdminProductPayload['category'];
  price: string;
  stockQuantity: string;
  image: string;
  description: string;
};

const emptyCreateForm: EditableProductDraft = {
  name: '',
  category: 'SKINCARE',
  price: '',
  stockQuantity: '12',
  image: '',
  description: '',
};

function draftFromProduct(product: AdminProductRecord): EditableProductDraft {
  return {
    name: product.name,
    category: product.category,
    price: (product.pricePence / 100).toFixed(2),
    stockQuantity: String(product.stockQuantity),
    image: product.image,
    description: product.description,
  };
}

function parseProductPayload(draft: EditableProductDraft): ProductMutationResult & { payload?: AdminProductPayload } {
  const price = Number.parseFloat(draft.price);
  const stockQuantity = Number.parseInt(draft.stockQuantity, 10);
  const fieldErrors: Record<string, string> = {};

  if (!draft.name.trim()) fieldErrors.name = 'Product name is required.';
  if (!Number.isFinite(price) || price < 1) fieldErrors.price = 'Enter a price of at least £1.00.';
  if (!Number.isFinite(stockQuantity) || stockQuantity < 0) fieldErrors.stockQuantity = 'Stock cannot be negative.';
  if (!draft.image.trim()) fieldErrors.image = 'Image URL is required.';
  if (!draft.description.trim()) fieldErrors.description = 'Description is required.';

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    payload: {
      name: draft.name.trim(),
      category: draft.category,
      pricePence: Math.round(price * 100),
      stockQuantity,
      image: draft.image.trim(),
      description: draft.description.trim(),
    },
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-2 text-xs text-[var(--elanoire-color-destructive)]">{message}</p>;
}

function ProductRow({
  product,
  draft,
  fieldErrors,
  isBusy,
  isConfirmingDelete,
  onChange,
  onSave,
  onDeleteToggle,
  onDeleteConfirm,
}: {
  product: AdminProductRecord;
  draft: EditableProductDraft;
  fieldErrors?: Record<string, string>;
  isBusy: boolean;
  isConfirmingDelete: boolean;
  onChange: (productId: string, key: keyof EditableProductDraft, value: string) => void;
  onSave: (productId: string) => void;
  onDeleteToggle: (productId: string | null) => void;
  onDeleteConfirm: (productId: string) => void;
}) {
  const status = getStockStatus(product.stockQuantity, product.active);

  return (
    <article className={`border border-stone-200 bg-white/70 p-6 ${product.active ? '' : 'opacity-75'}`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-xl font-serif text-stone-900">{product.name}</h4>
            <span className={`inline-flex items-center border px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${status.toneClassName}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-3 text-sm text-stone-500">
            {formatCategoryLabel(product.category)} · {formatCurrencyFromPence(product.pricePence)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onSave(product.id)}
            disabled={isBusy}
            className="text-xs tracking-[0.22em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isBusy ? 'Saving' : 'Save Changes'}
          </button>
          {isConfirmingDelete ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onDeleteConfirm(product.id)}
                disabled={isBusy}
                className="text-xs tracking-[0.22em] uppercase text-[var(--elanoire-color-destructive)] border-b border-[var(--elanoire-color-destructive)] pb-1 disabled:opacity-60"
              >
                Confirm Remove
              </button>
              <button
                type="button"
                onClick={() => onDeleteToggle(null)}
                disabled={isBusy}
                className="text-xs tracking-[0.22em] uppercase text-stone-500 border-b border-stone-300 pb-1 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onDeleteToggle(product.id)}
              disabled={isBusy}
              className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-stone-500 border-b border-stone-300 pb-1 hover:text-[var(--elanoire-color-destructive)] hover:border-[var(--elanoire-color-destructive)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={14} strokeWidth={1.5} />
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
            Product Name
          </label>
          <input
            type="text"
            value={draft.name}
            onChange={(event) => onChange(product.id, 'name', event.target.value)}
            className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
          />
          <FieldError message={fieldErrors?.name} />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
            Category
          </label>
          <select
            value={draft.category}
            onChange={(event) => onChange(product.id, 'category', event.target.value)}
            className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
          >
            {adminCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
            Price (GBP)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={draft.price}
            onChange={(event) => onChange(product.id, 'price', event.target.value)}
            className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
          />
          <FieldError message={fieldErrors?.price} />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
            Stock
          </label>
          <input
            type="number"
            min="0"
            value={draft.stockQuantity}
            onChange={(event) => onChange(product.id, 'stockQuantity', event.target.value)}
            className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
          />
          <FieldError message={fieldErrors?.stockQuantity} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
            Image URL
          </label>
          <input
            type="url"
            value={draft.image}
            onChange={(event) => onChange(product.id, 'image', event.target.value)}
            className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
          />
          <FieldError message={fieldErrors?.image} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
            Description
          </label>
          <textarea
            rows={3}
            value={draft.description}
            onChange={(event) => onChange(product.id, 'description', event.target.value)}
            className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors resize-y"
          />
          <FieldError message={fieldErrors?.description} />
        </div>
      </div>
    </article>
  );
}

export function ProductManagementTable({
  products,
  dataMode,
  creating,
  busyProductId,
  onCreate,
  onUpdate,
  onDelete,
}: {
  products: AdminProductRecord[];
  dataMode: 'database' | 'mock';
  creating: boolean;
  busyProductId: string | null;
  onCreate: (payload: AdminProductPayload) => Promise<ProductMutationResult>;
  onUpdate: (productId: string, payload: AdminProductPayload) => Promise<ProductMutationResult>;
  onDelete: (productId: string) => Promise<ProductMutationResult>;
}) {
  const [createDraft, setCreateDraft] = useState(emptyCreateForm);
  const [drafts, setDrafts] = useState<Record<string, EditableProductDraft>>({});
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, Record<string, string>>>({});
  const [formMessage, setFormMessage] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(products.map((product) => [product.id, draftFromProduct(product)])),
    );
  }, [products]);

  const sortedProducts = useMemo(
    () => [...products].sort((left, right) => {
      if (left.active !== right.active) return left.active ? -1 : 1;
      return left.name.localeCompare(right.name);
    }),
    [products],
  );

  async function handleCreate() {
    const parsed = parseProductPayload(createDraft);

    if (!parsed.payload) {
      setCreateErrors(parsed.fieldErrors ?? {});
      return;
    }

    const result = await onCreate(parsed.payload);

    if (result.error || result.fieldErrors) {
      setCreateErrors(result.fieldErrors ?? {});
      setFormMessage(result.error ?? 'The product could not be added.');
      return;
    }

    setCreateDraft(emptyCreateForm);
    setCreateErrors({});
    setFormMessage('Product added to the admin catalogue.');
  }

  async function handleSave(productId: string) {
    const draft = drafts[productId];
    if (!draft) return;

    const parsed = parseProductPayload(draft);

    if (!parsed.payload) {
      setRowErrors((current) => ({
        ...current,
        [productId]: parsed.fieldErrors ?? {},
      }));
      return;
    }

    const result = await onUpdate(productId, parsed.payload);

    if (result.error || result.fieldErrors) {
      setRowErrors((current) => ({
        ...current,
        [productId]: result.fieldErrors ?? (result.error ? { general: result.error } : {}),
      }));
      setFormMessage(result.error ?? 'The product could not be updated.');
      return;
    }

    setRowErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[productId];
      return nextErrors;
    });
    setFormMessage('Product details saved.');
  }

  async function handleDelete(productId: string) {
    const result = await onDelete(productId);

    if (result.error) {
      setFormMessage(result.error);
      return;
    }

    setConfirmingDeleteId(null);
    setFormMessage('Product removed from the storefront and archived for admin review.');
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
            Product Management
          </span>
          <h3 className="text-2xl font-serif text-stone-900">Update catalogue content without leaving the dashboard</h3>
        </div>
        <p className="text-sm text-stone-500">
          {dataMode === 'database'
            ? 'Changes write through to PostgreSQL-backed products.'
            : 'Database is unavailable, so this section is running in temporary mock mode.'}
        </p>
      </div>

      {formMessage ? (
        <div className="border border-stone-200 bg-white/75 px-5 py-4">
          <p className="text-sm text-stone-600">{formMessage}</p>
        </div>
      ) : null}

      <div className="border border-stone-200 bg-white/80 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <Plus size={18} strokeWidth={1.5} className="text-stone-900" />
          <h4 className="text-xl font-serif text-stone-900">Add a new product</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Product Name
            </label>
            <input
              type="text"
              value={createDraft.name}
              onChange={(event) => setCreateDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
            />
            <FieldError message={createErrors.name} />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Category
            </label>
            <select
              value={createDraft.category}
              onChange={(event) => setCreateDraft((current) => ({ ...current, category: event.target.value as AdminProductPayload['category'] }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
            >
              {adminCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Price (GBP)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={createDraft.price}
              onChange={(event) => setCreateDraft((current) => ({ ...current, price: event.target.value }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
            />
            <FieldError message={createErrors.price} />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Stock
            </label>
            <input
              type="number"
              min="0"
              value={createDraft.stockQuantity}
              onChange={(event) => setCreateDraft((current) => ({ ...current, stockQuantity: event.target.value }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
            />
            <FieldError message={createErrors.stockQuantity} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Image URL
            </label>
            <input
              type="url"
              value={createDraft.image}
              onChange={(event) => setCreateDraft((current) => ({ ...current, image: event.target.value }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
            />
            <FieldError message={createErrors.image} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Description
            </label>
            <textarea
              rows={3}
              value={createDraft.description}
              onChange={(event) => setCreateDraft((current) => ({ ...current, description: event.target.value }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors resize-y"
            />
            <FieldError message={createErrors.description} />
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="mt-8 bg-stone-900 text-[#faf9f6] px-8 py-4 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? 'Adding Product' : 'Add Product'}
        </button>
      </div>

      <div className="space-y-6">
        {sortedProducts.map((product) => (
          <div key={product.id}>
            <ProductRow
              product={product}
              draft={drafts[product.id] ?? draftFromProduct(product)}
              fieldErrors={rowErrors[product.id]}
              isBusy={busyProductId === product.id}
              isConfirmingDelete={confirmingDeleteId === product.id}
              onChange={(productId, key, value) => {
                setDrafts((current) => ({
                  ...current,
                  [productId]: {
                    ...(current[productId] ?? draftFromProduct(product)),
                    [key]: value,
                  },
                }));
              }}
              onSave={handleSave}
              onDeleteToggle={setConfirmingDeleteId}
              onDeleteConfirm={handleDelete}
            />
            {rowErrors[product.id]?.general ? (
              <p className="mt-3 text-sm text-[var(--elanoire-color-destructive)]">
                {rowErrors[product.id]?.general}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
