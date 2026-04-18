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
  orders: OrderItem[] = [];
  draftStatuses: Record<number, Exclude<OrderStatus, 'accepted'>> = {};
  dateFrom = '';
  dateTo = '';
  isLoading = false;
  errorMessage = '';

  readonly sellerStatuses: Array<Exclude<OrderStatus, 'accepted'>> = ['pending_payment', 'paid', 'delivered'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.orderService
      .getOrders({
        dateFrom: this.dateFrom || undefined,
        dateTo: this.dateTo || undefined,
      })
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.draftStatuses = {};
          for (const order of orders) {
            this.draftStatuses[order.id] = this.asSellerStatus(order.status);
          }
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Не удалось загрузить заказы продавца.';
          this.isLoading = false;
          this.orders = [];
        },
      });
  }

  saveStatus(order: OrderItem): void {
    const nextStatus = this.draftStatuses[order.id];
    if (!nextStatus) {
      return;
    }

    this.orderService.updateStatus(order.id, nextStatus).subscribe({
      next: (updatedOrder) => {
        this.orders = this.orders.map((entry) => (entry.id === updatedOrder.id ? updatedOrder : entry));
      },
      error: () => {
        this.errorMessage = 'Не удалось обновить статус заказа.';
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
}
