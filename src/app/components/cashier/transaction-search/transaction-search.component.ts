import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, Order } from '../../../services/mock-data.service';

interface TransactionSearchResult {
  orderId: string;
  customerName: string;
  tableNumber: string;
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'refunded' | 'voided' | 'pending';
  timestamp: Date;
  cashierName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  modifications?: Array<{
    type: 'void' | 'discount' | 'refund';
    amount: number;
    reason: string;
    timestamp: Date;
  }>;
}

interface SearchFilters {
  orderId: string;
  customerName: string;
  tableNumber: string;
  paymentMethod: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  amountMin: number;
  amountMax: number;
  cashierName: string;
}

@Component({
  selector: 'app-transaction-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-search.component.html',
  styleUrl: './transaction-search.component.css'
})
export class TransactionSearchComponent implements OnInit {
  searchResults: TransactionSearchResult[] = [];
  filteredResults: TransactionSearchResult[] = [];
  selectedTransaction: TransactionSearchResult | null = null;
  showTransactionModal = false;

  // Search filters
  filters: SearchFilters = {
    orderId: '',
    customerName: '',
    tableNumber: '',
    paymentMethod: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    amountMin: 0,
    amountMax: 0,
    cashierName: ''
  };

  // Quick filters
  quickFilters = {
    today: false,
    yesterday: false,
    thisWeek: false,
    lastHour: false,
    highValue: false,
    refunded: false
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Available options
  paymentMethods = ['Cash', 'Card', 'UPI', 'Wallet'];
  statuses = ['completed', 'refunded', 'voided', 'pending'];
  cashiers = ['John Doe', 'Jane Smith', 'Mike Johnson'];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadSampleTransactions();
  }

  private loadSampleTransactions(): void {
    // Generate sample transaction data
    const now = new Date();
    this.searchResults = [
      {
        orderId: 'ORD-20241201-001',
        customerName: 'Amit Patil',
        tableNumber: 'T-07',
        totalAmount: 483,
        paymentMethod: 'Card',
        status: 'completed',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        cashierName: 'John Doe',
        items: [
          { name: 'Hyderabadi Biryani', quantity: 2, price: 280 },
          { name: 'Margherita Pizza', quantity: 1, price: 250 }
        ]
      },
      {
        orderId: 'ORD-20241201-002',
        customerName: 'Sarah Johnson',
        tableNumber: 'T-12',
        totalAmount: 250,
        paymentMethod: 'Cash',
        status: 'completed',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        cashierName: 'Jane Smith',
        items: [
          { name: 'Margherita Pizza', quantity: 2, price: 250 }
        ]
      },
      {
        orderId: 'ORD-20241201-003',
        customerName: 'Raj Kumar',
        tableNumber: 'T-05',
        totalAmount: 320,
        paymentMethod: 'UPI',
        status: 'refunded',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        cashierName: 'John Doe',
        items: [
          { name: 'Butter Chicken', quantity: 1, price: 320 }
        ],
        modifications: [
          {
            type: 'refund',
            amount: 320,
            reason: 'Customer complaint - cold food',
            timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000)
          }
        ]
      },
      {
        orderId: 'ORD-20241130-045',
        customerName: 'Priya Sharma',
        tableNumber: 'T-08',
        totalAmount: 1250,
        paymentMethod: 'Card',
        status: 'completed',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        cashierName: 'Mike Johnson',
        items: [
          { name: 'Paneer Butter Masala', quantity: 2, price: 350 },
          { name: 'Garlic Naan', quantity: 4, price: 80 },
          { name: 'Ras Malai', quantity: 2, price: 120 }
        ]
      },
      {
        orderId: 'ORD-20241201-004',
        customerName: 'David Chen',
        tableNumber: 'T-15',
        totalAmount: 180,
        paymentMethod: 'Wallet',
        status: 'voided',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        cashierName: 'Jane Smith',
        items: [
          { name: 'Coffee', quantity: 2, price: 90 }
        ],
        modifications: [
          {
            type: 'void',
            amount: 180,
            reason: 'Wrong order entry',
            timestamp: new Date(now.getTime() - 25 * 60 * 1000)
          }
        ]
      }
    ];

