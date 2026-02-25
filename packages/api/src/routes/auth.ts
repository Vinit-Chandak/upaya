import { Router } from 'express';
import { z } from 'zod';
import { queryOne, query } from '../db/connection';
import { firebaseAuth } from '../services/firebase';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { User } from '@upaya/shared';

export const authRouter = Router();

const registerSchema = z.object({
  firebaseIdToken: z.string().min(1),
  name: z.string().optional(),
  language: z.enum(['hi', 'en']).default('hi'),
  /** Optional anonymous session IDs to migrate to the new authenticated account */
  anonymousSessionIds: z.array(z.string().uuid()).optional(),
  anonymousKundliIds: z.array(z.string().uuid()).optional(),
});

/**
 * POST /api/auth/register
 * Register or login a user with a Firebase ID token.
 * Creates a new user record if one doesn't exist for this Firebase UID.
 * Supports anonymous→authenticated session migration:
 *   Pass anonymousSessionIds and/or anonymousKundliIds to transfer
 *   previously created anonymous data to the newly authenticated account.
 */
authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const decoded = await firebaseAuth.verifyToken(body.firebaseIdToken);

    // Check if user already exists
    let user = await queryOne<User>(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [decoded.uid],
    );

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const rows = await query<User>(
        `INSERT INTO users (firebase_uid, phone, email, name, language)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          decoded.uid,
          decoded.phone_number || null,
          decoded.email || null,
          body.name || decoded.name || null,
          body.language,
        ],
      );
      user = rows[0];
    }

    // Migrate anonymous sessions to the authenticated user
    let migratedSessions = 0;
    let migratedKundlis = 0;

    if (user && body.anonymousSessionIds && body.anonymousSessionIds.length > 0) {
      const result = await query(
        `UPDATE chat_sessions SET user_id = $1
         WHERE session_id = ANY($2) AND user_id IS NULL`,
        [user.id, body.anonymousSessionIds],
      );
      migratedSessions = result.length;
    }

    if (user && body.anonymousKundliIds && body.anonymousKundliIds.length > 0) {
      const result = await query(
        `UPDATE kundlis SET user_id = $1
         WHERE id = ANY($2) AND user_id IS NULL`,
        [user.id, body.anonymousKundliIds],
      );
      migratedKundlis = result.length;
    }

    res.json({
      user,
      isNewUser,
      migration: {
        sessions: migratedSessions,
        kundlis: migratedKundlis,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get the current authenticated user's profile.
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<User>(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/auth/me
 * Update the current user's profile.
 */
authRouter.patch('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const updateSchema = z.object({
      name: z.string().optional(),
      language: z.enum(['hi', 'en']).optional(),
    });
    const body = updateSchema.parse(req.body);

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(body.name);
    }
    if (body.language !== undefined) {
      setClauses.push(`language = $${paramIndex++}`);
      values.push(body.language);
    }

    if (setClauses.length === 0) {
      throw new AppError(400, 'No fields to update', 'VALIDATION_ERROR');
    }

    values.push(req.user!.uid);
    const user = await queryOne<User>(
      `UPDATE users SET ${setClauses.join(', ')} WHERE firebase_uid = $${paramIndex} RETURNING *`,
      values,
    );

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});
