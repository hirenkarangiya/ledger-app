import { defineTool } from '@copilotkit/runtime/v2';
import { z } from 'zod';
import * as accountService from '../services/accounts.service.js';
import * as transactionService from '../services/transactions.service.js';
import * as reportService from '../services/reports.service.js';

// If a service throws, return the message to the model instead of crashing the run
const safe = (fn) => async (args) => {
  try {
    return await fn(args);
  } catch (err) {
    return { error: err.message };
  }
};

export const listAccountsTool = defineTool({
  name: 'list_accounts',
  description: 'Lists all bank accounts with their current balances in INR.',
  parameters: z.object({}),
  execute: safe(async () => ({ items: await accountService.listAccounts() })),
});

export const listTransactionsTool = defineTool({
  name: 'list_transactions',
  description:
    'Lists transactions, newest first. All filters are optional. Dates use YYYY-MM-DD. Use a small limit for quick questions.',
  parameters: z.object({
    from: z.string().optional().describe('Start date, YYYY-MM-DD'),
    to: z.string().optional().describe('End date, YYYY-MM-DD'),
    kind: z.enum(['income', 'expense']).optional(),
    account_id: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(20).default(5),
  }),
  execute: safe(async (args) => ({
    items: await transactionService.listTransactions({ page: 1, ...args }),
  })),
});

export const monthlySummaryTool = defineTool({
  name: 'get_monthly_summary',
  description: 'Shows income, expense, and net totals for each month of a year.',
  parameters: z.object({
    year: z.number().int().min(2000).max(2100),
  }),
  execute: safe(async ({ year }) => ({
    year,
    months: await reportService.monthlySummary(year),
  })),
});

export const categoryBreakdownTool = defineTool({
  name: 'get_category_breakdown',
  description: 'Shows totals per category for a year, for either income or expenses.',
  parameters: z.object({
    year: z.number().int().min(2000).max(2100),
    kind: z.enum(['income', 'expense']).default('expense'),
  }),
  execute: safe(async ({ year, kind }) => ({
    year,
    kind,
    categories: await reportService.categoryBreakdown(year, kind),
  })),
});
