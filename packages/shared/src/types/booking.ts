export type BookingStatus =
  | 'booked'
  | 'confirmed_by_temple'
  | 'puja_performed'
  | 'video_delivered'
  | 'prasad_shipped'
  | 'prasad_delivered'
  | 'protocol_complete';

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  'booked',
  'confirmed_by_temple',
  'puja_performed',
  'video_delivered',
  'prasad_shipped',
  'prasad_delivered',
  'protocol_complete',
];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, { hi: string; en: string }> = {
  booked: { hi: 'Booked', en: 'Booked' },
  confirmed_by_temple: { hi: 'Temple ने Confirm किया', en: 'Confirmed by Temple' },
  puja_performed: { hi: 'पूजा सम्पन्न', en: 'Puja Performed' },
  video_delivered: { hi: 'Video Delivered', en: 'Video Delivered' },
  prasad_shipped: { hi: 'प्रसाद Shipped', en: 'Prasad Shipped' },
  prasad_delivered: { hi: 'प्रसाद Delivered', en: 'Prasad Delivered' },
  protocol_complete: { hi: 'Protocol Complete', en: 'Protocol Complete' },
};

export interface SankalpDetails {
  fullName: string;
  fatherName: string;
  gotra: string;
  gotraUnknown: boolean;
  wish: string;
}

export interface Booking {
  id: string;
  userId: string;
  pujaCatalogId: string;
  templeId: string;
  sankalpName: string;
  sankalpFatherName: string;
  sankalpGotra: string;
  sankalpWish: string;
  bookingDate: string;
  status: BookingStatus;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithDetails extends Booking {
  pujaName: string;
  pujaNameHi: string;
  pujaPrice: number;
  templeName: string;
  templeNameHi: string;
  templeCity: string;
}

export interface BookingStatusLog {
  id: string;
  bookingId: string;
  status: BookingStatus;
  notes: string | null;
  updatedBy: string | null;
  createdAt: Date;
}

export interface CreateBookingInput {
  pujaCatalogId: string;
  templeId: string;
  sankalp: SankalpDetails;
  bookingDate: string;
  deliveryAddressId: string;
}

export interface PujaVideo {
  id: string;
  bookingId: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  uploadedAt: Date;
}

export interface PujaCertificate {
  id: string;
  bookingId: string;
  pdfUrl: string;
  createdAt: Date;
}
