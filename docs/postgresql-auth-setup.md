# PostgreSQL Auth Setup

Use this setup to run signup, signin, and two-step verification locally against PostgreSQL.

## Required Environment

Create `.env.local` from `.env.example` and fill these values:

```bash
DATABASE_URL="postgresql://YOUR_MAC_USERNAME@127.0.0.1:5432/elanoire_beauty?schema=public"
NEXTAUTH_URL="http://127.0.0.1:5173"
NEXTAUTH_SECRET="replace-with-a-secure-random-secret"
NEXT_PUBLIC_APP_URL="http://127.0.0.1:5173"
AUTH_EMAIL_FROM="Élanoire Beauty UK <accounts@example.com>"
SMTP_HOST="127.0.0.1"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASSWORD=""
```

Generate a local `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## Local PostgreSQL

Install and start PostgreSQL if it is not already available:

```bash
brew install postgresql@16
brew services start postgresql@16
```

Create the database:

```bash
/opt/homebrew/opt/postgresql@16/bin/createdb -h 127.0.0.1 -p 5432 elanoire_beauty
```

Apply the Prisma schema and seed products:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

`prisma.config.ts` loads `.env.local` for Prisma CLI commands, so the database scripts use the same local database URL as the Next.js app.

## SMTP For Verification Codes

For production, set `AUTH_EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` to a real SMTP provider.

For local testing, run any SMTP capture service on `127.0.0.1:1025`. The signup and signin APIs will send verification-code emails through SMTP when `SMTP_HOST` is present. In development, the API response also includes `devCode` so the flow can be tested without reading a real inbox.

## Expected Auth Flow

1. `POST /api/auth/register` validates details, hashes the password with Argon2id, stores a `SIGN_UP` challenge, and sends a six-digit code.
2. The signup form posts the code through the existing NextAuth credentials callback with `flow=signup`.
3. NextAuth verifies and consumes the challenge, creates the user in PostgreSQL, and starts the session.
4. `POST /api/auth/sign-in/start` verifies email and password, stores a `SIGN_IN` challenge, and sends a six-digit code.
5. The signin form posts the code through the existing NextAuth credentials callback with `flow=signin`.
6. NextAuth verifies and consumes the challenge, upgrades legacy bcrypt hashes to Argon2id when needed, and starts the session.

## Validation Queries

Check that a user was created with Argon2id:

```bash
/opt/homebrew/opt/postgresql@16/bin/psql -h 127.0.0.1 -p 5432 -d elanoire_beauty -c 'select email, left("passwordHash", 10) from "User" order by "createdAt" desc limit 1;'
```

Check that the latest signup and signin challenges were consumed:

```bash
/opt/homebrew/opt/postgresql@16/bin/psql -h 127.0.0.1 -p 5432 -d elanoire_beauty -c 'select purpose, "consumedAt" is not null as consumed from "AuthChallenge" order by "createdAt" desc limit 2;'
```
