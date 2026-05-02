import { prisma } from './db';
import type {
  AccountAddress,
  AccountBillingSnapshot,
  AccountDashboardData,
  AccountOrder,
  AccountProfile,
  AccountSettings,
} from '@/types/account';

const defaultSettings: AccountSettings = {
  communicationPreferencesReady: false,
  securityEntryPoint: true,
};

function serialiseProfile(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt.toISOString(),
  } satisfies AccountProfile;
}

function serialiseAddress(address: {
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
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: address.id,
    label: address.label,
    fullName: address.fullName,
    phoneNumber: address.phoneNumber,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postcode: address.postcode,
    country: address.country,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  } satisfies AccountAddress;
}

function serialiseBillingSnapshot(order: {
  billingName: string | null;
  billingEmail: string | null;
  billingPhoneNumber: string | null;
  billingLine1: string | null;
  billingLine2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostcode: string | null;
  billingCountry: string | null;
}) {
  const snapshot = {
    name: order.billingName,
    email: order.billingEmail,
    phoneNumber: order.billingPhoneNumber,
    line1: order.billingLine1,
    line2: order.billingLine2,
    city: order.billingCity,
    state: order.billingState,
    postcode: order.billingPostcode,
    country: order.billingCountry,
  } satisfies AccountBillingSnapshot;

  return Object.values(snapshot).some((value) => value) ? snapshot : null;
}

function serialiseOrder(order: {
  id: string;
  status: string;
  subtotalPence: number;
  totalPence: number;
  currency: string;
  createdAt: Date;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    pricePence: number;
  }>;
  billingName: string | null;
  billingEmail: string | null;
  billingPhoneNumber: string | null;
  billingLine1: string | null;
  billingLine2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostcode: string | null;
  billingCountry: string | null;
}) {
  return {
    id: order.id,
    reference: `ELA-${order.id.slice(-8).toUpperCase()}`,
    status: order.status,
    subtotalPence: order.subtotalPence,
    totalPence: order.totalPence,
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      pricePence: item.pricePence,
    })),
    billingSnapshot: serialiseBillingSnapshot(order),
  } satisfies AccountOrder;
}

export async function getAccountDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      },
      addresses: {
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    profile: serialiseProfile(user),
    orders: user.orders.map(serialiseOrder),
    addresses: user.addresses.map(serialiseAddress),
    settings: defaultSettings,
  } satisfies AccountDashboardData;
}

export async function listAccountAddresses(userId: string) {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return addresses.map(serialiseAddress);
}
