import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, User, CashDrawer, CashTransaction, ShiftReconciliation } from '../../../services/mock-data.service';

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
  cashDrawer: CashDrawer | null = null;

  // Transactions
  transactions: CashTransaction[] = [];

  // Shift Reconciliation
  currentReconciliation: ShiftReconciliation | null = null;

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

    // Subscribe to cash drawer data
    this.mockDataService.getCashDrawers().subscribe(drawers => {
      this.cashDrawer = drawers.find(drawer => drawer.cashierId === this.currentUser?.id) || null;
    });

    // Subscribe to cash transactions
    this.mockDataService.getCashTransactions().subscribe(transactions => {
      this.transactions = transactions.filter(txn => txn.cashierId === this.currentUser?.id);
    });

    // Subscribe to shift reconciliations
    this.mockDataService.getShiftReconciliations().subscribe(reconciliations => {
      this.currentReconciliation = reconciliations.find(recon => recon.cashierId === this.currentUser?.id) || null;
      if (this.currentReconciliation) {
        this.calculateExpectedBalance();
      }
    });
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

    if (!this.cashDrawer) {
      alert('Cash drawer not found');
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

    this.mockDataService.addCashTransaction(transaction);
    this.mockDataService.updateCashDrawer(this.cashDrawer.id, {
      currentBalance: this.cashDrawer.currentBalance - this.depositAmount,
      lastUpdated: new Date()
    });

    this.closeDepositModal();
  }

  processWithdrawal(): void {
    if (!this.validateManagerPin()) {
      alert('Invalid manager PIN');
      return;
    }

    if (!this.cashDrawer) {
      alert('Cash drawer not found');
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

    this.mockDataService.addCashTransaction(transaction);
    this.mockDataService.updateCashDrawer(this.cashDrawer.id, {
      currentBalance: this.cashDrawer.currentBalance + this.withdrawalAmount,
      lastUpdated: new Date()
    });

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
    if (!this.currentReconciliation) return;

    this.currentReconciliation.expectedEndingBalance =
      this.currentReconciliation.startingFloat +
      this.currentReconciliation.cashSales +
      this.transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  calculateVariance(): void {
    if (!this.currentReconciliation) return;

    this.currentReconciliation.variance =
      this.actualCashCount - this.currentReconciliation.expectedEndingBalance;
  }

  processReconciliation(): void {
    if (!this.validateManagerPin()) {
      alert('Invalid manager PIN');
      return;
    }

    if (!this.currentReconciliation || !this.cashDrawer) {
      alert('Reconciliation or cash drawer data not found');
      return;
    }

    this.calculateVariance();

    this.mockDataService.updateShiftReconciliation(this.currentReconciliation.id, {
      actualCount: this.actualCashCount,
      status: 'approved',
      reconciledBy: 'Manager',
      reconciledAt: new Date()
    });

    this.mockDataService.updateCashDrawer(this.cashDrawer.id, {
      status: 'reconciled'
    });

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
