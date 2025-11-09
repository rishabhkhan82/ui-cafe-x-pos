import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User, Order, MenuItem, CustomerSegment, LoyaltyStats, SatisfactionScores } from '../../../services/mock-data.service';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';

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

@Component({
  selector: 'app-analytics-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-reporting.component.html',
  styleUrl: './analytics-reporting.component.css'
})
export class AnalyticsReportingComponent implements OnInit, AfterViewInit {
  // Subscriptions
  private subscriptions = new Subscription();

  // Constructor for dependency injection
  constructor(
    private mockDataService: MockDataService,
    private router: Router
  ) {}

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

  // Customer insights - Data will be loaded from service
  customerSegments: CustomerSegment[] = [];
  loyaltyStats: LoyaltyStats = {
    activeMembers: 0,
    avgPoints: 0,
    redemptionRate: 0
  };
  satisfactionScores: SatisfactionScores = {
    food: 0,
    service: 0,
    overall: 0
  };

  // Charts
  revenueChart: Chart | null = null;
  ordersChart: Chart | null = null;
  paymentChart: Chart | null = null;
  itemsChart: Chart | null = null;

  ngOnInit(): void {
    this.initializeData();
    this.loadAnalyticsData();
    this.loadServiceData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    const ordersSub = this.mockDataService.getOrders().subscribe(orders => {
      this.calculateAnalytics(orders);
      this.calculateCategorySales(orders);
      this.calculatePeakHours(orders);
      this.updateCharts();
    });
    this.subscriptions.add(ordersSub);
  }

  private loadServiceData(): void {
    // Load customer segments from service
    const segmentsSub = this.mockDataService.getCustomerSegments().subscribe(segments => {
      this.customerSegments = segments;
    });
    this.subscriptions.add(segmentsSub);

    // Load loyalty stats from service
    const loyaltySub = this.mockDataService.getLoyaltyStats().subscribe(stats => {
      if (stats) {
        this.loyaltyStats = stats;
      }
    });
    this.subscriptions.add(loyaltySub);

    // Load satisfaction scores from service
    const satisfactionSub = this.mockDataService.getSatisfactionScores().subscribe(scores => {
      if (scores) {
        this.satisfactionScores = scores;
        this.analytics.customerSatisfaction = scores.overall;
      }
    });
    this.subscriptions.add(satisfactionSub);

    // Load customer satisfaction and growth from service
    const customerSatSub = this.mockDataService.getCustomerSatisfaction().subscribe(score => {
      if (this.analytics.customerSatisfaction === 0) {
        this.analytics.customerSatisfaction = score;
      }
    });
    this.subscriptions.add(customerSatSub);

    const satisfactionGrowthSub = this.mockDataService.getSatisfactionGrowth().subscribe(growth => {
      this.analytics.satisfactionGrowth = growth;
    });
    this.subscriptions.add(satisfactionGrowthSub);
  }

  private calculateAnalytics(orders: Order[]): void {
    const currentPeriodOrders = this.filterOrdersByDateRange(orders);
    const previousPeriodOrders = this.getPreviousPeriodOrders(orders);

    this.analytics.totalRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    this.analytics.totalOrders = currentPeriodOrders.length;
    this.analytics.avgOrderValue = currentPeriodOrders.length > 0 ?
      Math.round(this.analytics.totalRevenue / currentPeriodOrders.length) : 0;

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

    // Use service data for chart
    const chartSub = this.mockDataService.getRevenueChartData().subscribe(chartData => {
      this.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Revenue',
            data: chartData.data,
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
    });
    this.subscriptions.add(chartSub);
  }

  private createOrdersChart(): void {
    const ctx = document.getElementById('ordersChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Use service data for chart
    const chartSub = this.mockDataService.getOrdersChartData().subscribe(chartData => {
      this.ordersChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Orders',
            data: chartData.data,
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
    });
    this.subscriptions.add(chartSub);
  }

  private createPaymentChart(): void {
    const ctx = document.getElementById('paymentChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Use service data for chart
    const chartSub = this.mockDataService.getPaymentChartData().subscribe(chartData => {
      this.paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['UPI', 'Card', 'Cash', 'Wallet'],
          datasets: [{
            data: chartData,
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
    });
    this.subscriptions.add(chartSub);
  }

  private createItemsChart(): void {
    const ctx = document.getElementById('itemsChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Use service data for chart
    const chartSub = this.mockDataService.getItemsChartData().subscribe(chartData => {
      this.itemsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Orders',
            data: chartData.data,
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
    });
    this.subscriptions.add(chartSub);
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
    sessionStorage.setItem('theme', newTheme);
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
