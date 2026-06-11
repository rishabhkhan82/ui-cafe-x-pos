import { Component, OnInit } from '@angular/core';
import { AnimateOnScrollDirective } from '../../../directives/animate-on-scroll.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../services/cart.service';
import { CrudService } from '../../../services/crud.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimateOnScrollDirective],
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
  orderType: 'DINE_IN' | 'TAKEAWAY' = 'DINE_IN';
  isPlacingOrder = false;

  constructor(
    private location: Location,
    private router: Router,
    private cartService: CartService,
    private crudService: CrudService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.computeTotals();
    });
  }

  proceedToOrder(): void {
    if (this.cartItems.length === 0 || this.isPlacingOrder) return;

    this.isPlacingOrder = true;

    const currentUser = this.authService.getCurrentUser();
    const customerId = currentUser?.id;
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');
    const tableNumber = sessionStorage.getItem('current_customer_table_no');

    const orderPayload: any = {
      customer_id: customerId !== undefined && customerId !== null ? Number(customerId) : null,
      customer_name: currentUser?.name || 'Guest',
      table_number: tableNumber,
      restaurant_id: restaurantId !== null ? Number(restaurantId) : null,
      status: 'PENDING',
      total_amount: this.total,
      tax_amount: this.gst, 
      payment_status: 'PENDING',
      order_type: this.orderType,
      priority: 'MEDIUM',
      special_instructions: '',
      // new fields added to match order interface
      created_at : new Date().toISOString(),
      delivered_at : null,
      estimated_ready_time : null,
      updated_at : null,
      order_id : null,
    payment_method : null,
      order_items: this.cartItems.map(cartItem => ({
        menu_item_id: cartItem.menuItem.id,
        menu_item_name: cartItem.menuItem.name,
        quantity: cartItem.quantity,
        unit_price: cartItem.menuItem.price,
        total_price: cartItem.menuItem.price * cartItem.quantity,
        category: cartItem.menuItem.category || '',
        special_instructions: '',
        status: 'PENDING'
      }))
    };

    this.crudService.createOrder(orderPayload).subscribe({
      next: (response: any) => {
        const orderId = response?.data?.order_id || response?.id || 'placed';
        this.cartService.clearCart();
        this.notificationService.success('Order Placed', `Order #${orderId} has been sent to the kitchen`);
        this.router.navigate(['/customer/orders']);
      },
      error: (error: any) => {
        console.error('Failed to place order:', error);
        this.notificationService.error('Order Failed', 'Could not place your order. Please try again.');
        this.isPlacingOrder = false;
      }
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
      const effectivePrice = menuItem.price;
      return sum + effectivePrice * cartItem.quantity;
    }, 0);

    this.gst = Math.round(this.subtotal * 0.18);
    this.total = this.subtotal + this.deliveryFee + this.gst;
    this.orderCount = this.cartItems.length;
  }
}
