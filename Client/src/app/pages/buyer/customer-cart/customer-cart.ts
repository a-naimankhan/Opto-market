import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../../models/api.models';
import { CartService } from '../../../services/cart/cart';

@Component({
  selector: 'app-customer-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-cart.html',
  styleUrl: './customer-cart.css',
})
export class CustomerCart {
  cartItems: CartItem[] = [];

  constructor(private cartService: CartService) {
    this.cartService.items$.subscribe((items) => {
      this.cartItems = items;
    });
  }

  increase(productId: number): void {
    this.cartService.increase(productId);
  }

  decrease(productId: number): void {
    this.cartService.decrease(productId);
  }

  remove(productId: number): void {
    this.cartService.remove(productId);
  }

  onQuantityInput(productId: number, rawValue: string): void {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      return;
    }

    this.cartService.setQuantity(productId, Math.trunc(parsed));
  }

  clear(): void {
    this.cartService.clear();
  }

  get subtotal(): number {
    return this.cartService.subtotal;
  }

  trackByProductId(_: number, item: CartItem): number {
    return item.product.id;
  }
}
