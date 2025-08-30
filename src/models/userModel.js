// src/models/userModel.js
import { pool } from '../db/mysql.js';

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, email, password_hash AS passwordHash, created_at AS createdAt FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

export async function createUser({ email, passwordHash }) {
  await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  );
  return findUserByEmail(email);
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, email, password_hash AS passwordHash, created_at AS createdAt FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}
