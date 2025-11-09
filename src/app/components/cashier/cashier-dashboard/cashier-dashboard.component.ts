import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CashierStats, MockDataService, Order, QuickAction, RecentTransaction, User } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-dashboard.component.html',
  styleUrl: './cashier-dashboard.component.css'
})
export class CashierDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | null = null;
  stats: CashierStats = {
    todaysSales: 0,
    pendingBills: 0,
    activeTables: 0,
    shiftHours: 0,
    transactionsToday: 0,
    avgTransactionValue: 0
  };

  // Quick actions
  quickActions: QuickAction[] = [];

  // Recent transactions
  recentTransactions: RecentTransaction[] = [];

  // Pending orders
  pendingOrders: Order[] = [];

  constructor(
    private mockDataService: MockDataService,
    private realtimeService: RealtimeService
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.setupRealtimeSubscriptions();
    this.calculateStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('cashier') || null;

    // Subscribe to quick actions
    this.mockDataService.getQuickActions().subscribe(actions => {
      this.quickActions = actions;
    });

    // Subscribe to recent transactions
    this.mockDataService.getRecentTransactions().subscribe(transactions => {
      this.recentTransactions = transactions;
      this.calculateStats();
    });

    // Subscribe to cashier stats
    this.mockDataService.getCashierStats().subscribe(stats => {
      if (stats.length > 0) {
        this.stats = { ...this.stats, ...stats[0] };
      }
    });

    this.loadPendingOrders();
  }

  private setupRealtimeSubscriptions(): void {
    // Subscribe to new orders
    const newOrderSub = this.realtimeService.newOrder$.subscribe(order => {
      if (order) {
        this.loadPendingOrders();
        this.calculateStats();
      }
    });
    this.subscriptions.push(newOrderSub);

    // Subscribe to order updates
    const orderUpdateSub = this.realtimeService.orderUpdate$.subscribe(order => {
      if (order) {
        this.loadPendingOrders();
        this.calculateStats();
      }
    });
    this.subscriptions.push(orderUpdateSub);
  }


  private loadPendingOrders(): void {
    this.mockDataService.getOrders().subscribe(orders => {
      this.pendingOrders = orders.filter(order =>
        order.status === 'ready' && order.paymentStatus === 'pending'
      );
      this.calculateStats();
    });
  }

  private calculateStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate today's sales and transactions
    let todaysTransactions = 0;
    let todaysSales = 0;

    this.recentTransactions.forEach(txn => {
      const txnDate = new Date(txn.timestamp);
      txnDate.setHours(0, 0, 0, 0);
      if (txnDate.getTime() === today.getTime() && txn.status === 'success') {
        todaysTransactions++;
        todaysSales += txn.amount;
      }
    });

    // Update stats with calculated values, keeping existing values for activeTables and shiftHours
    this.stats = {
      ...this.stats,
      todaysSales: todaysSales,
      pendingBills: this.pendingOrders.length,
      transactionsToday: todaysTransactions,
      avgTransactionValue: todaysTransactions > 0 ? todaysSales / todaysTransactions : 0
    };

    // Update the service with new stats
    this.mockDataService.updateCashierStats(this.stats);
  }

  // Action handlers
  executeQuickAction(action: string): void {
    switch (action) {
      case 'newBill':
        this.newBill();
        break;
      case 'searchOrder':
        this.searchOrder();
        break;
      case 'splitBill':
        this.splitBill();
        break;
      case 'openCashDrawer':
        this.openCashDrawer();
        break;
      case 'shiftReport':
        this.shiftReport();
        break;
      case 'managerOverride':
        this.managerOverride();
        break;
    }
  }

  newBill(): void {
    console.log('Creating new bill...');
    // Navigate to bill creation or open modal
  }

  searchOrder(): void {
    console.log('Opening order search...');
    // Navigate to order search or open modal
  }

  splitBill(): void {
    console.log('Opening bill splitting...');
    // Navigate to bill splitting component
  }

  openCashDrawer(): void {
    console.log('Opening cash drawer...');
    // Open cash drawer hardware or show cash management
  }

  shiftReport(): void {
    console.log('Generating shift report...');
    // Navigate to shift reports
  }

  managerOverride(): void {
    console.log('Opening manager override...');
    // Open manager override modal
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  getCurrentTime(): string {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());
  }

  getTransactionStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method.toLowerCase()) {
      case 'cash': return 'fas fa-money-bill-wave';
      case 'card': return 'fas fa-credit-card';
      case 'upi': return 'fas fa-mobile-alt';
      case 'wallet': return 'fas fa-wallet';
      default: return 'fas fa-question-circle';
    }
  }

  getSalesPerHour(): string {
    const salesPerHour = Math.round(this.stats.todaysSales / Math.max(this.stats.shiftHours, 1));
    return salesPerHour.toLocaleString('en-IN');
  }
}