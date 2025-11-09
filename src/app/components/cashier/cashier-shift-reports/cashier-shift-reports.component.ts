import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashierShiftReport, HourlySalesData, MockDataService, PaymentMethodSummary, User } from '../../../services/mock-data.service';

@Component({
  selector: 'app-cashier-shift-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-shift-reports.component.html',
  styleUrl: './cashier-shift-reports.component.css'
})
export class CashierShiftReportsComponent implements OnInit {
  currentUser: User | null = null;
  currentShiftReport: CashierShiftReport | null = null;
  previousReports: CashierShiftReport[] = [];
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
    this.loadShiftReportData();
  }

  private loadCurrentUser(): void {
    this.currentUser = this.mockDataService.getUserByRole('cashier') || null;
  }

  private loadShiftReportData(): void {
    // Load current shift report
    this.mockDataService.getCurrentShiftReport().subscribe(report => {
      this.currentShiftReport = report;
    });

    // Load previous reports
    this.mockDataService.getPreviousShiftReports().subscribe(reports => {
      this.previousReports = reports;
    });

    // Load payment method summary
    this.mockDataService.getPaymentMethodSummary().subscribe(summary => {
      this.paymentMethodSummary = summary;
    });

    // Load hourly sales data
    this.mockDataService.getHourlySalesData().subscribe(data => {
      this.hourlySalesData = data;
    });
  }

  generateReport(type: 'X' | 'Z'): void {
    this.reportType = type;
    if (this.currentShiftReport) {
      const updatedReport = {
        ...this.currentShiftReport,
        reportType: type,
        generatedAt: new Date()
      };
      this.mockDataService.updateCurrentShiftReport(updatedReport);
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
      const updatedReport = {
        ...this.currentShiftReport,
        actualCash: this.actualCashCount,
        cashDifference: this.actualCashCount - this.currentShiftReport.expectedCash,
        status: 'reconciled' as const
      };
      this.mockDataService.updateCurrentShiftReport(updatedReport);
      this.closeCashReconciliation();
      alert('Cash reconciliation completed!');
    }
  }

  endShift(): void {
    if (confirm('Are you sure you want to end the current shift? This will generate a final Z-report.')) {
      this.generateReport('Z');
      if (this.currentShiftReport) {
        const closedReport = { ...this.currentShiftReport, status: 'closed' as const };
        this.mockDataService.addPreviousShiftReport(closedReport);
        // Start new shift - create a new current shift report
        const now = new Date();
        const shiftStart = new Date(now.getTime() - 8 * 60 * 60 * 1000);
        const newShiftReport: CashierShiftReport = {
          id: 'SHIFT-' + Date.now(),
          cashierId: this.currentUser?.id || '5',
          cashierName: this.currentUser?.name || 'Amit Kumar',
          shiftStart: shiftStart,
          shiftEnd: now,
          reportType: 'X',
          totalSales: 0,
          cashSales: 0,
          cardSales: 0,
          upiSales: 0,
          walletSales: 0,
          totalTransactions: 0,
          averageTransaction: 0,
          openingCash: closedReport.expectedCash,
          cashReceived: 0,
          cashPaidOut: 0,
          expectedCash: closedReport.expectedCash,
          actualCash: 0,
          cashDifference: 0,
          voidedItems: 0,
          voidedAmount: 0,
          discountsApplied: 0,
          discountAmount: 0,
          refundsProcessed: 0,
          refundAmount: 0,
          status: 'open',
          generatedAt: now
        };
        this.mockDataService.updateCurrentShiftReport(newShiftReport);
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
