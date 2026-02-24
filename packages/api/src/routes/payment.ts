import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { paymentService } from '../services/payment';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { PRICING, type Payment } from '@upaya/shared';

export const paymentRouter = Router();

const createOrderSchema = z.object({
  reportId: z.string().uuid(),
});

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for report purchase.
 */
paymentRouter.post('/create-order', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Verify report exists and belongs to user
    const report = await queryOne<{ id: string }>(
      'SELECT id FROM reports WHERE id = $1 AND user_id = $2',
      [body.reportId, user.id],
    );
    if (!report) {
      throw new AppError(404, 'Report not found', 'REPORT_NOT_FOUND');
    }

    // Create Razorpay order
    const order = await paymentService.createOrder(
      PRICING.fullRemedyReport.amount,
      'INR',
      report.id,
    );

    // Store payment record
    await query(
      `INSERT INTO payments (user_id, report_id, razorpay_order_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, 'created')`,
      [user.id, body.reportId, order.razorpayOrderId, PRICING.fullRemedyReport.amount, 'INR'],
    );

    res.json({ order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

/**
 * POST /api/payments/verify
 * Verify a Razorpay payment after user completes checkout.
 */
paymentRouter.post('/verify', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = verifyPaymentSchema.parse(req.body);

    // Verify signature
    const isValid = paymentService.verifyPaymentSignature(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature,
    );

    if (!isValid) {
      throw new AppError(400, 'Invalid payment signature', 'PAYMENT_INVALID');
    }

    // Update payment record
    const payment = await queryOne<Payment>(
      `UPDATE payments
       SET razorpay_payment_id = $1, status = 'captured'
       WHERE razorpay_order_id = $2
       RETURNING *`,
      [body.razorpayPaymentId, body.razorpayOrderId],
    );

    if (!payment) {
      throw new AppError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
    }

    // Update report status to 'ready'
    if (payment.reportId) {
      await query(
        `UPDATE reports SET status = 'ready' WHERE id = $1`,
        [payment.reportId],
      );
    }

    res.json({ payment, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook endpoint for payment status updates.
 */
paymentRouter.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      throw new AppError(400, 'Missing webhook signature', 'WEBHOOK_INVALID');
    }

    const isValid = paymentService.verifyWebhookSignature(
      JSON.stringify(req.body),
      signature,
    );

    if (!isValid) {
      throw new AppError(400, 'Invalid webhook signature', 'WEBHOOK_INVALID');
    }

    const event = req.body;
    const eventType = event.event as string;

    if (eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      if (paymentEntity) {
        await query(
          `UPDATE payments
           SET razorpay_payment_id = $1, status = 'captured'
           WHERE razorpay_order_id = $2`,
          [paymentEntity.id, paymentEntity.order_id],
        );
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});
