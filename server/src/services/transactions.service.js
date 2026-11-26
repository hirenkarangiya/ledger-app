import { pool } from '../db.js';
import { httpError } from '../utils/httpError.js';

const SELECT_TRANSACTIONS = `
  SELECT
    t.id,
    t.account_id,
    a.name AS account_name,
    t.category_id,
    c.name AS category_name,
    t.txn_date,
    t.description,
    t.amount,
    t.kind
  FROM transactions t
  JOIN accounts a ON a.id = t.account_id
  LEFT JOIN categories c ON c.id = t.category_id
`;

// Builds the WHERE clause and its values from the optional filters.
// Used by both the list query and the count query.
function buildFilters(filters) {
  const conditions = [];
  const params = [];

  if (filters.from) {
    conditions.push('t.txn_date >= ?');
    params.push(filters.from);
  }
  if (filters.to) {
    conditions.push('t.txn_date <= ?');
    params.push(filters.to);
  }
  if (filters.account_id) {
    conditions.push('t.account_id = ?');
    params.push(filters.account_id);
  }
  if (filters.category_id) {
    conditions.push('t.category_id = ?');
    params.push(filters.category_id);
  }
  if (filters.kind) {
    conditions.push('t.kind = ?');
    params.push(filters.kind);
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

export async function listTransactions(filters) {
  const { where, params } = buildFilters(filters);

  const [rows] = await pool.query(
    `${SELECT_TRANSACTIONS} ${where} ORDER BY t.txn_date DESC, t.id DESC LIMIT ? OFFSET ?`,
    [...params, filters.limit, (filters.page - 1) * filters.limit]
  );
  return rows;
}

// Counts every row that matches the filters, ignoring pagination
export async function countTransactions(filters) {
  const { where, params } = buildFilters(filters);

  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM transactions t ${where}`, params);
  return Number(rows[0].total);
}

export async function getTransactionById(id) {
  const [rows] = await pool.execute(`${SELECT_TRANSACTIONS} WHERE t.id = ?`, [id]);
  return rows[0] ?? null;
}

export async function createTransaction(data) {
  const [accounts] = await pool.execute('SELECT id FROM accounts WHERE id = ?', [data.account_id]);
  if (accounts.length === 0) {
    throw httpError(400, 'Account does not exist');
  }

  if (data.category_id) {
    const [categories] = await pool.execute('SELECT kind FROM categories WHERE id = ?', [data.category_id]);
    if (categories.length === 0) {
      throw httpError(400, 'Category does not exist');
    }
    if (categories[0].kind !== data.kind) {
      throw httpError(400, `Category is '${categories[0].kind}' but transaction is '${data.kind}'`);
    }
  }

  const [result] = await pool.execute(
    `INSERT INTO transactions (account_id, category_id, txn_date, description, amount, kind)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.account_id, data.category_id ?? null, data.txn_date, data.description, data.amount, data.kind]
  );
  return getTransactionById(result.insertId);
}