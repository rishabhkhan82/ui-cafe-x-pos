import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { ReportType } from '../../../interfaces';

@Component({
  selector: 'app-owner-reports-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-reports-mobile.component.html',
  styleUrl: './owner-reports-mobile.component.css'
})
export class OwnerReportsMobileComponent implements OnInit {
  reportType: string = 'SALES_SUMMARY';
  fromDate: string = '';
  toDate: string = '';
  reportMeta: any = null;
  statistics: any = null;
  data: any[] = [];
  isLoading: boolean = false;
  hasReport: boolean = false;

  reportTypes: ReportType[] = [];

  dateRequiredReportTypes: string[] = [
    'SALES_SUMMARY',
    'TOP_SELLING_ITEMS',
    'CATEGORY_WISE_SALE',
    'TAX_DISCOUNTS'
  ];

  datePresets: { label: string; value: string }[] = [
    { label: 'Today', value: 'TODAY' },
    { label: 'This Week', value: 'THIS_WEEK' },
    { label: 'This Month', value: 'THIS_MONTH' },
    { label: 'This Year', value: 'THIS_YEAR' },
    { label: 'Yesterday', value: 'YESTERDAY' },
    { label: '3 Months', value: 'LAST_3_MONTHS' },
    { label: '6 Months', value: 'LAST_6_MONTHS' },
    { label: 'Last Year', value: 'LAST_YEAR' }
  ];

  selectedPreset: string = 'TODAY';

  displayTitle: string = 'Sales Summary';
  reportPeriod: string = '';
  generatedAt: string = '';
  statisticsList: { key: string; label: string; value: string }[] = [];
  dataColumns: string[] = [];
  dataColumnLabels: string[] = [];
  formattedData: any[] = [];

  constructor(
    public router: Router,
    private crudService: CrudService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReportTypes();
    this.applyDatePreset('TODAY');
    this.generateReport();
  }

  loadReportTypes(): void {
    this.crudService.getReportTypes({ isActive: true }).subscribe({
      next: (response: any) => {
        const types = response.data || response || [];
        this.reportTypes = types.map((type: any) => ({
          id: type.id,
          name: type.name,
          key: type.key,
          description: type.description,
          is_active: type.is_active ?? type.isActive ?? true,
          display_order: type.display_order ?? type.displayOrder ?? 0,
          created_by: type.created_by ?? type.createdBy ?? '',
          updated_by: type.updated_by ?? type.updatedBy ?? '',
          created_at: type.created_at ? new Date(type.created_at) : new Date(),
          updated_at: type.updated_at ? new Date(type.updated_at) : new Date()
        }));
      },
      error: (error) => {
        console.error('Error loading report types:', error);
      }
    });
  }

  isDateRequired(): boolean {
    return this.dateRequiredReportTypes.includes(this.reportType);
  }

