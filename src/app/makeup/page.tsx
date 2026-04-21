import { ProductListingPage } from '../components/product/ProductListingPage';
import { products } from '@/data/products';

const makeupProducts = products.filter((product) => product.category === 'Makeup');

export default function MakeupPage() {
  return (
    <ProductListingPage
      eyebrow="Makeup"
      title="Colour with quiet confidence."
      description="Elegant makeup essentials presented with the same refined spacing, neutral palette, and premium shopping rhythm."
      products={makeupProducts}
    />
  );
}
