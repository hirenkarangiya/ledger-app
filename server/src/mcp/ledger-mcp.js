import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as accountService from '../services/accounts.service.js';
import * as transactionService from '../services/transactions.service.js';
import * as reportService from '../services/reports.service.js';

const server = new McpServer({ name: 'ledger', version: '1.0.0' });

// Converts data into the text format MCP tools return
const ok = (data) => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
});

// Tells the AI that the tool failed and why
const fail = (err) => ({
  isError: true,
  content: [{ type: 'text', text: err.message }],
});

server.registerTool(
  'list_accounts',
  {
    title: 'List accounts',
    description: 'Lists all bank accounts with their current balances.',
    inputSchema: {},
  },
  async () => {
    try {
      return ok(await accountService.listAccounts());
    } catch (err) {
      return fail(err);
    }
  }
);

server.registerTool(
  'list_transactions',
  {
    title: 'List transactions',
    description:
      'Lists transactions, newest first. All filters are optional. Dates use the format YYYY-MM-DD.',
    inputSchema: {
      from: z.string().optional().describe('Start date, YYYY-MM-DD'),
      to: z.string().optional().describe('End date, YYYY-MM-DD'),
      kind: z.enum(['income', 'expense']).optional(),
      account_id: z.number().int().positive().optional(),
      limit: z.number().int().min(1).max(100).default(20),
    },
  },
  async (args) => {
    try {
      return ok(await transactionService.listTransactions({ page: 1, ...args }));
    } catch (err) {
      return fail(err);
    }
  }
);

server.registerTool(
  'get_monthly_summary',
  {
    title: 'Monthly summary',
    description: 'Shows income, expense, and net totals for each month of a year.',
    inputSchema: {
      year: z.number().int().min(2000).max(2100),
    },
  },
  async ({ year }) => {
    try {
      const months = await reportService.monthlySummary(year);
      return ok({ year, months });
    } catch (err) {
      return fail(err);
    }
  }
);

server.registerTool(
  'add_transaction',
  {
    title: 'Add transaction',
    description:
      'Records a new income or expense transaction. The amount must be positive, and the category must match the transaction type.',
    inputSchema: {
      account_id: z.number().int().positive(),
      category_id: z.number().int().positive().nullable().optional(),
      txn_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('YYYY-MM-DD'),
      description: z.string().min(1).max(255),
      amount: z.number().positive(),
      kind: z.enum(['income', 'expense']),
    },
  },
  async (args) => {
    try {
      return ok(await transactionService.createTransaction(args));
    } catch (err) {
      return fail(err);
    }
  }
);

// Start the server, listening on standard input and output
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Ledger MCP server is running');
