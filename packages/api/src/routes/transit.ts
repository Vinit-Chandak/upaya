import { Router } from 'express';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

export const transitRouter = Router();

/**
 * GET /api/transits
 * Get transit alerts for the authenticated user.
 */
transitRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const { unreadOnly } = req.query;

    let sql = 'SELECT * FROM transit_alerts WHERE user_id = $1';
    const params: unknown[] = [user.id];

    if (unreadOnly === 'true') {
      sql += ' AND read = FALSE';
    }

    sql += ' ORDER BY transit_date DESC';

    const alerts = await query(sql, params);
    res.json({ alerts });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transits/:id
 * Get a specific transit alert detail.
 */
transitRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const alert = await queryOne(
      'SELECT * FROM transit_alerts WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );
    if (!alert) throw new AppError(404, 'Transit alert not found', 'ALERT_NOT_FOUND');

    res.json({ alert });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/transits/:id/read
 * Mark a transit alert as read.
 */
transitRouter.post('/:id/read', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    await query(
      'UPDATE transit_alerts SET read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
