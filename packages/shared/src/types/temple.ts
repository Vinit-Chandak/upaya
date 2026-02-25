export type TempleStatus = 'active' | 'inactive' | 'pending_verification';

export interface Temple {
  id: string;
  name: string;
  nameHi: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
  descriptionHi: string;
  images: string[];
  contactPhone: string | null;
  contactEmail: string | null;
  revenueSharePct: number;
  rating: number;
  totalPujasCompleted: number;
  status: TempleStatus;
  createdAt: Date;
}

export interface TempleAdmin {
  id: string;
  templeId: string;
  name: string;
  phone: string;
  email: string | null;
  firebaseUid: string;
  role: 'admin' | 'operator';
  createdAt: Date;
}
