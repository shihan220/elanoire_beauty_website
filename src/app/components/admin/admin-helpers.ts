import type { AdminProductCategory } from '@/types/admin';

export const adminCategoryOptions: Array<{ value: AdminProductCategory; label: string }> = [
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'FRAGRANCE', label: 'Fragrance' },
];

export function formatCurrencyFromPence(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value / 100);
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatCategoryLabel(category: AdminProductCategory) {
  return adminCategoryOptions.find((option) => option.value === category)?.label ?? category;
}

export function getStockStatus(stockQuantity: number, active: boolean) {
  if (!active) {
    return {
      label: 'Archived',
      toneClassName: 'border-stone-200 text-stone-500 bg-white/70',
    };
  }

  if (stockQuantity <= 0) {
    return {
      label: 'Out of Stock',
      toneClassName: 'border-[color:var(--elanoire-color-destructive)]/20 text-[color:var(--elanoire-color-destructive)] bg-[color:var(--elanoire-color-destructive)]/5',
    };
  }

  if (stockQuantity <= 5) {
    return {
      label: 'Low Stock',
      toneClassName: 'border-amber-300 text-amber-700 bg-amber-50',
    };
  }

  return {
    label: 'In Stock',
    toneClassName: 'border-stone-300 text-stone-700 bg-[#faf9f6]',
  };
}
