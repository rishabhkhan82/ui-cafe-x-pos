import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, User } from '../../../services/mock-data.service';

interface ShiftReport {
  id: string;
  cashierId: string;
  cashierName: string;
  shiftStart: Date;
  shiftEnd: Date;
  reportType: 'X' | 'Z';
  totalSales: number;
  cashSales: number;
  cardSales: number;
  upiSales: number;
  walletSales: number;
  totalTransactions: number;
  averageTransaction: number;
  openingCash: number;
  cashReceived: number;
  cashPaidOut: number;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  voidedItems: number;
  voidedAmount: number;
  discountsApplied: number;
  discountAmount: number;
  refundsProcessed: number;
  refundAmount: number;
  status: 'open' | 'closed' | 'reconciled';
  generatedAt: Date;
}

interface PaymentMethodSummary {
  method: string;
  amount: number;
  percentage: number;
  transactions: number;
  color: string;
}

interface HourlySalesData {
  hour: string;
  sales: number;
  transactions: number;
}

@Component({
  selector: 'app-cashier-shift-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-shift-reports.component.html',
  styleUrl: './cashier-shift-reports.component.css'
})
export class CashierShiftReportsComponent implements OnInit {
  currentUser: User | null = null;
  currentShiftReport: ShiftReport | null = null;
  previousReports: ShiftReport[] = [];
  paymentMethodSummary: PaymentMethodSummary[] = [];
  hourlySalesData: HourlySalesData[] = [];
  showCashReconciliation = false;
  actualCashCount = 0;

