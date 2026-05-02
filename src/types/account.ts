export type AccountProfile = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  createdAt: string;
};

export type AccountAddress = {
  id: string;
  label: string;
  fullName: string | null;
  phoneNumber: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postcode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AccountOrderItem = {
  id: string;
  name: string;
  quantity: number;
  pricePence: number;
};

export type AccountBillingSnapshot = {
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
};

export type AccountOrder = {
  id: string;
  reference: string;
  status: string;
  subtotalPence: number;
  totalPence: number;
  currency: string;
  createdAt: string;
  items: AccountOrderItem[];
  billingSnapshot: AccountBillingSnapshot | null;
};

export type AccountSettings = {
  communicationPreferencesReady: boolean;
  securityEntryPoint: boolean;
};

export type AccountDashboardData = {
  profile: AccountProfile;
  orders: AccountOrder[];
  addresses: AccountAddress[];
  settings: AccountSettings;
};

export type AccountProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type AccountAddressInput = {
  label: string;
  fullName: string;
  phoneNumber: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
};
