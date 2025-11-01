import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService, Order, User } from '../../../services/mock-data.service';

interface LiveOrder extends Order {
  estimatedTime: number;
}

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-orders.component.html',
  styleUrl: './customer-orders.component.css'
})
export class CustomerOrdersComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  liveOrder: LiveOrder | null = null;
  recentOrders: Order[] = [];
  selectedOrder: Order | null = null;
  showOrderDetails: boolean = false;

  // Mock data
  pendingOrdersCount = 2;
  cartItemCount = 3;

  ngOnInit(): void {
    this.initializeData();
    this.loadOrders();
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('customer') || null;
  }

  private loadOrders(): void {
    this.mockDataService.getOrders().subscribe(orders => {
      // Mock live order (first order in preparing/ready status)
      const activeOrder = orders.find(order =>
        ['preparing', 'ready', 'on_the_way'].includes(order.status)
      );

      if (activeOrder) {
        this.liveOrder = {
          ...activeOrder,
          estimatedTime: 15
        };
      }

      // Recent orders (completed orders)
      this.recentOrders = orders.filter(order =>
        ['completed', 'served'].includes(order.status)
      ).slice(0, 5);
    });
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  closeOrderDetails(): void {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  helpWithOrder(): void {
    alert('Help with order - would open support chat');
  }

  cancelOrder(order: Order): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      alert('Order cancellation request sent');
    }
  }

  reorder(order: Order): void {
    alert('Reorder functionality - would add items to cart');
  }

  contactSupport(): void {
    alert('Contact support - would open chat interface');
  }

  viewFavorites(): void {
    alert('View favorites - would navigate to favorites page');
  }

  viewCart(): void {
    alert('View cart - would navigate to cart page');
  }

  // Helper methods
  getOrderStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'on_the_way': return 'On the Way';
      case 'served': return 'Served';
      case 'completed': return 'Completed';
      default: return status;
    }
  }

  getOrderStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'confirmed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'preparing': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'ready': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'on_the_way': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      case 'served': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600';
      case 'completed': return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getOrderItemsText(items: any[]): string {
    if (items.length === 0) return 'No items';
    if (items.length === 1) return `${items[0].quantity}x ${items[0].menuItemName}`;
    return `${items.length} items`;
  }

  formatOrderDate(date: Date | string): string {
    const orderDate = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - orderDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return orderDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: orderDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
