import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { Navbar } from '../../components/Navbar';
import { ProductAddButton } from '../../components/product/ProductAddButton';
import { getProductBySlug } from '@/server/products';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const backHref = product.category === 'Fragrance' ? '/products' : `/${product.category.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-[#faf9f6]">
      <Navbar />
      <main className="pt-36 md:pt-44">
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <Link href={backHref} className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-stone-500 hover:text-stone-900 transition-colors mb-12">
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back to {product.category}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-24 items-start">
            <div className="aspect-[4/5] bg-stone-200 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:sticky lg:top-32">
              <span className="text-xs font-medium tracking-[0.35em] uppercase text-stone-500 mb-6 block">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-wide text-stone-900 mb-8">
                {product.name}
              </h1>
              <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed mb-10">
                {product.description}
              </p>
              <div className="border-y border-stone-200 py-8 mb-10 flex items-center justify-between gap-8">
                <span className="text-xs tracking-[0.2em] uppercase text-stone-500">Price</span>
                <span className="text-2xl font-serif text-stone-900">{product.priceLabel}</span>
              </div>
              <ProductAddButton productId={product.id} label="Add To Bag" fullWidth />
              <div className="mt-12 space-y-8">
                <div className="border-t border-stone-200 pt-8">
                  <h2 className="text-xl font-serif text-stone-900 mb-3">Product Details</h2>
                  <p className="text-sm text-stone-600 font-light leading-relaxed">
                    Detail content is structured for future ingredients, shade, and usage data from the product backend.
                  </p>
                </div>
                <div className="border-t border-stone-200 pt-8">
                  <h2 className="text-xl font-serif text-stone-900 mb-3">Delivery</h2>
                  <p className="text-sm text-stone-600 font-light leading-relaxed">
                    Delivery messaging is ready for checkout integration and regional fulfilment rules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
