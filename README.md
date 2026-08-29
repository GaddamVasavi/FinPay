# FinPay – Personal Finance & Digital Payments Platform

FinPay is an enterprise-grade digital financial management platform that allows users to manage digital wallets, multi-currency balances, bank accounts, instant P2P transfers, payment requests, virtual cards, loans/credit, category budgets, and savings goals from a single unified application.

---

## 1. System Architecture

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Redis, Helmet, CORS, Rate-Limiting, Zod Validation, Winston Logger, Swagger/OpenAPI.
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Redux Toolkit, React Router v6, React Hook Form, Lucide React, Recharts.
- **Infrastructure:** Docker, Docker Compose, PostgreSQL 15, Redis 7.

---

## 2. Six Primary Commands

1. **`npm run dev`** — Starts both backend API server and frontend React client concurrently in development mode.
2. **`npm run build`** — Compiles and builds production bundles for backend and frontend.
3. **`npm run start`** — Starts the production Node.js API server.
4. **`npm run db:migrate`** — Applies Prisma database schema migrations.
5. **`npm run db:seed`** — Populates the database with fictional demo accounts, categories, and wallets.
6. **`npm run test`** — Executes automated unit and integration tests.

---

## 3. Getting Started

### Prerequisites
- Node.js (>= 20.x)
- PostgreSQL (or Docker)
- Redis (or Docker)

### Installation
```bash
# Install root and workspace dependencies
npm run install:all

# Setup environment variables
cp .env.example .env

# Generate Prisma Client
npm run db:generate

# Start development servers
npm run dev
```

Frontend application will be available at: `http://localhost:5173`  
Backend API and Health check will be available at: `http://localhost:5000/health`  
Interactive Swagger API documentation: `http://localhost:5000/api/docs`

---

## 4. Fictional Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Customer** | `alex.morgan@finpay.local` | `FintechDemo#2026` |
| **Administrator** | `admin@finpay.local` | `FintechDemo#2026` |
| **Support Agent** | `support@finpay.local` | `FintechDemo#2026` |

---

## 5. Security & Financial Transaction Safety

- **Decimal Arithmetic:** Monetary values are modeled and calculated using decimal precision (`decimal.js` / Postgres `Decimal(18, 4)`) avoiding floating-point roundoff issues.
- **No Plaintext Cards:** Virtual cards use tokenized references and masked PANs (`4111********1111`).
- **Idempotency:** Transfers and payments support idempotency keys to eliminate double-spending or duplicate debit execution.
- **Audit Trails:** All sensitive user, payment, and KYC lifecycle events write to an immutable audit log.
