import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { Report } from '@upaya/shared';

export const reportRouter = Router();

const createReportSchema = z.object({
  diagnosisId: z.string().uuid(),
});

/**
 * POST /api/reports
 * Create a full remedy report (requires authentication + payment).
 */
reportRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createReportSchema.parse(req.body);

    // Look up user
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Verify diagnosis exists
    const diagnosis = await queryOne<{ id: string }>(
      'SELECT id FROM diagnoses WHERE id = $1',
      [body.diagnosisId],
    );
    if (!diagnosis) {
      throw new AppError(404, 'Diagnosis not found', 'DIAGNOSIS_NOT_FOUND');
    }

    // Create report in 'generating' status
    const rows = await query<Report>(
      `INSERT INTO reports (user_id, diagnosis_id, type, status)
       VALUES ($1, $2, 'full_remedy_plan', 'generating')
       RETURNING *`,
      [user.id, body.diagnosisId],
    );

    // TODO: Trigger async PDF generation job

    res.status(201).json({ report: rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/reports/:id
 * Get a specific report by ID.
 */
reportRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const report = await queryOne<Report>(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );

    if (!report) {
      throw new AppError(404, 'Report not found', 'REPORT_NOT_FOUND');
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports
 * List all reports for the authenticated user.
 */
reportRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const reports = await query<Report>(
      'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id],
    );

    res.json({ reports });
  } catch (error) {
    next(error);
  }
});
