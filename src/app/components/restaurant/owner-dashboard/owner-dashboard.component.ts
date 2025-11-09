import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  MockDataService,
  ResOwnerDashboardData,
  User,
  OwnerDashboardConfig,
  SelectOption
} from '../../../services/mock-data.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css'
})
export class OwnerDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  currentDate = new Date();
  currentYear = new Date().getFullYear();
  subscriptionDaysLeft = 28;
  notificationCount = 3;

  // Configuration data from service
  ownerDashboardConfig: OwnerDashboardConfig | null = null;
  periodFilterOptions: SelectOption[] = [];

  // Dashboard data
  dashboardData: ResOwnerDashboardData | null = null;

  // Filters
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedPeriod: string = 'today';

  ngOnInit(): void {
    this.loadConfigurationData();
    this.initializeData();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadConfigurationData(): void {
    // Load owner dashboard configuration
    this.subscriptions.add(
      this.mockDataService.getOwnerDashboardConfig().subscribe(config => {
        this.ownerDashboardConfig = config;
        if (config) {
          this.periodFilterOptions = config.periodFilterOptions;
        }
      })
    );

    // Load owner dashboard data
    this.subscriptions.add(
      this.mockDataService.getOwnerDashboardData().subscribe(data => {
        this.dashboardData = data;
      })
    );
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
    sessionStorage.setItem('theme', newTheme);
  }

  refreshDashboard(): void {
    // Refresh dashboard data
    this.initializeData();
  }

  // Navigation methods
  navigateTo(section: string): void {
    const route = this.mockDataService.getNavigationRoute(section);
    if (route) {
      this.router.navigate([route]);
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
    return this.mockDataService.getBadgeClass('summary', status.toLowerCase());
  }

  getPerformanceClass(performance: number): string {
    return this.mockDataService.getBadgeClass('performance', performance.toString());
  }

  getTransactionStatusClass(status: string): string {
    return this.mockDataService.getBadgeClass('transactionStatus', status.toLowerCase());
  }

  getStaffPerformanceClass(rating: number): string {
    return this.mockDataService.getBadgeClass('staffPerformance', rating.toString());
  }

  getOrderStatusClass(status: string): string {
    return this.mockDataService.getBadgeClass('orderStatus', status.toLowerCase());
  }

  getTrendIcon(trend: string): string {
    return this.mockDataService.getTrendIconClass(trend);
  }

  getStaffStatusClass(status: string): string {
    return this.mockDataService.getBadgeClass('staffStatus', status.toLowerCase());
  }

  // Helper methods
  getPaymentBadgeClass(payment: string): string {
    return this.mockDataService.getBadgeClass('paymentStatus', payment.toLowerCase());
  }

  getStatusBadgeClass(status: string): string {
    return this.mockDataService.getBadgeClass('status', status.toLowerCase());
  }

  getMetricBadgeClass(status: string): string {
    return this.mockDataService.getBadgeClass('metric', status.toLowerCase());
  }
}
