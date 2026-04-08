// src/app/profile/profile.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ProductService, Product } from '../services/product';

interface Order {
  id: number;
  order_number: string;
  product: Product;
  quantity: number;
  total_price: string;
  status: string;
  created_at: string;
  buyer_name: string;
  buyer_phone: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);
  productService = inject(ProductService);

  products: Product[] = [];
  userProducts: Product[] = [];
  userOrders: Order[] = [];
  loading = true;

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    if (!this.authService.isLoggedIn()) {
      this.loading = false;
      return;
    }

    // Всегда показываем витрину товаров в профиле (для всех ролей)
    this.productService.getProducts(1, 48).subscribe((resp) => {
      this.products = resp.results;

      if (this.authService.isSeller()) {
        this.userProducts = this.products.filter(p => p.owner === this.authService.currentUser?.id);
        this.loading = false;
        return;
      }

      // Для покупателя дополнительно загружаем его заказы
      this.http.get<Order[]>('http://127.0.0.1:8000/api/orders/').subscribe({
        next: (orders) => {
          this.userOrders = orders;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    });
  }

  removeProduct(id: number) {
    if (confirm('Удалить этот лот?')) {
      this.productService.deleteProduct(id).subscribe(() => this.loadUserData());
    }
  }
}