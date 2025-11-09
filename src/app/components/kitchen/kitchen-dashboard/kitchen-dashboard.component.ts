import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, Order, OrderStats, RecentOrder, User } from '../../../services/mock-data.service';

@Component({
  selector: 'app-kitchen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kitchen-dashboard.component.html',
  styleUrl: './kitchen-dashboard.component.css'
})
export class KitchenDashboardComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  recentOrders: RecentOrder[] = [];

  // Stats
  orderStats: OrderStats = {
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    avgPrepTime: 0,
    totalRevenue: 0,
    processing: 0
  };

  // Filters
  dateFilter: string = 'today';
  statusFilter: string = 'all';
  searchQuery: string = '';

  // Date range
  startDate: string = '';
  endDate: string = '';

  ngOnInit(): void {
    this.initializeData();
    this.loadOrders();
    this.calculateStats();
    this.setDefaultDateRange();
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('kitchen_manager') || null;
  }

  private loadOrders(): void {
    this.mockDataService.getOrders().subscribe(orders => {
      this.allOrders = orders;
      this.filterOrders();
      this.updateRecentOrders();
    });
  }

  private setDefaultDateRange(): void {
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  filterOrders(): void {
    let filtered = [...this.allOrders];

    // Date filter
    if (this.dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (this.dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'custom':
          if (this.startDate && this.endDate) {
            startDate = new Date(this.startDate);
            const endDate = new Date(this.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= startDate && orderDate <= endDate;
            });
          }
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      if (this.dateFilter !== 'custom') {
        filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
      }
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.tableNumber.toLowerCase().includes(query)
      );
    }

    this.filteredOrders = filtered;
  }

  private calculateStats(): void {
    const completedOrders = this.allOrders.filter(order =>
      ['completed', 'served'].includes(order.status)
    );

    this.orderStats = {
      totalOrders: this.allOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: this.allOrders.filter(order =>
        ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
      ).length,
      avgPrepTime: this.calculateAveragePrepTime(completedOrders),
      totalRevenue: this.allOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      processing: this.allOrders.filter(order =>
        ['confirmed', 'preparing'].includes(order.status)
      ).length
    };
  }

  private calculateAveragePrepTime(orders: Order[]): number {
    if (orders.length === 0) return 0;

    const prepTimes = orders
      .filter(order => order.estimatedReadyTime)
      .map(order => {
        const created = new Date(order.createdAt).getTime();
        const ready = new Date(order.estimatedReadyTime!).getTime();
        return (ready - created) / (1000 * 60); // minutes
      })
      .filter(time => time > 0);

    if (prepTimes.length === 0) return 0;

    return Math.round(prepTimes.reduce((sum, time) => sum + time, 0) / prepTimes.length);
  }

  private updateRecentOrders(): void {
    this.recentOrders = this.allOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        customerName: order.customerName,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        estimatedReadyTime: order.estimatedReadyTime
      }));
  }

  onDateFilterChange(): void {
    if (this.dateFilter === 'custom') {
      // Keep custom dates
    } else {
      this.setDefaultDateRange();
    }
    this.filterOrders();
  }

  onStatusFilterChange(): void {
    this.filterOrders();
  }

  onSearchChange(): void {
    this.filterOrders();
  }

  onCustomDateChange(): void {
    if (this.dateFilter === 'custom') {
      this.filterOrders();
    }
  }

  clearFilters(): void {
    this.dateFilter = 'today';
    this.statusFilter = 'all';
    this.searchQuery = '';
    this.setDefaultDateRange();
    this.filterOrders();
  }

  viewOrderDetails(order: Order): void {
    // Navigate to order details or open modal
    alert(`View details for order ${order.id}`);
  }

  exportOrders(): void {
    // Export filtered orders to CSV/Excel
    alert('Export functionality - would download CSV/Excel file with filtered orders');
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-green-100 text-green-800',
      'served': 'bg-purple-100 text-purple-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const texts = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready',
      'served': 'Served',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return texts[status as keyof typeof texts] || status;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getElapsedTime(createdAt: Date | string): string {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const elapsed = now - created;

    const minutes = Math.floor(elapsed / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  getOrderItemsText(order: Order): string {
    return order.items.map(item => item.menuItemName).join(', ');
  }
}