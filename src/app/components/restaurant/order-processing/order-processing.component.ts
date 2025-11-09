import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { MockDataService, Order, OrderStats, User, OrderStatusConfig, OrderFilterOption, OrderSortOption } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';



@Component({
  selector: 'app-order-processing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-processing.component.html',
  styleUrl: './order-processing.component.css'
})
export class OrderProcessingComponent implements OnInit, OnDestroy {
  private mockDataService: MockDataService;
  private realtimeService: RealtimeService;
  private router: Router;
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | null = null;
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  searchQuery: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'newest';

  // Configuration data from service
  orderStatusConfigs: OrderStatusConfig[] = [];
  orderFilterOptions: OrderFilterOption[] = [];
  orderSortOptions: OrderSortOption[] = [];

  constructor(
    mockDataService: MockDataService,
    realtimeService: RealtimeService,
    router: Router
  ) {
    this.mockDataService = mockDataService;
    this.realtimeService = realtimeService;
    this.router = router;
  }

  // Stats
  orderStats: OrderStats = {
    totalOrders: 0,
    pendingOrders: 0,
    processing: 0,
    completedOrders: 0,
    avgPrepTime: 0,
    totalRevenue: 0
  };

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
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;

    // Load configuration data from service
    const statusConfigSub = this.mockDataService.getOrderStatusConfigs().subscribe(configs => {
      this.orderStatusConfigs = configs;
    });
    this.subscriptions.push(statusConfigSub);

    const filterOptionsSub = this.mockDataService.getOrderFilterOptions().subscribe(options => {
      this.orderFilterOptions = options;
    });
    this.subscriptions.push(filterOptionsSub);

    const sortOptionsSub = this.mockDataService.getOrderSortOptions().subscribe(options => {
      this.orderSortOptions = options;
    });
    this.subscriptions.push(sortOptionsSub);
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

