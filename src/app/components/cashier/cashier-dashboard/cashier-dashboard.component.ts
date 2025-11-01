import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MockDataService, Order, User } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';

interface CashierStats {
  todaysSales: number;
  pendingBills: number;
  activeTables: number;
  shiftHours: number;
  transactionsToday: number;
  avgTransactionValue: number;
}

interface QuickAction {
  id: string;
  name: string;
  icon: string;
  color: string;
  action: string;
}

interface RecentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
}

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
  quickActions: QuickAction[] = [
    {
      id: 'new-bill',
      name: 'New Bill',
      icon: 'fas fa-plus',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: 'newBill'
    },
    {
      id: 'search-order',
      name: 'Find Order',
      icon: 'fas fa-search',
      color: 'bg-green-500 hover:bg-green-600',
      action: 'searchOrder'
    },
    {
      id: 'split-bill',
      name: 'Split Bill',
      icon: 'fas fa-code-branch',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: 'splitBill'
    },
    {
      id: 'cash-drawer',
      name: 'Cash Drawer',
      icon: 'fas fa-cash-register',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: 'openCashDrawer'
    },
    {
      id: 'shift-report',
      name: 'Shift Report',
      icon: 'fas fa-file-alt',
      color: 'bg-red-500 hover:bg-red-600',
      action: 'shiftReport'
    },
    {
      id: 'manager-override',
      name: 'Manager Override',
      icon: 'fas fa-user-shield',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: 'managerOverride'
    }
  ];

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
    this.loadRecentTransactions();
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

  private loadRecentTransactions(): void {
    // Mock recent transactions - in real app, fetch from API
    this.recentTransactions = [
      {
        id: 'txn-1',
        orderId: 'ORD-2025-1045',
        customerName: 'Amit Patil',
        amount: 483,
        paymentMethod: 'UPI',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'success'
      },
      {
        id: 'txn-2',
        orderId: 'ORD-2025-1044',
        customerName: 'Sarah Johnson',
        amount: 250,
        paymentMethod: 'Card',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'success'
      },
      {
        id: 'txn-3',
        orderId: 'ORD-2025-1043',
        customerName: 'Raj Kumar',
        amount: 380,
        paymentMethod: 'Cash',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'success'
      }
    ];
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

    this.stats = {
      todaysSales: todaysSales,
      pendingBills: this.pendingOrders.length,
      activeTables: 12, // Mock data - would come from table management
      shiftHours: 6.5, // Mock data - would come from shift tracking
      transactionsToday: todaysTransactions,
      avgTransactionValue: todaysTransactions > 0 ? todaysSales / todaysTransactions : 0
    };
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