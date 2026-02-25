import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { Address } from '@upaya/shared';

export const addressRouter = Router();

const createAddressSchema = z.object({
  name: z.string().min(1).max(255),
  line1: z.string().min(1).max(500),
  line2: z.string().max(500).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^\d{6}$/),
  phone: z.string().min(10).max(15),
  isDefault: z.boolean().optional(),
});

/**
 * POST /api/addresses
 * Add a new delivery address. Requires auth.
 */
addressRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createAddressSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // If setting as default, unset other defaults first
    if (body.isDefault) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [user.id]);
    }

    // If this is the first address, make it default
    const existingCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM addresses WHERE user_id = $1',
      [user.id],
    );
    const makeDefault = body.isDefault || existingCount?.count === '0';

    const address = await queryOne<Address>(
      `INSERT INTO addresses (user_id, name, line1, line2, city, state, pincode, phone, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user.id, body.name, body.line1, body.line2 || null, body.city, body.state, body.pincode, body.phone, makeDefault],
    );

    res.status(201).json({ address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/addresses
 * List user's addresses. Requires auth.
 */
addressRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const addresses = await query<Address>(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [user.id],
    );

    res.json({ addresses });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/addresses/:id
 * Delete an address. Requires auth.
 */
addressRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const deleted = await queryOne<Address>(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, user.id],
    );

    if (!deleted) {
      throw new AppError(404, 'Address not found', 'ADDRESS_NOT_FOUND');
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
