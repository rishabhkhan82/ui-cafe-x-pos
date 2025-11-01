import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { MockDataService, Order, User } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';

interface KitchenStats {
  totalOrders: number;
  preparing: number;
  ready: number;
  avgPrepTime: number;
}

interface KitchenStaff {
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'break';
  currentTask: string;
}

@Component({
  selector: 'app-kitchen-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen-manager.component.html',
  styleUrl: './kitchen-manager.component.css'
})
export class KitchenManagerComponent implements OnInit, OnDestroy {
  private mockDataService = inject(MockDataService);
  private realtimeService = inject(RealtimeService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | null = null;
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  statusFilter: string = 'all';
  autoRefresh: boolean = true;

  // Kitchen stats
  kitchenStats: KitchenStats = {
    totalOrders: 0,
    preparing: 0,
    ready: 0,
    avgPrepTime: 14
  };

  // Kitchen staff
  kitchenStaff: KitchenStaff[] = [
    {
      name: 'Chef Kumar',
      role: 'Head Chef',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
      status: 'active',
      currentTask: 'Preparing Biryani'
    },
    {
      name: 'Priya Sharma',
      role: 'Sous Chef',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&h=80&fit=crop&crop=face',
      status: 'active',
      currentTask: 'Pizza Station'
    }
  ];

  ngOnInit(): void {
    this.initializeData();
    this.setupRealtimeSubscriptions();
    this.loadOrders();
    this.updateStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('kitchen_manager') || null;
  }

  private setupRealtimeSubscriptions(): void {
    // Subscribe to new orders
    const newOrderSub = this.realtimeService.newOrder$.subscribe(order => {
      if (order) {
        this.allOrders.unshift(order);
        this.filterOrders();
        this.updateStats();
      }
    });
    this.subscriptions.push(newOrderSub);

    // Subscribe to order updates
    const orderUpdateSub = this.realtimeService.orderUpdate$.subscribe(order => {
      if (order) {
        const index = this.allOrders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.allOrders[index] = order;
          this.filterOrders();
          this.updateStats();
        }
      }
    });
    this.subscriptions.push(orderUpdateSub);

    // Auto-refresh every 30 seconds if enabled
    const refreshSub = interval(30000).subscribe(() => {
      if (this.autoRefresh) {
        this.refreshOrders();
      }
    });
    this.subscriptions.push(refreshSub);
  }

  private loadOrders(): void {
    this.mockDataService.getOrders().subscribe(orders => {
      this.allOrders = orders.filter(order =>
        ['confirmed', 'preparing', 'ready'].includes(order.status)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      this.filterOrders();
      this.updateStats();
    });
  }

  private updateStats(): void {
    this.kitchenStats.totalOrders = this.allOrders.length;
    this.kitchenStats.preparing = this.allOrders.filter(order => order.status === 'preparing').length;
    this.kitchenStats.ready = this.allOrders.filter(order => order.status === 'ready').length;
  }

  private filterOrders(): void {
    if (this.statusFilter === 'all') {
      this.filteredOrders = [...this.allOrders];
    } else if (this.statusFilter === 'urgent') {
      // Mock urgent orders (orders older than 15 minutes)
      this.filteredOrders = this.allOrders.filter(order => {
        const age = Date.now() - new Date(order.createdAt).getTime();
        return age > 15 * 60 * 1000; // 15 minutes
      });
    } else {
      this.filteredOrders = this.allOrders.filter(order => order.status === this.statusFilter);
    }
  }

  // Public methods
  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.filterOrders();
  }

  getFilterButtonClass(status: string): string {
    const baseClass = 'px-3 py-1.5 rounded-full text-xs font-medium transition-colors';
    if (this.statusFilter === status) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.filterOrders();
  }

  canStartPreparing(order: Order): boolean {
    return order.status === 'confirmed';
  }

  canMarkReady(order: Order): boolean {
    return order.status === 'preparing';
  }

  startPreparing(order: Order): void {
    order.status = 'preparing';
    this.realtimeService.updateOrder(order);
    this.updateStats();
  }

  markAsReady(order: Order): void {
    order.status = 'ready';
    this.realtimeService.updateOrder(order);
    this.updateStats();
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  manageStaff(): void {
    this.router.navigate(['/kitchen/staff']);
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
  }

  // Helper methods
  getOrderBorderClass(order: Order): string {
    switch (order.status) {
      case 'confirmed': return 'border-blue-500';
      case 'preparing': return 'border-orange-500';
      case 'ready': return 'border-green-500';
      default: return 'border-gray-300 dark:border-gray-600';
    }
  }

  getOrderStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'preparing': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'ready': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getOrderStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      default: return status;
    }
  }

  getItemStatusText(status?: string): string {
    if (!status) return 'Pending';
    switch (status) {
      case 'preparing': return 'Cooking';
      case 'ready': return 'Ready';
      default: return 'Pending';
    }
  }

  getItemStatusDotClass(status?: string): string {
    if (!status) return 'bg-gray-400';
    switch (status) {
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  }

  getItemStatusTextClass(status?: string): string {
    if (!status) return 'text-gray-500';
    switch (status) {
      case 'preparing': return 'text-orange-600';
      case 'ready': return 'text-green-600';
      default: return 'text-gray-500';
    }
  }

  formatOrderTime(createdAt: Date | string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }
}
