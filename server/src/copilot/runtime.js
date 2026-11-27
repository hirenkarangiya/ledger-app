import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from '@copilotkit/runtime/v2';
import {
  listAccountsTool,
  listTransactionsTool,
  monthlySummaryTool,
  categoryBreakdownTool,
} from './tools.js';

const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, server's local date

const agent = new BuiltInAgent({
  model: process.env.GEMINI_MODEL ?? 'google/gemini-3.5-flash',
  maxSteps: 5,
  tools: [
    listAccountsTool,
    listTransactionsTool,
    monthlySummaryTool,
    categoryBreakdownTool,
  ],
  prompt:
    "You are the assistant inside Ledger, a personal finance app. " +
    `Today's date is ${today}. ` +
    "Use the tools to look up the user's real accounts and transactions. " +
    "Never invent amounts. If a tool returns an error, say so. " +
    "The chat displays tool results as tables and charts automatically, " +
    "so do not repeat the rows or numbers in text. " +
    "Reply with one short sentence that summarizes the result. " +
    "To add a transaction, call add_transaction with the account name and category name the user gave, " +
    "and the date in YYYY-MM-DD format. The user approves it in the chat before anything is saved. " +
    "Only say a transaction was saved if the approval result says it was saved. " +
    "All amounts are in Indian rupees (INR).",
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
});

export const copilotHandler = createCopilotRuntimeHandler({
  runtime,
  basePath: '/api/copilotkit',
});