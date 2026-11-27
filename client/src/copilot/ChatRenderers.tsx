import { useRenderTool } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import type { Account, CategoryRow, MonthlyRow, Transaction } from '../api/types';
import {
  ChatAccountCards,
  ChatCategoryBars,
  ChatMonthlyChart,
  ChatTransactionTable,
} from './ChatComponents';

// The tool result can arrive as an object or as JSON text, so handle both
function parseResult<T>(result: unknown): T | null {
  if (!result) return null;
  if (typeof result === 'string') {
    try {
      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }
  return result as T;
}

// Accepts any arguments, because the components only care about the result
const anyArgs = z.object({}).passthrough();

function Loading({ label }: { label: string }) {
  return <div className="chat-card chat-loading">{label}</div>;
}

function ErrorCard({ message }: { message: string }) {
  return <div className="chat-card form-error">{message}</div>;
}

export default function ChatRenderers() {
  useRenderTool({
    name: 'list_transactions',
    parameters: anyArgs,
    render: ({ status, result }) => {
      if (status !== 'complete') return <Loading label="Looking up transactions..." />;
      const data = parseResult<{ items: Transaction[]; error?: string }>(result);
      if (!data) return null;
      if (data.error) return <ErrorCard message={data.error} />;
      return <ChatTransactionTable items={data.items} />;
    },
  });

  useRenderTool({
    name: 'list_accounts',
    parameters: anyArgs,
    render: ({ status, result }) => {
      if (status !== 'complete') return <Loading label="Checking your accounts..." />;
      const data = parseResult<{ items: Account[]; error?: string }>(result);
      if (!data) return null;
      if (data.error) return <ErrorCard message={data.error} />;
      return <ChatAccountCards items={data.items} />;
    },
  });

  useRenderTool({
    name: 'get_monthly_summary',
    parameters: anyArgs,
    render: ({ status, result }) => {
      if (status !== 'complete') return <Loading label="Building the monthly summary..." />;
      const data = parseResult<{ year: number; months: MonthlyRow[]; error?: string }>(result);
      if (!data) return null;
      if (data.error) return <ErrorCard message={data.error} />;
      return <ChatMonthlyChart year={data.year} months={data.months} />;
    },
  });

  useRenderTool({
    name: 'get_category_breakdown',
    parameters: anyArgs,
    render: ({ status, result }) => {
      if (status !== 'complete') return <Loading label="Totaling categories..." />;
      const data = parseResult<{ year: number; categories: CategoryRow[]; error?: string }>(result);
      if (!data) return null;
      if (data.error) return <ErrorCard message={data.error} />;
      return <ChatCategoryBars year={data.year} categories={data.categories} />;
    },
  });

  // This component only registers renderers, so it shows nothing itself
  return null;
}