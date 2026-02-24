import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client:', err);
});

/**
 * Execute a query against the database.
 */
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Execute a query and return a single row (or null).
 */
export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Test the database connection.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    console.log('[Database] Connection successful');
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    return false;
  }
}
