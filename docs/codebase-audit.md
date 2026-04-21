# Élanoire Beauty UK Codebase Audit

## Current Architecture

- React single-page app generated for Vite.
- Homepage entry is `src/app/App.tsx`.
- Current visible sections are `Navbar`, `Hero`, `Categories`, `Bestsellers`, `AboutSection`, and `Footer`.
- Tailwind CSS v4 is imported from `src/styles/tailwind.css`.
- Theme variables live in `src/styles/theme.css`.
- The app does not yet use Next.js routes, API routes, server components, or backend integration.

## Approved Visual Direction

- Luxury beauty aesthetic with editorial spacing, serif display type, clean neutrals, and restrained interaction.
- Main brand surface: `#faf9f6`.
- Main theme ink token: `#030213`.
- White: `#ffffff`.
- Supporting theme values currently present: `#ececf0`, `#717182`, `#e9ebef`, `#d4183d`, `#f3f3f5`, `#cbced4`, and `rgba(0, 0, 0, 0.1)`.
- Tailwind stone utilities are used heavily for the approved neutral scale.
- Motion is subtle: soft fade, slide, parallax, and hover scale transitions.

## Existing Patterns To Preserve

- Wide uppercase microcopy with `tracking-[0.2em]` to `tracking-[0.4em]`.
- Serif headings using the existing `font-serif` mapping.
- Large section rhythm: `py-24 md:py-32`, `px-6 md:px-12`, and `max-w-7xl`.
- Rectangular editorial image blocks with minimal border radius.
- Buttons use uppercase labels, generous horizontal padding, and stone/ivory contrast.

## Incomplete Sections

- Sign in, sign up, and forgot password routes are missing.
- Account dashboard, profile, orders, addresses, and settings routes are missing.
- Cart state, cart page, quantity controls, and checkout CTA are missing.
- Skincare and makeup category routes are missing.
- Product detail route structure is missing.
- Product data is hardcoded inside components rather than shared.
- Navigation links currently point to `#`.

## Technical Follow-Ups

- Migrate the app from Vite-only SPA routing to Next.js App Router.
- Create shared product data and reusable product card components.
- Add client-side cart state now, then connect it to a backend/session strategy.
- Add API route structure for products, auth placeholders, cart, and account data.
- Replace placeholder auth/account data with real provider-backed flows when the auth provider is selected.
