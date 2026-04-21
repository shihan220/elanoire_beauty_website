import { ProductListingPage } from '../components/product/ProductListingPage';
import { listProducts } from '@/server/products';

export const dynamic = 'force-dynamic';

type ProductsPageProps = {
  searchParams?: Promise<{
    search?: string;
    q?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const searchQuery = (params?.search ?? params?.q ?? '').trim();
  const products = await listProducts();

  return (
    <ProductListingPage
      eyebrow="Shop All"
      title="The complete edit."
      description="A concise collection of skincare, makeup, and signature fragrance products staged for a refined e-commerce experience."
      products={products}
      searchQuery={searchQuery}
    />
  );
}
