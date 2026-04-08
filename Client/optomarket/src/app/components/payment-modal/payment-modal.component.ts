// src/app/components/payment-modal/payment-modal.component.ts
import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../services/product';
import QRCode from 'qrcode';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css']
})           
export class PaymentModalComponent {
  @Input() isVisible = false;
  @Input() product: Product | null = null;
  @Input() quantity = 1;
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmPayment = new EventEmitter<number>();

  qrText = '';
  totalPrice = 0;

  ngOnChanges() {
    if (this.isVisible && this.product) {
      this.generateQRCode();
    }
  }

  generateQRCode() {
    if (!this.product) return;

    // Расчет общей суммы
    this.totalPrice = this.product.price * this.quantity;

    // Формирование данных для Kaspi QR
    // Формат Kaspi QR обычно включает merchant ID, сумму, валюту и описание
    const merchantId = 'MERCHANT123456'; // В реальном приложении это будет настоящий ID продавца
    const currency = 'KZT';
    const description = `Оплата за ${this.product.name} (${this.quantity} ${this.product.unit})`;

    // Создание QR данных в формате Kaspi
    this.qrText = `kaspi://pay?serviceId=${merchantId}&amount=${this.totalPrice}&currency=${currency}&description=${encodeURIComponent(description)}`;

    // Генерация QR кода
    setTimeout(() => {
      const canvas = document.querySelector('#qrCanvas') as HTMLCanvasElement;
      if (canvas) {
        QRCode.toCanvas(canvas, this.qrText, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }).catch(err => {
          console.error('Ошибка генерации QR кода:', err);
        });
      }
    }, 100);
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock_quantity) {
      this.quantity++;
      this.generateQRCode();
    }
  }

  decreaseQuantity() {
    if (this.product && this.quantity > this.product.min_quantity) {
      this.quantity--;
      this.generateQRCode();
    }
  }

  onQuantityChange(event: any) {
    const value = parseInt(event.target.value);
    if (this.product && value >= this.product.min_quantity && value <= this.product.stock_quantity) {
      this.quantity = value;
      this.generateQRCode();
    } else if (this.product) {
      // Возвращаем к допустимому значению
      this.quantity = Math.max(this.product.min_quantity, Math.min(this.product.stock_quantity, value));
      event.target.value = this.quantity;
      this.generateQRCode();
    }
  }

  close() {
    this.closeModal.emit();
  }

  onConfirmPayment() {
    this.confirmPayment.emit(this.quantity);
  }
}