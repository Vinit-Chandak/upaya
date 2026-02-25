/** Phase 4: Muhurta Planner Types */

export type MuhurtaCategory =
  | 'marriage'
  | 'business'
  | 'property'
  | 'travel'
  | 'education'
  | 'ceremony'
  | 'other';

export type MuhurtaQuality = 'excellent' | 'good' | 'average';

export interface RecommendedDate {
  date: string;
  quality: MuhurtaQuality;
  reasoning: string;
  reasoningHi: string;
  tithi: string;
  nakshatra: string;
}

export interface MuhurtaQuery {
  id: string;
  userId: string;
  queryText: string;
  category: MuhurtaCategory;
  recommendedDatesJson: RecommendedDate[];
  paymentId: string | null;
  createdAt: Date;
}

export interface CreateMuhurtaQueryInput {
  queryText: string;
  category: MuhurtaCategory;
}

export const MUHURTA_CATEGORIES: Array<{
  key: MuhurtaCategory;
  label: string;
  labelHi: string;
  emoji: string;
}> = [
  { key: 'marriage', label: 'Marriage / Wedding', labelHi: 'शादी / विवाह', emoji: '💍' },
  { key: 'business', label: 'Business / Deal', labelHi: 'बिजनेस / सौदा', emoji: '💼' },
  { key: 'property', label: 'Property / Home', labelHi: 'प्रॉपर्टी / घर', emoji: '🏠' },
  { key: 'travel', label: 'Travel / Journey', labelHi: 'यात्रा', emoji: '✈️' },
  { key: 'education', label: 'Education / Exam', labelHi: 'शिक्षा / परीक्षा', emoji: '📚' },
  { key: 'ceremony', label: 'Religious Ceremony', labelHi: 'धार्मिक अनुष्ठान', emoji: '🪔' },
  { key: 'other', label: 'Other', labelHi: 'अन्य', emoji: '📅' },
];

export const MUHURTA_PRICING = {
  perQuery: {
    amount: 19900,
    displayAmount: 199,
  },
  premium: {
    amount: 49900,
    displayAmount: 499,
  },
} as const;
