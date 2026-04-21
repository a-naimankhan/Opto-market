import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../services/product/product';
import { Category, Product } from '../../../models/api.models';
import { AuthService } from '../../../services/auth/auth';


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
  editingProductId: number | null = null;
  currentSellerId: number | null = null;
  productObj: Partial<Product> = {
    name: '',
    category: 0,
    seller_name: '',
    seller_phone: '',
    price: 0,
    min_quantity: 1,
    stock_quantity: 0,
    unit: 'кг',
    is_with_sale: false,
    discount_percent: 0,
  } as Product

    categoryList: Category[] = [];
    productsList: Product[] = [];

  constructor(private productSrv: ProductService, private authService: AuthService) {}
  ngOnInit(): void {
    this.currentSellerId = this.authService.currentUser?.id ?? null;
    if (!this.currentSellerId && this.authService.getToken()) {
      this.authService.loadUserProfile().subscribe((user) => {
        this.currentSellerId = user?.id ?? null;
      });
    }
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

    const discountPercent = Number(this.productObj.discount_percent ?? 0);
    if (discountPercent < 0 || discountPercent > 100) {
      alert('Скидка должна быть от 0 до 100');
      return;
    }

    if (!this.productObj.is_with_sale) {
      this.productObj.discount_percent = 0;
    }
    const saveRequest$ = this.editingProductId
      ? this.productSrv.updateProduct(this.editingProductId, this.productObj, this.selectedImageFile)
      : this.productSrv.saveProduct(this.productObj, this.selectedImageFile);

    saveRequest$.subscribe({
      next: () => {
        alert(this.editingProductId ? 'Товар успешно обновлен' : 'Товар успешно добавлен');
        this.getProducts();
        this.closeSidePanel();
      },
      error: () => {
        alert(this.editingProductId
          ? 'Ошибка при обновлении товара. Проверьте заполнение полей.'
          : 'Ошибка при добавлении товара. Проверьте, что вы вошли как продавец и заполнили все поля');
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    this.selectedImageFile = files && files.length ? files[0] : null;
  }


  openSidePanel() {
    this.editingProductId = null;
    this.isSidePanelVisible = true;
    this.resetProductForm();
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.isSidePanelVisible = true;
    this.selectedImageFile = null;
    this.productObj = {
      ...product,
      category: Number(product.category),
      price: Number(product.price),
      min_quantity: Number(product.min_quantity),
      stock_quantity: Number(product.stock_quantity),
      discount_percent: Number(product.discount_percent ?? 0),
      is_with_sale: !!product.is_with_sale,
    };
  }

  closeSidePanel() {
    this.isSidePanelVisible = false;
    this.editingProductId = null;
    this.selectedImageFile = null;
    this.resetProductForm();
  }

  discountedPrice(product: Product): number {
    const price = Number(product.price || 0);
    const discount = Number(product.discount_percent || 0);
    if (!product.is_with_sale || discount <= 0) {
      return price;
    }
    return Math.max(0, price - (price * discount) / 100);
  }

  private resetProductForm(): void {
    this.productObj = {
      name: '',
      category: 0,
      seller_name: '',
      seller_phone: '',
      price: 0,
      min_quantity: 1,
      stock_quantity: 0,
      unit: 'кг',
      is_with_sale: false,
      discount_percent: 0,
    };
  }

  categoryNameById(id: number): string {
    return this.categoryList.find((item) => item.id === id)?.name ?? 'Без категории';
  }
}
