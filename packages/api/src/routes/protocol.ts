import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, optionalAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

export const protocolRouter = Router();

const createProtocolSchema = z.object({
  reportId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  nameHi: z.string().max(255).default(''),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalDays: z.number().int().min(1).max(365).default(63),
  tasks: z.array(
    z.object({
      name: z.string().min(1).max(255),
      nameHi: z.string().max(255).default(''),
      type: z.enum(['mantra', 'fasting', 'daan', 'daily_practice']).default('mantra'),
      description: z.string().max(2000).default(''),
      descriptionHi: z.string().max(2000).default(''),
      frequency: z.string().max(100).default('daily'),
      frequencyHi: z.string().max(100).default(''),
      mantraTextRoman: z.string().optional(),
      mantraTextDevanagari: z.string().optional(),
      mantraAudioUrl: z.string().url().optional(),
      targetCount: z.number().int().min(1).default(108),
      dayOfWeek: z.string().optional(),
    }),
  ).min(1),
});

/**
 * POST /api/protocols
 * Create a new remedy protocol with tasks. Requires auth.
 */
protocolRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createProtocolSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Calculate end date
    const startDate = new Date(body.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + body.totalDays);

    // Create protocol
    const protocol = await queryOne<{ id: string }>(
      `INSERT INTO remedy_protocols (user_id, report_id, name, name_hi, start_date, end_date, total_days, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING *`,
      [user.id, body.reportId || null, body.name, body.nameHi, body.startDate, endDate.toISOString().split('T')[0], body.totalDays],
    );

    // Create tasks
    for (const task of body.tasks) {
      const createdTask = await queryOne<{ id: string }>(
        `INSERT INTO remedy_tasks (protocol_id, name, name_hi, type, description, description_hi, frequency, frequency_hi, mantra_text_roman, mantra_text_devanagari, mantra_audio_url, target_count, day_of_week)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          protocol!.id, task.name, task.nameHi, task.type, task.description, task.descriptionHi,
          task.frequency, task.frequencyHi, task.mantraTextRoman || null, task.mantraTextDevanagari || null,
          task.mantraAudioUrl || null, task.targetCount, task.dayOfWeek || null,
        ],
      );

      // Initialize streak for this task
      await query(
        `INSERT INTO streaks (user_id, task_id, current_streak, longest_streak)
         VALUES ($1, $2, 0, 0)`,
        [user.id, createdTask!.id],
      );
    }

    // Fetch the full protocol with tasks
    const fullProtocol = await queryOne(
      'SELECT * FROM remedy_protocols WHERE id = $1',
      [protocol!.id],
    );
    const tasks = await query(
      'SELECT * FROM remedy_tasks WHERE protocol_id = $1 ORDER BY created_at ASC',
      [protocol!.id],
    );

    res.status(201).json({ protocol: fullProtocol, tasks });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/protocols
 * List user's protocols. Requires auth.
 */
protocolRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const { status } = req.query;
    let sql = 'SELECT * FROM remedy_protocols WHERE user_id = $1';
    const params: unknown[] = [user.id];

    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const protocols = await query(sql, params);
    res.json({ protocols });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/protocols/:id
 * Get a protocol with its tasks and today's completion status.
 */
protocolRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const protocol = await queryOne(
      'SELECT * FROM remedy_protocols WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );
    if (!protocol) throw new AppError(404, 'Protocol not found', 'PROTOCOL_NOT_FOUND');

    const today = new Date().toISOString().split('T')[0];

    // Get tasks with today's completion status and streaks
    const tasks = await query(
      `SELECT
        rt.*,
        COALESCE(s.current_streak, 0) AS streak,
        CASE WHEN rc.id IS NOT NULL THEN true ELSE false END AS today_done,
        (SELECT COUNT(*) FROM remedy_completions WHERE task_id = rt.id) AS completed_count
       FROM remedy_tasks rt
       LEFT JOIN streaks s ON s.task_id = rt.id AND s.user_id = $2
       LEFT JOIN remedy_completions rc ON rc.task_id = rt.id AND rc.user_id = $2 AND rc.completed_date = $3
       WHERE rt.protocol_id = $1
       ORDER BY rt.created_at ASC`,
      [req.params.id, user.id, today],
    );

    res.json({ protocol, tasks });
  } catch (error) {
    next(error);
  }
});

const completeTaskSchema = z.object({
  count: z.number().int().min(1).default(1),
  durationSeconds: z.number().int().optional(),
});

/**
 * POST /api/protocols/tasks/:taskId/complete
 * Mark a task as completed for today. Awards karma points and updates streak.
 */
protocolRouter.post('/tasks/:taskId/complete', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = completeTaskSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const task = await queryOne<{ id: string; protocol_id: string }>(
      'SELECT rt.id, rt.protocol_id FROM remedy_tasks rt JOIN remedy_protocols rp ON rp.id = rt.protocol_id WHERE rt.id = $1 AND rp.user_id = $2',
      [req.params.taskId, user.id],
    );
    if (!task) throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');

    const today = new Date().toISOString().split('T')[0];

    // Check if already completed today
    const existing = await queryOne(
      'SELECT id FROM remedy_completions WHERE task_id = $1 AND user_id = $2 AND completed_date = $3',
      [req.params.taskId, user.id, today],
    );
    if (existing) throw new AppError(400, 'Task already completed today', 'ALREADY_COMPLETED');

    const karmaPoints = 10;

    // Record completion
    await query(
      `INSERT INTO remedy_completions (task_id, user_id, completed_date, count, duration_seconds, karma_points)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.taskId, user.id, today, body.count, body.durationSeconds || null, karmaPoints],
    );

    // Update streak
    const streak = await queryOne<{ current_streak: number; longest_streak: number; last_completed_date: string | null }>(
      'SELECT current_streak, longest_streak, last_completed_date FROM streaks WHERE user_id = $1 AND task_id = $2',
      [user.id, req.params.taskId],
    );

    if (streak) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const isConsecutive = streak.last_completed_date === yesterdayStr;
      const newStreak = isConsecutive ? streak.current_streak + 1 : 1;
      const newLongest = Math.max(newStreak, streak.longest_streak);

      await query(
        'UPDATE streaks SET current_streak = $1, longest_streak = $2, last_completed_date = $3 WHERE user_id = $4 AND task_id = $5',
        [newStreak, newLongest, today, user.id, req.params.taskId],
      );

      // Award streak milestones
      if (newStreak === 7) {
        await query(
          `INSERT INTO karma_points (user_id, points, source, source_id, description) VALUES ($1, 50, 'milestone_7day', $2, '7-day streak milestone')`,
          [user.id, req.params.taskId],
        );
      } else if (newStreak === 21) {
        await query(
          `INSERT INTO karma_points (user_id, points, source, source_id, description) VALUES ($1, 150, 'milestone_21day', $2, '21-day streak milestone')`,
          [user.id, req.params.taskId],
        );
      } else if (newStreak === 63) {
        await query(
          `INSERT INTO karma_points (user_id, points, source, source_id, description) VALUES ($1, 500, 'milestone_63day', $2, '63-day streak milestone')`,
          [user.id, req.params.taskId],
        );
      }
    }

    // Award daily karma points
    await query(
      `INSERT INTO karma_points (user_id, points, source, source_id, description) VALUES ($1, $2, 'daily_task', $3, 'Daily task completed')`,
      [user.id, karmaPoints, req.params.taskId],
    );

    res.json({ success: true, karmaPoints });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/protocols/stats/weekly
 * Get weekly completion stats and karma points.
 */
