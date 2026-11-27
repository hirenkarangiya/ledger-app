import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Account, CategoryRow, MonthlyRow, Transaction } from '../api/types';
import { badgeTone } from '../utils/badge';
import { formatCompact, formatINR, monthLabel } from '../utils/format';

export function ChatTransactionTable({ items }: { items: Transaction[] }) {
  if (items.length === 0) {
    return <div className="chat-card black-text">No transactions found.</div>;
  }

  return (
    <div className="chat-card">
      <div className="chat-card-title">Recent transactions</div>
      <table className="chat-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th className="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td className="black-text">{t.txn_date}</td>
              <td>
                <strong>{t.description}</strong>
                <div className="black-text small">{t.account_name}</div>
              </td>
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
        </tbody>
      </table>
    </div>
  );
}

export function ChatAccountCards({ items }: { items: Account[] }) {
  return (
    <div className="chat-card">
      <div className="chat-card-title">Your accounts</div>
      <div className="chat-accounts">
        {items.map((a) => {
          const balance = Number(a.current_balance);
          return (
            <div key={a.id} className="chat-account">
              <div>
                <div><strong>{a.name}</strong></div>
                <div className="black-text small">{a.account_type.replace('_', ' ')}</div>
              </div>
              <div className={`chat-amount ${balance < 0 ? 'negative' : ''}`}>
                {formatINR(balance)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChatMonthlyChart({ year, months }: { year: number; months: MonthlyRow[] }) {
  const data = months.map((m) => ({
    month: monthLabel(m.month),
    Income: Number(m.income),
    Expense: Number(m.expense),
  }));

  if (data.length === 0) {
    return <div className="chat-card black-text">No transactions for {year}.</div>;
  }

  return (
    <div className="chat-card">
      <div className="chat-card-title">Monthly summary, {year}</div>
      <div className="chat-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(v) => formatCompact(Number(v))}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip formatter={(v) => formatINR(Number(v))} />
            <Bar dataKey="Income" fill="#22a06b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expense" fill="#e5484d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ChatCategoryBars({
  year,
  categories,
}: {
  year: number;
  categories: CategoryRow[];
}) {
  if (categories.length === 0) {
    return <div className="chat-card black-text">No expenses for {year}.</div>;
  }

  const total = categories.reduce((sum, c) => sum + Number(c.total), 0);

  return (
    <div className="chat-card">
      <div className="chat-card-title">Expenses by category, {year}</div>
      {categories.map((c) => {
        const value = Number(c.total);
        const percent = total ? (value / total) * 100 : 0;
        return (
          <div key={c.category} className="cat-row">
            <div className="cat-head">
              <span>{c.category}</span>
              <span>
                {percent.toFixed(1)}% · <strong>{formatINR(value)}</strong>
              </span>
            </div>
            <div className="cat-track">
              <div className="cat-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}