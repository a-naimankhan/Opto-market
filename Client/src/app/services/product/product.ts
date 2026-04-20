import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from './constant/constant';
import { Category, Product, ProductListResponse } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) { }

  getAllProduct(categoryId?: number | null, pageSize?: number, page?: number) {
    const query: string[] = [];
    if (categoryId) {
      query.push(`category=${categoryId}`);
    }
    if (pageSize && pageSize > 0) {
      query.push(`page_size=${pageSize}`);
    }
    if (page && page > 0) {
      query.push(`page=${page}`);
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

  saveProduct(obj: Partial<Product>, imageFile?: File | null) {
    const formData = new FormData();

    if (obj.name) {
      formData.append('name', String(obj.name));
    }
    if (obj.category) {
      formData.append('category', String(obj.category));
    }
    if (obj.seller_name) {
      formData.append('seller_name', String(obj.seller_name));
    }
    if (obj.seller_phone) {
      formData.append('seller_phone', String(obj.seller_phone));
    }
    if (obj.price !== undefined && obj.price !== null) {
      formData.append('price', String(obj.price));
    }
    if (obj.min_quantity !== undefined && obj.min_quantity !== null) {
      formData.append('min_quantity', String(obj.min_quantity));
    }
    if (obj.stock_quantity !== undefined && obj.stock_quantity !== null) {
      formData.append('stock_quantity', String(obj.stock_quantity));
    }
    if (obj.unit) {
      formData.append('unit', String(obj.unit));
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post<Product>(Constant.API_END_POINT + Constant.METHODS.CREATE_PRODUCT, formData);
  }
}
