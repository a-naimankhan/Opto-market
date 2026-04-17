import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product/product';
import { Product } from '../../../models/api.models';

@Component({
  selector: 'app-landing',
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  categories: string[] = [
    'Fruits & Vegetables',
    'Foodgrains, Oil & Masala',
    'Bakery, Cakes & Dairy',
    'Beverages',
    'Snacks & Branded Foods',
    'Beauty & Hygiene',
    'Cuts & Sprouts',
    'Dal & Pulses',
    'Dry Fruits',
    'Cakes & Pastries',
  ];

  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProduct().subscribe({
      next: (response) => {
        if (response && response.results) {
          this.products = response.results;
        }
      },
      error: () => {
        console.error('Failed to load products');
        // Fallback to empty list or placeholder
        this.products = [];
      },
    });
  }
}
