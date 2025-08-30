// src/db/mysql.js
import mysql from 'mysql2/promise';
import { ENV } from '../config/env.js';

export const pool = mysql.createPool({
  host: ENV.MYSQL_HOST,
  port: ENV.MYSQL_PORT,
  user: ENV.MYSQL_USER,
  password: ENV.MYSQL_PASSWORD,
  database: ENV.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function pingDb() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
