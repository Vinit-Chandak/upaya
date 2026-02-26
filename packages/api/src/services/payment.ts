import crypto from 'crypto';
import { config } from '../config';
import type { CreateOrderResponse } from '@upaya/shared';

/**
 * Razorpay payment integration service.
 *
 * Handles order creation, payment verification, and webhook processing.
 * Uses Razorpay SDK for API calls and manual signature verification for webhooks.
 */

interface RazorpayInstance {
  orders: {
    create(params: Record<string, unknown>): Promise<{ id: string; amount: number; currency: string }>;
  };
  payments: {
    fetch(paymentId: string): Promise<Record<string, unknown>>;
  };
}

let razorpayInstance: RazorpayInstance | null = null;

function getRazorpay(): RazorpayInstance {
  if (!razorpayInstance) {
    try {
      const Razorpay = require('razorpay');
      razorpayInstance = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      }) as RazorpayInstance;
    } catch {
      console.warn('[Razorpay] SDK not available — using mock mode');
      razorpayInstance = createMockRazorpay();
    }
  }
  return razorpayInstance;
}

function createMockRazorpay(): RazorpayInstance {
  return {
    orders: {
      create: async (params: Record<string, unknown>) => ({
        id: `order_mock_${Date.now()}`,
        amount: params.amount as number,
        currency: params.currency as string,
      }),
    },
    payments: {
      fetch: async (paymentId: string) => ({
        id: paymentId,
        status: 'captured',
        amount: 19900,
        currency: 'INR',
      }),
    },
  };
}

export const paymentService = {
  /**
   * Create a Razorpay order for report purchase.
   */
  async createOrder(
    amount: number,
    currency: string = 'INR',
    receiptId: string,
  ): Promise<CreateOrderResponse> {
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount, // amount in paise
      currency,
      receipt: receiptId,
    });

    return {
      orderId: receiptId,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency as 'INR',
      keyId: config.razorpay.keyId,
    };
  },

  /**
   * Verify a Razorpay payment signature.
   * This ensures the payment callback is genuinely from Razorpay.
   */
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  },

  /**
   * Verify a Razorpay webhook signature.
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  },

  /**
   * Fetch payment details from Razorpay.
   */
  async fetchPayment(paymentId: string): Promise<Record<string, unknown>> {
    const razorpay = getRazorpay();
    return razorpay.payments.fetch(paymentId);
  },
};
