# Ledger: Personal Finance Tracker

A fullstack personal finance app for tracking bank accounts, income and expenses, and monthly trends. It includes a REST API, a React dashboard, and an MCP server that lets AI assistants query the ledger.

![Dashboard](./docs/dashboard.png)

## Features

- Account balances calculated from transactions in SQL
- Add income and expense transactions with validation on both client and server
- Filter transactions by type, account, and date range, with pagination
- Monthly income vs. expense chart and expense breakdown by category
- MCP server exposing four tools for AI assistants

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TanStack Query, React Hook Form, Zod, Recharts
- **Backend:** Node.js, Express, MySQL 8, mysql2, Zod
- **AI integration:** Model Context Protocol (MCP) SDK
- **Testing:** Vitest, Supertest

## Architecture

```
React UI ──HTTP──► Express routes ──► Services ──► MySQL
                                          ▲
MCP client ──stdio──► MCP server ─────────┘
```

Routes handle HTTP and validation. Services hold business rules and SQL. The MCP server reuses the same services, so both the web app and AI tools follow the same rules.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MySQL 8 (MAMP works well on macOS and Windows)

### 1. Set up the database

```sql
CREATE DATABASE ledger_app;
CREATE DATABASE ledger_app_test;
```

Then load the schema and sample data:

```bash
mysql -u <user> -p ledger_app < server/sql/schema.sql
mysql -u <user> -p ledger_app < server/sql/seed.sql
```

### 2. Start the API

```bash
cd server
cp .env.example .env   # then fill in your database values
npm install
npm run dev            # http://localhost:4000
```

### 3. Start the web app

```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

## Running Tests

```bash
cd server
npm test
```

The tests use `ledger_app_test` and reset the data before each test.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/accounts` | List accounts with current balances |
| POST | `/api/accounts` | Create an account |
| GET | `/api/transactions` | List transactions with filters and pagination |
| POST | `/api/transactions` | Record a transaction |
| GET | `/api/categories` | List categories |
| GET | `/api/reports/monthly?year=` | Monthly income, expense, and net |
| GET | `/api/reports/categories?year=&kind=` | Totals by category |

## MCP Server

Run the server with `npm run mcp` from the `server` folder. It exposes these tools:

- `list_accounts`
- `list_transactions`
- `get_monthly_summary`
- `add_transaction`

## Design Decisions

- **Money is stored as `DECIMAL(12,2)`**, never floating point, to avoid rounding errors.
- **Business rules live in the service layer**, so the API and MCP tools follow the same checks.
- **Parameterized queries throughout** prevent SQL injection.
- **Balances are calculated in SQL** from the transaction history, so they can't drift out of sync.

## Roadmap

- Edit and delete transactions
- Authentication with per-user ledgers
- Budget limits per category