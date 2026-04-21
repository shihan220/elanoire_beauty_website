import { ProductListingPage } from '../components/product/ProductListingPage';
import { products } from '@/data/products';

const skincareProducts = products.filter((product) => product.category === 'Skincare');

export default function SkincarePage() {
  return (
    <ProductListingPage
      eyebrow="Skincare"
      title="Rituals for luminous calm."
      description="High-performance skincare staged in a clean, editorial shopping experience that keeps the current Élanoire visual language intact."
      products={skincareProducts}
    />
  );
}
