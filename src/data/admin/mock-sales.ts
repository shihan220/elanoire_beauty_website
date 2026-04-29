import type { AdminSalesSnapshot } from '@/types/admin';

export const mockSalesSnapshot: AdminSalesSnapshot = {
  totalRevenuePence: 184300,
  totalOrders: 42,
  last7DaysRevenuePence: 28600,
  last30DaysRevenuePence: 121400,
  bestSellers: [
    { name: 'Lumiere Face Serum', quantity: 18, revenuePence: 117000 },
    { name: 'Velvet Matte Lipstick', quantity: 14, revenuePence: 44800 },
    { name: 'Rose Blush Palette', quantity: 11, revenuePence: 52800 },
  ],
  recentOrders: [
    {
      id: 'ELN-1042',
      customerName: 'Ava Sinclair',
      customerEmail: 'ava.sinclair@example.com',
      totalPence: 11300,
      itemCount: 2,
      status: 'PAID',
      createdAt: '2026-04-28T10:25:00.000Z',
    },
    {
      id: 'ELN-1041',
      customerName: 'Mia Hart',
      customerEmail: 'mia.hart@example.com',
      totalPence: 6500,
      itemCount: 1,
      status: 'PAID',
      createdAt: '2026-04-27T15:40:00.000Z',
    },
    {
      id: 'ELN-1040',
      customerName: 'Sophia Reed',
      customerEmail: 'sophia.reed@example.com',
      totalPence: 16800,
      itemCount: 3,
      status: 'FULFILLED',
      createdAt: '2026-04-26T09:10:00.000Z',
    },
    {
      id: 'ELN-1039',
      customerName: 'Amelia Byrne',
      customerEmail: 'amelia.byrne@example.com',
      totalPence: 4800,
      itemCount: 1,
      status: 'PAID',
      createdAt: '2026-04-24T13:45:00.000Z',
    },
  ],
  salesSeries: [
    { label: 'Week 1', revenuePence: 16200, orders: 4 },
    { label: 'Week 2', revenuePence: 21900, orders: 6 },
    { label: 'Week 3', revenuePence: 25400, orders: 7 },
    { label: 'Week 4', revenuePence: 30100, orders: 8 },
    { label: 'Week 5', revenuePence: 27800, orders: 7 },
    { label: 'Week 6', revenuePence: 32900, orders: 10 },
  ],
};
