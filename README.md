# Financial API Simulator

A backend project that simulates basic financial account operations through a REST API. It was built with Fastify, TypeScript, Prisma and PostgreSQL.

## Features

- Create a user and an initial account
- List users without exposing password hashes
- Deposit funds into an account
- Transfer funds between accounts
- Retrieve an account transaction statement
- Persist related financial operations using Prisma transactions

## Technology stack

- Node.js
- TypeScript
- Fastify
- PostgreSQL 15
- Prisma ORM
- bcryptjs for password hashing

## Project structure

```text
.
├── Docs/
│   └── financial-api.postman_collection.json
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── routes/
│   └── server.ts
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Requirements

- Node.js 20 or later
- npm
- Docker Desktop / Docker Engine

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Create a local `.env` file:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/financial_api?schema=public"
   PORT=3333
   CORS_ORIGIN="http://localhost:3000"
   ```

4. Generate the Prisma client and apply migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. Start the API in development:

   ```bash
   npm run dev
   ```

The API listens on `http://localhost:3333`.

## Available endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | Health check |
| POST | `/users` | Create a user and initial account |
| GET | `/users` | List users (without password hashes) |
| POST | `/transactions/deposit` | Deposit into an account |
| POST | `/transactions/transfer` | Transfer between accounts |
| GET | `/accounts/:id/statement` | Retrieve account transactions |

### Example: create a user

```http
POST /users
Content-Type: application/json
```

```json
{
  "name": "Alex Example",
  "email": "alex@example.com",
  "password": "use-a-local-test-password"
}
```

Passwords must contain at least 8 characters. The API stores a bcrypt hash and does not return the password or hash in user responses.

### Example: deposit

```json
{
  "accountId": "ACCOUNT_ID",
  "amount": 100.50,
  "description": "Initial deposit"
}
```

### Example: transfer

```json
{
  "senderAccountId": "SENDER_ACCOUNT_ID",
  "receiverAccountId": "RECEIVER_ACCOUNT_ID",
  "amount": 25.00,
  "description": "Test transfer"
}
```

Amounts must be positive. Transfers require two different existing accounts and sufficient funds.

## API exploration

An existing Postman collection is available at `Docs/financial-api.postman_collection.json`. Update its account IDs with records created in your local environment before running deposit or transfer requests.

## Quality and security notes

The API includes basic request validation, password hashing, restricted CORS origins and transactional updates for financial operations. This is a learning/portfolio project, not production banking software. It does not currently implement authentication/authorization, rate limiting, idempotency keys, audit-grade ledger controls or comprehensive automated integration tests. Do not use real personal or financial data.

## Useful commands

- `npm run dev` — run the TypeScript server in development
- `npm run typecheck` — type-check the source
- `npm run build` — compile to `dist/`
- `npm start` — run the compiled server

## Author

João Guilherme Lima Bento