protocolRouter.get('/stats/weekly', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Get last 14 days of completions
    const completions = await query<{ completed_date: string; task_count: number }>(
      `SELECT completed_date, COUNT(DISTINCT task_id) AS task_count
       FROM remedy_completions
       WHERE user_id = $1 AND completed_date >= NOW() - INTERVAL '14 days'
       GROUP BY completed_date
       ORDER BY completed_date ASC`,
      [user.id],
    );

    // Get total karma points
    const karmaResult = await queryOne<{ total: string }>(
      'SELECT COALESCE(SUM(points), 0) AS total FROM karma_points WHERE user_id = $1',
      [user.id],
    );

    // Get max streak across all tasks
    const streakResult = await queryOne<{ max_streak: number; max_longest: number }>(
      'SELECT COALESCE(MAX(current_streak), 0) AS max_streak, COALESCE(MAX(longest_streak), 0) AS max_longest FROM streaks WHERE user_id = $1',
      [user.id],
    );

    // Calculate completion rate for last 7 days
    const totalTasksResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM remedy_tasks rt
       JOIN remedy_protocols rp ON rp.id = rt.protocol_id
       WHERE rp.user_id = $1 AND rp.status = 'active'`,
      [user.id],
    );
    const totalDailyTasks = parseInt(totalTasksResult?.count || '0', 10);
    const last7Completions = completions.filter((c) => {
      const d = new Date(c.completed_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    });
    const completedDays = last7Completions.length;
    const completionRate = totalDailyTasks > 0 && completedDays > 0
      ? Math.round((completedDays / 7) * 100)
      : 0;

    res.json({
      completions,
      karmaPoints: parseInt(karmaResult?.total || '0', 10),
      currentStreak: streakResult?.max_streak || 0,
      longestStreak: streakResult?.max_longest || 0,
      completionRate,
    });
  } catch (error) {
    next(error);
  }
});
