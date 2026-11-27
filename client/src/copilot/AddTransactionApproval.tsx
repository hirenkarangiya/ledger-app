import { useState } from 'react';
import { useHumanInTheLoop } from '@copilotkit/react-core/v2';
import { z } from 'zod';
import { useAccounts } from '../hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
import { useCreateTransaction } from '../hooks/useCreateTransaction';
import { formatINR } from '../utils/format';

const parameters = z.object({
  account_name: z.string().describe('Name of the account, such as HDFC Savings'),
  category_name: z.string().optional().describe('Category name, such as Dining Out. Leave out if none.'),
  txn_date: z.string().describe('Date in YYYY-MM-DD format'),
  description: z.string().describe('Short description of the transaction'),
  amount: z.number().positive().describe('Amount in rupees, greater than zero'),
  kind: z.enum(['income', 'expense']),
});

type Args = z.infer<typeof parameters>;

// Registers the approval tool. It renders nothing itself.
export default function AddTransactionApproval() {
  useHumanInTheLoop({
    name: 'add_transaction',
    description:
      'Prepare a transaction for the user to approve in the chat. Nothing is saved until the user approves it.',
    parameters,
    render: ({ status, args, respond }) => {
      // Only show the loading text while the arguments are still arriving
      if (status === 'inProgress') {
        return <div className="chat-card chat-loading">Preparing transaction...</div>;
      }

      // Once the user has decided, keep the same card on screen, marked as resolved
      return (
        <ApprovalCard
          args={args as Args}
          respond={respond}
          resolved={status === 'complete'}
        />
      );
    },
  });

  return null;
}

function ApprovalCard({
  args,
  respond,
  resolved,
}: {
  args: Args;
  respond?: (result: unknown) => void;
  resolved: boolean;
}) {
  const accounts = useAccounts();
  const categories = useCategories();
  const createTransaction = useCreateTransaction();
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);

  // Match the names the assistant used to the real records
  const account = accounts.data?.find(
    (a) => a.name.toLowerCase() === args.account_name.toLowerCase()
  );
  const category = args.category_name
    ? categories.data?.find((c) => c.name.toLowerCase() === args.category_name!.toLowerCase())
    : undefined;
  const categoryNotFound = Boolean(args.category_name) && categories.data !== undefined && !category;
  const categoryTypeMismatch = Boolean(category) && category!.kind !== args.kind;
  const canApprove = Boolean(account) && !categoryNotFound && !categoryTypeMismatch && Boolean(respond);

  async function approve() {
    setError(null);
    try {
      const saved = await createTransaction.mutateAsync({
        account_id: account!.id,
        category_id: category?.id ?? null,
        txn_date: args.txn_date,
        description: args.description,
        amount: args.amount,
        kind: args.kind,
      });
      setOutcome('Saved to your ledger.');
      respond?.({ saved: true, id: saved.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save the transaction.';
      setError(message);
      setOutcome('Not saved.');
      respond?.({ saved: false, error: message });
    }
  }

  function cancel() {
    setOutcome('Cancelled. Nothing was saved.');
    respond?.({ saved: false, reason: 'The user cancelled.' });
  }

  // After a decision, show the result text instead of the buttons
  if (outcome || resolved) {
    return <div className="chat-card black-text">{outcome ?? 'Decision recorded.'}</div>;
  }

  return (
    <div className="chat-card">
      <div className="chat-card-title">Confirm transaction</div>
      <dl className="approval-grid">
        <dt>Type</dt>
        <dd className={args.kind}>{args.kind === 'income' ? 'Income' : 'Expense'}</dd>

        <dt>Amount</dt>
        <dd><strong>{formatINR(args.amount)}</strong></dd>

        <dt>Account</dt>
        <dd>
          {args.account_name}
          {accounts.data && !account && <span className="form-error"> (not found)</span>}
        </dd>

        <dt>Category</dt>
        <dd>
          {args.category_name ?? 'Uncategorized'}
          {categoryNotFound && <span className="form-error"> (not found)</span>}
          {categoryTypeMismatch && (
            <span className="form-error"> (this category is for {category!.kind}s)</span>
          )}
        </dd>

        <dt>Date</dt>
        <dd>{args.txn_date}</dd>

        <dt>Description</dt>
        <dd>{args.description}</dd>
      </dl>

      {error && <p className="form-error">{error}</p>}

      <div className="approval-actions">
        <button className="btn-secondary" onClick={cancel} disabled={createTransaction.isPending}>
          Cancel
        </button>
        <button className="btn-save" onClick={approve} disabled={!canApprove || createTransaction.isPending}>
          {createTransaction.isPending ? 'Saving...' : 'Approve & save'}
        </button>
      </div>
    </div>
  );
}
