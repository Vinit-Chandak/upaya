export type PaymentStatus =
  | 'created'
  | 'authorized'
  | 'captured'
  | 'refunded'
  | 'failed';

export interface Payment {
  id: string;
  userId: string;
  reportId: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  currency: 'INR';
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  amount: number;
  reportId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: 'INR';
  keyId: string;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/** Pricing constants */
export const PRICING = {
  fullRemedyReport: {
    amount: 19900,
    displayAmount: 199,
    originalAmount: 49900,
    originalDisplayAmount: 499,
    currency: 'INR' as const,
    discountPercent: 60,
  },
} as const;