    // Auto-refresh every 30 seconds
    const refreshSub = interval(30000).subscribe(() => {
      this.refreshOrders();
    });
    this.subscriptions.push(refreshSub);
  }

  private loadOrders(): void {
    this.mockDataService.getOrders().subscribe(orders => {
      this.allOrders = orders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.filterOrders();
      this.updateStats();
    });
  }

  private updateStats(): void {
    this.orderStats = {
      totalOrders: this.allOrders.length,
      pendingOrders: this.allOrders.filter(o => ['placed', 'confirmed'].includes(o.status)).length,
      processing: this.allOrders.filter(o => ['preparing', 'ready', 'on_the_way'].includes(o.status)).length,
      completedOrders: this.allOrders.filter(o => ['served', 'completed'].includes(o.status)).length,
      avgPrepTime: 0,
      totalRevenue: 0
    };
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    sessionStorage.setItem('theme', newTheme);
  }

  // Filter and Search
  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.filterOrders();
  }

  filterOrders(): void {
    let filtered = this.allOrders;

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.tableNumber.toString().includes(query)
      );
    }

    // Sort orders
    filtered = this.sortOrders(filtered);

    this.filteredOrders = filtered;
  }

  private sortOrders(orders: Order[]): Order[] {
    return orders.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount-high':
          return b.totalAmount - a.totalAmount;
        case 'amount-low':
          return a.totalAmount - b.totalAmount;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  exportOrders(): void {
    // In a real app, this would generate and download a CSV/Excel file
    alert('Order export functionality would generate a CSV file with all order data');
  }

  // Order Actions
  canConfirmOrder(order: Order): boolean {
    return order.status === 'pending';
  }

  canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed', 'preparing'].includes(order.status);
  }

  confirmOrder(order: Order): void {
    order.status = 'confirmed';
    this.realtimeService.updateOrder(order);
    this.showNotification(`Order #${order.id.split('-').pop()} confirmed`);
  }

  cancelOrder(order: Order): void {
    if (confirm(`Are you sure you want to cancel Order #${order.id.split('-').pop()}?`)) {
      order.status = 'cancelled';
      this.realtimeService.updateOrder(order);
      this.showNotification(`Order #${order.id.split('-').pop()} cancelled`);
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  // Bulk Actions
  bulkConfirmOrders(): void {
    const pendingOrders = this.filteredOrders.filter(order => order.status === 'pending');
    if (pendingOrders.length === 0) {
      alert('No orders to confirm');
      return;
    }

    if (confirm(`Confirm ${pendingOrders.length} pending order(s)?`)) {
      pendingOrders.forEach(order => {
        order.status = 'confirmed';
        this.realtimeService.updateOrder(order);
      });
      this.showNotification(`${pendingOrders.length} orders confirmed`);
    }
  }

  bulkMarkPreparing(): void {
    const confirmedOrders = this.filteredOrders.filter(order => order.status === 'confirmed');
    if (confirmedOrders.length === 0) {
      alert('No orders to start preparing');
      return;
    }

    if (confirm(`Start preparing ${confirmedOrders.length} confirmed order(s)?`)) {
      confirmedOrders.forEach(order => {
        order.status = 'preparing';
        this.realtimeService.updateOrder(order);
      });
      this.showNotification(`${confirmedOrders.length} orders moved to preparation`);
    }
  }

  bulkMarkReady(): void {
    const preparingOrders = this.filteredOrders.filter(order => order.status === 'preparing');
    if (preparingOrders.length === 0) {
      alert('No orders to mark as ready');
      return;
    }

    if (confirm(`Mark ${preparingOrders.length} order(s) as ready?`)) {
      preparingOrders.forEach(order => {
        order.status = 'ready';
        this.realtimeService.updateOrder(order);
      });
      this.showNotification(`${preparingOrders.length} orders marked as ready`);
    }
  }

  bulkCancelOrders(): void {
    const cancellableOrders = this.filteredOrders.filter(order =>
      ['placed', 'confirmed', 'preparing'].includes(order.status)
    );
    if (cancellableOrders.length === 0) {
      alert('No orders to cancel');
      return;
    }

    if (confirm(`Cancel ${cancellableOrders.length} order(s)? This action cannot be undone.`)) {
      cancellableOrders.forEach(order => {
        order.status = 'cancelled';
        this.realtimeService.updateOrder(order);
      });
      this.showNotification(`${cancellableOrders.length} orders cancelled`);
    }
  }

  // Helper methods
  getFilterButtonClass(status: string): string {
    const baseClass = 'px-3 py-1.5 rounded-full text-xs font-medium transition-colors';
    if (this.statusFilter === status) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }

  getOrderStatusConfig(status: string): OrderStatusConfig | undefined {
    return this.orderStatusConfigs.find(config => config.status === status);
  }

  getOrderBorderClass(order: Order): string {
    const config = this.getOrderStatusConfig(order.status);
    return config ? config.borderClass : 'border-gray-300 dark:border-gray-600';
  }

  getOrderStatusBadgeClass(status: string): string {
    const config = this.getOrderStatusConfig(status);
    return config ? config.badgeClass : 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  getOrderStatusText(status: string): string {
    const config = this.getOrderStatusConfig(status);
    return config ? config.text : status;
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

  formatDateTime(date: Date | string): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getOrderIcon(status: string): string {
    const config = this.getOrderStatusConfig(status);
    return config ? config.icon : 'fas fa-receipt';
  }

  getOrderItemsSummary(order: Order): string {
    if (order.items.length === 0) return 'No items';
    if (order.items.length === 1) return `${order.items[0].quantity}x ${order.items[0].menuItemName}`;

    const firstItem = order.items[0];
    const remainingCount = order.items.length - 1;
    return `${firstItem.quantity}x ${firstItem.menuItemName}${remainingCount > 0 ? ` +${remainingCount} more` : ''}`;
  }

  private showNotification(message: string): void {
    // In a real app, this would use a proper notification service
    console.log('Notification:', message);
    // For demo purposes, you could implement a toast notification here
  }
}
