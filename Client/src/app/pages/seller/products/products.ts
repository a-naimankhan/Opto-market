import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class Products implements OnInit, OnDestroy {

  private refreshTimerId: ReturnType<typeof setInterval> | null = null;


  

  
  isSidePanelVisible: boolean = false; 
  isProductsLoaded: boolean = false;
  productsLoadError: string | null = null;
  selectedImageFile: File | null = null;
  productObj: Partial<Product> = {
    name: '',
    category: 0,
    seller_name: '',
    seller_phone: '',
    price: 0,
    min_quantity: 1,
    stock_quantity: 0,
    unit: 'кг',
  } as Product

    categoryList: Category[] = [];
    productsList: Product[] = [];

  constructor(private productSrv: ProductService) {}
  ngOnInit(): void {
    this.getProducts();
    this.getAllCategory();
    this.refreshTimerId = setInterval(() => this.getProducts(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimerId) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  getProducts() {
    this.isProductsLoaded = false;
    this.productsLoadError = null;
    this.productSrv.getAllProduct(null, 48).subscribe({
      next: (res) => {
        this.productsList = res.results ?? [];
        this.isProductsLoaded = true;
      },
      error: () => {
        this.productsList = [];
        this.productsLoadError = 'Не удалось загрузить список товаров. Проверьте, что backend запущен.';
        this.isProductsLoaded = true;
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
    if ((this.productObj.price ?? 0) < 0) {
      alert('Цена не может быть ниже 0');
      return;
    }

    if ((this.productObj.stock_quantity ?? 0) < 0) {
      alert('Остаток не может быть ниже 0');
      return;
    }

    if ((this.productObj.min_quantity ?? 0) < 1) {
      alert('Минимальный заказ должен быть минимум 1');
      return;
    }

    if (!this.productObj.name || !this.productObj.category) {
      alert('Заполните обязательные поля (название и категория)');
      return;
    }

    this.productSrv.saveProduct(this.productObj, this.selectedImageFile).subscribe({
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    this.selectedImageFile = files && files.length ? files[0] : null;
  }


  openSidePanel() {
    this.isSidePanelVisible = true;
  }

  closeSidePanel() {
    this.isSidePanelVisible = false;
    this.selectedImageFile = null;
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
