import { ProductListingPage } from '../components/product/ProductListingPage';
import { listProductsByCategory } from '@/server/products';

export const dynamic = 'force-dynamic';

type MakeupPageProps = {
  searchParams?: Promise<{
    search?: string;
    q?: string;
  }>;
};

export default async function MakeupPage({ searchParams }: MakeupPageProps) {
  const params = await searchParams;
  const searchQuery = (params?.search ?? params?.q ?? '').trim();
  const makeupProducts = await listProductsByCategory('Makeup');

  return (
    <ProductListingPage
      eyebrow="Makeup"
      title="Colour with quiet confidence."
      description="Elegant makeup essentials presented with the same refined spacing, neutral palette, and premium shopping rhythm."
      products={makeupProducts}
      searchQuery={searchQuery}
    />
  );
}
