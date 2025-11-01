import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, User } from '../../../services/mock-data.service';

interface CashTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'float_start' | 'float_end' | 'safe_deposit' | 'change_fund';
  amount: number;
  description: string;
  timestamp: Date;
  cashierId: string;
  cashierName: string;
  approvedBy?: string;
  reference?: string;
}

interface CashDrawer {
  id: string;
  cashierId: string;
  cashierName: string;
  startingFloat: number;
  currentBalance: number;
  lastUpdated: Date;
  status: 'active' | 'reconciled' | 'closed';
}

interface ShiftReconciliation {
  id: string;
  shiftId: string;
  cashierId: string;
  cashierName: string;
  date: Date;
  startingFloat: number;
  cashSales: number;
  expectedEndingBalance: number;
  actualCount: number;
  variance: number;
  status: 'pending' | 'approved' | 'rejected';
  reconciledBy?: string;
  reconciledAt?: Date;
  notes?: string;
}

@Component({
  selector: 'app-cash-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-management.component.html',
  styleUrl: './cash-management.component.css'
})
export class CashManagementComponent implements OnInit {
  currentUser: User | null = null;

  // Cash Drawer Status
  cashDrawer: CashDrawer = {
    id: 'drawer-1',
    cashierId: '3',
    cashierName: 'Amit Kumar',
    startingFloat: 2000,
    currentBalance: 2450,
    lastUpdated: new Date(),
    status: 'active'
  };

  // Transactions
  transactions: CashTransaction[] = [
    {
      id: 'txn-1',
      type: 'float_start',
      amount: 2000,
      description: 'Starting float for morning shift',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      cashierId: '3',
      cashierName: 'Amit Kumar'
    },
    {
      id: 'txn-2',
      type: 'safe_deposit',
      amount: -5000,
      description: 'Safe deposit - excess cash',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      cashierId: '3',
      cashierName: 'Amit Kumar',
      approvedBy: 'Manager'
    },
    {
      id: 'txn-3',
      type: 'change_fund',
      amount: 200,
      description: 'Additional change fund',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      cashierId: '3',
      cashierName: 'Amit Kumar'
    }
  ];

  // Shift Reconciliation
  currentReconciliation: ShiftReconciliation = {
    id: 'recon-1',
    shiftId: 'shift-1',
    cashierId: '3',
    cashierName: 'Amit Kumar',
    date: new Date(),
    startingFloat: 2000,
    cashSales: 8500,
    expectedEndingBalance: 2450,
    actualCount: 0,
    variance: 0,
    status: 'pending'
  };

  // UI State
  showDepositModal = false;
  showWithdrawalModal = false;
  showReconciliationModal = false;
  showTransactionModal = false;

  // Forms
  depositAmount = 0;
  depositReason = '';
  withdrawalAmount = 0;
  withdrawalReason = '';
  managerPin = '';
  actualCashCount = 0;

