import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product';

export interface Order {
  id: number;
  order_number: string;
  customer: number;
  product: Product;
  quantity: number;
  total_price: string;
  status: string;
  created_at: string;
  buyer_name: string;
  buyer_phone: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private apiUrl = 'http://127.0.0.1:8000/api/orders/';

  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }
}

