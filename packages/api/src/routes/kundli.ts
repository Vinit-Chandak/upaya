import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { kundliService } from '../services/kundli';
import { optionalAuth, requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { Kundli, KundliProfile } from '@upaya/shared';

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

// ============================================
// KUNDLI PROFILES
// ============================================

const createProfileSchema = z.object({
  personName: z.string().min(1).max(255),
  relationship: z.enum(['self', 'family', 'pet']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM').nullable().optional(),
  timeApproximate: z.boolean().default(false),
  placeOfBirthName: z.string().min(1).max(255),
  placeOfBirthLat: z.number().min(-90).max(90),
  placeOfBirthLng: z.number().min(-180).max(180),
});

/**
 * POST /api/kundli/profiles
 * Create a kundli profile (person name + birth details).
 * Works for anonymous users (user_id = null) and authenticated users.
 * Anonymous profiles are claimed via POST /api/auth/migrate-session on login.
 */
kundliRouter.post('/profiles', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createProfileSchema.parse(req.body);

    let userId: string | null = null;
    if (req.user) {
      const user = await queryOne<{ id: string }>(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [req.user.uid],
      );
      userId = user?.id ?? null;
    }

    const rows = await query<KundliProfile>(
      `INSERT INTO kundli_profiles (
        user_id, person_name, relationship,
        date_of_birth, time_of_birth, time_approximate,
        place_of_birth_name, place_of_birth_lat, place_of_birth_lng
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        body.personName,
        body.relationship,
        body.dateOfBirth,
        body.timeOfBirth ?? null,
        body.timeApproximate,
        body.placeOfBirthName,
        body.placeOfBirthLat,
        body.placeOfBirthLng,
      ],
    );

    res.status(201).json({ profile: rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, error.errors.map((e) => e.message).join(', '), 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/kundli/profiles
 * List all kundli profiles for the authenticated user.
 * Returns profiles ordered by most recently created first.
 */
kundliRouter.get('/profiles', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const profiles = await query<KundliProfile>(
      `SELECT * FROM kundli_profiles
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id],
    );

    res.json({ profiles });
  } catch (error) {
    next(error);
  }
});
