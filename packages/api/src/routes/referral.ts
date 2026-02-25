import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { query, queryOne } from '../db/connection';
import { requireAuth, optionalAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { Referral } from '@upaya/shared';
import { REFERRAL_CREDIT_AMOUNT } from '@upaya/shared';

export const referralRouter = Router();

/**
 * Generate a unique 8-character referral code.
 */
function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * POST /api/referrals/generate
 * Generate a referral code for the authenticated user.
 * If one already exists, returns the existing code.
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

    // Check for existing referral code
    const existing = await queryOne<Referral>(
      'SELECT * FROM referrals WHERE referrer_user_id = $1 AND referred_user_id IS NULL',
      [user.id],
    );

    if (existing) {
      res.json({ referral: existing });
      return;
    }

    // Generate unique code
    let code = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const dup = await queryOne<{ id: string }>(
        'SELECT id FROM referrals WHERE code = $1',
        [code],
      );
      if (!dup) break;
      code = generateReferralCode();
      attempts++;
    }

    const rows = await query<Referral>(
      `INSERT INTO referrals (referrer_user_id, code, conversion_status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [user.id, code],
    );

    res.status(201).json({ referral: rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/referrals/my-code
 * Get the authenticated user's referral code.
 */
referralRouter.get('/my-code', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const referral = await queryOne<Referral>(
      'SELECT * FROM referrals WHERE referrer_user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user.id],
    );

    res.json({ referral: referral || null });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/referrals/stats
 * Get referral stats for the authenticated user.
 */
referralRouter.get('/stats', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const stats = await queryOne<{
      total_referrals: string;
      total_installed: string;
      total_converted: string;
      total_credits: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE referred_user_id IS NOT NULL) as total_referrals,
         COUNT(*) FILTER (WHERE conversion_status = 'installed') as total_installed,
         COUNT(*) FILTER (WHERE conversion_status = 'converted') as total_converted,
         COUNT(*) FILTER (WHERE credit_applied = true) as total_credits
       FROM referrals WHERE referrer_user_id = $1`,
      [user.id],
    );

    const creditAmount = parseInt(stats?.total_credits || '0') * REFERRAL_CREDIT_AMOUNT;

    res.json({
      stats: {
        totalReferrals: parseInt(stats?.total_referrals || '0'),
        totalInstalled: parseInt(stats?.total_installed || '0'),
        totalConverted: parseInt(stats?.total_converted || '0'),
        totalCreditsEarned: creditAmount,
        creditPerConversion: REFERRAL_CREDIT_AMOUNT,
      },
    });
  } catch (error) {
    next(error);
  }
});

const applyReferralSchema = z.object({
  code: z.string().min(4).max(20),
});

/**
 * POST /api/referrals/apply
 * Apply a referral code (used by the referred user).
 */
referralRouter.post('/apply', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = applyReferralSchema.parse(req.body);

    const referral = await queryOne<Referral>(
      'SELECT * FROM referrals WHERE code = $1',
      [body.code.toUpperCase()],
    );

    if (!referral) {
      throw new AppError(404, 'Referral code not found', 'REFERRAL_NOT_FOUND');
    }

    // If user is authenticated, link them as the referred user
    if (req.user) {
      const user = await queryOne<{ id: string }>(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [req.user.uid],
      );

      if (user) {
        // Don't allow self-referral
        if (referral.referrerUserId === user.id) {
          throw new AppError(400, 'Cannot use your own referral code', 'SELF_REFERRAL');
        }

        await query(
          `UPDATE referrals SET referred_user_id = $1, conversion_status = 'installed'
           WHERE id = $2 AND referred_user_id IS NULL`,
          [user.id, referral.id],
        );
      }
    }

    res.json({ success: true, referrerCode: body.code });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid referral code', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});
