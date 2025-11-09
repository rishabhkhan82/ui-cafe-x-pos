import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MockDataService, PaymentMethod, PaymentMethods, PaymentStatsData, PaymentGatewayConfig, PaymentStatusConfig, RecentCustomerTransaction, User } from '../../../services/mock-data.service';

@Component({
  selector: 'app-payment-processing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-processing.component.html',
  styleUrl: './payment-processing.component.css'
})
export class PaymentProcessingComponent implements OnInit, OnDestroy {
  private mockDataService: MockDataService;
  private router: Router;
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | null = null;

  // Filters and search
  searchQuery: string = '';
  statusFilter: string = 'all';
  dateFilter: string = 'today';
  filteredTransactions: RecentCustomerTransaction[] = [];

  // Configuration data from service
  paymentStats: PaymentStatsData | null = null;
  paymentGateways: PaymentGatewayConfig[] = [];
  paymentMethods: PaymentMethods = { cards: true, upi: true, cash: true, wallets: false };
  recentTransactions: RecentCustomerTransaction[] = [];
  paymentMethodsList: PaymentMethod[] = [];
  paymentStatusConfigs: PaymentStatusConfig[] = [];

  constructor(
    mockDataService: MockDataService,
    router: Router
  ) {
    this.mockDataService = mockDataService;
    this.router = router;
  }

  ngOnInit(): void {
    this.initializeData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;

    // Load configuration data from service
    const statsSub = this.mockDataService.getPaymentStatsData().subscribe(stats => {
      this.paymentStats = stats;
    });
    this.subscriptions.push(statsSub);

    const gatewaysSub = this.mockDataService.getPaymentGateways().subscribe(gateways => {
      this.paymentGateways = gateways;
    });
    this.subscriptions.push(gatewaysSub);

    const methodsSub = this.mockDataService.getPaymentMethodSettings().subscribe(methods => {
      this.paymentMethods = methods;
    });
    this.subscriptions.push(methodsSub);

    const transactionsSub = this.mockDataService.getRecentCustomerTransactions().subscribe(transactions => {
      this.recentTransactions = transactions;
      this.initializeFilters(); // Re-initialize filters when transactions change
    });
    this.subscriptions.push(transactionsSub);

    const methodsListSub = this.mockDataService.getPaymentMethods().subscribe(methods => {
      this.paymentMethodsList = methods;
    });
    this.subscriptions.push(methodsListSub);

    const statusConfigsSub = this.mockDataService.getPaymentStatusConfigs().subscribe(configs => {
      this.paymentStatusConfigs = configs;
    });
    this.subscriptions.push(statusConfigsSub);
  }

  private initializeFilters(): void {
    this.filteredTransactions = [...this.recentTransactions];
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    sessionStorage.setItem('theme', newTheme);
  }

  // Quick Actions
  configureGateway(): void {
    alert('Configure payment gateway settings - would open gateway configuration modal');
  }

  viewTransactions(): void {
    alert('View all payment transactions - would navigate to detailed transaction history');
  }

  generateReport(): void {
    alert('Generate payment reports - would create PDF/Excel reports with transaction data');
  }

  manageRefunds(): void {
    alert('Manage refunds and chargebacks - would open refund management interface');
  }

  exportData(): void {
    alert('Export payment data - would download CSV/Excel file with transaction data');
  }

  // Filtering and Search
  filterTransactions(): void {
    let filtered = [...this.recentTransactions];

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(transaction =>
        transaction.status.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(query) ||
        transaction.customerName.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (this.dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        switch (this.dateFilter) {
          case 'today':
            return transactionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    this.filteredTransactions = filtered;
  }

  // Gateway Management
  toggleGateway(gateway: PaymentGatewayConfig): void {
    gateway.enabled = !gateway.enabled;
    alert(`${gateway.name} ${gateway.enabled ? 'enabled' : 'disabled'} successfully`);
  }

  // Payment Methods
  togglePaymentMethod(method: PaymentMethod): void {
    method.enabled = !method.enabled;
    alert(`${method.name} ${method.enabled ? 'enabled' : 'disabled'} successfully`);
  }

  // Transaction Management
  viewTransactionDetails(transaction: RecentCustomerTransaction): void {
    alert(`View details for transaction ${transaction.id} - would open detailed transaction modal`);
  }

  canRefundTransaction(transaction: RecentCustomerTransaction): boolean {
    return transaction.status === 'Success' && transaction.gateway !== 'Cash';
  }

  processRefund(transaction: RecentCustomerTransaction): void {
    alert(`Process refund for transaction ${transaction.id} - would open refund form`);
  }

  // Gateway Management
  addGateway(): void {
    alert('Add new payment gateway - would open gateway setup wizard');
  }

  configureGatewaySettings(gateway: PaymentGatewayConfig): void {
    alert(`Configure ${gateway.name} settings - would open gateway configuration modal`);
  }

  testGateway(gateway: PaymentGatewayConfig): void {
    alert(`Test ${gateway.name} connection - would perform gateway connectivity test`);
  }

  // Payment Methods
  manageMethods(): void {
    alert('Manage payment methods - would open payment method configuration');
  }

  // Transaction History
  viewAllTransactions(): void {
    alert('View all transactions - would navigate to comprehensive transaction history');
  }

  // Helper methods
  getStatusBadgeClass(status: string): string {
    const config = this.paymentStatusConfigs.find(c => c.status === status.toLowerCase());
    return config ? config.badgeClass : 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  getTransactionStatusBadgeClass(status: string): string {
    const config = this.paymentStatusConfigs.find(c => c.status === status.toLowerCase());
    return config ? config.badgeClass : 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  formatDateTime(date: Date): string {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Gateway toggle handlers (for future use)
  onGatewayToggle(gateway: PaymentGatewayConfig): void {
    // In a real app, this would save the gateway preferences
    console.log(`${gateway.name} gateway toggled:`, gateway.enabled);
  }

  // Payment method toggle handlers (for future use)
  onPaymentMethodToggle(method: keyof PaymentMethods): void {
    // In a real app, this would save the payment method preferences
    console.log(`${method} payment method toggled:`, this.paymentMethods[method]);
  }
}
