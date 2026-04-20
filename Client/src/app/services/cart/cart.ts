import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../../models/api.models';
import { AuthService } from '../auth/auth';

const CART_STORAGE_KEY_PREFIX = 'optomarket_cart_items_user_';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  private activeStorageKey: string | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe((user) => {
      // Guests should always see an empty cart; authenticated users get their own persisted cart.
      this.activeStorageKey = user ? `${CART_STORAGE_KEY_PREFIX}${user.id}` : null;
      this.itemsSubject.next(this.readFromActiveStorage());
    });
  }

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

  setQuantity(productId: number, quantity: number): void {
    const next = this.items.map((item) => {
      if (item.product.id !== productId) {
        return item;
      }

      const maxAllowed = Math.max(1, item.product.stock_quantity);
      const safeQuantity = this.ensureMinQuantity(quantity);

      return {
        ...item,
        quantity: Math.min(maxAllowed, safeQuantity),
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
    if (typeof window !== 'undefined' && window.localStorage && this.activeStorageKey) {
      window.localStorage.setItem(this.activeStorageKey, JSON.stringify(items));
    }
  }

  private readFromActiveStorage(): CartItem[] {
    if (typeof window === 'undefined' || !window.localStorage || !this.activeStorageKey) {
      return [];
    }

    const raw = window.localStorage.getItem(this.activeStorageKey);
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
