import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart/cart';
import { AuthService } from '../../../services/auth/auth';
import { CheckoutPayload, DeliveryMethod, PaymentMethod } from '../../../models/api.models';
import { OrderService } from '../../../services/order/order';

const CHECKOUT_DRAFT_KEY = 'optomarket_checkout_draft';
const CHECKOUT_TEMPLATE_KEY = 'optomarket_checkout_template';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  isSubmitting = false;
  submitError = '';
  submitSuccess = '';
  readonly checkoutForm;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      customer_first_name: ['', [Validators.required]],
      customer_last_name: ['', [Validators.required]],
      customer_phone: ['', [Validators.required]],
      customer_email: ['', [Validators.required, Validators.email]],

      has_other_recipient: [false],
      recipient_first_name: [''],
      recipient_last_name: [''],
      recipient_phone: [''],
      recipient_email: [''],

      delivery_method: ['pickup' as DeliveryMethod, [Validators.required]],
      payment_method: ['cash' as PaymentMethod, [Validators.required]],
    });

    this.checkoutForm.controls.has_other_recipient.valueChanges.subscribe((enabled) => {
      this.toggleRecipientValidators(!!enabled);
    });

    this.toggleRecipientValidators(false);
    this.loadDraft();
  }

  get hasOtherRecipient(): boolean {
    return !!this.checkoutForm.controls.has_other_recipient.value;
  }

  get isAnotherPerson(): boolean {
    return this.hasOtherRecipient;
  }

  get cartItems() {
    return this.cartService.items;
  }

  get subtotal(): number {
    return this.cartService.subtotal;
  }

  resetForm(): void {
    this.checkoutForm.reset({
      customer_first_name: '',
      customer_last_name: '',
      customer_phone: '',
      customer_email: '',
      has_other_recipient: false,
      recipient_first_name: '',
      recipient_last_name: '',
      recipient_phone: '',
      recipient_email: '',
      delivery_method: 'pickup',
      payment_method: 'cash',
    });

    this.submitError = '';
    this.submitSuccess = '';

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
    }
  }

  saveTemplate(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(CHECKOUT_TEMPLATE_KEY, JSON.stringify(this.checkoutForm.getRawValue()));
    this.submitSuccess = 'Шаблон сохранен в браузере.';
    this.submitError = '';
  }

  saveDraft(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(this.checkoutForm.getRawValue()));
    this.submitSuccess = 'Черновик сохранен.';
    this.submitError = '';
  }

  loadTemplate(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const raw = window.localStorage.getItem(CHECKOUT_TEMPLATE_KEY);
    if (!raw) {
      this.submitError = 'Шаблон не найден.';
      this.submitSuccess = '';
      return;
    }

    try {
      this.checkoutForm.patchValue(JSON.parse(raw));
      this.submitSuccess = 'Шаблон загружен.';
      this.submitError = '';
    } catch {
      this.submitError = 'Не удалось прочитать шаблон.';
      this.submitSuccess = '';
    }
  }

  submitOrder(): void {
    this.submitError = '';
    this.submitSuccess = '';

    const token = this.authService.getToken();
    if (!token) {
      this.submitError = 'Для оформления заказа необходимо войти в аккаунт покупателя.';
      this.router.navigate(['/login'], { queryParams: { redirect: '/buyer/checkout' } });
      return;
    }

    if (!this.authService.currentUser) {
      this.authService.loadUserProfile().subscribe((user) => {
        if (!user) {
          this.submitError = 'Сессия истекла. Войдите снова, чтобы оформить заказ.';
          this.router.navigate(['/login'], { queryParams: { redirect: '/buyer/checkout' } });
          return;
        }
        if (user.role !== 'buyer') {
          this.submitError = 'Оформление заказа доступно только из аккаунта покупателя.';
          return;
        }
        this.submitOrder();
      });
      return;
    }

    if (this.authService.currentUser.role !== 'buyer') {
      this.submitError = 'Оформление заказа доступно только из аккаунта покупателя.';
      return;
    }

    if (!this.cartItems.length) {
      this.submitError = 'Корзина пуста.';
      return;
    }

    this.checkoutForm.markAllAsTouched();
    if (this.checkoutForm.invalid) {
      this.submitError = 'Проверьте корректность заполнения формы.';
      return;
    }

    const formData = this.checkoutForm.getRawValue();
    const payload: CheckoutPayload = {
      customer_first_name: formData.customer_first_name ?? '',
      customer_last_name: formData.customer_last_name ?? '',
      customer_phone: formData.customer_phone ?? '',
      customer_email: formData.customer_email ?? '',
      has_other_recipient: !!formData.has_other_recipient,
      recipient_first_name: formData.recipient_first_name ?? '',
      recipient_last_name: formData.recipient_last_name ?? '',
      recipient_phone: formData.recipient_phone ?? '',
      recipient_email: formData.recipient_email ?? '',
      delivery_method: (formData.delivery_method ?? 'pickup') as DeliveryMethod,
      payment_method: (formData.payment_method ?? 'cash') as PaymentMethod,
      items: this.cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.isSubmitting = true;
    this.orderService.checkout(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cartService.clear();
        this.submitSuccess = 'Заказ принят и отправлен продавцу.';
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
        }
        this.router.navigate(['/buyer/orders']);
      },
      error: (error: { error?: { error?: string } }) => {
        this.isSubmitting = false;
        this.submitError = error?.error?.error ?? 'Не удалось оформить заказ.';
      },
    });
  }

  private loadDraft(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const raw = window.localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) {
      return;
    }
    try {
      this.checkoutForm.patchValue(JSON.parse(raw));
    } catch {
      window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
    }
  }

  private toggleRecipientValidators(enabled: boolean): void {
    const controls = [
      this.checkoutForm.controls.recipient_first_name,
      this.checkoutForm.controls.recipient_last_name,
      this.checkoutForm.controls.recipient_phone,
      this.checkoutForm.controls.recipient_email,
    ];

    for (const control of controls) {
      control.clearValidators();
      if (enabled) {
        control.addValidators([Validators.required]);
      }
      control.updateValueAndValidity({ emitEvent: false });
    }

    this.checkoutForm.controls.recipient_email.clearValidators();
    if (enabled) {
      this.checkoutForm.controls.recipient_email.addValidators([Validators.required, Validators.email]);
    }
    this.checkoutForm.controls.recipient_email.updateValueAndValidity({ emitEvent: false });
  }
}
