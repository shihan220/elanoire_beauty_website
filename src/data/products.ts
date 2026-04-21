export type ProductCategory = 'Skincare' | 'Makeup' | 'Fragrance';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  priceLabel: string;
  image: string;
  description: string;
  speed: number;
  floatDuration: number;
};

export const products: Product[] = [
  {
    id: 'lumiere-face-serum',
    slug: 'lumiere-face-serum',
    name: 'Lumiere Face Serum',
    category: 'Skincare',
    price: 65,
    priceLabel: '£65.00',
    image: 'https://images.unsplash.com/photo-1767256046031-743d33937c4e?auto=format&fit=crop&q=80&w=800',
    description: 'A luminous daily serum staged for the skincare product detail experience.',
    speed: 0.15,
    floatDuration: 5,
  },
  {
    id: 'velvet-matte-lipstick',
    slug: 'velvet-matte-lipstick',
    name: 'Velvet Matte Lipstick',
    category: 'Makeup',
    price: 32,
    priceLabel: '£32.00',
    image: 'https://images.unsplash.com/photo-1695634543497-5970299bccaf?auto=format&fit=crop&q=80&w=800',
    description: 'A refined matte lip colour staged for the makeup collection experience.',
    speed: 0.3,
    floatDuration: 6.5,
  },
  {
    id: 'radiance-night-cream',
    slug: 'radiance-night-cream',
    name: 'Radiance Night Cream',
    category: 'Skincare',
    price: 85,
    priceLabel: '£85.00',
    image: 'https://images.unsplash.com/photo-1772191530787-b9546da02fbc?auto=format&fit=crop&q=80&w=800',
    description: 'A replenishing night cream staged for the skincare product detail experience.',
    speed: 0.2,
    floatDuration: 4.5,
  },
  {
    id: 'noir-essence-perfume',
    slug: 'noir-essence-perfume',
    name: 'Noir Essence Perfume',
    category: 'Fragrance',
    price: 120,
    priceLabel: '£120.00',
    image: 'https://images.unsplash.com/photo-1775210727378-7b0e9a50b660?auto=format&fit=crop&q=80&w=800',
    description: 'A signature fragrance staged for future collection expansion.',
    speed: 0.25,
    floatDuration: 7,
  },
  {
    id: 'rose-blush-palette',
    slug: 'rose-blush-palette',
    name: 'Rose Blush Palette',
    category: 'Makeup',
    price: 48,
    priceLabel: '£48.00',
    image: 'https://images.unsplash.com/photo-1601232265708-70dff722ba0f?auto=format&fit=crop&q=80&w=800',
    description: 'A soft-focus cheek palette staged for the makeup product detail experience.',
    speed: 0.1,
    floatDuration: 5.5,
  },
  {
    id: 'botanical-oil-drops',
    slug: 'botanical-oil-drops',
    name: 'Botanical Oil Drops',
    category: 'Skincare',
    price: 55,
    priceLabel: '£55.00',
    image: 'https://images.unsplash.com/photo-1693734488312-87b12f1cbac2?auto=format&fit=crop&q=80&w=800',
    description: 'A botanical facial oil staged for the skincare product detail experience.',
    speed: 0.35,
    floatDuration: 6,
  },
];

export const featuredProducts = products.slice(0, 6);

export function getProductById(productId: string) {
  return products.find((product) => product.id === productId);
}
