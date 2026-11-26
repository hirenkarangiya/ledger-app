import { pool } from '../db.js';

// Converts a year into a half-open date range: [Jan 1, next Jan 1)
function yearRange(year) {
  return { start: `${year}-01-01`, end: `${year + 1}-01-01` };
}

// Income, expense, and net per month for one year
export async function monthlySummary(year) {
  const { start, end } = yearRange(year);

  const [rows] = await pool.execute(
    `SELECT
       DATE_FORMAT(t.txn_date, '%Y-%m') AS month,
       COALESCE(SUM(CASE WHEN t.kind = 'income'  THEN t.amount END), 0) AS income,
       COALESCE(SUM(CASE WHEN t.kind = 'expense' THEN t.amount END), 0) AS expense,
       COALESCE(SUM(CASE WHEN t.kind = 'income'  THEN t.amount
                         WHEN t.kind = 'expense' THEN -t.amount END), 0) AS net
     FROM transactions t
     WHERE t.txn_date >= ? AND t.txn_date < ?
     GROUP BY month
     ORDER BY month`,
    [start, end]
  );
  return rows;
}

// Totals per category for one year, for income or expenses
export async function categoryBreakdown(year, kind) {
  const { start, end } = yearRange(year);

  const [rows] = await pool.execute(
    `SELECT
       COALESCE(c.name, 'Uncategorized') AS category,
       COUNT(*) AS transaction_count,
       SUM(t.amount) AS total
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.txn_date >= ? AND t.txn_date < ? AND t.kind = ?
     GROUP BY category
     ORDER BY total DESC`,
    [start, end, kind]
  );
  return rows;
}