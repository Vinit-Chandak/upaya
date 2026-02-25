import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { AppError } from '../middleware/error';
import type { Temple } from '@upaya/shared';

export const templeRouter = Router();

/**
 * GET /api/temples
 * List all active temples, optionally filtered by city or state.
 */
templeRouter.get('/', async (req, res, next) => {
  try {
    const { city, state } = req.query;

    let sql = `SELECT * FROM temples WHERE status = 'active'`;
    const params: unknown[] = [];
    let paramIdx = 1;

    if (city) {
      sql += ` AND LOWER(city) = LOWER($${paramIdx++})`;
      params.push(city);
    }
    if (state) {
      sql += ` AND LOWER(state) = LOWER($${paramIdx++})`;
      params.push(state);
    }

    sql += ` ORDER BY total_pujas_completed DESC, rating DESC`;

    const temples = await query<Temple>(sql, params);
    res.json({ temples });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/temples/:id
 * Get a single temple by ID with its puja catalog.
 */
templeRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const temple = await queryOne<Temple>(
      `SELECT * FROM temples WHERE id = $1 AND status = 'active'`,
      [id],
    );

    if (!temple) {
      throw new AppError(404, 'Temple not found', 'TEMPLE_NOT_FOUND');
    }

    const pujas = await query(
      `SELECT * FROM puja_catalog WHERE temple_id = $1 AND status = 'active' ORDER BY created_at`,
      [id],
    );

    res.json({ temple, pujas });
  } catch (error) {
    next(error);
  }
});