    this.filteredResults = [...this.searchResults];
    this.totalItems = this.filteredResults.length;
  }

  applyFilters(): void {
    this.filteredResults = this.searchResults.filter(transaction => {
      // Text-based filters
      if (this.filters.orderId && !transaction.orderId.toLowerCase().includes(this.filters.orderId.toLowerCase())) {
        return false;
      }
      if (this.filters.customerName && !transaction.customerName.toLowerCase().includes(this.filters.customerName.toLowerCase())) {
        return false;
      }
      if (this.filters.tableNumber && !transaction.tableNumber.toLowerCase().includes(this.filters.tableNumber.toLowerCase())) {
        return false;
      }
      if (this.filters.cashierName && !transaction.cashierName.toLowerCase().includes(this.filters.cashierName.toLowerCase())) {
        return false;
      }

      // Select filters
      if (this.filters.paymentMethod && transaction.paymentMethod !== this.filters.paymentMethod) {
        return false;
      }
      if (this.filters.status && transaction.status !== this.filters.status) {
        return false;
      }

      // Amount filters
      if (this.filters.amountMin > 0 && transaction.totalAmount < this.filters.amountMin) {
        return false;
      }
      if (this.filters.amountMax > 0 && transaction.totalAmount > this.filters.amountMax) {
        return false;
      }

      // Date filters
      if (this.filters.dateFrom) {
        const fromDate = new Date(this.filters.dateFrom);
        if (transaction.timestamp < fromDate) return false;
      }
      if (this.filters.dateTo) {
        const toDate = new Date(this.filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (transaction.timestamp > toDate) return false;
      }

      return true;
    });

    this.totalItems = this.filteredResults.length;
    this.currentPage = 1;
  }

  applyQuickFilter(filterType: string): void {
    const now = new Date();
    this.resetFilters();

    switch (filterType) {
      case 'today':
        this.filters.dateFrom = now.toISOString().split('T')[0];
        this.filters.dateTo = now.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        this.filters.dateFrom = yesterdayStr;
        this.filters.dateTo = yesterdayStr;
        break;
      case 'thisWeek':
        const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
        this.filters.dateFrom = weekStart.toISOString().split('T')[0];
        this.filters.dateTo = now.toISOString().split('T')[0];
        break;
      case 'lastHour':
        // Filter transactions from last hour
        const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
        this.filteredResults = this.searchResults.filter(t => t.timestamp >= lastHour);
        this.totalItems = this.filteredResults.length;
        return;
      case 'highValue':
        this.filters.amountMin = 500;
        break;
      case 'refunded':
        this.filters.status = 'refunded';
        break;
    }

    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      orderId: '',
      customerName: '',
      tableNumber: '',
      paymentMethod: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      amountMin: 0,
      amountMax: 0,
      cashierName: ''
    };
    this.filteredResults = [...this.searchResults];
    this.totalItems = this.filteredResults.length;
    this.currentPage = 1;
  }

  viewTransaction(transaction: TransactionSearchResult): void {
    this.selectedTransaction = transaction;
    this.showTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.selectedTransaction = null;
  }

  processRefund(transaction: TransactionSearchResult): void {
    if (confirm(`Process refund for Order ${transaction.orderId}?`)) {
      // Simulate refund processing
      alert('Refund processed successfully!');
      transaction.status = 'refunded';
      if (!transaction.modifications) transaction.modifications = [];
      transaction.modifications.push({
        type: 'refund',
        amount: transaction.totalAmount,
        reason: 'Customer request',
        timestamp: new Date()
      });
    }
  }

  reprintReceipt(transaction: TransactionSearchResult): void {
    alert(`Reprinting receipt for Order ${transaction.orderId}...`);
  }

  exportResults(): void {
    // Simulate export functionality
    alert('Transaction data exported successfully!');
  }

  // Pagination methods
  get paginatedResults(): TransactionSearchResult[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredResults.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Computed properties for statistics
  get completedCount(): number {
    return this.searchResults.filter(t => t.status === 'completed').length;
  }

  get refundedCount(): number {
    return this.searchResults.filter(t => t.status === 'refunded').length;
  }

  get voidedCount(): number {
    return this.searchResults.filter(t => t.status === 'voided').length;
  }

  // Utility methods
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'refunded': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'voided': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method.toLowerCase()) {
      case 'cash': return 'fas fa-money-bill-wave';
      case 'card': return 'fas fa-credit-card';
      case 'upi': return 'fas fa-mobile-alt';
      case 'wallet': return 'fas fa-wallet';
      default: return 'fas fa-money-check';
    }
  }

  getModificationTypeColor(type: string): string {
    switch (type) {
      case 'void': return 'text-yellow-600';
      case 'discount': return 'text-blue-600';
      case 'refund': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
}
