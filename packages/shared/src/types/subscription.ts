/** Phase 4: Subscription / 9-Week Protocol Types */

export type SubscriptionTier = 'basic' | 'standard' | 'premium';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  protocolId: string | null;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  tier: SubscriptionTier;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  nameHi: string;
  price: number;
  displayPrice: number;
  features: string[];
  featuresHi: string[];
  recommended: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'basic',
    name: 'Basic',
    nameHi: 'Basic',
    price: 99900,
    displayPrice: 999,
    features: [
      'Mantra tracking & reminders',
      'Free remedies tracking',
      '9-week protocol calendar',
    ],
    featuresHi: [
      'मंत्र tracking & reminders',
      'Free remedies tracking',
      '9-week protocol calendar',
    ],
    recommended: false,
  },
  {
    tier: 'standard',
    name: 'Standard',
    nameHi: 'Standard',
    price: 199900,
    displayPrice: 1999,
    features: [
      'Everything in Basic',
      '1 puja per month (included)',
      '1 remedy product (included)',
      'Priority AI support',
    ],
    featuresHi: [
      'Basic की सभी सुविधाएं',
      '1 पूजा/माह (शामिल)',
      '1 remedy product (शामिल)',
      'Priority AI support',
    ],
    recommended: true,
  },
  {
    tier: 'premium',
    name: 'Premium',
    nameHi: 'Premium',
    price: 299900,
    displayPrice: 2999,
    features: [
      'Everything in Standard',
      '2 pujas per month (included)',
      'Full remedy kit (included)',
      'Monthly pandit consultation',
      'Muhurta planner (unlimited)',
    ],
    featuresHi: [
      'Standard की सभी सुविधाएं',
      '2 पूजा/माह (शामिल)',
      'Full remedy kit (शामिल)',
      'Monthly pandit consultation',
      'Muhurta planner (unlimited)',
    ],
    recommended: false,
  },
];
