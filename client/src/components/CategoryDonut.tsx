import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useCategoryReport } from '../hooks/useReports';
import { formatINR } from '../utils/format';

const palette = ['#3b82f6', '#f59e0b', '#22a06b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];

interface Props {
  year: number;
}

export default function CategoryDonut({ year }: Props) {
  const { data, isLoading, isError, error } = useCategoryReport(year, 'expense');

  // Convert the API's text totals into numbers, and give each category a color
  const rows =
    data?.categories.map((c, i) => ({
      name: c.category,
      value: Number(c.total),
      color: palette[i % palette.length],
    })) ?? [];

  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <section className="card">
      <h2>Expenses by Category</h2>

      {isLoading && <p className="muted">Loading...</p>}
      {isError && <p>Could not load categories: {error.message}</p>}
      {data && rows.length === 0 && <p className="muted">No expenses for {year}.</p>}

      {rows.length > 0 && (
        <>
          <div className="donut-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {rows.map((r) => (
                    <Cell key={r.name} fill={r.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(Number(v))} />
              </PieChart>
            </ResponsiveContainer>

            <div className="donut-center">
              <span className="muted small">Total Expenses</span>
              <strong>{formatINR(total)}</strong>
            </div>
          </div>

          <ul className="legend-list">
            {rows.map((r) => {
              const percent = total ? (r.value / total) * 100 : 0;
              return (
                <li key={r.name}>
                  <span className="dot" style={{ background: r.color }} />
                  <span>{r.name}</span>
                  <span className="muted small">{percent.toFixed(1)}%</span>
                  <strong>{formatINR(r.value)}</strong>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}