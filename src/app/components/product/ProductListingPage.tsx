import { Product } from '@/data/products';
import { Footer } from '../Footer';
import { Navbar } from '../Navbar';
import { ProductCard } from './ProductCard';

type ProductListingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  searchQuery?: string;
};

export function ProductListingPage({
  eyebrow,
  title,
  description,
  products,
  searchQuery = '',
}: ProductListingPageProps) {
  const normalisedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleProducts = normalisedSearchQuery
    ? products.filter((product) =>
        [
          product.name,
          product.category,
          product.description,
        ].some((value) => value.toLowerCase().includes(normalisedSearchQuery)),
      )
    : products;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <Navbar />
      <main className="pt-36 md:pt-44">
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16 lg:gap-24 items-end mb-20">
            <div>
              <span className="text-xs font-medium tracking-[0.35em] uppercase text-stone-500 mb-6 block">
                {eyebrow}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-wide text-stone-900 mb-8">
                {title}
              </h1>
              <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                {description}
              </p>
              {searchQuery ? (
                <p className="text-stone-500 text-sm tracking-[0.2em] uppercase mt-8">
                  Search: {searchQuery}
                </p>
              ) : null}
            </div>
            <div className="border-t border-stone-300 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <span className="text-xs tracking-[0.2em] uppercase text-stone-500">
                {visibleProducts.length} pieces
              </span>
              <span className="text-xs tracking-[0.2em] uppercase text-stone-500">
                Curated Sort
              </span>
            </div>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-14">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-stone-200 bg-[#faf9f6] p-8 md:p-12 max-w-3xl">
              <h2 className="text-3xl font-serif text-stone-900 mb-4">
                No pieces found.
              </h2>
              <p className="text-stone-600 font-light leading-relaxed max-w-xl">
                Try a different search across skincare, makeup, or fragrance.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
