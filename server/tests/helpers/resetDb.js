import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Drops and recreates the tables, then loads the sample data
export async function resetDb() {
  const sql = ['schema.sql', 'seeds.sql']
    .map((file) => fs.readFileSync(path.join(serverRoot, 'sql', file), 'utf8'))
    .join('\n');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  await conn.query(sql);
  await conn.end();
}