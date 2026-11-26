import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/db.js';
import { resetDb } from './helpers/resetDb.js';

// Every test starts from the same known data
beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await pool.end();
});

describe('GET /api/transactions', () => {
  it('returns the total and one page of items', async () => {
    const res = await request(app).get('/api/transactions?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(15);
    expect(res.body.items).toHaveLength(5);
  });

  it('filters by kind', async () => {
    const res = await request(app).get('/api/transactions?kind=income');

    expect(res.body.total).toBe(4);
    expect(res.body.items.every((t) => t.kind === 'income')).toBe(true);
  });

  it('rejects an impossible date', async () => {
    const res = await request(app).get('/api/transactions?from=2026-13-01');

    expect(res.status).toBe(400);
  });
});

describe('POST /api/transactions', () => {
  it('creates a transaction and updates the account balance', async () => {
    const before = await request(app).get('/api/accounts/1');
    expect(before.body.current_balance).toBe('186950.00');

    const created = await request(app).post('/api/transactions').send({
      account_id: 1,
      category_id: 3,
      txn_date: '2026-11-25',
      description: 'Test groceries',
      amount: 100,
      kind: 'expense',
    });
    expect(created.status).toBe(201);

    const after = await request(app).get('/api/accounts/1');
    expect(after.body.current_balance).toBe('186850.00');
  });

  it('rejects a category that does not match the transaction type', async () => {
    const res = await request(app).post('/api/transactions').send({
      account_id: 1,
      category_id: 1, // Salary, an income category
      txn_date: '2026-11-25',
      description: 'Mismatch',
      amount: 100,
      kind: 'expense',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Category is 'income'/);
  });

  it('rejects a zero amount', async () => {
    const res = await request(app).post('/api/transactions').send({
      account_id: 1,
      txn_date: '2026-11-25',
      description: 'Zero',
      amount: 0,
      kind: 'expense',
    });

    expect(res.status).toBe(400);
  });

  it('rejects an account that does not exist', async () => {
    const res = await request(app).post('/api/transactions').send({
      account_id: 999,
      txn_date: '2026-11-25',
      description: 'Ghost account',
      amount: 100,
      kind: 'expense',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Account does not exist');
  });
});

describe('GET /api/reports/monthly', () => {
  it('matches the October totals from the seed data', async () => {
    const res = await request(app).get('/api/reports/monthly?year=2026');
    const october = res.body.months.find((m) => m.month === '2026-10');

    expect(october.income).toBe('105000.00');
    expect(october.expense).toBe('47549.00');
  });
});