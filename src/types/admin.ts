export type AdminAuthMode = 'configured' | 'mock' | 'unconfigured';
export type AdminDataMode = 'database' | 'mock';
export type AdminProductCategory = 'SKINCARE' | 'MAKEUP' | 'FRAGRANCE';
export type NewsletterStatusLabel = 'Active' | 'Paused';

export type AdminProductRecord = {
  id: string;
  slug: string;
  name: string;
  category: AdminProductCategory;
  pricePence: number;
  image: string;
  description: string;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminSalesSnapshot = {
  totalRevenuePence: number;
  totalOrders: number;
  periodTotals: {
    dailyRevenuePence: number;
    weeklyRevenuePence: number;
    monthlyRevenuePence: number;
    yearlyRevenuePence: number;
  };
  last7DaysRevenuePence: number;
  last30DaysRevenuePence: number;
  bestSellers: Array<{
    name: string;
    quantity: number;
    revenuePence: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    totalPence: number;
    itemCount: number;
    status: string;
    createdAt: string;
  }>;
  salesSeries: Array<{
    label: string;
    revenuePence: number;
    orders: number;
  }>;
};

export type AdminCustomerOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  totalPence: number;
  subtotalPence: number;
  currency: string;
  status: string;
  createdAt: string;
  billingSummary: string | null;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    pricePence: number;
  }>;
};

export type NewsletterUpdate = {
  id: string;
  email: string;
  subscribedAt: string;
  status: NewsletterStatusLabel;
  source: string;
};

export type AdminDashboardData = {
  dataMode: AdminDataMode;
  salesDataSource: AdminDataMode;
  products: AdminProductRecord[];
  sales: AdminSalesSnapshot;
  customerOrders: AdminCustomerOrder[];
  newsletterUpdates: NewsletterUpdate[];
};

export type AdminProductPayload = {
  name: string;
  category: AdminProductCategory;
  pricePence: number;
  stockQuantity: number;
  image: string;
  description: string;
};

export type AdminNewsletterPayload = {
  email: string;
  source: string;
  status: NewsletterStatusLabel;
};
