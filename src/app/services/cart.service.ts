import { Injectable,inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '../interfaces';
import { OrderItem } from '../services/mock-data.service';
import { NotificationService } from './notification.service';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'cafe_x_cart';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();
  private notificationService = inject(NotificationService);

  constructor() {
    this.loadFromStorage();
  }

  get cartItems(): CartItem[] {
    return this.cartSubject.value;
  }

  get cartItemCount(): number {
    return this.cartSubject.value.length;
  }

  addToCart(menuItem: MenuItem, quantity: number = 1): void {
    if (sessionStorage.getItem('customer_billing_pending') === 'true') {
      this.notificationService.error(
        'Bill Pending',
        `You have a pending bill. Please pay at the counter before placing a new order.`
      );
      return;
    }
    const current = this.cartSubject.value;
    const existing = current.find(cartItem => cartItem.menuItem.id === menuItem.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      current.push({ menuItem, quantity });
    }
    this.cartSubject.next([...current]);
    this.saveToStorage();
  }


  addOrderItemsToCart(orderItems: OrderItem[]): void {
    if (sessionStorage.getItem('customer_billing_pending') === 'true') {
      this.notificationService.error(
        'Bill Pending',
        `You have a pending bill. Please pay at the counter before placing a new order.`
      );
      return;
    }

    const current = this.cartSubject.value;
    for (const item of orderItems) {
      const menuItem: MenuItem = {
        id: item.menu_item_id,
        name: item.menu_item_name,
        description: '',
        price: item.unit_price,
        category: item.category,
        image: '',
        item_id: String(item.menu_item_id),
        discount: '0',
        preparation_time: 15,
        is_active: true,
        is_available: true,
        is_popular: false,
        is_spicy: false,
        is_veg: false,
        is_vegetarian: false,
        restaurant_id: 0
      };

      const existing = current.find(cartItem => cartItem.menuItem.id === menuItem.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        current.push({ menuItem, quantity: item.quantity });
      }
    }
    this.cartSubject.next([...current]);
    this.saveToStorage();
  }

  increaseQuantity(menuItem: MenuItem): void {
    if (sessionStorage.getItem('customer_billing_pending') === 'true') {
      this.notificationService.error(
        'Bill Pending',
        `You have a pending bill. Please pay at the counter before placing a new order.`
      );
      return;
    }
    const current = this.cartSubject.value;
    const existing = current.find(cartItem => cartItem.menuItem.id === menuItem.id);
    if (existing) {
      existing.quantity++;
    } else {
      current.push({ menuItem, quantity: 1 });
    }
    this.cartSubject.next([...current]);
    this.saveToStorage();
  }

  decreaseQuantity(menuItem: MenuItem): void {
    const current = this.cartSubject.value;
    const existing = current.find(cartItem => cartItem.menuItem.id === menuItem.id);
    if (existing) {
      existing.quantity--;
      if (existing.quantity <= 0) {
        this.removeFromCart(menuItem.id);
        return;
      }
      this.cartSubject.next([...current]);
      this.saveToStorage();
    }
  }

  removeFromCart(menuItemId: number): void {
    const current = this.cartSubject.value.filter(cartItem => cartItem.menuItem.id !== menuItemId);
    this.cartSubject.next(current);
    this.saveToStorage();
  }

  clearCart(): void {
    this.cartSubject.next([]);
    this.saveToStorage();
  }

  getItemQuantity(menuItem: MenuItem): number {
    const existing = this.cartSubject.value.find(cartItem => cartItem.menuItem.id === menuItem.id);
    return existing ? existing.quantity : 0;
  }

  private saveToStorage(): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartSubject.value));
    } catch (error) {
      console.error('Failed to save cart to sessionStorage', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        this.cartSubject.next(parsed);
      }
    } catch (error) {
      console.error('Failed to load cart from sessionStorage', error);
      this.cartSubject.next([]);
    }
  }
}
