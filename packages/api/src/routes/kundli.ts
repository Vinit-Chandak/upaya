import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { kundliService } from '../services/kundli';
import { optionalAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { Kundli } from '@upaya/shared';

export const kundliRouter = Router();

const generateKundliSchema = z.object({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM').optional(),
  timeApproximate: z.boolean().default(false),
  placeOfBirthName: z.string().min(1),
  placeOfBirthLat: z.number().min(-90).max(90),
  placeOfBirthLng: z.number().min(-180).max(180),
});

/**
 * POST /api/kundli/generate
 * Generate a kundli from birth details.
 * Caches results: same DOB + TOB + POB = same kundli.
 */
kundliRouter.post('/generate', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = generateKundliSchema.parse(req.body);

    // Check cache: same birth details = same kundli
    const existing = await queryOne<Kundli>(
      `SELECT * FROM kundlis
       WHERE date_of_birth = $1
         AND place_of_birth_lat = $2
         AND place_of_birth_lng = $3
         AND ($4::time IS NULL OR time_of_birth = $4::time)
       LIMIT 1`,
      [body.dateOfBirth, body.placeOfBirthLat, body.placeOfBirthLng, body.timeOfBirth || null],
    );

    if (existing) {
      res.json({ kundli: existing, cached: true });
      return;
    }

    // Generate new kundli
    const kundliData = await kundliService.generateKundli({
      dateOfBirth: body.dateOfBirth,
      timeOfBirth: body.timeOfBirth,
      timeApproximate: body.timeApproximate,
      placeOfBirthName: body.placeOfBirthName,
      placeOfBirthLat: body.placeOfBirthLat,
      placeOfBirthLng: body.placeOfBirthLng,
    });

    // Look up user ID from Firebase UID if authenticated
    let userId: string | null = null;
    if (req.user) {
      const user = await queryOne<{ id: string }>(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [req.user.uid],
      );
      userId = user?.id ?? null;
    }

    // Store in database
    const rows = await query<Kundli>(
      `INSERT INTO kundlis (
        user_id, date_of_birth, time_of_birth, time_approximate,
        place_of_birth_name, place_of_birth_lat, place_of_birth_lng,
        planetary_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId,
        body.dateOfBirth,
        body.timeOfBirth || null,
        body.timeApproximate,
        body.placeOfBirthName,
        body.placeOfBirthLat,
        body.placeOfBirthLng,
        JSON.stringify(kundliData),
      ],
    );

    res.status(201).json({ kundli: rows[0], cached: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, error.errors.map((e) => e.message).join(', '), 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/kundli/:id
 * Get a specific kundli by ID.
 */
kundliRouter.get('/:id', async (req, res, next) => {
  try {
    const kundli = await queryOne<Kundli>('SELECT * FROM kundlis WHERE id = $1', [req.params.id]);

    if (!kundli) {
      throw new AppError(404, 'Kundli not found', 'KUNDLI_NOT_FOUND');
    }

    res.json({ kundli });
  } catch (error) {
    next(error);
  }
});