  // Report generation
  reportType: 'X' | 'Z' = 'X';
  showReportModal = false;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadCurrentShiftReport();
    this.loadPreviousReports();
    this.generatePaymentSummary();
    this.generateHourlySalesData();
  }

  private loadCurrentUser(): void {
    this.currentUser = this.mockDataService.getUserByRole('cashier') || null;
  }

  private loadCurrentShiftReport(): void {
    // Simulate current shift data
    const now = new Date();
    const shiftStart = new Date(now.getTime() - 8 * 60 * 60 * 1000); // 8 hours ago

    this.currentShiftReport = {
      id: 'SHIFT-' + Date.now(),
      cashierId: this.currentUser?.id || 'cashier-1',
      cashierName: this.currentUser?.name || 'John Doe',
      shiftStart: shiftStart,
      shiftEnd: now,
      reportType: 'X',
      totalSales: 45280,
      cashSales: 15848,
      cardSales: 20416,
      upiSales: 6792,
      walletSales: 2264,
      totalTransactions: 127,
      averageTransaction: 356,
      openingCash: 5000,
      cashReceived: 15848,
      cashPaidOut: 1200,
      expectedCash: 19648,
      actualCash: 0,
      cashDifference: 0,
      voidedItems: 3,
      voidedAmount: 480,
      discountsApplied: 5,
      discountAmount: 1200,
      refundsProcessed: 1,
      refundAmount: 250,
      status: 'open',
      generatedAt: now
    };
  }

  private loadPreviousReports(): void {
    // Simulate previous shift reports
    const now = new Date();
    this.previousReports = [
      {
        id: 'SHIFT-20241201-001',
        cashierId: 'cashier-1',
        cashierName: 'John Doe',
        shiftStart: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        shiftEnd: new Date(now.getTime() - 16 * 60 * 60 * 1000),
        reportType: 'Z',
        totalSales: 38750,
        cashSales: 13512,
        cardSales: 17538,
        upiSales: 5812,
        walletSales: 1888,
        totalTransactions: 98,
        averageTransaction: 395,
        openingCash: 5000,
        cashReceived: 13512,
        cashPaidOut: 800,
        expectedCash: 17712,
        actualCash: 17712,
        cashDifference: 0,
        voidedItems: 2,
        voidedAmount: 320,
        discountsApplied: 4,
        discountAmount: 950,
        refundsProcessed: 0,
        refundAmount: 0,
        status: 'closed',
        generatedAt: new Date(now.getTime() - 16 * 60 * 60 * 1000)
      },
      {
        id: 'SHIFT-20241130-002',
        cashierId: 'cashier-1',
        cashierName: 'John Doe',
        shiftStart: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        shiftEnd: new Date(now.getTime() - 40 * 60 * 60 * 1000),
        reportType: 'Z',
        totalSales: 42100,
        cashSales: 14735,
        cardSales: 19040,
        upiSales: 6310,
        walletSales: 2015,
        totalTransactions: 112,
        averageTransaction: 376,
        openingCash: 5000,
        cashReceived: 14735,
        cashPaidOut: 950,
        expectedCash: 18785,
        actualCash: 18785,
        cashDifference: 0,
        voidedItems: 1,
        voidedAmount: 180,
        discountsApplied: 6,
        discountAmount: 1350,
        refundsProcessed: 1,
        refundAmount: 320,
        status: 'closed',
        generatedAt: new Date(now.getTime() - 40 * 60 * 60 * 1000)
      }
    ];
  }

  private generatePaymentSummary(): void {
    if (!this.currentShiftReport) return;

    this.paymentMethodSummary = [
      {
        method: 'Card',
        amount: this.currentShiftReport.cardSales,
        percentage: (this.currentShiftReport.cardSales / this.currentShiftReport.totalSales) * 100,
        transactions: Math.round(this.currentShiftReport.totalTransactions * 0.45),
        color: 'bg-blue-500'
      },
      {
        method: 'Cash',
        amount: this.currentShiftReport.cashSales,
        percentage: (this.currentShiftReport.cashSales / this.currentShiftReport.totalSales) * 100,
        transactions: Math.round(this.currentShiftReport.totalTransactions * 0.35),
        color: 'bg-yellow-500'
      },
      {
        method: 'UPI',
        amount: this.currentShiftReport.upiSales,
        percentage: (this.currentShiftReport.upiSales / this.currentShiftReport.totalSales) * 100,
        transactions: Math.round(this.currentShiftReport.totalTransactions * 0.15),
        color: 'bg-purple-500'
      },
      {
        method: 'Wallet',
        amount: this.currentShiftReport.walletSales,
        percentage: (this.currentShiftReport.walletSales / this.currentShiftReport.totalSales) * 100,
        transactions: Math.round(this.currentShiftReport.totalTransactions * 0.05),
        color: 'bg-green-500'
      }
    ];
  }

  private generateHourlySalesData(): void {
    // Simulate hourly sales data for the current shift
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    this.hourlySalesData = hours.map(hour => ({
      hour,
      sales: Math.floor(Math.random() * 5000) + 2000,
      transactions: Math.floor(Math.random() * 15) + 5
    }));
  }

  generateReport(type: 'X' | 'Z'): void {
    this.reportType = type;
    if (this.currentShiftReport) {
      this.currentShiftReport.reportType = type;
      this.currentShiftReport.generatedAt = new Date();
      this.showReportModal = true;
    }
  }

  closeReportModal(): void {
    this.showReportModal = false;
  }

  printReport(): void {
    window.print();
  }

  exportReport(): void {
    // Simulate export functionality
    alert('Report exported successfully!');
  }

  openCashReconciliation(): void {
    this.showCashReconciliation = true;
    this.actualCashCount = 0;
  }

  closeCashReconciliation(): void {
    this.showCashReconciliation = false;
  }

  reconcileCash(): void {
    if (this.currentShiftReport) {
      this.currentShiftReport.actualCash = this.actualCashCount;
      this.currentShiftReport.cashDifference = this.actualCashCount - this.currentShiftReport.expectedCash;
      this.currentShiftReport.status = 'reconciled';
      this.closeCashReconciliation();
      alert('Cash reconciliation completed!');
    }
  }

  endShift(): void {
    if (confirm('Are you sure you want to end the current shift? This will generate a final Z-report.')) {
      this.generateReport('Z');
      if (this.currentShiftReport) {
        this.currentShiftReport.status = 'closed';
        this.previousReports.unshift({ ...this.currentShiftReport });
        this.loadCurrentShiftReport(); // Start new shift
      }
    }
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

  getShiftDuration(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  getCashDifferenceColor(difference: number): string {
    if (difference === 0) return 'text-green-600';
    return difference > 0 ? 'text-blue-600' : 'text-red-600';
  }

  getReportStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'reconciled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }
}