  applyDatePreset(preset: string) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    switch (preset) {
      case 'TODAY':
        this.fromDate = this.toDate = today.toISOString().split('T')[0];
        break;
      case 'YESTERDAY': {
        const yesterday = new Date(year, month, date - 1);
        this.fromDate = this.toDate = yesterday.toISOString().split('T')[0];
        break;
      }
      case 'THIS_WEEK': {
        const startOfWeek = new Date(year, month, date - ((date + 6) % 7));
        this.fromDate = startOfWeek.toISOString().split('T')[0];
        this.toDate = today.toISOString().split('T')[0];
        break;
      }
      case 'THIS_MONTH':
        this.fromDate = new Date(year, month, 1).toISOString().split('T')[0];
        this.toDate = today.toISOString().split('T')[0];
        break;
      case 'THIS_YEAR':
        this.fromDate = new Date(year, 0, 1).toISOString().split('T')[0];
        this.toDate = today.toISOString().split('T')[0];
        break;
      case 'LAST_3_MONTHS': {
        const last3 = new Date(year, month - 3, date);
        this.fromDate = last3.toISOString().split('T')[0];
        this.toDate = new Date(year, month, date - 1).toISOString().split('T')[0];
        break;
      }
      case 'LAST_6_MONTHS': {
        const last6 = new Date(year, month - 6, date);
        this.fromDate = last6.toISOString().split('T')[0];
        this.toDate = new Date(year, month, date - 1).toISOString().split('T')[0];
        break;
      }
      case 'LAST_YEAR': {
        const lastYear = new Date(year - 1, 0, 1);
        this.fromDate = lastYear.toISOString().split('T')[0];
        this.toDate = new Date(year - 1, 11, 31).toISOString().split('T')[0];
        break;
      }
    }
    this.selectedPreset = preset;
  }

  private refreshComputedReportFields() {
    this.displayTitle = this.getReportTitle();
    this.reportPeriod = this.reportMeta?.period || '';
    this.generatedAt = this.reportMeta?.generated_at || '';

    const keys = this.statistics ? Object.keys(this.statistics) : [];
    this.statisticsList = keys.map(k => ({
      key: k,
      label: this.formatKey(k),
      value: this.formatValue(k, this.statistics[k])
    }));

    this.dataColumns = this.data && this.data.length > 0 ? Object.keys(this.data[0]) : [];
    this.dataColumnLabels = this.dataColumns.map(col => this.formatKey(col));
    this.formattedData = this.data.map(row => {
      const formatted: any = {};
      this.dataColumns.forEach(col => {
        formatted[col] = this.formatValue(col, row[col]);
      });
      return formatted;
    });
  }

  generateReport() {
    if (this.isDateRequired() && (!this.fromDate || !this.toDate)) {
      this.notificationService.error('Validation Error', 'Please select both from and to dates');
      return;
    }

    this.isLoading = true;
    this.loadingService.show();

    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId || currentUser?.restaurant_id;

    if (!restaurantId) {
      this.notificationService.error('Error', 'Restaurant information not found');
      this.loadingService.hide();
      this.isLoading = false;
      return;
    }

    this.crudService.getRestaurantReport(this.reportType, this.fromDate || '', this.toDate || '', restaurantId).subscribe({
      next: (response: any) => {
        this.reportMeta = response.report_meta || response.reportMeta;
        this.statistics = response.statistics;
        this.data = response.data || [];
        this.refreshComputedReportFields();
        this.hasReport = true;
        this.loadingService.hide();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching report:', error);
        const apiMessage = error.error?.message || 'Failed to load report data';
        this.notificationService.error('Error', apiMessage);
        this.loadingService.hide();
        this.isLoading = false;
        this.hasReport = false;
      }
    });
  }

  clearReport() {
    this.reportMeta = null;
    this.statistics = null;
    this.data = [];
    this.refreshComputedReportFields();
    this.hasReport = false;
    this.notificationService.success('Report Cleared', 'Report data has been cleared');
  }

  downloadReport() {
    if (!this.hasReport) {
      this.notificationService.warning('No Report', 'Please generate a report before downloading');
      return;
    }

    this.isLoading = true;
    this.loadingService.show();

    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId || currentUser?.restaurant_id;

    if (!restaurantId) {
      this.notificationService.error('Error', 'Restaurant information not found');
      this.loadingService.hide();
      this.isLoading = false;
      return;
    }

    const start = this.isDateRequired() ? this.fromDate : '';
    const end = this.isDateRequired() ? this.toDate : '';

    this.crudService.getRestaurantReportPdf(this.reportType, start, end, restaurantId).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = this.getReportTitle().replace(/\s+/g, '_').toLowerCase() + '_' + Date.now() + '.pdf';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.loadingService.hide();
        this.isLoading = false;
        this.notificationService.success('Download Complete', 'Report PDF downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        const apiMessage = error.error?.message || 'Failed to download report';
        this.notificationService.error('Error', apiMessage);
        this.loadingService.hide();
        this.isLoading = false;
      }
    });
  }

  refreshReport() {
    if (this.hasReport) {
      this.generateReport();
    }
  }

  getReportTitle(): string {
    const found = this.reportTypes.find(r => r.key === this.reportType);
    return found ? found.name : 'Report';
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatValue(key: string, value: any): string {
    if (value === null || value === undefined) return '-';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (!isNaN(num)) {
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('value') || key.toLowerCase().includes('tax') || key.toLowerCase().includes('discount')) {
        return '\u20B9' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return num.toLocaleString('en-IN');
    }
    return value.toString();
  }

  getDataColumns(): string[] {
    if (!this.data || this.data.length === 0) return [];
    return Object.keys(this.data[0]);
  }
}
