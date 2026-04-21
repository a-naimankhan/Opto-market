import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { OrderItem, OrderStatus } from '../../../models/api.models';
import { OrderService } from '../../../services/order/order';
import { AuthService } from '../../../services/auth/auth';
import { ChatWindowComponent } from '../../../components/chat-window/chat-window';

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
  imports: [CommonModule, ChatWindowComponent],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer implements OnInit {
  customers: SellerCustomer[] = [];
  isLoading = false;
  errorMessage = '';
  activeCustomerId: number | null = null;
  currentSellerId: number | null = null;

  constructor(private orderService: OrderService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentSellerId = this.authService.currentUser?.id ?? null;
    // #region agent log
    fetch('http://127.0.0.1:7713/ingest/3dddc5ea-9df8-49ca-a7b3-8ad76e1b8199',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98dc0d'},body:JSON.stringify({sessionId:'98dc0d',runId:'pre-fix',hypothesisId:'H1',location:'customer.ts:50',message:'seller-id-initialized-from-auth-currentUser',data:{hasCurrentUser:!!this.authService.currentUser,currentSellerId:this.currentSellerId},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!this.currentSellerId && this.authService.getToken()) {
      this.authService.loadUserProfile().subscribe((user) => {
        this.currentSellerId = user?.id ?? null;
        // #region agent log
        fetch('http://127.0.0.1:7713/ingest/3dddc5ea-9df8-49ca-a7b3-8ad76e1b8199',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98dc0d'},body:JSON.stringify({sessionId:'98dc0d',runId:'pre-fix',hypothesisId:'H1',location:'customer.ts:55',message:'seller-id-loaded-from-profile',data:{loadedSellerId:this.currentSellerId},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      });
    }
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        // #region agent log
        fetch('http://127.0.0.1:7713/ingest/3dddc5ea-9df8-49ca-a7b3-8ad76e1b8199',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98dc0d'},body:JSON.stringify({sessionId:'98dc0d',runId:'pre-fix',hypothesisId:'H2',location:'customer.ts:69',message:'orders-loaded-for-seller-page',data:{count:orders.length,sample:orders.slice(0,3).map((o)=>({orderId:o.id,customer:o.customer,owner:o.product?.owner,totalPrice:o.total_price,totalPriceType:typeof o.total_price}))},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
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

  toggleChat(customerId: number): void {
    this.activeCustomerId = this.activeCustomerId === customerId ? null : customerId;
    // #region agent log
    fetch('http://127.0.0.1:7713/ingest/3dddc5ea-9df8-49ca-a7b3-8ad76e1b8199',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98dc0d'},body:JSON.stringify({sessionId:'98dc0d',runId:'pre-fix',hypothesisId:'H3',location:'customer.ts:105',message:'toggle-chat-customer-and-seller-ids',data:{selectedBuyerId:customerId,currentSellerId:this.currentSellerId,activeCustomerId:this.activeCustomerId},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }

  private buildCustomersFromOrders(orders: OrderItem[]): SellerCustomer[] {
    const grouped = new Map<string, SellerCustomer>();

    for (const [index, order] of orders.entries()) {
      if (index < 5) {
        // #region agent log
        fetch('http://127.0.0.1:7713/ingest/3dddc5ea-9df8-49ca-a7b3-8ad76e1b8199',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98dc0d'},body:JSON.stringify({sessionId:'98dc0d',runId:'pre-fix',hypothesisId:'H4',location:'customer.ts:114',message:'order-price-before-grouping',data:{orderId:order.id,customerId:order.customer,sellerOwnerId:order.product?.owner,totalPrice:order.total_price,totalPriceType:typeof order.total_price},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }
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
