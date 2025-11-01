import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService, ShiftReport, User } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-shift-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shift-reports.component.html',
  styleUrls: ['./shift-reports.component.css']
})
export class ShiftReportsComponent implements OnInit {
  currentUser: any;
  shiftReports: ShiftReport[] = [];
  filteredReports: ShiftReport[] = [];
  selectedPeriod = 'week';
  selectedShift = '';
  startDate: string = '';
  endDate: string = '';
  currentDate = new Date();

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

    this.initializeDateRange();
    this.loadShiftReports();
  }

  initializeDateRange(): void {
    const endDate = new Date();
    const startDate = new Date();

    switch (this.selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    this.startDate = startDate.toISOString().split('T')[0];
    this.endDate = endDate.toISOString().split('T')[0];
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
      totalHours: this.filteredReports.reduce((sum, report) => sum + 24, 0), // Assuming 24 hours per shift
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
      '24', // Assuming 24 hours per shift
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
    switch (shift) {
      case 'morning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'afternoon': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'evening': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'night': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getApprovalBadgeClass(approved: boolean | undefined): string {
    return approved
      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
  }

  getTopPerformingShifts(): ShiftReport[] {
    return this.filteredReports
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  getPerformanceScore(report: ShiftReport): number {
    // Simple performance score based on revenue and orders vs complaints
    const baseScore = (report.revenue / 1000) + (report.ordersProcessed * 2);
    const penalty = report.customerComplaints * 5;
    return Math.max(0, Math.min(100, Math.round(baseScore - penalty)));
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
    // Analyze which shift type performs best
    const shiftPerformance = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };

    this.filteredReports.forEach(report => {
      const score = this.getPerformanceScore(report);
      shiftPerformance[report.shift as keyof typeof shiftPerformance] += score;
    });

    const bestShift = Object.entries(shiftPerformance).reduce((a, b) =>
      shiftPerformance[a[0] as keyof typeof shiftPerformance] > shiftPerformance[b[0] as keyof typeof shiftPerformance] ? a : b
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
    // Mock growth calculation - in real app would compare with previous period
    return Math.floor(Math.random() * 20) + 5; // Random growth between 5-25%
  }
}
