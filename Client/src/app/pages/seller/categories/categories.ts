import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, timeout } from 'rxjs';
import { Category, Product } from '../../../models/api.models';
import { ProductService } from '../../../services/product/product';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit, OnDestroy {
  categories: Category[] = [];
  products: Product[] = [];
  selectedCategoryId: number | null = null;
  searchQuery = '';

  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  readonly pageSize = 12;
  totalCount = 0;

  private productsSubscription?: Subscription;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
  }

  loadCategories(): void {
    this.productService.getCategory().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productsSubscription?.unsubscribe();

    this.productsSubscription = this.productService
      .getAllProduct(this.selectedCategoryId, this.pageSize, this.currentPage)
      .pipe(timeout(10000))
      .subscribe({
        next: (response: unknown) => {
          if (Array.isArray(response)) {
            this.products = response;
            this.totalCount = response.length;
          } else {
            const payload = response as { results?: Product[]; count?: number } | null;
            this.products = payload?.results ?? [];
            this.totalCount = payload?.count ?? this.products.length;
          }
          this.isLoading = false;
        },
        error: () => {
          this.products = [];
          this.totalCount = 0;
          this.errorMessage = 'Не удалось загрузить товары. Проверьте backend и обновите страницу.';
          this.isLoading = false;
        },
      });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i += 1) {
      pages.push(i);
    }
    return pages;
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
    return this.categories.find((category) => category.id === categoryId)?.name ?? 'Без категории';
  }
}