  // Selected transaction for details
  selectedTransaction: CashTransaction | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.currentUser = this.mockDataService.getUserByRole('cashier') || null;
    this.calculateExpectedBalance();
  }

  // Cash Operations
  openDepositModal(): void {
    this.showDepositModal = true;
    this.depositAmount = 0;
    this.depositReason = '';
    this.managerPin = '';
  }

  closeDepositModal(): void {
    this.showDepositModal = false;
  }

  openWithdrawalModal(): void {
    this.showWithdrawalModal = true;
    this.withdrawalAmount = 0;
    this.withdrawalReason = '';
    this.managerPin = '';
  }

  closeWithdrawalModal(): void {
    this.showWithdrawalModal = false;
  }

  processDeposit(): void {
    if (!this.validateManagerPin()) {
      alert('Invalid manager PIN');
      return;
    }

    const transaction: CashTransaction = {
      id: `txn-${Date.now()}`,
      type: 'safe_deposit',
      amount: -this.depositAmount,
      description: this.depositReason || 'Safe deposit',
      timestamp: new Date(),
      cashierId: this.currentUser?.id || '',
      cashierName: this.currentUser?.name || '',
      approvedBy: 'Manager'
    };

    this.transactions.unshift(transaction);
    this.cashDrawer.currentBalance -= this.depositAmount;
    this.cashDrawer.lastUpdated = new Date();

    this.closeDepositModal();
  }

  processWithdrawal(): void {
    if (!this.validateManagerPin()) {
      alert('Invalid manager PIN');
      return;
    }

    const transaction: CashTransaction = {
      id: `txn-${Date.now()}`,
      type: 'change_fund',
      amount: this.withdrawalAmount,
      description: this.withdrawalReason || 'Cash withdrawal',
      timestamp: new Date(),
      cashierId: this.currentUser?.id || '',
      cashierName: this.currentUser?.name || '',
      approvedBy: 'Manager'
    };

    this.transactions.unshift(transaction);
    this.cashDrawer.currentBalance += this.withdrawalAmount;
    this.cashDrawer.lastUpdated = new Date();

    this.closeWithdrawalModal();
  }

  // Shift Reconciliation
  openReconciliationModal(): void {
    this.showReconciliationModal = true;
    this.actualCashCount = 0;
    this.managerPin = '';
  }

  closeReconciliationModal(): void {
    this.showReconciliationModal = false;
  }

  calculateExpectedBalance(): void {
    this.currentReconciliation.expectedEndingBalance =
      this.currentReconciliation.startingFloat +
      this.currentReconciliation.cashSales +
      this.transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  calculateVariance(): void {
    this.currentReconciliation.variance =
      this.actualCashCount - this.currentReconciliation.expectedEndingBalance;
  }

  processReconciliation(): void {
    if (!this.validateManagerPin()) {
      alert('Invalid manager PIN');
      return;
    }

    this.calculateVariance();

    this.currentReconciliation.actualCount = this.actualCashCount;
    this.currentReconciliation.status = 'approved';
    this.currentReconciliation.reconciledBy = 'Manager';
    this.currentReconciliation.reconciledAt = new Date();

    // Close the drawer
    this.cashDrawer.status = 'reconciled';

    this.closeReconciliationModal();
  }

  // Transaction Details
  showTransactionDetails(transaction: CashTransaction): void {
    this.selectedTransaction = transaction;
    this.showTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.selectedTransaction = null;
  }

  // Utility Methods
  private validateManagerPin(): boolean {
    return this.managerPin === '1234';
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'deposit': return 'fas fa-arrow-down';
      case 'withdrawal': return 'fas fa-arrow-up';
      case 'float_start': return 'fas fa-play-circle';
      case 'float_end': return 'fas fa-stop-circle';
      case 'safe_deposit': return 'fas fa-lock';
      case 'change_fund': return 'fas fa-coins';
      default: return 'fas fa-question-circle';
    }
  }

  getTransactionColor(type: string): string {
    switch (type) {
      case 'deposit': return 'text-red-600';
      case 'withdrawal': return 'text-green-600';
      case 'float_start': return 'text-blue-600';
      case 'float_end': return 'text-purple-600';
      case 'safe_deposit': return 'text-orange-600';
      case 'change_fund': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  }

  getTransactionTypeLabel(type: string): string {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'float_start': return 'Float Start';
      case 'float_end': return 'Float End';
      case 'safe_deposit': return 'Safe Deposit';
      case 'change_fund': return 'Change Fund';
      default: return type;
    }
  }

  getVarianceColor(variance: number): string {
    if (variance === 0) return 'text-green-600';
    if (variance > 0) return 'text-blue-600';
    return 'text-red-600';
  }

  getVarianceLabel(variance: number): string {
    if (variance === 0) return 'Balanced';
    if (variance > 0) return 'Over';
    return 'Short';
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

  getTotalDeposits(): number {
    return this.transactions
      .filter(t => t.type === 'safe_deposit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  getTotalWithdrawals(): number {
    return this.transactions
      .filter(t => t.type === 'change_fund')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getNetTransactions(): number {
    return this.transactions.reduce((sum, t) => sum + t.amount, 0);
  }
}
