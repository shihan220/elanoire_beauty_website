import type { Product as DatabaseProduct, ProductCategory as DatabaseProductCategory } from '@prisma/client';
import { products as fallbackProducts, type Product, type ProductCategory } from '@/data/products';
import { prisma } from './db';

const categoryMap: Record<DatabaseProductCategory, ProductCategory> = {
  SKINCARE: 'Skincare',
  MAKEUP: 'Makeup',
  FRAGRANCE: 'Fragrance',
};

function formatPrice(pricePence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pricePence / 100);
}

function mapProduct(product: DatabaseProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: categoryMap[product.category],
    price: product.pricePence / 100,
    priceLabel: formatPrice(product.pricePence),
    image: product.image,
    description: product.description,
    speed: product.speed,
    floatDuration: product.floatDuration,
  };
}

function canQueryDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function listProducts() {
  if (!canQueryDatabase()) return fallbackProducts;

  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    return products.map(mapProduct);
  } catch {
    return fallbackProducts;
  }
}

export async function listProductsByCategory(category: ProductCategory) {
  const products = await listProducts();

  return products.filter((product) => product.category === category);
}

export async function getProductBySlug(slug: string) {
  if (canQueryDatabase()) {
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
      });

      if (product?.active) return mapProduct(product);
    } catch {
      return fallbackProducts.find((product) => product.slug === slug);
    }
  }

  return fallbackProducts.find((product) => product.slug === slug);
}

export async function getProductById(productId: string) {
  if (canQueryDatabase()) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (product?.active) return mapProduct(product);
    } catch {
      return fallbackProducts.find((product) => product.id === productId);
    }
  }

  return fallbackProducts.find((product) => product.id === productId);
}
