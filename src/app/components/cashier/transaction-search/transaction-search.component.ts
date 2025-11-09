import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, Order, SearchFilters, TransactionSearchResult } from '../../../services/mock-data.service';

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
  paymentMethods: string[] = [];
  statuses: string[] = [];
  cashiers: string[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadTransactionData();
  }

  private loadTransactionData(): void {
    // Load transaction search results
    this.mockDataService.getTransactionSearchResults().subscribe(results => {
      this.searchResults = results;
      this.filteredResults = [...this.searchResults];
      this.totalItems = this.filteredResults.length;
    });

    // Load available payment methods
    this.mockDataService.getAvailablePaymentMethods().subscribe(methods => {
      this.paymentMethods = methods;
    });

    // Load available statuses
    this.mockDataService.getAvailableStatuses().subscribe(statuses => {
      this.statuses = statuses;
    });

    // Load available cashiers
    this.mockDataService.getAvailableCashiers().subscribe(cashiers => {
      this.cashiers = cashiers;
    });
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
      // Update transaction status in service
      this.mockDataService.updateTransactionStatus(transaction.orderId, 'refunded');

      // Add modification to transaction
      const modification = {
        type: 'refund',
        amount: transaction.totalAmount,
        reason: 'Customer request',
        timestamp: new Date()
      };
      this.mockDataService.addTransactionModification(transaction.orderId, modification);

      alert('Refund processed successfully!');
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
