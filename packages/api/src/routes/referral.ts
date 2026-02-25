import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, optionalAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { REFERRAL_CREDIT_AMOUNT, type Referral } from '@upaya/shared';

export const referralRouter = Router();

/**
 * Generate a unique 6-char referral code.
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/referrals/generate
 * Generate a unique referral code for the authenticated user.
 * If the user already has one, returns the existing code.
 */
referralRouter.post('/generate', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Check if user already has a referral code
    const existing = await queryOne<Referral>(
      'SELECT * FROM referrals WHERE referrer_user_id = $1 AND referred_user_id IS NULL LIMIT 1',
      [user.id],
    );

    if (existing) {
      res.json({ referral: existing });
      return;
    }

    // Generate unique code (retry on collision)
    let code = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const collision = await queryOne('SELECT id FROM referrals WHERE code = $1', [code]);
      if (!collision) break;
      code = generateReferralCode();
      attempts++;
    }

    const rows = await query<Referral>(
      `INSERT INTO referrals (referrer_user_id, code, conversion_status, credit_applied)
       VALUES ($1, $2, 'pending', false)
       RETURNING *`,
      [user.id, code],
    );

    res.status(201).json({ referral: rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/referrals/apply
 * Apply a referral code (called by the referred user during registration).
 */
const applySchema = z.object({
  code: z.string().min(4).max(10),
});

referralRouter.post('/apply', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = applySchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Find the referral code
    const referral = await queryOne<Referral>(
      'SELECT * FROM referrals WHERE code = $1 AND referred_user_id IS NULL',
      [body.code.toUpperCase()],
    );

    if (!referral) {
      throw new AppError(404, 'Invalid or already used referral code', 'REFERRAL_NOT_FOUND');
    }

    // Don't allow self-referral
    if (referral.referrerUserId === user.id) {
      throw new AppError(400, 'Cannot use your own referral code', 'SELF_REFERRAL');
    }

    // Apply the referral
    const updated = await queryOne<Referral>(
      `UPDATE referrals
       SET referred_user_id = $1, conversion_status = 'installed'
       WHERE id = $2
       RETURNING *`,
      [user.id, referral.id],
    );

    res.json({ referral: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * POST /api/referrals/:id/convert
 * Mark a referral as converted (called after referred user makes a purchase).
 * Awards credit to the referrer.
 */
referralRouter.post('/:id/convert', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const referral = await queryOne<Referral>(
      'SELECT * FROM referrals WHERE id = $1',
      [req.params.id],
    );

    if (!referral) {
      throw new AppError(404, 'Referral not found', 'REFERRAL_NOT_FOUND');
    }

    if (referral.conversionStatus === 'converted') {
      res.json({ referral, message: 'Already converted' });
      return;
    }

    const updated = await queryOne<Referral>(
      `UPDATE referrals
       SET conversion_status = 'converted', credit_applied = true
       WHERE id = $1
       RETURNING *`,
      [referral.id],
    );

    res.json({
      referral: updated,
      creditAmount: REFERRAL_CREDIT_AMOUNT,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/referrals/my-referrals
 * Get all referrals for the authenticated user (as referrer).
 */
referralRouter.get('/my-referrals', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const referrals = await query<Referral>(
      `SELECT * FROM referrals WHERE referrer_user_id = $1 ORDER BY created_at DESC`,
      [user.id],
    );

    const stats = {
      total: referrals.length,
      installed: referrals.filter((r) => r.conversionStatus === 'installed').length,
      converted: referrals.filter((r) => r.conversionStatus === 'converted').length,
      totalCredits: referrals.filter((r) => r.creditApplied).length * REFERRAL_CREDIT_AMOUNT,
    };

    res.json({ referrals, stats });
  } catch (error) {
    next(error);
  }
});
