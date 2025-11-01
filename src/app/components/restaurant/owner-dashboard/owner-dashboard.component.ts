import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User } from '../../../services/mock-data.service';

interface DashboardData {
  // Key Metrics
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;

  // Today's Performance
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  todayAvgOrderValue: number;

  // Recent Orders
  recentOrders: any[];

  // Staff Status
  activeStaff: number;
  totalStaff: number;
  staffOnBreak: number;
  staffPerformance: any[];

  // Inventory Alerts
  lowStockItems: any[];
  outOfStockItems: any[];

  // Popular Items
  popularItems: any[];

  // Financial Summary
  monthlyRevenue: number;
  monthlyGrowth: number;
  expenses: number;
  profit: number;

  // Quick Stats
  pendingOrders: number;
  completedOrders: number;
  avgServiceTime: string;
  customerSatisfaction: number;
}

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css'
})
export class OwnerDashboardComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  currentDate = new Date();
  currentYear = new Date().getFullYear();
  subscriptionDaysLeft = 28;
  notificationCount = 3;

  // Dashboard data
  dashboardData: DashboardData = {
    // Key Metrics
    totalRevenue: 245680,
    totalOrders: 1247,
    totalCustomers: 892,
    avgOrderValue: 197,

    // Today's Performance
    todayRevenue: 45680,
    todayOrders: 247,
    todayCustomers: 189,
    todayAvgOrderValue: 185,

    // Recent Orders
    recentOrders: [
      {
        id: 'ORD-2025-1045',
        time: '14:32',
        customer: 'John Doe',
        items: 3,
        amount: 460,
        status: 'Completed',
        paymentMethod: 'Cash'
      },
      {
        id: 'ORD-2025-1044',
        time: '14:28',
        customer: 'Jane Smith',
        items: 2,
        amount: 250,
        status: 'Preparing',
        paymentMethod: 'Card'
      },
      {
        id: 'ORD-2025-1043',
        time: '14:25',
        customer: 'Mike Johnson',
        items: 4,
        amount: 380,
        status: 'Ready',
        paymentMethod: 'UPI'
      },
      {
        id: 'ORD-2025-1042',
        time: '14:20',
        customer: 'Sarah Wilson',
        items: 1,
        amount: 180,
        status: 'Served',
        paymentMethod: 'Cash'
      },
      {
        id: 'ORD-2025-1041',
        time: '14:15',
        customer: 'Tom Brown',
        items: 2,
        amount: 320,
        status: 'Completed',
        paymentMethod: 'Card'
      }
    ],

    // Staff Status
    activeStaff: 8,
    totalStaff: 12,
    staffOnBreak: 2,
    staffPerformance: [
      {
        name: 'Rahul Singh',
        role: 'Cashier',
        ordersProcessed: 89,
        revenue: 16500,
        avgServiceTime: '3.2m',
        rating: 4.8,
        performance: 96,
        status: 'Active'
      },
      {
        name: 'Priya Sharma',
        role: 'Waiter',
        ordersProcessed: 76,
        revenue: 14200,
        avgServiceTime: '3.8m',
        rating: 4.6,
        performance: 92,
        status: 'Active'
      },
      {
        name: 'Amit Kumar',
        role: 'Chef',
        ordersProcessed: 82,
        revenue: 14980,
        avgServiceTime: '3.5m',
        rating: 4.7,
        performance: 94,
        status: 'Active'
      }
    ],

    // Inventory Alerts
    lowStockItems: [
      { name: 'Chicken Breast', current: 5, minimum: 10, unit: 'kg' },
      { name: 'Tomatoes', current: 8, minimum: 15, unit: 'kg' },
      { name: 'Rice', current: 12, minimum: 20, unit: 'kg' }
    ],
    outOfStockItems: [
      { name: 'Special Sauce', current: 0, minimum: 5, unit: 'bottles' },
      { name: 'Garlic Bread', current: 0, minimum: 20, unit: 'pieces' }
    ],

    // Popular Items
    popularItems: [
      { name: 'Butter Chicken', orders: 45, revenue: 13500, trend: 'up' },
      { name: 'Paneer Tikka', orders: 38, revenue: 9500, trend: 'up' },
      { name: 'Biryani', orders: 32, revenue: 12800, trend: 'down' },
      { name: 'Naan', orders: 28, revenue: 1400, trend: 'stable' },
      { name: 'Dal Makhani', orders: 25, revenue: 6250, trend: 'up' }
    ],

    // Financial Summary
    monthlyRevenue: 425680,
    monthlyGrowth: 12.5,
    expenses: 285000,
    profit: 140680,

    // Quick Stats
    pendingOrders: 5,
    completedOrders: 242,
    avgServiceTime: '4.2 min',
    customerSatisfaction: 4.7
  };

  // Filters
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedPeriod: string = 'today';

  ngOnInit(): void {
    this.initializeData();
    this.loadDashboardData();
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
  }

  loadDashboardData(): void {
    // In a real app, this would fetch dashboard data based on selected filters
    // For now, we use the mock data
    console.log('Loading dashboard data for:', this.selectedDate, this.selectedPeriod);
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
  }

  refreshDashboard(): void {
    // Refresh dashboard data
    this.initializeData();
  }

  // Navigation methods
  navigateTo(section: string): void {
    switch (section) {
      case 'menu':
        this.router.navigate(['/restaurant/menu']);
        break;
      case 'staff':
        this.router.navigate(['/restaurant/staff']);
        break;
      case 'inventory':
        this.router.navigate(['/restaurant/inventory']);
        break;
      case 'analytics':
        this.router.navigate(['/restaurant/analytics']);
        break;
    }
  }

  viewAllItems(): void {
    this.router.navigate(['/restaurant/menu']);
  }

  viewAllOrders(): void {
    this.router.navigate(['/restaurant/orders']);
  }

  // Dashboard methods
  generateReport(): void {
    alert('Generating comprehensive business report...');
  }

  viewDetailedAnalytics(): void {
    alert('Opening detailed analytics view...');
  }

  printReport(): void {
    alert('Printing business report...');
  }

  exportToPDF(): void {
    alert('Exporting business report to PDF...');
  }

  emailReport(): void {
    alert('Sending business report via email...');
  }

  viewOrderDetails(orderId: string): void {
    alert(`Opening order details for ${orderId}...`);
  }

  viewStaffDetails(): void {
    alert('Opening staff management details...');
  }

  viewInventoryDetails(): void {
    alert('Opening inventory management details...');
  }

  manageMenu(): void {
    this.router.navigate(['/restaurant/menu']);
  }

  manageStaff(): void {
    this.router.navigate(['/restaurant/staff']);
  }

  viewAnalytics(): void {
    this.router.navigate(['/restaurant/analytics']);
  }

  manageSettings(): void {
    this.router.navigate(['/restaurant/settings']);
  }

  // Helper methods
  getSummaryBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'good':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'average':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'poor':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getPerformanceClass(performance: number): string {
    if (performance >= 95) return 'bg-green-500';
    if (performance >= 85) return 'bg-blue-500';
    if (performance >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getTransactionStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getStaffPerformanceClass(rating: number): string {
    if (rating >= 4.5) return 'bg-green-100 dark:bg-green-900/30 text-green-600';
    if (rating >= 4.0) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
    if (rating >= 3.5) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
    return 'bg-red-100 dark:bg-red-900/30 text-red-600';
  }

  getOrderStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'preparing':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'ready':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'served':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'fas fa-arrow-up text-green-500';
      case 'down': return 'fas fa-arrow-down text-red-500';
      case 'stable': return 'fas fa-minus text-gray-500';
      default: return 'fas fa-minus text-gray-500';
    }
  }

  getStaffStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'break':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'offline':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  // Helper methods
  getPaymentBadgeClass(payment: string): string {
    switch (payment.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'preparing':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'ready':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'served':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getMetricBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'good':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'average':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'poor':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }
}
