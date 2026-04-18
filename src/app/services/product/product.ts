import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from './constant/constant';
import { Category, Product, ProductListResponse } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) { }

  getAllProduct(categoryId?: number | null, pageSize?: number) {
    const query: string[] = [];
    if (categoryId) {
      query.push(`category=${categoryId}`);
    }
    if (pageSize && pageSize > 0) {
      query.push(`page_size=${pageSize}`);
    }

    let url = Constant.API_END_POINT + Constant.METHODS.GET_ALL_PRODUCT;
    if (query.length) {
      url += `?${query.join('&')}`;
    }
    return this.http.get<ProductListResponse>(url);
  }

 

  getCategory() {
    return this.http.get<Category[]>(Constant.API_END_POINT + Constant.METHODS.GET_ALL_CATEGORY);
  }

  saveProduct(obj: Partial<Product>) {
    return this.http.post<Product>(Constant.API_END_POINT + Constant.METHODS.CREATE_PRODUCT, obj);
  }
}
