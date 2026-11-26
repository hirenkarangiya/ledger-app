import { Router } from 'express';
import { z } from 'zod';
import * as accountService from '../services/accounts.service.js';

const router = Router();

const createAccountSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  account_type: z.enum(['savings', 'checking', 'credit_card']),
  currency: z.string().trim().toUpperCase().length(3).default('INR'),
  opening_balance: z.number().finite().max(9999999999.99).default(0),
});

// GET /api/accounts
router.get('/', async (req, res) => {
  const accounts = await accountService.listAccounts();
  res.json(accounts);
});

// GET /api/accounts/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid account id' });
  }

  const account = await accountService.getAccountById(id);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.json(account);
});

// POST /api/accounts
router.post('/', async (req, res) => {
  const parsed = createAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  const account = await accountService.createAccount(parsed.data);
  res.status(201).json(account);
});

export default router;