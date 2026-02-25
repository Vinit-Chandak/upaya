import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { FamilyMember, FamilyMemberWithKundli } from '@upaya/shared';

export const familyRouter = Router();

/**
 * GET /api/family
 * List family members for the authenticated user. Requires auth.
 */
familyRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const members = await query<FamilyMemberWithKundli>(
      `SELECT
        fm.*,
        k.date_of_birth,
        k.place_of_birth_name AS place_of_birth,
        k.current_dasha
       FROM family_members fm
       LEFT JOIN kundlis k ON fm.kundli_id = k.id
       WHERE fm.user_id = $1
       ORDER BY fm.created_at ASC`,
      [user.id],
    );

    res.json({ members });
  } catch (error) {
    next(error);
  }
});

const createFamilyMemberSchema = z.object({
  name: z.string().min(1).max(255),
  relationship: z.enum(['spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'other']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  timeApproximate: z.boolean().default(false),
  placeOfBirthName: z.string().min(1).max(255),
  placeOfBirthLat: z.number().min(-90).max(90),
  placeOfBirthLng: z.number().min(-180).max(180),
});

/**
 * POST /api/family
 * Add a family member with birth details and generate kundli. Requires auth.
 */
familyRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createFamilyMemberSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Generate kundli for the family member
    const kundli = await queryOne<{ id: string }>(
      `INSERT INTO kundlis (user_id, date_of_birth, time_of_birth, time_approximate, place_of_birth_name, place_of_birth_lat, place_of_birth_lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        user.id,
        body.dateOfBirth,
        body.timeOfBirth || null,
        body.timeApproximate,
        body.placeOfBirthName,
        body.placeOfBirthLat,
        body.placeOfBirthLng,
      ],
    );

    // Create family member linked to the kundli
    const member = await queryOne<FamilyMember>(
      `INSERT INTO family_members (user_id, name, relationship, kundli_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.id, body.name, body.relationship, kundli!.id],
    );

    res.status(201).json({ member, kundliId: kundli!.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/family/:id
 * Get family member detail with kundli data. Requires auth.
 */
familyRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const member = await queryOne<FamilyMemberWithKundli>(
      `SELECT
        fm.*,
        k.date_of_birth,
        k.place_of_birth_name AS place_of_birth,
        k.current_dasha
       FROM family_members fm
       LEFT JOIN kundlis k ON fm.kundli_id = k.id
       WHERE fm.id = $1 AND fm.user_id = $2`,
      [req.params.id, user.id],
    );
    if (!member) throw new AppError(404, 'Family member not found', 'FAMILY_MEMBER_NOT_FOUND');

    // Get full kundli details if available
    let kundli = null;
    if (member.kundliId) {
      kundli = await queryOne(
        'SELECT * FROM kundlis WHERE id = $1',
        [member.kundliId],
      );
    }

    res.json({ member, kundli });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/family/:id
 * Remove a family member. Requires auth.
 */
familyRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const member = await queryOne<{ id: string; kundli_id: string | null }>(
      'SELECT id, kundli_id FROM family_members WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );
    if (!member) throw new AppError(404, 'Family member not found', 'FAMILY_MEMBER_NOT_FOUND');

    // Delete the family member
    await query('DELETE FROM family_members WHERE id = $1', [req.params.id]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
