# Financial API Simulator

A backend project that simulates basic financial account operations through a REST API. It was built with Fastify, TypeScript, Prisma and PostgreSQL.

## Features

- Create a user and an initial account
- List users without exposing password hashes
- Deposit funds into an account
- Transfer funds between accounts
- Retrieve an account transaction statement
- Persist related financial operations using Prisma transactions
- Validate email, amount and transfer-account inputs

## Technology stack

- Node.js
- TypeScript
- Fastify
- PostgreSQL 15
- Prisma ORM
- bcryptjs for password hashing
- Node.js built-in Test Runner for validation unit tests

## Project structure

```text
.
├── .github/workflows/ci.yml
├── Docs/
│   └── financial-api.postman_collection.json
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── routes/
│   ├── server.ts
│   └── validation.ts
├── tests/
│   └── validation.test.js
├── docker-compose.yml
└── package.json
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

4. Generate Prisma Client and apply migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. Start the API:

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

## Tests and quality checks

Run validation unit tests:

```bash
npm test
```

Run the TypeScript check and build:

```bash
npm run typecheck
npm run build
```

The tests cover email format, positive finite amounts and distinct account identifiers. The GitHub Actions workflow runs these checks on pushes and pull requests to `main`.

An existing Postman collection is available at `Docs/financial-api.postman_collection.json`. Update its account IDs with records created in your local environment before running deposit or transfer requests.

## Security scope

The API now hashes passwords, omits password hashes from user responses, validates key request inputs, restricts browser origins through `CORS_ORIGIN` and performs transfer debits with a conditional database update inside a transaction.

This is a learning/portfolio project, not production banking software. Authentication/authorization, rate limiting, idempotency keys, audit-grade ledger controls and comprehensive API integration tests are not implemented. Do not use real personal or financial data. The default PostgreSQL credentials in Docker Compose are for local development only.

## Useful commands

- `npm run dev` — run the TypeScript server in development
- `npm test` — build and run validation unit tests
- `npm run typecheck` — type-check the source
- `npm run build` — compile to `dist/`
- `npm start` — run the compiled server

## Author

João Guilherme Lima Bento
