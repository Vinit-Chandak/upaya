export type ConversionStatus = 'pending' | 'installed' | 'converted';

export interface Referral {
  id: string;
  referrerUserId: string;
  code: string;
  referredUserId: string | null;
  conversionStatus: ConversionStatus;
  creditApplied: boolean;
  createdAt: Date;
}

export const REFERRAL_CREDIT_AMOUNT = 5000; // ₹50 in paise
