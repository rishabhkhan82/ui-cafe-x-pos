import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { AuthService } from '../../../services/auth.service';
import { CrudService } from '../../../services/crud.service';
import { Subject, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-stock-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-stock-log.component.html',
  styleUrl: './inventory-stock-log.component.css'
})
export class InventoryStockLogComponent implements OnInit, OnDestroy {
  stockLogs: any[] = [];
  filterType: string = 'ALL';
  isLoading = false;
  searchTerm = '';
  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  currentPage = 1;
  totalPages = 1;
  totalElements = 0;
  itemsPerPage = 10;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  summary: any = {
    totalLogs: 0,
    sales: 0,
    production: 0,
    waste: 0,
    adjustments: 0,
    purchases: 0
  };

  constructor(
    public router: Router,
    public loadingService: LoadingService,
    private authService: AuthService,
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadStockLogs();
    this.setupSearch();
  }

  loadStockLogs(): void {
    this.isLoading = true;
    this.loadingService.show();
    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      restaurant_id: currentUser?.restaurantId,
      page: this.currentPage,
      size: this.itemsPerPage
    };
    if (this.filterType !== 'ALL') {
      params.type = this.filterType;
    }
    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    this.crudService.getStockLogs(params).subscribe({
      next: (response: any) => {
        this.stockLogs = response.data || [];
        this.currentPage = response.currentPage || this.currentPage;
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Failed to load stock logs', error);
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  loadSummary(): void {
    const currentUser = this.authService.getCurrentUser();
    this.crudService.getStockLogSummary({
      restaurant_id: currentUser?.restaurantId
    }).subscribe({
      next: (response: any) => {
        this.summary = response;
      },
      error: (error) => {
        console.error('Failed to load summary', error);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadStockLogs();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadStockLogs();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    if (this.totalElements === 0) return '0-0';
    return `${start}-${end}`;
  }

  onFilterChange(type: string): void {
    this.filterType = type;
    this.currentPage = 1;
    this.loadStockLogs();
  }

  private setupSearch(): void {
    const sub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.crudService.getStockLogs(this.buildSearchParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.stockLogs = response.data || [];
        this.currentPage = response.currentPage || this.currentPage;
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Failed to search stock logs', error);
        this.loadingService.hide();
      }
    });
    this.subscriptions.push(sub);
  }

  private buildSearchParams(): any {
    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      restaurant_id: currentUser?.restaurantId,
      page: this.currentPage,
      size: this.itemsPerPage
    };
    if (this.filterType !== 'ALL') {
      params.type = this.filterType;
    }
    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    return params;
  }

  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchInput = '';
      this.searchSubject.next('');
    }
  }

  onSearchInputChange(value: string): void {
    this.searchSubject.next(value);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getCountByType(type: string): number {
    return this.stockLogs.filter((log: any) => log.type === type).length;
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'PURCHASE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'SALE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'WASTAGE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'PRODUCTION': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'ADJUSTMENT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  getTypeIconBg(type: string): string {
    switch (type) {
      case 'PURCHASE': return 'bg-green-500';
      case 'SALE': return 'bg-blue-500';
      case 'WASTAGE': return 'bg-red-500';
      case 'PRODUCTION': return 'bg-purple-500';
      case 'ADJUSTMENT': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'PURCHASE': return 'fas fa-shopping-cart';
      case 'SALE': return 'fas fa-receipt';
      case 'WASTAGE': return 'fas fa-trash-alt';
      case 'PRODUCTION': return 'fas fa-blender';
      case 'ADJUSTMENT': return 'fas fa-edit';
      default: return 'fas fa-circle';
    }
  }
}
