import { pool } from './connection';

/**
 * Seed the database with initial test data.
 * Useful for development and testing.
 */
async function seed(): Promise<void> {
  console.log('[Seed] Starting database seeding...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Seed will be populated as we build out features.
    // For now, just verify the connection works.
    const result = await client.query('SELECT NOW() as current_time');
    console.log('[Seed] Database time:', result.rows[0].current_time);

    await client.query('COMMIT');
    console.log('[Seed] Seeding completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seed] Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
