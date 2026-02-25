import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { SUBSCRIPTION_PLANS } from '@upaya/shared';
import type { Subscription } from '@upaya/shared';

export const subscriptionRouter = Router();

/**
 * GET /api/subscriptions/plans
 * List available subscription tiers.
 */
subscriptionRouter.get('/plans', async (_req, res, next) => {
  try {
    res.json({ plans: SUBSCRIPTION_PLANS });
  } catch (error) {
    next(error);
  }
});

const createSubscriptionSchema = z.object({
  tier: z.enum(['basic', 'standard', 'premium']),
});

/**
 * POST /api/subscriptions
 * Create a new subscription. Requires auth.
 */
subscriptionRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createSubscriptionSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Check if user already has an active subscription
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM subscriptions WHERE user_id = $1 AND status = 'active'`,
      [user.id],
    );
    if (existing) {
      throw new AppError(400, 'You already have an active subscription', 'ACTIVE_SUBSCRIPTION_EXISTS');
    }

    // Verify the tier is valid
    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === body.tier);
    if (!plan) throw new AppError(400, 'Invalid subscription tier', 'INVALID_TIER');

    // Calculate start and end dates (63 days = 9 weeks)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 63);

    const subscription = await queryOne<Subscription>(
      `INSERT INTO subscriptions (user_id, tier, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [user.id, body.tier, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
    );

    res.status(201).json({ subscription, plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/subscriptions
 * Get the authenticated user's active subscription. Requires auth.
 */
subscriptionRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const subscription = await queryOne<Subscription>(
      `SELECT * FROM subscriptions WHERE user_id = $1 AND status IN ('active', 'paused') ORDER BY created_at DESC LIMIT 1`,
      [user.id],
    );

    if (!subscription) {
      res.json({ subscription: null, plan: null });
      return;
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === subscription.tier) || null;

    res.json({ subscription, plan });
  } catch (error) {
    next(error);
  }
});

const updateSubscriptionSchema = z.object({
  status: z.enum(['active', 'paused', 'cancelled']),
});

/**
 * PATCH /api/subscriptions/:id
 * Update subscription status (pause, resume, cancel). Requires auth.
 */
subscriptionRouter.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = updateSubscriptionSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const subscription = await queryOne<Subscription>(
      'SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );
    if (!subscription) throw new AppError(404, 'Subscription not found', 'SUBSCRIPTION_NOT_FOUND');

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      active: ['paused', 'cancelled'],
      paused: ['active', 'cancelled'],
    };

    const allowed = validTransitions[subscription.status] || [];
    if (!allowed.includes(body.status)) {
      throw new AppError(
        400,
        `Cannot change subscription from ${subscription.status} to ${body.status}`,
        'INVALID_STATUS_TRANSITION',
      );
    }

    const updated = await queryOne<Subscription>(
      'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [body.status, req.params.id],
    );

    res.json({ subscription: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});
