import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product/product';
import { AuthUser, CartItem, Category, Product } from '../../../models/api.models';
import { Subscription } from 'rxjs';
import { CartService } from '../../../services/cart/cart';
import { AuthService } from '../../../services/auth/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit, OnDestroy {
  readonly starScale = [1, 2, 3, 4, 5];
  categories: Category[] = [];
  products: Product[] = [];
  searchQuery = '';
  cartItems: CartItem[] = [];
  cartCount = 0;
  currentUser: AuthUser | null = null;
  selectedCategoryId: number | null = null;
  isCartSidebarOpen = false;
  isProfileOpen = false;
  private productsSubscription?: Subscription;
  private cartSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.cartSubscription = this.cartService.items$.subscribe((items) => {
      this.cartItems = items;
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    if (this.authService.getToken() && !this.authService.currentUser) {
      this.authService.loadUserProfile().subscribe();
    }
  }

  loadCategories(): void {
    this.productService.getCategory().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        console.error('Failed to load categories');
        this.categories = [];
      },
    });
  }

  filterByCategory(id: number | null): void {
    this.selectedCategoryId = id;
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsSubscription?.unsubscribe();

    this.productsSubscription = this.productService.getAllProduct(this.selectedCategoryId).subscribe({
      next: (response) => {
        if (response && response.results) {
          this.products = response.results;
        }
      },
      error: () => {
        console.error('Failed to load products');
        this.products = [];
      },
    });
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  get filteredProducts(): Product[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.products;
    }

    return this.products.filter((product) => {
      const categoryName = this.categoryNameById(product.category).toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.seller_name.toLowerCase().includes(query) ||
        categoryName.includes(query)
      );
    });
  }

  categoryNameById(categoryId: number): string {
    return this.categories.find((category) => category.id === categoryId)?.name ?? '';
  }

  getAverageRating(product: Product): number {
    return product.avg_rating ?? 0;
  }

  getRoundedRating(product: Product): number {
    return Math.round(this.getAverageRating(product));
  }

  getReviewsCount(product: Product): number {
    return product.reviews_count ?? 0;
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product, Math.max(1, product.min_quantity || 1));
    this.isCartSidebarOpen = true;
  }

  openCartSidebar(): void {
    this.isCartSidebarOpen = true;
  }

  closeCartSidebar(): void {
    this.isCartSidebarOpen = false;
  }

  increaseQuantity(productId: number): void {
    this.cartService.increase(productId);
  }

  decreaseQuantity(productId: number): void {
    this.cartService.decrease(productId);
  }

  removeFromCart(productId: number): void {
    this.cartService.remove(productId);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  goToCheckout(): void {
    this.closeCartSidebar();
    this.router.navigate(['/buyer/checkout']);
  }

  toggleProfilePanel(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  goToOrders(): void {
    this.isProfileOpen = false;
    this.router.navigate(['/buyer/orders']);
  }

  logout(): void {
    this.authService.logout();
    this.isProfileOpen = false;
    this.router.navigate(['/buyer']);
  }

  trackByProductId(_: number, item: CartItem): number {
    return item.product.id;
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
  }
}
