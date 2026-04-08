// src/app/components/product-list/product-list.component.ts
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService, Product } from '../services/product';
import { AuthService } from '../services/auth.service';
import { PaymentModalComponent } from '../components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentModalComponent],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  authService = inject(AuthService);
  http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  products: Product[] = [];
  page = 1;
  pageSize = 12;
  total = 0;
  totalPages = 1;
  private lastUserId: number | null = null;
  paidOrders: Record<number, boolean> = {};
  currentProduct: Product | null = null;
  currentQuantity = 1;
  isPaymentModalVisible = false;

  // Payment modal state
  showPaymentModal = false;
  selectedProduct: Product | null = null;
  purchaseQuantity = 1;

  ngOnInit() {
    this.loadProducts(1);

    // После логина/логаута Angular может не пересоздать компонент,
    // поэтому принудительно обновляем список товаров при смене пользователя.
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const userId = user?.id ?? null;
        if (userId === this.lastUserId) return;
        this.lastUserId = userId;
        this.loadProducts(1);
      });
  }

  loadProducts(page = this.page) {
    this.productService.getProducts(page, this.pageSize).subscribe(data => {
      this.products = data.results;
      this.total = data.count;
      this.page = page;
      this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    });
  }

  prevPage() {
    if (this.page > 1) this.loadProducts(this.page - 1);
  }

  nextPage() {
    if (this.page < this.totalPages) this.loadProducts(this.page + 1);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.loadProducts(p);
  }

  openPaymentModal(product: Product) {
    this.currentProduct = product;
    this.currentQuantity = product.min_quantity || 1;
    this.isPaymentModalVisible = true;
  }

  closePaymentModal() {
    this.isPaymentModalVisible = false;
    this.currentProduct = null;
    this.currentQuantity = 1;
  }

  submitOrder(quantity: number) {
    console.log('submitOrder called with quantity:', quantity);
    console.log('currentProduct:', this.currentProduct);
    console.log('isLoggedIn:', this.authService.isLoggedIn());

    if (!this.currentProduct || !this.authService.isLoggedIn()) {
      alert('Пожалуйста, войдите в систему, чтобы совершить покупку.');
      return;
    }

    const payload = {
      product: this.currentProduct.id,
      quantity,
    };

    console.log('Sending order payload:', payload);

    this.http.post<any>('http://127.0.0.1:8000/api/orders/', payload).subscribe({
      next: (order) => {
        console.log('Order created successfully:', order);
        this.paidOrders[this.currentProduct!.id!] = true;
        this.closePaymentModal();
        this.loadProducts(this.page); // Обновить остатки
        alert(`Заказ оформлен (№ ${order.order_number}).`);
      },
      error: (err) => {
        console.error('Ошибка при создании заказа', err);
        alert('Не удалось оформить заказ. Попробуйте позже.');
      }
    });
  }

  removeProduct(id: number) {
    if (confirm('Удалить этот лот?')) {
      this.productService.deleteProduct(id).subscribe(() => this.loadProducts(this.page));
    }
  }

  logout() {
    this.authService.logout();
  }
}


