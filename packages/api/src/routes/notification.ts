import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

export const notificationRouter = Router();

/**
 * GET /api/notifications
 * List user's notifications with optional type filter.
 */
notificationRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const { type, unreadOnly, limit = '50', offset = '0' } = req.query;

    let sql = 'SELECT * FROM notifications WHERE user_id = $1';
    const params: unknown[] = [user.id];
    let paramIdx = 2;

    if (type) {
      sql += ` AND type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    if (unreadOnly === 'true') {
      sql += ' AND read = FALSE';
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const notifications = await query(sql, params);

    // Get unread count
    const unreadResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND read = FALSE',
      [user.id],
    );

    res.json({
      notifications,
      unreadCount: parseInt(unreadResult?.count || '0', 10),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read.
 */
notificationRouter.post('/:id/read', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    await query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read.
 */
notificationRouter.post('/read-all', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    await query(
      'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
      [user.id],
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

const updateSettingsSchema = z.object({
  remedyReminders: z.boolean().optional(),
  transitAlerts: z.boolean().optional(),
  festivalRemedies: z.boolean().optional(),
  pujaUpdates: z.boolean().optional(),
  promotional: z.boolean().optional(),
  reminderTimeMorning: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  reminderTimeEvening: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

/**
 * GET /api/notifications/settings
 * Get notification preferences.
 */
notificationRouter.get('/settings', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    let settings = await queryOne(
      'SELECT * FROM notification_settings WHERE user_id = $1',
      [user.id],
    );

    // Create default settings if not exist
    if (!settings) {
      settings = await queryOne(
        `INSERT INTO notification_settings (user_id) VALUES ($1) RETURNING *`,
        [user.id],
      );
    }

    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/settings
 * Update notification preferences.
 */
notificationRouter.patch('/settings', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = updateSettingsSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Upsert settings
    const setClauses: string[] = [];
    const params: unknown[] = [user.id];
    let paramIdx = 2;

    const fields: Array<[string, unknown]> = [
      ['remedy_reminders', body.remedyReminders],
      ['transit_alerts', body.transitAlerts],
      ['festival_remedies', body.festivalRemedies],
      ['puja_updates', body.pujaUpdates],
      ['promotional', body.promotional],
      ['reminder_time_morning', body.reminderTimeMorning],
      ['reminder_time_evening', body.reminderTimeEvening],
    ];

    for (const [field, value] of fields) {
      if (value !== undefined) {
        setClauses.push(`${field} = $${paramIdx}`);
        params.push(value);
        paramIdx++;
      }
    }

    if (setClauses.length === 0) {
      throw new AppError(400, 'No fields to update', 'NO_FIELDS');
    }

    const settings = await queryOne(
      `INSERT INTO notification_settings (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET ${setClauses.join(', ')}
       RETURNING *`,
      params,
    );

    res.json({ settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});
