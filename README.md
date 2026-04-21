
# Élanoire Beauty UK

Luxury beauty e-commerce website for Élanoire Beauty UK.

## Running The Code

Install dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## PostgreSQL Auth Setup

Signup and signin require PostgreSQL through Prisma. Copy `.env.example` to `.env.local`, fill the database, NextAuth, app URL, and SMTP values, then run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

See `docs/postgresql-auth-setup.md` for the full local PostgreSQL and two-step auth validation flow.
