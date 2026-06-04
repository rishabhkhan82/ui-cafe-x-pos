import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '../interfaces';

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

  constructor() {
    this.loadFromStorage();
  }

  get cartItems(): CartItem[] {
    return this.cartSubject.value;
  }

  get cartItemCount(): number {
    return this.cartSubject.value.length;
  }

  addToCart(menuItem: MenuItem): void {
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

  updateQuantity(menuItem: MenuItem, quantity: number): void {
    const current = this.cartSubject.value;
    const existing = current.find(cartItem => cartItem.menuItem.id === menuItem.id);
    if (!existing) return;
    if (quantity <= 0) {
      this.removeFromCart(menuItem.id);
      return;
    }
    existing.quantity = quantity;
    this.cartSubject.next([...current]);
    this.saveToStorage();
  }

  increaseQuantity(menuItem: MenuItem): void {
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
