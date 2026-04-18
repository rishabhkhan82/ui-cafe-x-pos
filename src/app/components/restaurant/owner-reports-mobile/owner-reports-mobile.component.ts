import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Order, OrderItem } from '../../../services/mock-data.service';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-owner-reports-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-reports-mobile.component.html',
  styleUrl: './owner-reports-mobile.component.css'
})
export class OwnerReportsMobileComponent implements OnInit {
  fromDate: string = '';
  toDate: string = '';
  reportData: any = null;
  isLoading: boolean = false;

  constructor(
    public router: Router,
    private crudService: CrudService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.fromDate = today;
    this.toDate = today;
  }

  generateReport() {
    if (!this.fromDate || !this.toDate) {
      this.notificationService.error('Validation Error', 'Please select both from and to dates');
      return;
    }

    this.isLoading = true;
    this.loadingService.show();

    // Prepare date range filter
    const startDate = new Date(this.fromDate).toISOString().split('T')[0];
    const endDate = new Date(this.toDate).toISOString().split('T')[0];

    this.crudService.getOrdersForReports(startDate, endDate, 'COMPLETED').subscribe({
      next: (response: any) => {
        const orders: Order[] = response.data || response || [];
        this.reportData = this.calculateReport(orders);
        this.loadingService.hide();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching orders for reports:', error);
        this.notificationService.error('Error', 'Failed to load report data');
        this.loadingService.hide();
        this.isLoading = false;
      }
    });
  }

  private calculateReport(orders: Order[]) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    const paidOrders = orders.filter(o => o.payment_status === 'PAID').length;

    // Revenue by order type
    const revenueByType = orders.reduce((acc, order) => {
      acc[order.order_type] = (acc[order.order_type] || 0) + order.total_amount;
      return acc;
    }, {} as Record<string, number>);

    // Order count by type
    const ordersByType = orders.reduce((acc, order) => {
      acc[order.order_type] = (acc[order.order_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate popular items dynamically
    const itemStats = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const itemName = item.menu_item_name;
        if (!acc[itemName]) {
          acc[itemName] = { revenue: 0, quantity: 0 };
        }
        acc[itemName].revenue += item.total_price;
        acc[itemName].quantity += item.quantity;
      });
      return acc;
    }, {} as Record<string, { revenue: number; quantity: number }>);

    // Get top 3 items by revenue
    const topItems = Object.entries(itemStats)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 3)
      .map(([name, stats]) => ({ name, ...stats }));

    // Format dates properly
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const fromFormatted = formatDate(this.fromDate);
    const toFormatted = formatDate(this.toDate);
    const period = this.fromDate === this.toDate ? fromFormatted : `${fromFormatted} to ${toFormatted}`;

    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2),
      completedOrders,
      paidOrders,
      deliveryRevenue: (revenueByType['DELIVERY'] || 0).toFixed(2),
      dineInRevenue: (revenueByType['DINE_IN'] || 0).toFixed(2),
      takeawayRevenue: (revenueByType['TAKEAWAY'] || 0).toFixed(2),
      deliveryOrders: ordersByType['DELIVERY'] || 0,
      dineInOrders: ordersByType['DINE_IN'] || 0,
      takeawayOrders: ordersByType['TAKEAWAY'] || 0,
      popularItems: topItems.length > 0 ? topItems.map(item => ({
        name: item.name,
        revenue: item.revenue.toFixed(2),
        quantity: item.quantity
      })) : [],
      period
    };
  }

  // Helper methods for dynamic item styling
  getItemCardClasses(index: number): string {
    const colors = [
      'bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 dark:from-orange-900/20 dark:via-orange-800/20 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-700/30',
      'bg-gradient-to-r from-red-50 via-red-100 to-red-50 dark:from-red-900/20 dark:via-red-800/20 dark:to-red-900/20 border-red-200/50 dark:border-red-700/30',
      'bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:via-yellow-800/20 dark:to-yellow-900/20 border-yellow-200/50 dark:border-yellow-700/30'
    ];
    return colors[index] || colors[0];
  }

  getItemHoverClasses(index: number): string {
    const colors = [
      'bg-gradient-to-r from-orange-400/5 to-transparent',
      'bg-gradient-to-r from-red-400/5 to-transparent',
      'bg-gradient-to-r from-yellow-400/5 to-transparent'
    ];
    return colors[index] || colors[0];
  }

  getItemIconClasses(index: number): string {
    const colors = [
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600'
    ];
    return colors[index] || colors[0];
  }

  getItemTextClasses(index: number): string {
    const colors = [
      'text-orange-600 dark:text-orange-400',
      'text-red-600 dark:text-red-400',
      'text-yellow-600 dark:text-yellow-400'
    ];
    return colors[index] || colors[0];
  }

  getItemIcon(index: number): string {
    const icons = ['fas fa-utensils', 'fas fa-pizza-slice', 'fas fa-hamburger'];
    return icons[index] || 'fas fa-utensils';
  }

  getItemDescription(index: number): string {
    const descriptions = ['Most popular dish', 'Customer favorite', 'Quick meal option'];
    return descriptions[index] || 'Popular item';
  }
}