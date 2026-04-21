import { ProductListingPage } from '../components/product/ProductListingPage';
import { listProducts } from '@/server/products';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <ProductListingPage
      eyebrow="Shop All"
      title="The complete edit."
      description="A concise collection of skincare, makeup, and signature fragrance products staged for a refined e-commerce experience."
      products={products}
    />
  );
}
