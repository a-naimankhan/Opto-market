import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  orderSuccessMessage = '';
  isContactOpen = false;
  isCategoriesOpen = false;
  isFiltering = false;
  categoriesError = '';
  productsError = '';
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
    this.categoriesError = '';
    this.productService.getCategory().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categoriesError = 'Не удалось загрузить категории. Попробуйте обновить страницу.';
        this.categories = [];
      },
    });
  }

  filterByCategory(id: number | null): void {
    if (this.selectedCategoryId === id) {
      return;
    }
    this.selectedCategoryId = id;
    this.loadProducts();
  }

  selectCategoryFromMenu(id: number | null): void {
    this.isCategoriesOpen = false;
    this.filterByCategory(id);
  }

  toggleCategoriesMenu(): void {
    this.isCategoriesOpen = !this.isCategoriesOpen;
  }

  loadProducts(): void {
    this.productsError = '';
    this.isFiltering = true;
    this.productsSubscription?.unsubscribe();

    this.productsSubscription = this.productService.getAllProduct(this.selectedCategoryId).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.products = response;
        } else if (response && response.results) {
          this.products = response.results;
        } else {
          this.products = [];
        }
        window.setTimeout(() => {
          this.isFiltering = false;
        }, 130);
      },
      error: () => {
        this.productsError = 'Не удалось загрузить товары. Попробуйте обновить страницу.';
        this.products = [];
        this.isFiltering = false;
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
}
  
