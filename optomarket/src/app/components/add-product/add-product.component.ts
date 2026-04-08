// src/app/components/add-product/add-product.component.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Requirement: FormsModule for [(ngModel)]
import { ProductService, Product } from '../../services/product';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
  
})
export class AddProductComponent implements OnInit {
  // Исходное состояние нового товара
  newProduct: Product = {
    name: '',
    category: 1,
    price: 0,
    min_quantity: 100,
    stock_quantity: 1000,
    unit: 'кг',
    seller_name: '',
    seller_phone: ''
  };
  newProductCategoryName = '';

  categories: { id: number; name: string }[] = [];
  isSubmitting = false;
  authService = inject(AuthService);
  router = inject(Router);

  constructor(
    public productService: ProductService
  ) {}

  ngOnInit() {
    // Проверяем, что пользователь является продавцом
    console.log('AddProductComponent: Current user:', this.authService.currentUser);
    console.log('AddProductComponent: Is seller:', this.authService.isSeller());
    console.log('AddProductComponent: Is logged in:', this.authService.isLoggedIn());

    if (!this.authService.isSeller()) {
      console.warn('Пользователь не является продавцом');
    }

    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
      if (categories.length > 0) {
        this.newProduct.category = categories[0].id;
      } else {
        this.productService.errorMessage.set('Категории не найдены. Обратитесь к администратору');
      }
    });
  }

  submitProduct() {
    console.log('submitProduct called');
    console.log('Current user:', this.authService.currentUser);
    console.log('Is logged in:', this.authService.isLoggedIn());
    console.log('Is seller:', this.authService.isSeller());

    if (!this.authService.isLoggedIn()) {
      this.productService.errorMessage.set('Необходимо войти в систему');
      return;
    }

    if (!this.authService.isSeller()) {
      this.productService.errorMessage.set('Только продавцы могут добавлять товары');
      return;
    }

    this.isSubmitting = true;

    // Устанавливаем владельца товара
    this.newProduct.owner = this.authService.currentUser?.id;
    console.log('Product to submit:', this.newProduct);

    const payload: any = {
      ...this.newProduct,
      category_name: this.newProductCategoryName?.trim() || undefined
    };

    // Если новый category_name есть — передаём его, иначе используем текущий category
    if (!payload.category_name) {
      payload.category = this.newProduct.category;
    }

    this.productService.createProduct(payload).subscribe({
      next: (res) => {
        console.log('Товар успешно добавлен:', res);
        this.isSubmitting = false;
        this.router.navigate(['/products']); // Переход на список товаров
      },
      error: (err) => {
        console.error('Ошибка при создании:', err);
        this.isSubmitting = false;
        // Ошибка уже обработана в сервисе и записана в signal errorMessage
      }
    });
  }
}