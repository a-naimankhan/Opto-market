import { CommonModule } from '@angular/common';
import { Component,OnInit  } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../services/product/product';
import { Category, Product } from '../../../models/api.models';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {


  

  
  isSidePanelVisible: boolean = false; 
  productObj: Partial<Product> = {
    name: '',
    category: 0,
    seller_name: '',
    seller_phone: '',
    price: 0,
    min_quantity: 1,
    stock_quantity: 0,
    unit: 'кг',
  }

    categoryList: Category[] = [];
    productsList: Product[] = [];

  constructor(private productSrv: ProductService) {}
  ngOnInit(): void {
    this.getProducts();
    this.getAllCategory();
  }

  getProducts() {
    this.productSrv.getAllProduct().subscribe({
      next: (res) => {
        this.productsList = res.results ?? [];
      },
      error: () => {
        this.productsList = [];
      },
    });
  }

  getAllCategory() {
    this.productSrv.getCategory().subscribe({
      next: (res) => {
        this.categoryList = res;
      },
      error: () => {
        this.categoryList = [];
      },
    });
  }

  onSave() {
    this.productSrv.saveProduct(this.productObj).subscribe({
      next: () => {
        alert('Товар успешно добавлен');
        this.getProducts();
        this.closeSidePanel();
      },
      error: () => {
        alert('Ошибка при добавлении товара. Проверьте, что вы вошли как продавец и заполнили все поля');
      },
    });
  }


  openSidePanel() {
    this.isSidePanelVisible = true;
  }

  closeSidePanel() {
    this.isSidePanelVisible = false;
    this.productObj = {
      name: '',
      category: 0,
      seller_name: '',
      seller_phone: '',
      price: 0,
      min_quantity: 1,
      stock_quantity: 0,
      unit: 'кг',
    };
  }

  categoryNameById(id: number): string {
    return this.categoryList.find((item) => item.id === id)?.name ?? 'Без категории';
  }
}
