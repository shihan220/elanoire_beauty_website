import { OrderStatus } from '@prisma/client';
import { mockSalesSnapshot } from '@/data/admin/mock-sales';
import type { AdminCustomerOrder, AdminDashboardData, AdminDataMode, AdminSalesSnapshot } from '@/types/admin';
import { prisma } from '../db';
import { listAdminProducts } from './catalog';
import { listAdminNewsletterUpdates } from './newsletter';

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

function periodStart(daysAgo: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.getTime();
}

function yearStart() {
  const date = new Date();
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function buildBillingSummary(order: {
  billingName: string | null;
  billingEmail: string | null;
  billingLine1: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostcode: string | null;
  billingCountry: string | null;
}) {
  const lines = [
    order.billingName,
    order.billingEmail,
    order.billingLine1,
    [order.billingCity, order.billingState, order.billingPostcode].filter(Boolean).join(', '),
    order.billingCountry,
  ].filter(Boolean);

  return lines.length > 0 ? lines.join(' / ') : null;
}

function mapCustomerOrder(order: {
  id: string;
  status: OrderStatus;
  subtotalPence: number;
  totalPence: number;
  currency: string;
  createdAt: Date;
  billingName: string | null;
  billingEmail: string | null;
  billingLine1: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostcode: string | null;
  billingCountry: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    pricePence: number;
  }>;
}) {
  return {
    id: order.id,
    customerName: `${order.user.firstName} ${order.user.lastName}`.trim(),
    customerEmail: order.user.email,
    totalPence: order.totalPence,
    subtotalPence: order.subtotalPence,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    billingSummary: buildBillingSummary(order),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      pricePence: item.pricePence,
    })),
  } satisfies AdminCustomerOrder;
}

function buildMockCustomerOrders() {
  return mockSalesSnapshot.recentOrders.map((order) => ({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    totalPence: order.totalPence,
    subtotalPence: order.totalPence,
    currency: 'GBP',
    status: order.status,
    createdAt: order.createdAt,
    billingSummary: null,
    items: [
      {
        id: `${order.id}-item`,
        name: 'Sample order item',
        quantity: order.itemCount,
        pricePence: order.totalPence,
      },
    ],
  })) satisfies AdminCustomerOrder[];
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
  const dailyCutoff = periodStart(0);
  const weeklyCutoff = periodStart(6);
  const monthlyCutoff = periodStart(29);
  const yearlyCutoff = yearStart();
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
    periodTotals: {
      dailyRevenuePence: orders.reduce((total, order) => (
        order.createdAt.getTime() >= dailyCutoff ? total + order.totalPence : total
      ), 0),
      weeklyRevenuePence: orders.reduce((total, order) => (
        order.createdAt.getTime() >= weeklyCutoff ? total + order.totalPence : total
      ), 0),
      monthlyRevenuePence: orders.reduce((total, order) => (
        order.createdAt.getTime() >= monthlyCutoff ? total + order.totalPence : total
      ), 0),
      yearlyRevenuePence: orders.reduce((total, order) => (
        order.createdAt.getTime() >= yearlyCutoff ? total + order.totalPence : total
      ), 0),
    },
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

async function getDatabaseCustomerOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
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

  return orders.map(mapCustomerOrder);
}

export async function getAdminDashboardData() {
  const productData = await listAdminProducts();
  const newsletterData = await listAdminNewsletterUpdates();
  let sales = mockSalesSnapshot;
  let salesDataSource: AdminDataMode = 'mock';
  let customerOrders: AdminCustomerOrder[] = buildMockCustomerOrders();

  if (canUseDatabase()) {
    try {
      sales = await getDatabaseSalesSnapshot();
      customerOrders = await getDatabaseCustomerOrders();
      salesDataSource = 'database';
    } catch {
      sales = mockSalesSnapshot;
      customerOrders = buildMockCustomerOrders();
      salesDataSource = 'mock';
    }
  }

  return {
    dataMode: productData.dataMode,
    salesDataSource,
    products: productData.products,
    sales,
    customerOrders,
    newsletterUpdates: newsletterData.updates,
  } satisfies AdminDashboardData;
}
