# Backend Architecture Notes

## Current Scope

The app now uses Next.js App Router and includes lightweight API route handlers for the first backend integration points:

- `GET /api/products`
- `GET /api/products/[slug]`
- `POST /api/cart`
- `GET /api/account`
- `GET /api/auth/session`

These endpoints intentionally avoid fake persistence. They provide stable contracts for the frontend while the real auth, database, checkout, and product source decisions are still pending.

## Data Flow

- Product listing and detail pages currently read from `src/data/products.ts`.
- Cart UI persists locally in `localStorage`.
- `POST /api/cart` can calculate server-side cart totals from product IDs and quantities.
- Account and session endpoints return explicit unauthenticated placeholder responses.

## Integration TODOs

- Choose auth provider and replace local auth form success states with secure server actions.
- Move product data from static arrays to a CMS, database, or commerce backend.
- Persist cart state by session/user after authentication is available.
- Connect checkout CTA to order and payment APIs.
- Replace account placeholder response with authenticated profile, orders, addresses, and settings.
