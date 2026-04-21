import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderItem, OrderStatus } from '../../../models/api.models';
import { OrderService } from '../../../services/order/order';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  allOrders: OrderItem[] = [];
  orders: OrderItem[] = [];
  dateFrom = '';
  dateTo = '';
  isLoading = false;
  isUpdatingStatus = false;
  errorMessage = '';
  modalErrorMessage = '';
  selectedOrder: OrderItem | null = null;
  selectedStatus: Exclude<OrderStatus, 'accepted'> = 'pending_payment';
  private hasAppliedDateRange = false;

  readonly sellerStatuses: Array<Exclude<OrderStatus, 'accepted'>> = ['pending_payment', 'paid', 'delivered'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
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
          this.allOrders = orders.map((order) => ({
            ...order,
            status: this.normalizeStatus(order.status),
          }));
          this.applyCurrentFilters();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Не удалось загрузить заказы продавца.';
          this.isLoading = false;
          this.allOrders = [];
          this.orders = [];
        },
      });
  }

  openStatusModal(order: OrderItem): void {
    this.selectedOrder = order;
    this.selectedStatus = this.asSellerStatus(order.status);
    this.modalErrorMessage = '';
  }

  closeStatusModal(): void {
    if (this.isUpdatingStatus) {
      return;
    }

    this.selectedOrder = null;
    this.modalErrorMessage = '';
  }

  confirmStatusUpdate(): void {
    if (!this.selectedOrder || this.isUpdatingStatus) {
      return;
    }

    this.isUpdatingStatus = true;
    this.modalErrorMessage = '';
    this.errorMessage = '';

    this.orderService.updateStatus(this.selectedOrder.id, this.selectedStatus).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        this.closeStatusModal();
        this.loadOrders();
      },
      error: () => {
        this.isUpdatingStatus = false;
        this.modalErrorMessage = 'Не удалось обновить статус заказа.';
      },
    });
  }

  statusLabel(status: OrderStatus): string {
    if (status === 'accepted') {
      return 'Заказ принят';
    }
    if (status === 'pending_payment') {
      return 'Ожидает оплаты';
    }
    if (status === 'paid') {
      return 'Оплачено';
    }
    return 'Доставлено';
  }

  private asSellerStatus(status: OrderStatus): Exclude<OrderStatus, 'accepted'> {
    if (status === 'accepted') {
      return 'pending_payment';
    }
    return status;
  }

  private applyCurrentFilters(): void {
    let nextOrders = [...this.allOrders];

    if (this.hasAppliedDateRange && this.dateFrom && this.dateTo) {
      nextOrders = nextOrders.filter((order) => this.isWithinDateRange(order.created_at, this.dateFrom, this.dateTo));
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
}
