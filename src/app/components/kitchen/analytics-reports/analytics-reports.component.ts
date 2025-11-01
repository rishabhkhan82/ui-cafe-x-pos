import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, Order, MenuItem } from '../../../services/mock-data.service';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  avgPrepTime: number;
  popularItems: PopularItem[];
  hourlyDistribution: HourlyData[];
  dailyTrends: DailyData[];
  statusDistribution: StatusData[];
}

interface PopularItem {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface HourlyData {
  hour: number;
  orders: number;
  revenue: number;
}

interface DailyData {
  date: string;
  orders: number;
  revenue: number;
}

interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-analytics-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-reports.component.html',
  styleUrl: './analytics-reports.component.css'
})
export class AnalyticsReportsComponent implements OnInit {
  private mockDataService = inject(MockDataService);

  // Component state
  orders: Order[] = [];
  menuItems: MenuItem[] = [];
  analyticsData: AnalyticsData | null = null;

  // Filters
  dateRange: string = 'week';
  startDate: string = '';
  endDate: string = '';

  // Chart data (simplified for demo)
  chartData: any = {};

  ngOnInit(): void {
    this.loadData();
    this.setDefaultDateRange();
    this.generateAnalytics();
  }

  private loadData(): void {
    this.mockDataService.getOrders().subscribe(orders => {
      this.orders = orders;
    });

    this.mockDataService.getMenuItems().subscribe(items => {
      this.menuItems = items;
    });
  }

  private setDefaultDateRange(): void {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.startDate = weekAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  onDateRangeChange(): void {
    if (this.dateRange === 'custom') {
      // Keep custom dates
    } else {
      this.setDefaultDateRange();
    }
    this.generateAnalytics();
  }

  onCustomDateChange(): void {
    if (this.dateRange === 'custom') {
      this.generateAnalytics();
    }
  }

  private generateAnalytics(): void {
    // Filter orders by date range
    const filteredOrders = this.filterOrdersByDate();

    // Calculate basic metrics
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate average prep time
    const completedOrders = filteredOrders.filter(order =>
      ['completed', 'served'].includes(order.status) && order.estimatedReadyTime
    );
    const avgPrepTime = this.calculateAveragePrepTime(completedOrders);

    // Popular items analysis
    const popularItems = this.calculatePopularItems(filteredOrders);

    // Hourly distribution
    const hourlyDistribution = this.calculateHourlyDistribution(filteredOrders);

    // Daily trends
    const dailyTrends = this.calculateDailyTrends(filteredOrders);

    // Status distribution
    const statusDistribution = this.calculateStatusDistribution(filteredOrders);

    this.analyticsData = {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      avgPrepTime,
      popularItems,
      hourlyDistribution,
      dailyTrends,
      statusDistribution
    };

    this.prepareChartData();
  }

  private filterOrdersByDate(): Order[] {
    if (this.dateRange === 'all') {
      return this.orders;
    }

    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    endDate.setHours(23, 59, 59, 999);

    return this.orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  private calculateAveragePrepTime(orders: Order[]): number {
    if (orders.length === 0) return 0;

    const prepTimes = orders.map(order => {
      const created = new Date(order.createdAt).getTime();
      const ready = new Date(order.estimatedReadyTime!).getTime();
      return (ready - created) / (1000 * 60); // minutes
    }).filter(time => time > 0 && time < 240); // Filter out invalid times

    if (prepTimes.length === 0) return 0;

    return Math.round(prepTimes.reduce((sum, time) => sum + time, 0) / prepTimes.length);
  }

  private calculatePopularItems(orders: Order[]): PopularItem[] {
    const itemCounts: { [key: string]: { count: number; revenue: number } } = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = { count: 0, revenue: 0 };
        }
        itemCounts[item.menuItemId].count += item.quantity;
        itemCounts[item.menuItemId].revenue += item.totalPrice;
      });
    });

    const totalItems = Object.values(itemCounts).reduce((sum, item) => sum + item.count, 0);

    return Object.entries(itemCounts)
      .map(([menuItemId, data]) => {
        const menuItem = this.menuItems.find(item => item.id === menuItemId);
        return {
          name: menuItem?.name || 'Unknown Item',
          count: data.count,
          revenue: data.revenue,
          percentage: totalItems > 0 ? Math.round((data.count / totalItems) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateHourlyDistribution(orders: Order[]): HourlyData[] {
    const hourlyData: { [key: number]: { orders: number; revenue: number } } = {};

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { orders: 0, revenue: 0 };
    }

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders++;
      hourlyData[hour].revenue += order.totalAmount;
    });

    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        orders: data.orders,
        revenue: data.revenue
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  private calculateDailyTrends(orders: Order[]): DailyData[] {
    const dailyData: { [key: string]: { orders: number; revenue: number } } = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { orders: 0, revenue: 0 };
      }
      dailyData[date].orders++;
      dailyData[date].revenue += order.totalAmount;
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        orders: data.orders,
        revenue: data.revenue
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  }

  private calculateStatusDistribution(orders: Order[]): StatusData[] {
    const statusCounts: { [key: string]: number } = {};

    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    const totalOrders = orders.length;

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  private prepareChartData(): void {
    if (!this.analyticsData) return;

    // Prepare data for charts (simplified - in real app would use Chart.js or similar)
    this.chartData = {
      popularItems: this.analyticsData.popularItems,
      hourlyDistribution: this.analyticsData.hourlyDistribution,
      dailyTrends: this.analyticsData.dailyTrends,
      statusDistribution: this.analyticsData.statusDistribution
    };
  }

  exportReport(): void {
    // Export analytics data
    alert('Export functionality - would generate PDF/Excel report with charts and data');
  }

  refreshData(): void {
    this.generateAnalytics();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#fbbf24',
      'confirmed': '#3b82f6',
      'preparing': '#f59e0b',
      'ready': '#10b981',
      'served': '#8b5cf6',
      'completed': '#6b7280',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getBarWidth(value: number, allValues: number[]): number {
    if (value <= 0 || allValues.length === 0) return 0;
    const maxValue = Math.max(...allValues);
    return maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  }

  getHourlyValues(): number[] {
    return this.analyticsData?.hourlyDistribution.map(h => h.orders) || [];
  }

  getDailyValues(): number[] {
    return this.analyticsData?.dailyTrends.map(d => d.orders) || [];
  }
}