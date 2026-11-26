import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Save } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
import { useCreateTransaction } from '../hooks/useCreateTransaction';

// Form values are text, because that's what inputs produce.
const schema = z.object({
  account_id: z.string().min(1, 'Choose an account'),
  category_id: z.string(),
  txn_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
  description: z.string().trim().min(1, 'Description is required').max(255),
  amount: z.string().refine((v) => Number(v) > 0, 'Amount must be greater than zero'),
  kind: z.enum(['income', 'expense']),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  account_id: '',
  category_id: '',
  txn_date: new Date().toLocaleDateString('en-CA'),
  description: '',
  amount: '',
  kind: 'expense',
};

// A labeled input with an optional error message
interface FieldProps {
  label: string;
  error?: string;
  full?: boolean;
  children: ReactNode;
}

function Field({ label, error, full, children }: FieldProps) {
  return (
    <label className={`field${full ? ' full' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export default function AddTransactionForm() {
  const accounts = useAccounts();
  const categories = useCategories();
  const createTransaction = useCreateTransaction();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const kind = watch('kind');
  const visibleCategories = categories.data?.filter((c) => c.kind === kind) ?? [];

  // Switching type clears the category, since categories depend on the type
  function chooseKind(next: 'income' | 'expense') {
    setValue('kind', next);
    setValue('category_id', '');
  }

  const onSubmit = (values: FormValues) => {
    createTransaction.mutate(
      {
        account_id: Number(values.account_id),
        category_id: values.category_id ? Number(values.category_id) : null,
        txn_date: values.txn_date,
        description: values.description,
        amount: Number(values.amount),
        kind: values.kind,
      },
      { onSuccess: () => reset(defaultValues) }
    );
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="section-title">
          <span className="title-icon">
            <Plus size={18} />
          </span>
          Add Transaction
        </h2>

        <div className="segmented" role="group" aria-label="Transaction type">
          <button
            type="button"
            className={`seg ${kind === 'expense' ? 'active-expense' : ''}`}
            onClick={() => chooseKind('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`seg ${kind === 'income' ? 'active-income' : ''}`}
            onClick={() => chooseKind('income')}
          >
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        <Field label="Account" error={errors.account_id?.message}>
          <select className="input" {...register('account_id')}>
            <option value="">Choose an account</option>
            {accounts.data?.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Category">
          <select className="input" {...register('category_id')}>
            <option value="">Uncategorized</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Date" error={errors.txn_date?.message}>
          <input type="date" className="input" {...register('txn_date')} />
        </Field>

        <Field label="Amount (₹)" error={errors.amount?.message}>
          <input
            type="number"
            step="0.01"
            placeholder="Enter amount"
            className="input"
            {...register('amount')}
          />
        </Field>

        <Field label="Description" error={errors.description?.message} full>
          <input
            placeholder="e.g. Groceries at Big Bazaar"
            className="input"
            {...register('description')}
          />
        </Field>

        <div className="form-footer field full">
          {createTransaction.isError && (
            <p className="form-error">{createTransaction.error.message}</p>
          )}
          {createTransaction.isSuccess && (
            <p className="form-success">Transaction saved.</p>
          )}
          <button
            type="submit"
            className={`btn-save ${kind === 'income' ? 'income' : ''}`}
            disabled={createTransaction.isPending}
          >
            <Save size={16} />
            {createTransaction.isPending ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </section>
  );
}