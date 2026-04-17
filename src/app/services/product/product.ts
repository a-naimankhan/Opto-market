import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from './constant/constant';
import { Category, Product, ProductListResponse } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getAllProduct() {
    return this.http.get<ProductListResponse>(Constant.API_END_POINT + Constant.METHODS.GET_ALL_PRODUCT);
  }

 

  getCategory() {
    return this.http.get<Category[]>(Constant.API_END_POINT + Constant.METHODS.GET_ALL_CATEGORY);
  }

  saveProduct(obj: Partial<Product>) {
    return this.http.post<Product>(Constant.API_END_POINT + Constant.METHODS.CREATE_PRODUCT, obj);
  }
}
