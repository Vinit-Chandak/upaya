import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { MuhurtaQuery } from '@upaya/shared';

export const muhurtaRouter = Router();

const createMuhurtaQuerySchema = z.object({
  queryText: z.string().min(1).max(2000),
  category: z.enum(['marriage', 'business', 'property', 'travel', 'education', 'ceremony', 'other']),
});

/**
 * POST /api/muhurta
 * Submit a muhurta query. Requires auth.
 */
muhurtaRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createMuhurtaQuerySchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Create the muhurta query with empty recommended dates (to be filled by AI processing)
    const muhurtaQuery = await queryOne<MuhurtaQuery>(
      `INSERT INTO muhurta_queries (user_id, query_text, category, recommended_dates_json)
       VALUES ($1, $2, $3, '[]'::jsonb)
       RETURNING *`,
      [user.id, body.queryText, body.category],
    );

    res.status(201).json({ query: muhurtaQuery });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/muhurta
 * List the authenticated user's muhurta queries. Requires auth.
 */
muhurtaRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const { category } = req.query;

    let sql = 'SELECT * FROM muhurta_queries WHERE user_id = $1';
    const params: unknown[] = [user.id];

    if (category) {
      sql += ' AND category = $2';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC';

    const queries = await query<MuhurtaQuery>(sql, params);
    res.json({ queries });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/muhurta/:id
 * Get a muhurta query result. Requires auth.
 */
muhurtaRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const muhurtaQuery = await queryOne<MuhurtaQuery>(
      'SELECT * FROM muhurta_queries WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );
    if (!muhurtaQuery) throw new AppError(404, 'Muhurta query not found', 'MUHURTA_QUERY_NOT_FOUND');

    res.json({ query: muhurtaQuery });
  } catch (error) {
    next(error);
  }
});
