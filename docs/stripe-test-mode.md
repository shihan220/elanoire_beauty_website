# Stripe Test Mode Checkout

Use this guide to verify the signed-in Stripe checkout flow locally.

## Environment

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Set the required values in `.env.local`:

   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/elanoire_beauty?schema=public"
   NEXTAUTH_URL="http://127.0.0.1:5173"
   NEXTAUTH_SECRET="replace-with-a-secure-random-secret"
   NEXT_PUBLIC_APP_URL="http://127.0.0.1:5173"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

3. Generate a local auth secret if needed:

   ```bash
   openssl rand -base64 32
   ```

## Database Setup

1. Generate the Prisma client:

   ```bash
   npm run db:generate
   ```

2. Push the schema to the configured database:

   ```bash
   npm run db:push
   ```

3. Seed the product catalogue:

   ```bash
   npm run db:seed
   ```

## Stripe Webhook Setup

1. Install the Stripe CLI if `stripe --version` is not available:

   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Sign in to the Stripe CLI:

   ```bash
   stripe login
   ```

3. Forward local webhook events to the Next.js route:

   ```bash
   stripe listen --forward-to 127.0.0.1:5173/api/stripe/webhook
   ```

4. Copy the `whsec_...` value printed by the Stripe CLI into `STRIPE_WEBHOOK_SECRET`.

5. Restart the Next.js dev server after changing `.env.local`.

## Full Checkout Test

1. Start the app:

   ```bash
   npm run dev
   ```

2. Open `http://127.0.0.1:5173/sign-up` and create a test account.

3. Add one or more products to the bag.

4. Open `http://127.0.0.1:5173/cart` and select `Checkout`.

5. On `http://127.0.0.1:5173/checkout`, review the order summary, fill the billing information, leave card payment selected, and continue to payment.

6. Complete Stripe Checkout with test card `4242 4242 4242 4242`, any future expiry date, any CVC, and any UK postcode.

7. After Stripe redirects back to `/account`, confirm the order appears in the order history.

8. Confirm the Stripe CLI printed a delivered `checkout.session.completed` event.

9. Confirm the order status is `PAID` in the database. You can inspect it with:

   ```bash
   npx prisma studio
   ```

10. Confirm the order has billing fields populated and the user's cart is empty after the webhook runs.

## Expired Session Test

1. Start checkout from `/checkout`, but do not complete payment.

2. Copy the `cs_test_...` session id from the created order in Prisma Studio or from the Stripe Dashboard.

3. Expire the session in test mode:

   ```bash
   stripe checkout sessions expire cs_test_...
   ```

4. Confirm the Stripe CLI prints a delivered `checkout.session.expired` event.

5. Confirm the matching pending order changes to `CANCELLED`.

## Expected Lifecycle

- Checkout API creates a `PENDING` order before redirecting to Stripe.
- Checkout API validates billing details server-side and stores an order billing snapshot.
- Saved billing details can be reused by the signed-in user on future checkouts.
- Verified paid webhook events mark the order `PAID`.
- Duplicate paid webhook events leave the order paid and clear the cart again safely.
- Expired or failed checkout session events only cancel orders that are still `PENDING`.
- Fulfilled orders are not moved backward by later duplicate Stripe events.
