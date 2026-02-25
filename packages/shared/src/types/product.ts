/** Phase 4: Product / Siddha Store Types */

export type ProductCategory =
  | 'gemstones'
  | 'rudraksha'
  | 'yantras'
  | 'remedy_kits'
  | 'puja_items'
  | 'daan_seva';

export type ProductStatus = 'active' | 'out_of_stock' | 'draft' | 'discontinued';

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  category: ProductCategory;
  description: string;
  descriptionHi: string;
  images: string[];
  price: number;
  mrp: number;
  discountPct: number;
  weight: string | null;
  specifications: Record<string, string>;
  wearingInstructions: string | null;
  wearingInstructionsHi: string | null;
  pranPratisthaVideoUrl: string | null;
  certification: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  status: ProductStatus;
  doshaType: string | null;
  createdAt: Date;
}

export interface ProductWithAI extends Product {
  aiRecommended: boolean;
  aiReasoning: string | null;
  aiReasoningHi: string | null;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string | null;
  rating: number;
  reviewText: string;
  createdAt: Date;
}

export interface CreateProductReviewInput {
  productId: string;
  rating: number;
  reviewText: string;
}

export const PRODUCT_CATEGORIES: Array<{
  key: ProductCategory;
  label: string;
  labelHi: string;
  emoji: string;
}> = [
  { key: 'gemstones', label: 'Gemstones', labelHi: 'रत्न', emoji: '💎' },
  { key: 'rudraksha', label: 'Rudraksha', labelHi: 'रुद्राक्ष', emoji: '📿' },
  { key: 'yantras', label: 'Yantras', labelHi: 'यंत्र', emoji: '🔱' },
  { key: 'remedy_kits', label: 'Remedy Kits', labelHi: 'Remedy Kits', emoji: '📦' },
  { key: 'puja_items', label: 'Puja Items', labelHi: 'पूजा सामग्री', emoji: '🪔' },
  { key: 'daan_seva', label: 'Daan Seva', labelHi: 'दान सेवा', emoji: '🎁' },
];
