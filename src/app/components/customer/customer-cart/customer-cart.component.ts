import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-cart.component.html',
  styleUrl: './customer-cart.component.css'
})
export class CustomerCartComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal = 0;
  gst = 0;
  deliveryFee = 0;
  total = 0;
  orderCount = 0;

  constructor(
    private location: Location,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.computeTotals();
    });
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    return environment.api.baseUrl + imagePath;
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.increaseQuantity(item.menuItem);
  }

  decreaseQuantity(item: CartItem): void {
    this.cartService.decreaseQuantity(item.menuItem);
  }

  addMoreItems(): void {
    this.router.navigate(['/customer/menu']);
  }

  goBack(): void {
    this.location.back();
  }

  private computeTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, cartItem) => {
      const menuItem = cartItem.menuItem;
      const effectivePrice = Number(menuItem.discount) > 0 ? menuItem.original_price : menuItem.price;
      return sum + effectivePrice * cartItem.quantity;
    }, 0);

    this.gst = Math.round(this.subtotal * 0.18);
    this.total = this.subtotal + this.deliveryFee + this.gst;
    this.orderCount = this.cartItems.length;
  }
}
