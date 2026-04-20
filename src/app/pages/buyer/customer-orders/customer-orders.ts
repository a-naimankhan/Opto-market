import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderItem, OrderStatus, ProductReview } from '../../../models/api.models';
import { OrderService } from '../../../services/order/order';
import { AuthService } from '../../../services/auth/auth';

@Component({
  selector: 'app-customer-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-orders.html',
  styleUrl: './customer-orders.css',
})
export class CustomerOrders implements OnInit {
  allOrders: OrderItem[] = [];
  orders: OrderItem[] = [];
  reviewDrafts: Record<number, { rating: number; comment: string }> = {};
  reviewErrors: Record<number, string> = {};
  reviewSuccess: Record<number, string> = {};
  submittingReviews: Record<number, boolean> = {};
  dateFrom = '';
  dateTo = '';
  statusFilter: OrderStatus | '' = '';
  isLoading = false;
  errorMessage = '';
  checkoutSuccessMessage = '';
  private hasAppliedDateRange = false;
  private currentUserId: number | null = null;

  readonly statuses: OrderStatus[] = ['accepted', 'pending_payment', 'paid', 'delivered'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const created = this.route.snapshot.queryParamMap.get('created');
    if (created === '1') {
      this.checkoutSuccessMessage = 'Заказ принят. Он сохранен в базе данных и отображается в списке ниже.';
    }

    this.currentUserId = this.authService.currentUser?.id ?? null;
    if (!this.currentUserId && this.authService.getToken()) {
      this.authService.loadUserProfile().subscribe((user) => {
        this.currentUserId = user?.id ?? null;
      });
    }
    this.loadOrders();
  }

  applyFilters(): void {
    if (this.isLoading) {
      return;
    }

    if (!this.dateFrom || !this.dateTo) {
      this.errorMessage = 'Для фильтра выберите диапазон дат: и "Дата от", и "Дата до".';
      return;
    }

    if (this.dateFrom > this.dateTo) {
      this.errorMessage = 'Дата "от" не может быть больше даты "до".';
      return;
    }

    this.hasAppliedDateRange = true;
    this.errorMessage = '';
    this.applyCurrentFilters();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService
      .getOrders()
      .subscribe({
        next: (orders) => {
          const normalizedOrders = orders.map((order) => ({
            ...order,
            status: this.normalizeStatus(order.status),
          }));

          this.allOrders = normalizedOrders;
          this.applyCurrentFilters();

          this.isLoading = false;
          this.initializeReviewDrafts();
          this.loadExistingReviews();
        },
        error: () => {
          this.errorMessage = 'Не удалось загрузить историю заказов.';
          this.isLoading = false;
          this.orders = [];
        },
      });
  }

  submitReview(order: OrderItem): void {
    const draft = this.reviewDrafts[order.id];
    if (!draft) {
      return;
    }

    this.reviewErrors[order.id] = '';
    this.reviewSuccess[order.id] = '';

    const rating = Number(draft.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      this.reviewErrors[order.id] = 'Оценка должна быть от 1 до 5.';
      return;
    }

    this.submittingReviews[order.id] = true;
    this.orderService
      .submitProductReview(order.product.id, {
        rating,
        comment: draft.comment ?? '',
      })
      .subscribe({
        next: () => {
          this.reviewSuccess[order.id] = 'Отзыв сохранен.';
          this.submittingReviews[order.id] = false;
          alert('Отзыв отправлен');
        },
        error: (error: { error?: { error?: string } }) => {
          this.reviewErrors[order.id] = error?.error?.error ?? 'Не удалось сохранить отзыв.';
          this.submittingReviews[order.id] = false;
        },
      });
  }

  private initializeReviewDrafts(): void {
    for (const order of this.orders) {
      if (!this.reviewDrafts[order.id]) {
        this.reviewDrafts[order.id] = {
          rating: 5,
          comment: '',
        };
      }
    }
  }

  private loadExistingReviews(): void {
    if (!this.currentUserId) {
      return;
    }

    const uniqueProductIds = [...new Set(this.orders.map((order) => order.product.id))];

    for (const productId of uniqueProductIds) {
      this.orderService.getProductReviews(productId).subscribe({
        next: (reviews) => {
          this.applyReviewToOrders(productId, reviews);
        },
      });
    }
  }

  private applyReviewToOrders(productId: number, reviews: ProductReview[]): void {
    if (!this.currentUserId) {
      return;
    }

    const myReview = reviews.find((review) => review.user === this.currentUserId);
    if (!myReview) {
      return;
    }

    const relatedOrders = this.orders.filter((order) => order.product.id === productId);
    for (const order of relatedOrders) {
      this.reviewDrafts[order.id] = {
        rating: myReview.rating,
        comment: myReview.comment,
      };
    }
  }

  statusLabel(status: OrderStatus): string {
    const normalizedStatus = this.normalizeStatus(status);

    if (normalizedStatus === 'accepted') {
      return 'Заказ принят';
    }
    if (normalizedStatus === 'pending_payment') {
      return 'Ожидает оплаты';
    }
    if (normalizedStatus === 'paid') {
      return 'Оплачено';
    }
    return 'Доставлено';
  }

  private normalizeStatus(status: string): OrderStatus {
    const value = (status || '').toString().trim().toLowerCase();
    if (value === 'accepted' || value === 'заказ принят') {
      return 'accepted';
    }
    if (value === 'pending_payment' || value === 'pending' || value === 'ожидает оплаты') {
      return 'pending_payment';
    }
    if (value === 'paid' || value === 'оплачено') {
      return 'paid';
    }
    return 'delivered';
  }

  private applyCurrentFilters(): void {
    let nextOrders = [...this.allOrders];

    if (this.hasAppliedDateRange && this.dateFrom && this.dateTo) {
      nextOrders = nextOrders.filter((order) => this.isWithinDateRange(order.created_at, this.dateFrom, this.dateTo));
    }

    if (this.statusFilter) {
      nextOrders = nextOrders.filter((order) => this.normalizeStatus(order.status) === this.statusFilter);
    }

    this.orders = nextOrders;
  }

  private isWithinDateRange(createdAt: string, from: string, to: string): boolean {
    const createdDateOnly = this.extractDateOnly(createdAt);
    if (!createdDateOnly) {
      return false;
    }

    return createdDateOnly >= from && createdDateOnly <= to;
  }

  private extractDateOnly(createdAt: string): string {
    const value = (createdAt || '').toString();
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : '';
  }
}
