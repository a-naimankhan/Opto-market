import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product/product';
import { AuthUser, CartItem, Category, Product } from '../../../models/api.models';
import { Subscription } from 'rxjs';
import { CartService } from '../../../services/cart/cart';
import { AuthService } from '../../../services/auth/auth';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      state('out', style({ transform: 'translateX(-100%)', opacity: 0 })),
      transition('out => in', [
        animate('350ms ease-in-out')
      ]),
      transition('in => out', [
        animate('350ms ease-in-out')
      ])
    ]),
  ],
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
  orderSuccessMessage = '';
  isContactOpen = false;
  isClicked = false;
  isShowingSales = false;
  private productsSubscription?: Subscription;
  private cartSubscription?: Subscription;
  private userSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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

    this.routeSubscription = this.route.queryParamMap.subscribe((params) => {
      const orderStatus = params.get('order');
      this.orderSuccessMessage = orderStatus === 'success' ? 'Заказ оформлен' : '';
    });
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

    let params: any = { categoryId: this.selectedCategoryId };
    if (this.isShowingSales) {
      params.is_with_sale = 'true';
    }

    this.productsSubscription = this.productService.getAllProduct(params.categoryId, undefined, undefined, params.is_with_sale).subscribe({
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
    this.routeSubscription?.unsubscribe();
  }

  closeOrderSuccessMessage(): void {
    this.orderSuccessMessage = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { order: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
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

  openContact(): void {
    this.isContactOpen = true;
  }

  closeContact(): void {
    this.isContactOpen = false;
  }

  toggleProductList(): void {
    this.isClicked = !this.isClicked;
  }

  toggleSales(): void {
    this.isShowingSales = !this.isShowingSales;
    this.selectedCategoryId = null; // Reset category filter
    this.loadProducts();
  }
}
