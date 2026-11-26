import { pool } from './db.js';

const [rows] = await pool.query('SELECT 1 AS ok');
console.log('Connected to MySQL:', rows);
await pool.end();