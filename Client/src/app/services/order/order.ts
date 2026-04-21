import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CheckoutPayload, OrderItem, OrderStatus, ProductReview, ProductReviewPayload } from '../../models/api.models';
import { Constant } from '../product/constant/constant';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  checkout(payload: CheckoutPayload): Observable<OrderItem[]> {
    return this.http.post<OrderItem[]>(Constant.API_END_POINT + Constant.METHODS.ORDERS, payload);
  }

  getOrders(filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: OrderStatus;
  }): Observable<OrderItem[]> {
    let params = new HttpParams();

    if (filters?.dateFrom) {
      params = params.set('date_from', filters.dateFrom);
    }

    if (filters?.dateTo) {
      params = params.set('date_to', filters.dateTo);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<OrderItem[]>(Constant.API_END_POINT + Constant.METHODS.ORDERS, {
      params,
      headers: this.getAuthHeaders(),
    });
  }

  updateStatus(orderId: number, status: Exclude<OrderStatus, 'accepted'>): Observable<OrderItem> {
    const url = `${Constant.API_END_POINT}${Constant.METHODS.ORDERS}${orderId}/status/`;
    return this.http.patch<OrderItem>(url, { status }, { headers: this.getAuthHeaders() });
  }

  getProductReviews(productId: number): Observable<ProductReview[]> {
    const url = `${Constant.API_END_POINT}${Constant.METHODS.GET_ALL_PRODUCT}${productId}/reviews/`;
    return this.http.get<ProductReview[]>(url);
  }

  submitProductReview(productId: number, payload: ProductReviewPayload): Observable<ProductReview> {
    const url = `${Constant.API_END_POINT}${Constant.METHODS.GET_ALL_PRODUCT}${productId}/reviews/`;
    return this.http.post<ProductReview>(url, payload);
  }

  private getAuthHeaders(): HttpHeaders | undefined {
    const token =
      typeof window !== 'undefined' && window?.localStorage
        ? window.localStorage.getItem('access_token')
        : null;

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }
}
