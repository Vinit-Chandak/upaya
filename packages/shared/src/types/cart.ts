/** Phase 4: Cart & Product Orders Types */

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
}

export interface CartItemWithProduct extends CartItem {
  productName: string;
  productNameHi: string;
  productImage: string;
  productPrice: number;
  productMrp: number;
  productDiscountPct: number;
  productStock: number;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartInput {
  quantity: number;
}

export type ProductOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface ProductOrder {
  id: string;
  userId: string;
  totalAmount: number;
  shippingAddressId: string;
  paymentId: string | null;
  status: ProductOrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

export interface ProductOrderWithItems extends ProductOrder {
  items: Array<
    ProductOrderItem & {
      productName: string;
      productNameHi: string;
      productImage: string;
    }
  >;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
}

export interface CreateProductOrderInput {
  shippingAddressId: string;
}
