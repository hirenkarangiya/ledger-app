import { pool } from '../db.js';

export async function listCategories() {
  const [rows] = await pool.query('SELECT id, name, kind FROM categories ORDER BY name');
  return rows;
}