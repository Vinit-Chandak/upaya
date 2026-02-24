import { pool } from './connection';
import { schema } from './schema';

/**
 * Run database migrations.
 * Creates all tables defined in the schema if they don't exist.
 */
async function migrate(): Promise<void> {
  console.log('[Migration] Starting database migration...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Execute schema
    await client.query(schema);

    await client.query('COMMIT');
    console.log('[Migration] Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Migration] Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
