/** Phase 4: Daan Seva Types */

export type SevaType = 'gau_seva' | 'brahman_bhoj' | 'vastra_daan' | 'anna_daan';

export type SevaBookingStatus = 'pending' | 'confirmed' | 'performed' | 'proof_delivered';

export interface SevaCatalogItem {
  id: string;
  templeId: string;
  type: SevaType;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  price: number;
  photoProof: boolean;
  createdAt: Date;
}

export interface SevaCatalogWithTemple extends SevaCatalogItem {
  templeName: string;
  templeNameHi: string;
  templeCity: string;
}

export interface SevaBooking {
  id: string;
  userId: string;
  sevaCatalogId: string;
  templeId: string;
  paymentId: string | null;
  status: SevaBookingStatus;
  proofUrl: string | null;
  createdAt: Date;
}

export interface SevaBookingWithDetails extends SevaBooking {
  sevaName: string;
  sevaNameHi: string;
  sevaType: SevaType;
  sevaPrice: number;
  templeName: string;
  templeNameHi: string;
  templeCity: string;
}

export interface CreateSevaBookingInput {
  sevaCatalogId: string;
  templeId: string;
}

export const SEVA_TYPES: Array<{
  key: SevaType;
  label: string;
  labelHi: string;
  emoji: string;
  priceRange: string;
}> = [
  { key: 'gau_seva', label: 'Gau Seva', labelHi: 'गऊ सेवा', emoji: '🐄', priceRange: '₹151-501' },
  { key: 'brahman_bhoj', label: 'Brahman Bhoj', labelHi: 'ब्राह्मण भोज', emoji: '🙏', priceRange: '₹251-1,100' },
  { key: 'vastra_daan', label: 'Vastra Daan', labelHi: 'वस्त्र दान', emoji: '👕', priceRange: '₹201-501' },
  { key: 'anna_daan', label: 'Anna Daan', labelHi: 'अन्न दान', emoji: '🍚', priceRange: '₹151-351' },
];
