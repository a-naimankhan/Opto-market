// src/app/services/product.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, of, map } from 'rxjs';
import { SKIP_AUTH } from '../interceptors/auth-interceptor';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Product {
  id?: number;
  name: string;
  category: number;
  price: number;
  min_quantity: number;
  stock_quantity: number;
  unit: string;
  owner?: number;
  seller_name?: string;
  seller_phone?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {

  
private apiUrl = 'http://127.0.0.1:8000/api/products/';
  errorMessage = signal<string | null>(null); // Для вывода ошибок в UI

  constructor(private http: HttpClient) {}

  // Получение всех товаров (Овощи/Фрукты)
  getProducts(page = 1, pageSize = 12): Observable<PaginatedResponse<Product>> {
    const context = new HttpContext().set(SKIP_AUTH, true);
    const url = `${this.apiUrl}?page=${page}&page_size=${pageSize}`;
    // Бэк может вернуть либо пагинацию {count, results...}, либо просто массив товаров.
    // Нормализуем оба формата в PaginatedResponse, чтобы UI не ломался.
    return this.http.get<PaginatedResponse<Product> | Product[]>(url, { context }).pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return { count: data.length, next: null, previous: null, results: data };
        }
        if (data && Array.isArray((data as any).results)) {
          return data as PaginatedResponse<Product>;
        }
        return { count: 0, next: null, previous: null, results: [] };
      }),
      catchError((error) => {
        this.errorMessage.set('Произошла ошибка соединения');
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  // (click) event trigger 1: Создание товара фермером
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getCategories(): Observable<{id:number;name:string;}[]> {
    const context = new HttpContext().set(SKIP_AUTH, true);
    return this.http.get<{id:number;name:string;}[]>('http://127.0.0.1:8000/api/categories/', { context }).pipe(
      catchError((error) => {
        this.errorMessage.set('Ошибка загрузки категорий');
        return of([]);
      })
    );
  }

  // (click) event trigger 2: Удаление товара
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Произошла ошибка соединения';
    if (error.status === 400) message = 'Неверные данные в форме';
    if (error.status === 403) message = 'У вас нет прав на это действие';
    
    this.errorMessage.set(message);
    return throwError(() => new Error(message));
  }
}