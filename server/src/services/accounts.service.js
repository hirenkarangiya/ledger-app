import { pool } from '../db.js';

// Shared query: each account plus its current balance.
// Balance = opening balance + income − expenses.
const BALANCE_QUERY = `
  SELECT
    a.id,
    a.name,
    a.account_type,
    a.currency,
    a.opening_balance,
    ROUND(
      a.opening_balance + COALESCE(SUM(
        CASE
          WHEN t.kind = 'income'  THEN t.amount
          WHEN t.kind = 'expense' THEN -t.amount
        END
      ), 0),
    2) AS current_balance
  FROM accounts a
  LEFT JOIN transactions t ON t.account_id = a.id
`;

export async function listAccounts() {
  const [rows] = await pool.query(`${BALANCE_QUERY} GROUP BY a.id ORDER BY a.id`);
  return rows;
}

export async function getAccountById(id) {
  const [rows] = await pool.execute(`${BALANCE_QUERY} WHERE a.id = ? GROUP BY a.id`, [id]);
  return rows[0] ?? null;
}

export async function createAccount({ name, account_type, currency, opening_balance }) {
  const [result] = await pool.execute(
    'INSERT INTO accounts (name, account_type, currency, opening_balance) VALUES (?, ?, ?, ?)',
    [name, account_type, currency, opening_balance]
  );
  return getAccountById(result.insertId);
}