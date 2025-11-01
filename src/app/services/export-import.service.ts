import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { NotificationService } from './notification.service';

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  columns?: string[];
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  exportedAt: Date;
  recordCount: number;
  error?: string;
}

export interface ImportConfig {
  format: 'csv' | 'excel' | 'json';
  hasHeaders: boolean;
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateData: boolean;
  batchSize: number;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  failedRecords: number;
  errors: ImportError[];
  importedAt: Date;
}

export interface ImportError {
  row: number;
  field?: string;
  value?: any;
  message: string;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
  required: boolean;
  defaultValue?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ExportImportService {

  constructor(
    private crudService: CrudService,
    private notificationService: NotificationService
  ) { }

  // ===============================
  // EXPORT METHODS
  // ===============================

  /**
   * Export menu items data
   */
  exportMenuItems(config: ExportConfig): Observable<ExportResult> {
    return this.exportData('menu', config, 'menu_items');
  }

  /**
   * Export orders data
   */
  exportOrders(config: ExportConfig): Observable<ExportResult> {
    return this.exportData('orders', config, 'orders');
  }

  /**
   * Export inventory data
   */
  exportInventory(config: ExportConfig): Observable<ExportResult> {
    return this.exportData('inventory', config, 'inventory');
  }

  /**
   * Export customers data
   */
  exportCustomers(config: ExportConfig): Observable<ExportResult> {
    return this.exportData('customers', config, 'customers');
  }

  /**
   * Export sales reports
   */
  exportSalesReport(config: ExportConfig): Observable<ExportResult> {
    return this.exportData('reports/sales', config, 'sales_report');
  }

  /**
   * Export shift reports
   */
  exportShiftReports(config: ExportConfig): Observable<ExportResult> {
    return this.exportData('reports/shifts', config, 'shift_reports');
  }

  /**
   * Export analytics data
   */
  exportAnalytics(config: ExportConfig): Observable<ExportResult> {
    return this.exportData('analytics', config, 'analytics_data');
  }

  /**
   * Generic export method
   */
  private exportData(endpoint: string, config: ExportConfig, filePrefix: string): Observable<ExportResult> {
    const exportPayload = {
      format: config.format,
      includeHeaders: config.includeHeaders,
      dateRange: config.dateRange,
      filters: config.filters,
      columns: config.columns
    };

    return this.crudService.postData(`${endpoint}/export`, exportPayload).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          const result: ExportResult = {
            success: true,
            fileName: response.data.fileName,
            fileUrl: response.data.fileUrl,
            fileSize: response.data.fileSize,
            exportedAt: new Date(response.data.exportedAt),
            recordCount: response.data.recordCount
          };

          this.notificationService.success(
            'Export Completed',
            `${result.recordCount} records exported successfully`
          );

          return result;
        }
        throw new Error(response.message || 'Export failed');
      }),
      catchError(this.handleExportError)
    );
  }

  // ===============================
  // IMPORT METHODS
  // ===============================

  /**
   * Import menu items from file
   */
  importMenuItems(file: File, config: ImportConfig, mappings?: DataMapping[]): Observable<ImportResult> {
    return this.importData(file, 'menu', config, mappings);
  }

  /**
   * Import inventory data from file
   */
  importInventory(file: File, config: ImportConfig, mappings?: DataMapping[]): Observable<ImportResult> {
    return this.importData(file, 'inventory', config, mappings);
  }

  /**
   * Import customers data from file
   */
  importCustomers(file: File, config: ImportConfig, mappings?: DataMapping[]): Observable<ImportResult> {
    return this.importData(file, 'customers', config, mappings);
  }

  /**
   * Generic import method
   */
  private importData(
    file: File,
    endpoint: string,
    config: ImportConfig,
    mappings?: DataMapping[]
  ): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));
    if (mappings) {
      formData.append('mappings', JSON.stringify(mappings));
    }

    return this.crudService.uploadFile(`${endpoint}/import`, file, {
      config: JSON.stringify(config),
      mappings: mappings ? JSON.stringify(mappings) : undefined
    }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          const result: ImportResult = {
            success: true,
            totalRecords: response.data.totalRecords,
            importedRecords: response.data.importedRecords,
            skippedRecords: response.data.skippedRecords,
            failedRecords: response.data.failedRecords,
            errors: response.data.errors || [],
            importedAt: new Date(response.data.importedAt)
          };

          this.showImportResult(result);
          return result;
        }
        throw new Error(response.message || 'Import failed');
      }),
      catchError(this.handleImportError)
    );
  }

  // ===============================
  // BULK EXPORT METHODS
  // ===============================

  /**
   * Export complete restaurant data
   */
  exportRestaurantData(restaurantId: string, config: ExportConfig): Observable<Observable<ExportResult>[]> {
    const exports = [
      this.exportMenuItems({ ...config, filters: { restaurantId } }),
      this.exportInventory({ ...config, filters: { restaurantId } }),
      this.exportOrders({ ...config, filters: { restaurantId } }),
      this.exportCustomers({ ...config, filters: { restaurantId } })
    ];

    // Return array of observables - caller handles with forkJoin
    return of(exports);
  }

  /**
   * Export business reports bundle
   */
  exportBusinessReports(dateRange: { start: Date; end: Date }, format: 'pdf' | 'excel'): Observable<Observable<ExportResult>[]> {
    const config: ExportConfig = {
      format,
      includeHeaders: true,
      dateRange
    };

    const exports = [
      this.exportSalesReport(config),
      this.exportShiftReports(config),
      this.exportAnalytics(config)
    ];

    return of(exports);
  }

  // ===============================
  // TEMPLATE METHODS
  // ===============================

  /**
   * Download import template for menu items
   */
  downloadMenuTemplate(): Observable<Blob> {
    return this.downloadTemplate('menu');
  }

  /**
   * Download import template for inventory
   */
  downloadInventoryTemplate(): Observable<Blob> {
    return this.downloadTemplate('inventory');
  }

  /**
   * Download import template for customers
   */
  downloadCustomerTemplate(): Observable<Blob> {
    return this.downloadTemplate('customers');
  }

  private downloadTemplate(entity: string): Observable<Blob> {
    return this.crudService.getData(`${entity}/template`, {}, undefined).pipe(
      map((response: any) => {
        // Convert response to blob
        return new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      }),
      catchError(this.handleTemplateError)
    );
  }

  // ===============================
  // VALIDATION METHODS
  // ===============================

  /**
   * Validate import file before upload
   */
  validateImportFile(file: File, entity: string): { isValid: boolean; message?: string; preview?: any[] } {
    const maxSize = this.getMaxFileSize(entity);
    const allowedTypes = this.getAllowedTypes(entity);

    if (file.size > maxSize) {
      return {
        isValid: false,
        message: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Get standard data mappings for common entities
   */
  getStandardMappings(entity: string): DataMapping[] {
    const mappings: Record<string, DataMapping[]> = {
      menu: [
        { sourceField: 'Name', targetField: 'name', required: true },
        { sourceField: 'Description', targetField: 'description', required: false },
        { sourceField: 'Price', targetField: 'price', required: true, transform: (v) => parseFloat(v) },
        { sourceField: 'Category', targetField: 'category', required: true },
        { sourceField: 'Is Available', targetField: 'isAvailable', required: false, transform: (v) => v === 'Yes' },
        { sourceField: 'Preparation Time', targetField: 'preparationTime', required: false, transform: (v) => parseInt(v) }
      ],
      inventory: [
        { sourceField: 'Name', targetField: 'name', required: true },
        { sourceField: 'SKU', targetField: 'sku', required: true },
        { sourceField: 'Category', targetField: 'category', required: true },
        { sourceField: 'Current Stock', targetField: 'currentStock', required: true, transform: (v) => parseInt(v) },
        { sourceField: 'Min Stock Level', targetField: 'minStockLevel', required: false, transform: (v) => parseInt(v) },
        { sourceField: 'Unit Cost', targetField: 'unitCost', required: true, transform: (v) => parseFloat(v) }
      ],
      customers: [
        { sourceField: 'Name', targetField: 'name', required: true },
        { sourceField: 'Email', targetField: 'email', required: true },
        { sourceField: 'Phone', targetField: 'phone', required: true },
        { sourceField: 'Address', targetField: 'address', required: false },
        { sourceField: 'Member Since', targetField: 'memberSince', required: false, transform: (v) => new Date(v) }
      ]
    };

    return mappings[entity] || [];
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  private getMaxFileSize(entity: string): number {
    const sizes: Record<string, number> = {
      menu: 5 * 1024 * 1024,      // 5MB
      inventory: 10 * 1024 * 1024, // 10MB
      customers: 15 * 1024 * 1024, // 15MB
      orders: 20 * 1024 * 1024    // 20MB
    };
    return sizes[entity] || 10 * 1024 * 1024;
  }

  private getAllowedTypes(entity: string): string[] {
    return [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private showImportResult(result: ImportResult): void {
    if (result.failedRecords === 0) {
      this.notificationService.success(
        'Import Completed',
        `${result.importedRecords} records imported successfully`
      );
    } else {
      this.notificationService.warning(
        'Import Completed with Errors',
        `${result.importedRecords} imported, ${result.failedRecords} failed`
      );
    }
  }

  // ===============================
  // ERROR HANDLING
  // ===============================

  private handleExportError = (error: any): Observable<never> => {
    console.error('Export error:', error);
    this.notificationService.error('Export Failed', error.message || 'Failed to export data');
    return throwError(() => error);
  };

  private handleImportError = (error: any): Observable<never> => {
    console.error('Import error:', error);
    this.notificationService.error('Import Failed', error.message || 'Failed to import data');
    return throwError(() => error);
  };

  private handleTemplateError = (error: any): Observable<never> => {
    console.error('Template download error:', error);
    this.notificationService.error('Download Failed', 'Failed to download template');
    return throwError(() => error);
  };
}