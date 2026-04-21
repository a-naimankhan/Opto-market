export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'buyer' | 'seller';
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  image?: string | null;
  category: number;
  owner: number;
  seller_name: string;
  seller_phone: string;
  price: number;
  min_quantity: number;
  stock_quantity: number;
  unit: string;
  is_with_sale?: boolean;
  avg_rating?: number | null;
  reviews_count?: number;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'accepted' | 'pending_payment' | 'paid' | 'delivered';
export type DeliveryMethod = 'pickup' | 'other_city';
export type PaymentMethod = 'cash' | 'non_cash';

export interface CheckoutPayload {
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email: string;
  has_other_recipient: boolean;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_phone: string;
  recipient_email: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface OrderItem {
  id: number;
  order_number: string;
  order_group: string;
  customer: number;
  product: Product;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  createdAt?: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email: string;
  has_other_recipient: boolean;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_phone: string;
  recipient_email: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  buyer_name: string;
  buyer_phone: string;
}

export interface ProductReview {
  id: number;
  product: number;
  user: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ProductReviewPayload {
  rating: number;
  comment: string;
}
