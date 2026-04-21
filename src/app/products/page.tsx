import { ProductListingPage } from '../components/product/ProductListingPage';
import { products } from '@/data/products';

export default function ProductsPage() {
  return (
    <ProductListingPage
      eyebrow="Shop All"
      title="The complete edit."
      description="A concise collection of skincare, makeup, and signature fragrance products staged for a refined e-commerce experience."
      products={products}
    />
  );
}
