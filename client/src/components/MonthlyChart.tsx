import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMonthlyReport } from '../hooks/useReports';
import { formatCompact, formatINR, monthLabel } from '../utils/format';

interface Props {
  year: number;
}

export default function MonthlyChart({ year }: Props) {
  const { data, isLoading, isError, error } = useMonthlyReport(year);

  const chartData =
    data?.months.map((m) => ({
      month: monthLabel(m.month),
      Income: Number(m.income),
      Expense: Number(m.expense),
    })) ?? [];

  return (
    <section className="card">
      <div className="card-header">
        <h2>Monthly Summary</h2>
        <div className="chart-legend">
          <span><i className="dot" style={{ background: '#e5484d' }} />Expense</span>
          <span><i className="dot" style={{ background: '#22a06b' }} />Income</span>
        </div>
      </div>

      {isLoading && <p className="muted">Loading...</p>}
      {isError && <p>Could not load report: {error.message}</p>}
      {data && chartData.length === 0 && <p className="muted">No transactions for {year}.</p>}

      {chartData.length > 0 && (
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={6}>
              <CartesianGrid vertical={false} stroke="#eeeae4" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
              <YAxis
                tickFormatter={(v) => formatCompact(Number(v))}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280' }}
                width={80}
              />
              <Tooltip formatter={(v) => formatINR(Number(v))} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="Income" fill="#22a06b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expense" fill="#e5484d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}