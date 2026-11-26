import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import type { TransactionFilters } from '../api/types';
import { formatINR } from '../utils/format';

const PAGE_SIZE = 10;

const BADGE_TONES = ['badge-blue', 'badge-amber', 'badge-green', 'badge-purple', 'badge-pink', 'badge-cyan'];

function badgeTone(name: string) {
  const sum = [...name].reduce((total, ch) => total + ch.charCodeAt(0), 0);
  return BADGE_TONES[sum % BADGE_TONES.length];
}

export default function TransactionTable() {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: PAGE_SIZE });
  const [search, setSearch] = useState('');

  const accounts = useAccounts();
  const { data: transactions, isLoading, isError, error } = useTransactions(filters);

  const items = transactions?.items ?? [];
  const total = transactions?.total ?? 0;

  // Numbers for the footer, such as "Showing 11–20 of 45"
  const from = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(filters.page * PAGE_SIZE, total);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Changing any filter returns to page 1
  function updateFilter(patch: Partial<TransactionFilters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  // Search runs on the rows already loaded for this page
  const visible = items.filter((t) =>
    t.description.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Transactions</h2>

        <div className="toolbar">
          <div className="search">
            <Search size={16} />
            <input
              placeholder="Search this page..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input compact"
            value={filters.kind ?? ''}
            onChange={(e) => updateFilter({ kind: (e.target.value || undefined) as TransactionFilters['kind'] })}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className="input compact"
            value={filters.account_id ?? ''}
            onChange={(e) => updateFilter({ account_id: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">All accounts</option>
            {accounts.data?.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <input
            type="date"
            className="input compact"
            value={filters.from ?? ''}
            onChange={(e) => updateFilter({ from: e.target.value || undefined })}
          />
          <input
            type="date"
            className="input compact"
            value={filters.to ?? ''}
            onChange={(e) => updateFilter({ to: e.target.value || undefined })}
          />
        </div>
      </div>

      {isLoading && <p className="muted">Loading transactions...</p>}
      {isError && <p className="form-error">Could not load transactions: {error.message}</p>}

      {transactions && (
        <>
          <div className="table-wrap">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Account</th>
                  <th>Category</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <td className="muted">{t.txn_date}</td>
                    <td className="strong">{t.description}</td>
                    <td>{t.account_name}</td>
                    <td>
                      <span className={`badge ${badgeTone(t.category_name ?? 'none')}`}>
                        {t.category_name ?? 'Uncategorized'}
                      </span>
                    </td>
                    <td className={`right amount-cell ${t.kind}`}>
                      {t.kind === 'income' ? '+' : '-'}
                      {formatINR(Number(t.amount))}
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span className="muted small">
              {search
                ? `${visible.length} match${visible.length === 1 ? '' : 'es'} on this page`
                : `Showing ${from}–${to} of ${total} transaction${total === 1 ? '' : 's'}`}
            </span>

            <div className="pager">
              <button
                className="page-btn"
                disabled={filters.page === 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-current">{filters.page}</span>
              <span className="muted small">of {totalPages}</span>
              <button
                className="page-btn"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}