import { ProductListingPage } from '../components/product/ProductListingPage';
import { listProductsByCategory } from '@/server/products';

export const dynamic = 'force-dynamic';

type SkincarePageProps = {
  searchParams?: Promise<{
    search?: string;
    q?: string;
  }>;
};

export default async function SkincarePage({ searchParams }: SkincarePageProps) {
  const params = await searchParams;
  const searchQuery = (params?.search ?? params?.q ?? '').trim();
  const skincareProducts = await listProductsByCategory('Skincare');

  return (
    <ProductListingPage
      eyebrow="Skincare"
      title="Rituals for luminous calm."
      description="High-performance skincare staged in a clean, editorial shopping experience that keeps the current Élanoire visual language intact."
      products={skincareProducts}
      searchQuery={searchQuery}
    />
  );
}
