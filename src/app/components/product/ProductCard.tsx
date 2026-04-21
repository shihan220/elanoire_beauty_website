import Link from 'next/link';
import type { Product } from '@/data/products';
import { ProductAddButton } from './ProductAddButton';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] mb-7 overflow-hidden bg-stone-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </Link>
      <span className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
        {product.category}
      </span>
      <Link href={`/products/${product.slug}`} className="block">
        <h2 className="text-xl md:text-2xl font-serif text-stone-900 mb-3 group-hover:text-stone-600 transition-colors">
          {product.name}
        </h2>
      </Link>
      <p className="text-sm text-stone-600 font-light leading-relaxed mb-5 flex-grow">
        {product.description}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <span className="text-sm text-stone-900 font-medium">{product.priceLabel}</span>
        <ProductAddButton productId={product.id} />
      </div>
    </article>
  );
}
