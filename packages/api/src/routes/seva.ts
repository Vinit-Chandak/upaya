import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { SevaCatalogWithTemple, SevaBookingWithDetails } from '@upaya/shared';

export const sevaRouter = Router();

/**
 * GET /api/seva
 * List seva catalog with optional type filter.
 */
sevaRouter.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;

    let sql = `
      SELECT
        sc.*,
        t.name AS temple_name,
        t.name_hi AS temple_name_hi,
        t.city AS temple_city
      FROM seva_catalog sc
      JOIN temples t ON sc.temple_id = t.id
      WHERE t.status = 'active'
    `;
    const params: unknown[] = [];

    if (type) {
      sql += ` AND sc.type = $1`;
      params.push(type);
    }

    sql += ` ORDER BY sc.price ASC`;

    const sevas = await query<SevaCatalogWithTemple>(sql, params);
    res.json({ sevas });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/seva/:id
 * Get seva detail.
 */
sevaRouter.get('/:id', async (req, res, next) => {
  try {
    const seva = await queryOne<SevaCatalogWithTemple>(
      `SELECT
        sc.*,
        t.name AS temple_name,
        t.name_hi AS temple_name_hi,
        t.city AS temple_city
       FROM seva_catalog sc
       JOIN temples t ON sc.temple_id = t.id
       WHERE sc.id = $1`,
      [req.params.id],
    );

    if (!seva) {
      throw new AppError(404, 'Seva not found', 'SEVA_NOT_FOUND');
    }

    res.json({ seva });
  } catch (error) {
    next(error);
  }
});

const bookSevaSchema = z.object({
  sevaCatalogId: z.string().uuid(),
  templeId: z.string().uuid(),
});

/**
 * POST /api/seva/book
 * Book a seva. Requires auth.
 */
sevaRouter.post('/book', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = bookSevaSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Verify seva exists
    const seva = await queryOne<{ id: string; temple_id: string; price: number }>(
      'SELECT id, temple_id, price FROM seva_catalog WHERE id = $1',
      [body.sevaCatalogId],
    );
    if (!seva) throw new AppError(404, 'Seva not found', 'SEVA_NOT_FOUND');

    // Verify temple matches
    if (seva.temple_id !== body.templeId) {
      throw new AppError(400, 'Temple does not match seva', 'TEMPLE_MISMATCH');
    }

    // Create booking
    const booking = await queryOne<SevaBookingWithDetails>(
      `INSERT INTO seva_bookings (user_id, seva_catalog_id, temple_id, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [user.id, body.sevaCatalogId, body.templeId],
    );

    res.status(201).json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/seva/bookings
 * List user's seva bookings. Requires auth.
 */
sevaRouter.get('/bookings', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const { status } = req.query;

    let sql = `
      SELECT
        sb.*,
        sc.name AS seva_name,
        sc.name_hi AS seva_name_hi,
        sc.type AS seva_type,
        sc.price AS seva_price,
        t.name AS temple_name,
        t.name_hi AS temple_name_hi,
        t.city AS temple_city
      FROM seva_bookings sb
      JOIN seva_catalog sc ON sb.seva_catalog_id = sc.id
      JOIN temples t ON sb.temple_id = t.id
      WHERE sb.user_id = $1
    `;
    const params: unknown[] = [user.id];

    if (status) {
      sql += ` AND sb.status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY sb.created_at DESC`;

    const bookings = await query<SevaBookingWithDetails>(sql, params);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});
