import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

export const walletRouter = Router();

/**
 * GET /api/wallet
 * Get user's wallet balance.
 */
walletRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Get or create wallet
    let wallet = await queryOne(
      'SELECT * FROM wallets WHERE user_id = $1',
      [user.id],
    );

    if (!wallet) {
      wallet = await queryOne(
        'INSERT INTO wallets (user_id, balance) VALUES ($1, 0) RETURNING *',
        [user.id],
      );
    }

    res.json({ wallet });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/wallet/transactions
 * List wallet transactions.
 */
walletRouter.get('/transactions', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const wallet = await queryOne<{ id: string }>(
      'SELECT id FROM wallets WHERE user_id = $1',
      [user.id],
    );

    if (!wallet) {
      res.json({ transactions: [] });
      return;
    }

    const { limit = '50', offset = '0' } = req.query;

    const transactions = await query(
      `SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [wallet.id, parseInt(limit as string, 10), parseInt(offset as string, 10)],
    );

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

const rechargeSchema = z.object({
  amount: z.number().int().min(10000).max(10000000), // Min ₹100, max ₹100,000 (in paise)
});

/**
 * POST /api/wallet/recharge
 * Create a Razorpay order for wallet recharge.
 */
walletRouter.post('/recharge', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = rechargeSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Get or create wallet
    let wallet = await queryOne<{ id: string }>(
      'SELECT id FROM wallets WHERE user_id = $1',
      [user.id],
    );

    if (!wallet) {
      wallet = await queryOne<{ id: string }>(
        'INSERT INTO wallets (user_id, balance) VALUES ($1, 0) RETURNING id',
        [user.id],
      );
    }

    // In production, this would create a Razorpay order
    // For now, simulate direct recharge
    await query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
      [body.amount, wallet!.id],
    );

    // Record transaction
    await query(
      `INSERT INTO wallet_transactions (wallet_id, type, amount, description)
       VALUES ($1, 'recharge', $2, 'Wallet recharge')`,
      [wallet!.id, body.amount],
    );

    const updatedWallet = await queryOne(
      'SELECT * FROM wallets WHERE id = $1',
      [wallet!.id],
    );

    res.json({ wallet: updatedWallet, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});
