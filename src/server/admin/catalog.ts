import { ProductCategory as DatabaseProductCategory } from '@prisma/client';
import { products as fallbackProducts, type ProductCategory as StorefrontProductCategory } from '@/data/products';
import type { AdminDataMode, AdminProductCategory, AdminProductPayload, AdminProductRecord } from '@/types/admin';
import { prisma } from '../db';

const fallbackStockByProductId: Record<string, number> = {
  'lumiere-face-serum': 18,
  'velvet-matte-lipstick': 9,
  'radiance-night-cream': 5,
  'noir-essence-perfume': 2,
  'rose-blush-palette': 0,
  'botanical-oil-drops': 14,
};

const globalForAdminCatalog = globalThis as unknown as {
  adminMockProducts?: AdminProductRecord[];
};

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normaliseCategory(category: StorefrontProductCategory | AdminProductCategory) {
  return category.toUpperCase() as AdminProductCategory;
}

function buildMockProducts() {
  return fallbackProducts.map((product, index) => {
    const now = new Date(Date.now() - index * 86_400_000).toISOString();

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: normaliseCategory(product.category),
      pricePence: Math.round(product.price * 100),
      image: product.image,
      description: product.description,
      stockQuantity: fallbackStockByProductId[product.id] ?? 12,
      active: true,
      createdAt: now,
      updatedAt: now,
    } satisfies AdminProductRecord;
  });
}

function getMockProducts() {
  if (!globalForAdminCatalog.adminMockProducts) {
    globalForAdminCatalog.adminMockProducts = buildMockProducts();
  }

  return globalForAdminCatalog.adminMockProducts;
}

function slugifyProductName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    || 'elanoire-product';
}

function uniqueSlug(baseSlug: string, products: AdminProductRecord[], ignoreId?: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (products.some((product) => product.slug === candidate && product.id !== ignoreId)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function mapDatabaseProduct(product: {
  id: string;
  slug: string;
  name: string;
  category: DatabaseProductCategory;
  pricePence: number;
  image: string;
  description: string;
  stockQuantity: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: normaliseCategory(product.category),
    pricePence: product.pricePence,
    image: product.image,
    description: product.description,
    stockQuantity: product.stockQuantity,
    active: product.active,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  } satisfies AdminProductRecord;
}

function toDatabaseCategory(category: AdminProductCategory) {
  return category as DatabaseProductCategory;
}

async function listDatabaseProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ active: 'desc' }, { createdAt: 'asc' }],
  });

  return products.map(mapDatabaseProduct);
}

export async function listAdminProducts() {
  if (!canUseDatabase()) {
    return {
      dataMode: 'mock' as AdminDataMode,
      products: getMockProducts(),
    };
  }

  try {
    return {
      dataMode: 'database' as AdminDataMode,
      products: await listDatabaseProducts(),
    };
  } catch {
    return {
      dataMode: 'mock' as AdminDataMode,
      products: getMockProducts(),
    };
  }
}

export async function createAdminProduct(payload: AdminProductPayload) {
  const data = {
    ...payload,
    name: payload.name.trim(),
    image: payload.image.trim(),
    description: payload.description.trim(),
  };

  if (!canUseDatabase()) {
    const products = getMockProducts();
    const baseSlug = slugifyProductName(data.name);
    const slug = uniqueSlug(baseSlug, products);
    const now = new Date().toISOString();
    const product = {
      id: slug,
      slug,
      name: data.name,
      category: data.category,
      pricePence: data.pricePence,
      image: data.image,
      description: data.description,
      stockQuantity: data.stockQuantity,
      active: true,
      createdAt: now,
      updatedAt: now,
    } satisfies AdminProductRecord;

    products.unshift(product);
    return product;
  }

  const existingProducts = await prisma.product.findMany({
    select: { id: true, slug: true },
  });
  const baseSlug = slugifyProductName(data.name);
  const slug = uniqueSlug(
    baseSlug,
    existingProducts.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: '',
      category: 'SKINCARE',
      pricePence: 0,
      image: '',
      description: '',
      stockQuantity: 0,
      active: true,
      createdAt: '',
      updatedAt: '',
    })),
  );

  const product = await prisma.product.create({
    data: {
      id: slug,
      slug,
      name: data.name,
      category: toDatabaseCategory(data.category),
      pricePence: data.pricePence,
      image: data.image,
      description: data.description,
      stockQuantity: data.stockQuantity,
      active: true,
    },
  });

  return mapDatabaseProduct(product);
}

export async function updateAdminProduct(productId: string, payload: Partial<AdminProductPayload>) {
  if (!canUseDatabase()) {
    const products = getMockProducts();
    const product = products.find((item) => item.id === productId);
    if (!product) return null;

    Object.assign(product, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });

    return product;
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!existingProduct) return null;

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(payload.name ? { name: payload.name.trim() } : {}),
      ...(payload.category ? { category: toDatabaseCategory(payload.category) } : {}),
      ...(typeof payload.pricePence === 'number' ? { pricePence: payload.pricePence } : {}),
      ...(typeof payload.stockQuantity === 'number' ? { stockQuantity: payload.stockQuantity } : {}),
      ...(payload.image ? { image: payload.image.trim() } : {}),
      ...(payload.description ? { description: payload.description.trim() } : {}),
    },
  });

  return mapDatabaseProduct(product);
}

export async function archiveAdminProduct(productId: string) {
  if (!canUseDatabase()) {
    const products = getMockProducts();
    const product = products.find((item) => item.id === productId);
    if (!product) return null;

    product.active = false;
    product.stockQuantity = 0;
    product.updatedAt = new Date().toISOString();

    return product;
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      active: false,
      stockQuantity: 0,
    },
  }).catch(() => null);

  return product ? mapDatabaseProduct(product) : null;
}
