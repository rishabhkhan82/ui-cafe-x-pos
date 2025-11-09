import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  MockDataService,
  ShiftReport,
  User,
  ShiftReportsConfig,
  SelectOption
} from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-shift-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shift-reports.component.html',
  styleUrls: ['./shift-reports.component.css']
})
export class ShiftReportsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  currentUser: any;
  shiftReports: ShiftReport[] = [];
  filteredReports: ShiftReport[] = [];
  selectedPeriod = 'week';
  selectedShift = '';
  startDate: string = '';
  endDate: string = '';
  currentDate = new Date();

  // Configuration data from service
  shiftReportsConfig: ShiftReportsConfig | null = null;
  periodFilterOptions: SelectOption[] = [];
  shiftFilterOptions: SelectOption[] = [];
  defaultHoursPerShift = 24;

  // Summary stats
  summaryStats = {
    totalReports: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrdersPerShift: 0,
    totalHours: 0,
    avgRevenuePerShift: 0
  };

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadConfigurationData();
    this.initializeDateRange();
    this.loadShiftReports();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadConfigurationData(): void {
    // Load shift reports configuration
    this.subscriptions.add(
      this.mockDataService.getShiftReportsConfig().subscribe(config => {
        this.shiftReportsConfig = config;
        if (config) {
          this.periodFilterOptions = config.periodFilterOptions;
          this.shiftFilterOptions = config.shiftFilterOptions;
          this.defaultHoursPerShift = config.defaultHoursPerShift;
        }
      })
    );
  }

  initializeDateRange(): void {
    const dateRange = this.mockDataService.getDateRangeForPeriod(this.selectedPeriod);
    this.startDate = dateRange.startDate.toISOString().split('T')[0];
    this.endDate = dateRange.endDate.toISOString().split('T')[0];
  }

  loadShiftReports(): void {
    this.mockDataService.getShiftReports().subscribe(reports => {
      this.shiftReports = reports;
      this.filterReports();
      this.calculateSummaryStats();
    });
  }

  filterReports(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    this.filteredReports = this.shiftReports.filter(report => {
      const reportDate = new Date(report.date);
      const dateMatch = reportDate >= start && reportDate <= end;
      const shiftMatch = !this.selectedShift || report.shift === this.selectedShift;

      return dateMatch && shiftMatch;
    });

    this.calculateSummaryStats();
  }

  calculateSummaryStats(): void {
    this.summaryStats = {
      totalReports: this.filteredReports.length,
      totalRevenue: this.filteredReports.reduce((sum, report) => sum + report.revenue, 0),
      totalOrders: this.filteredReports.reduce((sum, report) => sum + report.ordersProcessed, 0),
      totalHours: this.filteredReports.reduce((sum, report) => sum + this.defaultHoursPerShift, 0),
      avgOrdersPerShift: 0,
      avgRevenuePerShift: 0
    };

    if (this.summaryStats.totalReports > 0) {
      this.summaryStats.avgOrdersPerShift = Math.round(this.summaryStats.totalOrders / this.summaryStats.totalReports);
      this.summaryStats.avgRevenuePerShift = Math.round(this.summaryStats.totalRevenue / this.summaryStats.totalReports);
    }
  }

  onPeriodChange(): void {
    this.initializeDateRange();
    this.filterReports();
  }

  onDateRangeChange(): void {
    this.selectedPeriod = 'custom';
    this.filterReports();
  }

  exportReport(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `shift-reports-${this.startDate}-to-${this.endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  generateCSV(): string {
    const headers = ['Date', 'Shift', 'Staff Count', 'Hours Worked', 'Orders Processed', 'Revenue', 'Complaints', 'Manager Approval'];
    const rows = this.filteredReports.map(report => [
      report.date.toLocaleDateString(),
      report.shift,
      report.staffCount.toString(),
      this.defaultHoursPerShift.toString(),
      report.ordersProcessed.toString(),
      report.revenue.toString(),
      report.customerComplaints.toString(),
      report.managerApproval ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  printReport(): void {
    const printContent = this.generatePrintContent();
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  generatePrintContent(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shift Reports - ${this.startDate} to ${this.endDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; background-color: #e8f4f8; }
          </style>
        </head>
        <body>
          <h1>Shift Reports Summary</h1>
          <div class="summary">
            <h3>Period: ${this.startDate} to ${this.endDate}</h3>
            <p>Total Reports: ${this.summaryStats.totalReports}</p>
            <p>Total Revenue: ₹${this.summaryStats.totalRevenue.toLocaleString()}</p>
            <p>Total Orders: ${this.summaryStats.totalOrders}</p>
            <p>Average Orders per Shift: ${this.summaryStats.avgOrdersPerShift}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Staff Count</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Complaints</th>
                <th>Approval</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredReports.map(report => `
                <tr>
                  <td>${report.date.toLocaleDateString()}</td>
                  <td>${report.shift}</td>
                  <td>${report.staffCount}</td>
                  <td>${report.ordersProcessed}</td>
                  <td>₹${report.revenue.toLocaleString()}</td>
                  <td>${report.customerComplaints}</td>
                  <td>${report.managerApproval ? 'Approved' : 'Pending'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>Totals</strong></td>
                <td><strong>${this.summaryStats.totalOrders}</strong></td>
                <td><strong>₹${this.summaryStats.totalRevenue.toLocaleString()}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  getShiftBadgeClass(shift: string): string {
    return this.mockDataService.getShiftBadgeClass(shift);
  }

  getApprovalBadgeClass(approved: boolean | undefined): string {
    return this.mockDataService.getApprovalBadgeClass(approved || false);
  }

  getTopPerformingShifts(): ShiftReport[] {
    return this.filteredReports
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  getPerformanceScore(report: ShiftReport): number {
    return this.mockDataService.calculatePerformanceScore(
      report.revenue,
      report.ordersProcessed,
      report.customerComplaints
    );
  }

  getReportsWithIssues(): ShiftReport[] {
    return this.filteredReports.filter(report =>
      report.customerComplaints > 0 || report.incidents.length > 0
    );
  }

  toggleTheme(): void {
    // Theme toggle logic would go here
  }

  // Enhanced POS-level methods
  generatePDF(): void {
    alert('PDF generation feature - would create detailed PDF report with charts and analytics');
  }

  emailReport(): void {
    alert('Email report feature - would send shift reports to specified email addresses');
  }

  scheduleReport(): void {
    alert('Schedule report feature - would allow automated report generation and delivery');
  }

  viewDetailedReport(): void {
    alert('Detailed report view - would show comprehensive analytics with charts and trends');
  }

  viewReportDetails(report: any): void {
    alert(`Viewing details for ${report.date} ${report.shift} shift report`);
  }

  editReport(report: any): void {
    alert(`Editing report for ${report.date} ${report.shift} shift`);
  }

  approveReport(report: any): void {
    report.managerApproval = true;
    alert(`Report approved for ${report.date} ${report.shift} shift`);
    this.calculateSummaryStats();
  }

  getPeakShiftType(): string {
    const shiftTypes = this.mockDataService.getShiftTypes();
    const shiftPerformance: { [key: string]: number } = {};

    // Initialize performance for all shift types
    shiftTypes.forEach(shift => {
      shiftPerformance[shift] = 0;
    });

    this.filteredReports.forEach(report => {
      const score = this.getPerformanceScore(report);
      if (shiftPerformance[report.shift] !== undefined) {
        shiftPerformance[report.shift] += score;
      }
    });

    const bestShift = Object.entries(shiftPerformance).reduce((a, b) =>
      shiftPerformance[a[0]] > shiftPerformance[b[0]] ? a : b
    )[0];

    return bestShift.charAt(0).toUpperCase() + bestShift.slice(1);
  }

  getAvgOrdersPerStaff(): number {
    if (this.filteredReports.length === 0) return 0;

    const totalOrders = this.filteredReports.reduce((sum, report) => sum + report.ordersProcessed, 0);
    const totalStaff = this.filteredReports.reduce((sum, report) => sum + report.staffCount, 0);

    return totalStaff > 0 ? Math.round((totalOrders / totalStaff) * 10) / 10 : 0;
  }

  getRevenueGrowth(): number {
    return this.mockDataService.calculateRevenueGrowth();
  }
}
