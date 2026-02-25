import { Router } from 'express';
import { query, queryOne } from '../db/connection';
import { AppError } from '../middleware/error';
import type { PujaCatalogWithTemple } from '@upaya/shared';

export const pujaRouter = Router();

/**
 * GET /api/pujas
 * List active pujas, optionally filtered by dosha_type.
 * Includes temple info for each puja.
 */
pujaRouter.get('/', async (req, res, next) => {
  try {
    const { doshaType } = req.query;

    let sql = `
      SELECT
        pc.*,
        t.name AS temple_name,
        t.name_hi AS temple_name_hi,
        t.city AS temple_city,
        t.state AS temple_state,
        t.rating AS temple_rating,
        t.total_pujas_completed AS temple_total_pujas,
        t.images AS temple_images
      FROM puja_catalog pc
      JOIN temples t ON pc.temple_id = t.id
      WHERE pc.status = 'active' AND t.status = 'active'
    `;
    const params: unknown[] = [];

    if (doshaType) {
      sql += ` AND pc.dosha_type = $1`;
      params.push(doshaType);
    }

    sql += ` ORDER BY t.rating DESC, pc.created_at`;

    const pujas = await query<PujaCatalogWithTemple>(sql, params);
    res.json({ pujas });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pujas/:id
 * Get a single puja with full temple details.
 */
pujaRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const puja = await queryOne<PujaCatalogWithTemple>(
      `SELECT
        pc.*,
        t.name AS temple_name,
        t.name_hi AS temple_name_hi,
        t.city AS temple_city,
        t.state AS temple_state,
        t.rating AS temple_rating,
        t.total_pujas_completed AS temple_total_pujas,
        t.images AS temple_images,
        t.description AS temple_description,
        t.description_hi AS temple_description_hi
      FROM puja_catalog pc
      JOIN temples t ON pc.temple_id = t.id
      WHERE pc.id = $1 AND pc.status = 'active'`,
      [id],
    );

    if (!puja) {
      throw new AppError(404, 'Puja not found', 'PUJA_NOT_FOUND');
    }

    res.json({ puja });
  } catch (error) {
    next(error);
  }
});
