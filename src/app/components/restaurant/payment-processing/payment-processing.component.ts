import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User } from '../../../services/mock-data.service';

interface PaymentStats {
  todayRevenue: number;
  successRate: number;
  failedPayments: number;
  avgTransaction: number;
}

interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  icon: string;
  fee: string;
  settlement: string;
  status: string;
  enabled: boolean;
}

interface PaymentMethods {
  cards: boolean;
  upi: boolean;
  cash: boolean;
  wallets: boolean;
}

interface RecentTransaction {
  id: string;
  description: string;
  customerName: string;
  amount: number;
  icon: string;
  timestamp: Date;
  status: string;
  gateway?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  fee: string;
  settlement: string;
  enabled: boolean;
}

@Component({
  selector: 'app-payment-processing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-processing.component.html',
  styleUrl: './payment-processing.component.css'
})
export class PaymentProcessingComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;

  // Filters and search
  searchQuery: string = '';
  statusFilter: string = 'all';
  dateFilter: string = 'today';
  filteredTransactions: RecentTransaction[] = [];

  // Payment statistics
  paymentStats: PaymentStats = {
    todayRevenue: 45280,
    successRate: 97,
    failedPayments: 3,
    avgTransaction: 144
  };

  // Payment gateways
  paymentGateways: PaymentGateway[] = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Popular Indian payment gateway',
      icon: 'fab fa-ravelry',
      fee: '2.0% + ₹3',
      settlement: 'T+1',
      status: 'Active',
      enabled: true
    },
    {
      id: 'payu',
      name: 'PayU',
      description: 'Global payment processing',
      icon: 'fas fa-credit-card',
      fee: '2.5% + ₹3',
      settlement: 'T+2',
      status: 'Active',
      enabled: false
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'International payments',
      icon: 'fab fa-stripe-s',
      fee: '2.9% + ₹30',
      settlement: 'T+7',
      status: 'Inactive',
      enabled: false
    },
    {
      id: 'cashfree',
      name: 'Cashfree',
      description: 'Complete payment solution',
      icon: 'fas fa-university',
      fee: '2.0% + ₹3',
      settlement: 'T+1',
      status: 'Active',
      enabled: true
    }
  ];

  // Payment methods
  paymentMethods: PaymentMethods = {
    cards: true,
    upi: true,
    cash: true,
    wallets: false
  };

  // Recent transactions
  recentTransactions: RecentTransaction[] = [
    {
      id: '1',
      description: 'Order #ORD-2025-1045',
      customerName: 'Amit Patil',
      amount: 1264,
      icon: 'fas fa-utensils',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      status: 'Success',
      gateway: 'Razorpay'
    },
    {
      id: '2',
      description: 'Order #ORD-2025-1044',
      customerName: 'Sarah Johnson',
      amount: 760,
      icon: 'fas fa-utensils',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      status: 'Success',
      gateway: 'Cashfree'
    },
    {
      id: '3',
      description: 'Order #ORD-2025-1043',
      customerName: 'Ravi Kumar',
      amount: 1980,
      icon: 'fas fa-utensils',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'Failed',
      gateway: 'Razorpay'
    },
    {
      id: '4',
      description: 'Order #ORD-2025-1042',
      customerName: 'Emma Thompson',
      amount: 450,
      icon: 'fas fa-utensils',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      status: 'Success',
      gateway: 'Cash'
    }
  ];

  // Payment methods list
  paymentMethodsList: PaymentMethod[] = [
    {
      id: 'cards',
      name: 'Credit/Debit Cards',
      description: 'Visa, Mastercard, RuPay',
      icon: 'fab fa-cc-visa',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      fee: '2.5% + ₹3',
      settlement: 'T+1',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm',
      icon: 'fas fa-mobile-alt',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      fee: '1.5% + ₹2',
      settlement: 'Instant',
      enabled: true
    },
    {
      id: 'cash',
      name: 'Cash',
      description: 'Physical currency',
      icon: 'fas fa-money-bill-wave',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      fee: '₹0',
      settlement: 'Instant',
      enabled: true
    },
    {
      id: 'wallets',
      name: 'Digital Wallets',
      description: 'Paytm, Mobikwik, Ola Money',
      icon: 'fas fa-wallet',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      fee: '2.0% + ₹2',
      settlement: 'T+1',
      enabled: false
    }
  ];

  ngOnInit(): void {
    this.initializeData();
    this.initializeFilters();
  }

  private initializeFilters(): void {
    this.filteredTransactions = [...this.recentTransactions];
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
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
  toggleGateway(gateway: PaymentGateway): void {
    gateway.enabled = !gateway.enabled;
    alert(`${gateway.name} ${gateway.enabled ? 'enabled' : 'disabled'} successfully`);
  }

  // Payment Methods
  togglePaymentMethod(method: PaymentMethod): void {
    method.enabled = !method.enabled;
    alert(`${method.name} ${method.enabled ? 'enabled' : 'disabled'} successfully`);
  }

  // Transaction Management
  viewTransactionDetails(transaction: RecentTransaction): void {
    alert(`View details for transaction ${transaction.id} - would open detailed transaction modal`);
  }

  canRefundTransaction(transaction: RecentTransaction): boolean {
    return transaction.status === 'Success' && transaction.gateway !== 'Cash';
  }

  processRefund(transaction: RecentTransaction): void {
    alert(`Process refund for transaction ${transaction.id} - would open refund form`);
  }

  // Gateway Management
  addGateway(): void {
    alert('Add new payment gateway - would open gateway setup wizard');
  }

  configureGatewaySettings(gateway: PaymentGateway): void {
    alert(`Configure ${gateway.name} settings - would open gateway configuration modal`);
  }

  testGateway(gateway: PaymentGateway): void {
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
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getTransactionStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'refunded':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
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
  onGatewayToggle(gateway: PaymentGateway): void {
    // In a real app, this would save the gateway preferences
    console.log(`${gateway.name} gateway toggled:`, gateway.enabled);
  }

  // Payment method toggle handlers (for future use)
  onPaymentMethodToggle(method: keyof PaymentMethods): void {
    // In a real app, this would save the payment method preferences
    console.log(`${method} payment method toggled:`, this.paymentMethods[method]);
  }
}
