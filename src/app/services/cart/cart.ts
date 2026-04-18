import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../../models/api.models';

const CART_STORAGE_KEY = 'optomarket_cart_items';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>(this.readFromStorage());
  readonly items$ = this.itemsSubject.asObservable();

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  get count(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  private ensureMinQuantity(quantity: number): number {
    if (quantity < 1) {
      quantity = 1;
    }
    return quantity;
  }

  addItem(product: Product, quantity: number = 1): void {
    const safeQuantity = this.ensureMinQuantity(quantity);
    const existing = this.items.find((item) => item.product.id === product.id);

    if (existing) {
      const maxAllowed = Math.max(1, product.stock_quantity);
      existing.quantity = Math.min(maxAllowed, existing.quantity + safeQuantity);
      this.commit([...this.items]);
      return;
    }

    this.commit([...this.items, { product, quantity: Math.min(safeQuantity, Math.max(1, product.stock_quantity)) }]);
  }

  increase(productId: number): void {
    const next = this.items.map((item) => {
      if (item.product.id !== productId) {
        return item;
      }

      const maxAllowed = Math.max(1, item.product.stock_quantity);
      const increasedQuantity = this.ensureMinQuantity(item.quantity + 1);
      return {
        ...item,
        quantity: Math.min(maxAllowed, increasedQuantity),
      };
    });

    this.commit(next);
  }

  decrease(productId: number): void {
    const next = this.items.map((item) => {
      if (item.product.id !== productId) {
        return item;
      }

      const decreasedQuantity = this.ensureMinQuantity(item.quantity - 1);

      return {
        ...item,
        quantity: decreasedQuantity,
      };
    });

    this.commit(next);
  }

  remove(productId: number): void {
    this.commit(this.items.filter((item) => item.product.id !== productId));
  }

  clear(): void {
    this.commit([]);
  }

  private commit(items: CartItem[]): void {
    this.itemsSubject.next(items);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }

  private readFromStorage(): CartItem[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((item) => !!item?.product?.id && item.quantity > 0);
    } catch {
      return [];
    }
  }
}
