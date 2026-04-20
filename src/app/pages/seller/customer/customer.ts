import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { OrderItem, OrderStatus } from '../../../models/api.models';
import { OrderService } from '../../../services/order/order';

interface CustomerOrderSummary {
  orderId: number;
  orderNumber: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  deliveryMethod: OrderItem['delivery_method'];
  paymentMethod: OrderItem['payment_method'];
}

interface SellerCustomer {
  key: string;
  customerId: number;
  fullName: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalAmount: number;
  firstOrderAt: string;
  lastOrderAt: string;
  orders: CustomerOrderSummary[];
}

@Component({
  selector: 'app-customer',
  imports: [CommonModule],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer implements OnInit {
  customers: SellerCustomer[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.customers = this.buildCustomersFromOrders(orders);
        this.isLoading = false;
      },
      error: () => {
        this.customers = [];
        this.errorMessage = 'Не удалось загрузить список покупателей. Проверьте, что backend запущен.';
        this.isLoading = false;
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

  deliveryLabel(method: OrderItem['delivery_method']): string {
    return method === 'pickup' ? 'Самовывоз' : 'Доставка в другой город';
  }

  paymentLabel(method: OrderItem['payment_method']): string {
    return method === 'cash' ? 'Наличный расчет' : 'Безналичный расчет';
  }

  private buildCustomersFromOrders(orders: OrderItem[]): SellerCustomer[] {
    const grouped = new Map<string, SellerCustomer>();

    for (const order of orders) {
      const fullName = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || 'Без имени';
      const phone = order.customer_phone || order.buyer_phone || 'Не указан';
      const email = order.customer_email || 'Не указан';
      const key = `${order.customer}-${email}-${phone}`;

      const existing = grouped.get(key);
      const orderSummary: CustomerOrderSummary = {
        orderId: order.id,
        orderNumber: order.order_number,
        productName: order.product?.name || 'Товар',
        quantity: order.quantity,
        totalPrice: order.total_price,
        status: order.status,
        createdAt: order.created_at,
        deliveryMethod: order.delivery_method,
        paymentMethod: order.payment_method,
      };

      if (!existing) {
        grouped.set(key, {
          key,
          customerId: order.customer,
          fullName,
          phone,
          email,
          totalOrders: 1,
          totalAmount: order.total_price,
          firstOrderAt: order.created_at,
          lastOrderAt: order.created_at,
          orders: [orderSummary],
        });
        continue;
      }

      existing.totalOrders += 1;
      existing.totalAmount += order.total_price;
      existing.orders.push(orderSummary);

      if (new Date(order.created_at).getTime() < new Date(existing.firstOrderAt).getTime()) {
        existing.firstOrderAt = order.created_at;
      }
      if (new Date(order.created_at).getTime() > new Date(existing.lastOrderAt).getTime()) {
        existing.lastOrderAt = order.created_at;
      }
    }

    return Array.from(grouped.values())
      .map((customer) => ({
        ...customer,
        orders: customer.orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      }))
      .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
  }
}
