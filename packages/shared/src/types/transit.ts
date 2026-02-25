/** Phase 3: Transit Alert Types */

export type ImpactLevel = 'low' | 'medium' | 'medium-high' | 'high';

export interface TransitAlert {
  id: string;
  userId: string;
  kundliId: string;
  planet: string;
  fromHouse: number;
  toHouse: number;
  transitDate: string;
  endDate: string | null;
  impactLevel: ImpactLevel;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  remediesJson: TransitRemedy[];
  read: boolean;
  createdAt: Date;
}

export interface TransitRemedy {
  type: 'puja' | 'mantra' | 'daan';
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  templeName?: string;
  templeCity?: string;
  price?: number;
  pujaId?: string;
  mantraText?: string;
  mantraTextHi?: string;
  duration?: string;
}
