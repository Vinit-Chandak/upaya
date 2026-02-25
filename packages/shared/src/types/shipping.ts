export type ShippingStatus =
  | 'pending'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed';

export interface ShippingOrder {
  id: string;
  bookingId: string;
  provider: string;
  trackingNumber: string | null;
  status: ShippingStatus;
  estimatedDelivery: string | null;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
}
