import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User, Order, MenuItem } from '../../../services/mock-data.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  customerSatisfaction: number;
  revenueGrowth: number;
  ordersGrowth: number;
  aovGrowth: number;
  satisfactionGrowth: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface CategorySale {
  name: string;
  icon: string;
  revenue: number;
  orders: number;
  percentage: number;
}

interface PeakHour {
  time: string;
  day: string;
  orders: number;
  revenue: number;
}

interface CustomerSegment {
  name: string;
  percentage: number;
}

interface LoyaltyStats {
  activeMembers: number;
  avgPoints: number;
  redemptionRate: number;
}

interface SatisfactionScores {
  food: number;
  service: number;
  overall: number;
}

@Component({
  selector: 'app-analytics-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-reporting.component.html',
  styleUrl: './analytics-reporting.component.css'
})
export class AnalyticsReportingComponent implements OnInit, AfterViewInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  selectedPeriod: string = 'This Month';
  selectedRange: string = 'month';
  reportType: string = 'sales';

  // Date range
  dateRange: DateRange = {
    start: this.getDefaultStartDate(),
    end: this.getDefaultEndDate()
  };

  // Analytics data
  analytics: AnalyticsData = {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    customerSatisfaction: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    aovGrowth: 0,
    satisfactionGrowth: 0
  };

  // Category sales
  categorySales: CategorySale[] = [];

  // Peak hours
  peakHours: PeakHour[] = [];

  // Customer insights
  customerSegments: CustomerSegment[] = [
    { name: 'New Customers', percentage: 35 },
    { name: 'Regular Customers', percentage: 45 },
    { name: 'VIP Customers', percentage: 20 }
  ];

  loyaltyStats: LoyaltyStats = {
    activeMembers: 1250,
    avgPoints: 450,
    redemptionRate: 68
  };

  satisfactionScores: SatisfactionScores = {
    food: 4.2,
    service: 4.5,
    overall: 4.3
  };

  // Charts
  revenueChart: Chart | null = null;
  ordersChart: Chart | null = null;
  paymentChart: Chart | null = null;
  itemsChart: Chart | null = null;

  ngOnInit(): void {
    this.initializeData();
    this.loadAnalyticsData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadAnalyticsData(): void {
    this.mockDataService.getOrders().subscribe(orders => {
      this.calculateAnalytics(orders);
      this.calculateCategorySales(orders);
      this.calculatePeakHours(orders);
      this.updateCharts();
    });
  }

  private calculateAnalytics(orders: Order[]): void {
    const currentPeriodOrders = this.filterOrdersByDateRange(orders);
    const previousPeriodOrders = this.getPreviousPeriodOrders(orders);

    this.analytics.totalRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    this.analytics.totalOrders = currentPeriodOrders.length;
    this.analytics.avgOrderValue = currentPeriodOrders.length > 0 ?
      Math.round(this.analytics.totalRevenue / currentPeriodOrders.length) : 0;

    // Mock customer satisfaction (in real app, this would come from customer feedback)
    this.analytics.customerSatisfaction = 94;

    // Calculate growth percentages
    const prevRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const prevOrders = previousPeriodOrders.length;
    const prevAOV = prevOrders > 0 ? prevRevenue / prevOrders : 0;

    this.analytics.revenueGrowth = prevRevenue > 0 ?
      Math.round(((this.analytics.totalRevenue - prevRevenue) / prevRevenue) * 100) : 0;
    this.analytics.ordersGrowth = prevOrders > 0 ?
      Math.round(((this.analytics.totalOrders - prevOrders) / prevOrders) * 100) : 0;
    this.analytics.aovGrowth = prevAOV > 0 ?
      Math.round(((this.analytics.avgOrderValue - prevAOV) / prevAOV) * 100) : 0;
    this.analytics.satisfactionGrowth = 5; // Mock growth
  }

  private filterOrdersByDateRange(orders: Order[]): Order[] {
    const startDate = new Date(this.dateRange.start);
    const endDate = new Date(this.dateRange.end);
    endDate.setHours(23, 59, 59, 999); // End of day

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  private getPreviousPeriodOrders(orders: Order[]): Order[] {
    const startDate = new Date(this.dateRange.start);
    const endDate = new Date(this.dateRange.end);
    const periodLength = endDate.getTime() - startDate.getTime();

    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - periodLength);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= prevStartDate && orderDate <= prevEndDate;
    });
  }

  private calculateCategorySales(orders: Order[]): void {
    const categoryMap = new Map<string, { revenue: number; orders: number; icon: string }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.category || 'main_course';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { revenue: 0, orders: 0, icon: 'fas fa-utensils' });
        }
        const catData = categoryMap.get(category)!;
        catData.revenue += item.totalPrice;
        catData.orders += item.quantity;
      });
    });

    const totalRevenue = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.revenue, 0);

    this.categorySales = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      icon: data.icon,
      revenue: Math.round(data.revenue),
      orders: data.orders,
      percentage: Math.round((data.revenue / totalRevenue) * 100)
    })).sort((a, b) => b.revenue - a.revenue);
  }

  private calculatePeakHours(orders: Order[]): void {
    const hourMap = new Map<string, { orders: number; revenue: number }>();

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      const day = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      const key = `${hour}:00 ${day}`;

      if (!hourMap.has(key)) {
        hourMap.set(key, { orders: 0, revenue: 0 });
      }
      const hourData = hourMap.get(key)!;
      hourData.orders += 1;
      hourData.revenue += order.totalAmount;
    });

    this.peakHours = Array.from(hourMap.entries())
      .map(([time, data]) => ({
        time: time.split(' ')[0],
        day: time.split(' ')[1],
        orders: data.orders,
        revenue: Math.round(data.revenue)
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);
  }

  private initializeCharts(): void {
    this.createRevenueChart();
    this.createOrdersChart();
    this.createPaymentChart();
    this.createItemsChart();
  }

  private createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [82000, 95000, 91000, 110000, 124000, 132000];

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue',
          data,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + (value as number).toLocaleString()
            }
          }
        }
      }
    });
  }

  private createOrdersChart(): void {
    const ctx = document.getElementById('ordersChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [540, 610, 590, 700, 760, 780];

    this.ordersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Orders',
          data,
          backgroundColor: '#0ea5e9',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  private createPaymentChart(): void {
    const ctx = document.getElementById('paymentChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.paymentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['UPI', 'Card', 'Cash', 'Wallet'],
        datasets: [{
          data: [48, 32, 15, 5],
          backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#a855f7'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  private createItemsChart(): void {
    const ctx = document.getElementById('itemsChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = ['Biryani', 'Pizza', 'Butter Chicken', 'Pasta', 'Burger', 'Salad'];
    const data = [1240, 1050, 980, 850, 720, 650];

    this.itemsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Orders',
          data,
          backgroundColor: '#f59e0b',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        },
        indexAxis: 'y'
      }
    });
  }

  private updateCharts(): void {
    // Update chart data based on selected period
    if (this.revenueChart) {
      // Update revenue chart data
      this.revenueChart.update();
    }
    if (this.ordersChart) {
      this.ordersChart.update();
    }
    if (this.paymentChart) {
      this.paymentChart.update();
    }
    if (this.itemsChart) {
      this.itemsChart.update();
    }
  }

  // UI Actions
  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
  }

  setDateRange(range: string): void {
    this.selectedRange = range;
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'today':
        startDate = new Date(now);
        this.selectedPeriod = 'Today';
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        this.selectedPeriod = 'This Week';
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.selectedPeriod = 'This Month';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        this.selectedPeriod = 'This Year';
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.selectedPeriod = 'This Month';
    }

    this.dateRange.start = startDate.toISOString().split('T')[0];
    this.dateRange.end = now.toISOString().split('T')[0];

    this.generateReport();
  }

  generateReport(): void {
    // Reload analytics with new date range
    this.loadAnalyticsData();
  }

  // Export functions
  exportCategoryReport(): void {
    alert('Category sales report exported successfully!');
  }

  exportPeakHoursReport(): void {
    alert('Peak hours report exported successfully!');
  }

  exportCustomerReport(): void {
    alert('Customer insights report exported successfully!');
  }

  exportPDF(): void {
    alert('Full analytics report exported as PDF!');
  }

  exportExcel(): void {
    alert('Analytics data exported as Excel spreadsheet!');
  }

  exportCSV(): void {
    alert('Raw analytics data exported as CSV!');
  }

  scheduleReport(): void {
    alert('Report scheduling feature - would allow setting up automated reports via email');
  }

  getDateRangeButtonClass(range: string): string {
    const baseClass = 'px-3 py-1.5 rounded-full text-xs font-medium transition-colors';
    if (this.selectedRange === range) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }
}
