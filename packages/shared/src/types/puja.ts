import type { DoshaType } from './kundli';

export type PujaStatus = 'active' | 'inactive' | 'draft';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface MuhurtaData {
  recommendedDays: DayOfWeek[];
  hora: string;
  nakshatra: string;
  reasoning: string;
  reasoningHi: string;
}

export interface PujaCatalogItem {
  id: string;
  templeId: string;
  name: string;
  nameHi: string;
  deity: string;
  deityHi: string;
  doshaType: DoshaType | null;
  description: string;
  descriptionHi: string;
  inclusions: string[];
  inclusionsHi: string[];
  price: number;
  images: string[];
  availableDays: DayOfWeek[];
  muhurtaData: MuhurtaData | null;
  status: PujaStatus;
  createdAt: Date;
}

export interface PujaCatalogWithTemple extends PujaCatalogItem {
  templeName: string;
  templeNameHi: string;
  templeCity: string;
  templeState: string;
  templeRating: number;
  templeTotalPujas: number;
  templeImages: string[];
}
