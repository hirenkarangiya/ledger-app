import { Router } from 'express';
import { z } from 'zod';
import * as transactionService from '../services/transactions.service.js';

const router = Router();

// Checks that a string is a real calendar date in YYYY-MM-DD format
const isRealDate = (d) => {
  const t = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
};

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine(isRealDate, 'Not a valid calendar date');

// Query-string filters. z.coerce converts "2" (text) into 2 (number).
const listQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
  account_id: z.coerce.number().int().positive().optional(),
  category_id: z.coerce.number().int().positive().optional(),
  kind: z.enum(['income', 'expense']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createTransactionSchema = z.object({
  account_id: z.number().int().positive(),
  category_id: z.number().int().positive().nullable().optional(),
  txn_date: dateString,
  description: z.string().trim().min(1, 'Description is required').max(255),
  amount: z.number().positive('Amount must be greater than zero').max(9999999999.99),
  kind: z.enum(['income', 'expense']),
});

function sendValidationError(res, zodError) {
  return res.status(400).json({
    error: 'Validation failed',
    details: zodError.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
  });
}

// GET /api/transactions?from=2026-11-01&kind=expense&page=1&limit=20
router.get('/', async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  // Run both queries at the same time
  const [items, total] = await Promise.all([
    transactionService.listTransactions(parsed.data),
    transactionService.countTransactions(parsed.data),
  ]);

  res.json({ items, total, page: parsed.data.page, limit: parsed.data.limit });
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid transaction id' });
  }

  const transaction = await transactionService.getTransactionById(id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json(transaction);
});

// POST /api/transactions
router.post('/', async (req, res) => {
  const parsed = createTransactionSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  const transaction = await transactionService.createTransaction(parsed.data);
  res.status(201).json(transaction);
});

export default router;