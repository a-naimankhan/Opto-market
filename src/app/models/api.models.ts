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
  category: number;
  owner: number;
  seller_name: string;
  seller_phone: string;
  price: number;
  min_quantity: number;
  stock_quantity: number;
  unit: string;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
