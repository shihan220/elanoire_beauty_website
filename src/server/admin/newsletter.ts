import { NewsletterStatus } from '@prisma/client';
import { mockNewsletterUpdates } from '@/data/admin/mock-newsletter-updates';
import type { AdminDataMode, AdminNewsletterPayload, NewsletterStatusLabel, NewsletterUpdate } from '@/types/admin';
import { prisma } from '../db';

const globalForAdminNewsletter = globalThis as unknown as {
  adminMockNewsletterUpdates?: NewsletterUpdate[];
};

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function getMockNewsletterUpdates() {
  if (!globalForAdminNewsletter.adminMockNewsletterUpdates) {
    globalForAdminNewsletter.adminMockNewsletterUpdates = mockNewsletterUpdates.map((entry) => ({ ...entry }));
  }

  return globalForAdminNewsletter.adminMockNewsletterUpdates;
}

function toStatusLabel(status: NewsletterStatus): NewsletterStatusLabel {
  return status === NewsletterStatus.ACTIVE ? 'Active' : 'Paused';
}

function toDatabaseStatus(status: NewsletterStatusLabel) {
  return status === 'Active' ? NewsletterStatus.ACTIVE : NewsletterStatus.PAUSED;
}

function mapDatabaseNewsletter(entry: {
  id: string;
  email: string;
  source: string;
  status: NewsletterStatus;
  subscribedAt: Date;
}) {
  return {
    id: entry.id,
    email: entry.email,
    source: entry.source,
    status: toStatusLabel(entry.status),
    subscribedAt: entry.subscribedAt.toISOString(),
  } satisfies NewsletterUpdate;
}

export async function listAdminNewsletterUpdates() {
  if (!canUseDatabase()) {
    return {
      dataMode: 'mock' as AdminDataMode,
      updates: getMockNewsletterUpdates(),
    };
  }

  try {
    const updates = await prisma.newsletterSubscription.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    return {
      dataMode: 'database' as AdminDataMode,
      updates: updates.map(mapDatabaseNewsletter),
    };
  } catch {
    return {
      dataMode: 'mock' as AdminDataMode,
      updates: getMockNewsletterUpdates(),
    };
  }
}

export async function createAdminNewsletterUpdate(payload: AdminNewsletterPayload) {
  const data = {
    email: payload.email.trim().toLowerCase(),
    source: payload.source.trim(),
    status: payload.status,
  };

  if (!canUseDatabase()) {
    const updates = getMockNewsletterUpdates();
    const now = new Date().toISOString();
    const existing = updates.find((entry) => entry.email.toLowerCase() === data.email);

    if (existing) {
      Object.assign(existing, {
        source: data.source,
        status: data.status,
      });
      return existing;
    }

    const entry = {
      id: `newsletter-${Date.now()}`,
      email: data.email,
      source: data.source,
      status: data.status,
      subscribedAt: now,
    } satisfies NewsletterUpdate;
    updates.unshift(entry);
    return entry;
  }

  const update = await prisma.newsletterSubscription.upsert({
    where: { email: data.email },
    update: {
      source: data.source,
      status: toDatabaseStatus(data.status),
    },
    create: {
      email: data.email,
      source: data.source,
      status: toDatabaseStatus(data.status),
    },
  });

  return mapDatabaseNewsletter(update);
}

export async function updateAdminNewsletterUpdate(entryId: string, payload: Partial<AdminNewsletterPayload>) {
  if (!canUseDatabase()) {
    const updates = getMockNewsletterUpdates();
    const entry = updates.find((item) => item.id === entryId);
    if (!entry) return null;

    Object.assign(entry, {
      ...(payload.email ? { email: payload.email.trim().toLowerCase() } : {}),
      ...(payload.source ? { source: payload.source.trim() } : {}),
      ...(payload.status ? { status: payload.status } : {}),
    });

    return entry;
  }

  const update = await prisma.newsletterSubscription.update({
    where: { id: entryId },
    data: {
      ...(payload.email ? { email: payload.email.trim().toLowerCase() } : {}),
      ...(payload.source ? { source: payload.source.trim() } : {}),
      ...(payload.status ? { status: toDatabaseStatus(payload.status) } : {}),
    },
  }).catch(() => null);

  return update ? mapDatabaseNewsletter(update) : null;
}

export async function deleteAdminNewsletterUpdate(entryId: string) {
  if (!canUseDatabase()) {
    const updates = getMockNewsletterUpdates();
    const index = updates.findIndex((entry) => entry.id === entryId);
    if (index === -1) return null;

    const [removed] = updates.splice(index, 1);
    return removed;
  }

  const removed = await prisma.newsletterSubscription.delete({
    where: { id: entryId },
  }).catch(() => null);

  return removed ? mapDatabaseNewsletter(removed) : null;
}
