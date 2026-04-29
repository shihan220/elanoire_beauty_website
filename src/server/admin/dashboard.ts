import { OrderStatus } from '@prisma/client';
import { mockNewsletterUpdates } from '@/data/admin/mock-newsletter-updates';
import { mockSalesSnapshot } from '@/data/admin/mock-sales';
import type { AdminDashboardData, AdminDataMode, AdminSalesSnapshot } from '@/types/admin';
import { prisma } from '../db';
import { listAdminProducts } from './catalog';

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function weekBucket(date: Date) {
  const bucket = new Date(date);
  const day = bucket.getDay() || 7;
  bucket.setHours(0, 0, 0, 0);
  bucket.setDate(bucket.getDate() - day + 1);
  return bucket;
}

function formatWeekLabel(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

async function getDatabaseSalesSnapshot() {
  const completedStatuses = [OrderStatus.PAID, OrderStatus.FULFILLED];
  const orders = await prisma.order.findMany({
    where: {
      status: { in: completedStatuses },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const now = Date.now();
  const last7DaysCutoff = now - 7 * 86_400_000;
  const last30DaysCutoff = now - 30 * 86_400_000;
  const bestSellerMap = new Map<string, { quantity: number; revenuePence: number }>();
  const seriesMap = new Map<string, { weekStart: Date; revenuePence: number; orders: number }>();

  for (const order of orders) {
    const orderTime = order.createdAt.getTime();
    const weekStart = weekBucket(order.createdAt);
    const weekKey = weekStart.toISOString();
    const seriesEntry = seriesMap.get(weekKey) ?? { weekStart, revenuePence: 0, orders: 0 };
    seriesEntry.revenuePence += order.totalPence;
    seriesEntry.orders += 1;
    seriesMap.set(weekKey, seriesEntry);

    for (const item of order.items) {
      const sellerEntry = bestSellerMap.get(item.name) ?? { quantity: 0, revenuePence: 0 };
      sellerEntry.quantity += item.quantity;
      sellerEntry.revenuePence += item.quantity * item.pricePence;
      bestSellerMap.set(item.name, sellerEntry);
    }

    if (orderTime < last30DaysCutoff) {
      continue;
    }
  }

  const salesSeries = [...seriesMap.values()]
    .sort((left, right) => left.weekStart.getTime() - right.weekStart.getTime())
    .slice(-6)
    .map((entry) => ({
      label: formatWeekLabel(entry.weekStart),
      revenuePence: entry.revenuePence,
      orders: entry.orders,
    }));

  const bestSellers = [...bestSellerMap.entries()]
    .sort((left, right) => right[1].quantity - left[1].quantity)
    .slice(0, 5)
    .map(([name, values]) => ({
      name,
      quantity: values.quantity,
      revenuePence: values.revenuePence,
    }));

  return {
    totalRevenuePence: orders.reduce((total, order) => total + order.totalPence, 0),
    totalOrders: orders.length,
    last7DaysRevenuePence: orders.reduce((total, order) => (
      order.createdAt.getTime() >= last7DaysCutoff ? total + order.totalPence : total
    ), 0),
    last30DaysRevenuePence: orders.reduce((total, order) => (
      order.createdAt.getTime() >= last30DaysCutoff ? total + order.totalPence : total
    ), 0),
    bestSellers,
    recentOrders: orders.slice(0, 6).map((order) => ({
      id: order.id,
      customerName: `${order.user.firstName} ${order.user.lastName}`.trim(),
      customerEmail: order.user.email,
      totalPence: order.totalPence,
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    })),
    salesSeries,
  } satisfies AdminSalesSnapshot;
}

export async function getAdminDashboardData() {
  const productData = await listAdminProducts();
  let sales = mockSalesSnapshot;
  let salesDataSource: AdminDataMode = 'mock';

  if (canUseDatabase()) {
    try {
      sales = await getDatabaseSalesSnapshot();
      salesDataSource = 'database';
    } catch {
      sales = mockSalesSnapshot;
      salesDataSource = 'mock';
    }
  }

  return {
    dataMode: productData.dataMode,
    salesDataSource,
    products: productData.products,
    sales,
    newsletterUpdates: mockNewsletterUpdates,
  } satisfies AdminDashboardData;
}
