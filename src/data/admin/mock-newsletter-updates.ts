import type { NewsletterUpdate } from '@/types/admin';

export const mockNewsletterUpdates: NewsletterUpdate[] = [
  {
    id: 'newsletter-1',
    email: 'olive.taylor@example.com',
    subscribedAt: '2026-04-28T09:00:00.000Z',
    status: 'Active',
    source: 'Homepage footer form',
  },
  {
    id: 'newsletter-2',
    email: 'charlotte.bennett@example.com',
    subscribedAt: '2026-04-27T14:30:00.000Z',
    status: 'Active',
    source: 'Checkout opt-in',
  },
  {
    id: 'newsletter-3',
    email: 'isla.morgan@example.com',
    subscribedAt: '2026-04-26T18:05:00.000Z',
    status: 'Paused',
    source: 'Account preferences',
  },
  {
    id: 'newsletter-4',
    email: 'grace.hughes@example.com',
    subscribedAt: '2026-04-24T11:50:00.000Z',
    status: 'Active',
    source: 'Launch waitlist',
  },
];
