# Full-Stack Integration Progress

## Milestone 1: Auth And Prisma Foundation

Connected:

- Prisma schema for users, products, carts, addresses, orders, and order items.
- PostgreSQL datasource via `DATABASE_URL`.
- Seed script for the current product catalogue.
- NextAuth credentials provider with bcrypt password verification.
- Registration API at `POST /api/auth/register`.
- Protected account page using the authenticated session.
- Account API backed by the authenticated user record.

Required environment:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Remaining blockers:

- A real PostgreSQL/Supabase database URL is required before registration and sign-in can persist live users.
- Email reset delivery is still a muted placeholder until an email provider is selected.
- Product pages still use static data until the next product-database milestone.

## Milestone 2: Database-Backed Product Reads

Connected:

- Product listing pages now read through server product accessors.
- Product API routes now read through server product accessors.
- Product detail route now resolves products through the server data layer.
- Static product data remains only as a local fallback when `DATABASE_URL` is unavailable.

Remaining blockers:

- A PostgreSQL/Supabase `DATABASE_URL` and seeded product table are required for live database reads.
- Product admin/editor tooling is not implemented yet.

## Milestone 3: Authenticated Cart Persistence

Connected:

- `/api/cart` now supports authenticated `GET`, `POST`, `PATCH`, and `DELETE` operations against Prisma cart items.
- The client cart hydrates from the server when a user is signed in.
- Guest users keep the existing local cart fallback.
- Cart actions optimistically update the UI and sync to the database when a session is available.

Remaining blockers:

- Cart merging from guest cart into a newly authenticated account can be refined after checkout rules are finalized.
- Checkout still needs Stripe session creation and order persistence.

## Milestone 4: Stripe Checkout And Order Updates

Connected:

- `POST /api/checkout` creates a Stripe Checkout session from the authenticated Prisma cart.
- Checkout creates a pending order and order items before sending the customer to Stripe.
- Stripe Checkout metadata links the payment session to the order and user.
- `POST /api/stripe/webhook` verifies Stripe signatures, marks completed checkout sessions as paid, and clears the authenticated cart.
- Expired Stripe checkout sessions mark pending orders as cancelled.
- Checkout pricing is calculated from persisted product prices only, never from client-submitted amounts.
- Webhook processing is repeat-safe by using the unique Stripe Checkout session id and status-constrained updates.

Local validation:

- Follow `docs/stripe-test-mode.md` for the signed-in Stripe test checkout and expired-session test flow.

Required environment:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

Remaining blockers:

- A live Stripe account and webhook endpoint are required before real payment confirmation can update orders.
- Shipping, tax, discount, and fulfilment workflows are still outside this milestone.
