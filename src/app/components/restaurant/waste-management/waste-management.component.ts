import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { CrudService } from '../../../services/crud.service';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-waste-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waste-management.component.html',
  styleUrl: './waste-management.component.css'
})
export class WasteManagementComponent implements OnInit {
  inventoryItems: any[] = [];
  recipes: any[] = [];
  wasteRows: any[] = [];
  wasteEntries: any[] = [];
  isSubmitting = false;
  errorMessage = '';
  showAddForm = false;
  selectedWasteEntry: any = null;
  editingWasteEntry: any = null;

  searchTerm = '';
  searchInput = '';
  searchSubject = new Subject<string>();
  showSearchBar = false;
  typeFilter = 'all';
  reasonFilter = 'all';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  fieldErrors: { [key: string]: string } = {};

  wasteTypeOptions = [
    { value: 'INGREDIENT', label: 'Ingredient' },
    { value: 'DISH', label: 'Dish' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    public router: Router,
    public loadingService: LoadingService,
    private confirmationService: ConfirmationDialogService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.loadInventoryItems();
    this.loadRecipes();
    this.loadWasteEntries();
    this.setupSearch();
    this.addRow();
  }

  loadInventoryItems(): void {
    const currentUser = this.authService.getCurrentUser();
    this.crudService.getInventoryItems({
      page: 1,
      size: 100,
      restaurant_id: currentUser?.restaurantId,
      isActive: 'true'
    }).subscribe({
      next: (response: any) => {
        this.inventoryItems = response.data || [];
      },
      error: (error) => {
        console.error('Failed to load inventory items', error);
      }
    });
  }

  loadRecipes(): void {
    const currentUser = this.authService.getCurrentUser();
    this.crudService.getRecipes({
      page: 1,
      size: 100,
      restaurant_id: currentUser?.restaurantId,
      isActive: 'true'
    }).subscribe({
      next: (response: any) => {
        this.recipes = response.data || [];
      },
      error: (error) => {
        console.error('Failed to load recipes', error);
      }
    });
  }

  loadWasteEntries(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurant_id: currentUser?.restaurantId
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    if (this.typeFilter && this.typeFilter !== 'all') {
      params.waste_type = this.typeFilter;
    }
    if (this.reasonFilter && this.reasonFilter !== 'all') {
      params.reason = this.reasonFilter;
    }

    this.crudService.getWasteManagement(params).subscribe({
      next: (response: any) => {
        this.wasteEntries = response.data || [];
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading waste entries:', error);
        const apiMessage = error.error?.message || 'Failed to load waste entries. Please try again.';
        this.errorMessage = apiMessage;
        this.loadingService.hide();
      }
    });
  }

  async deleteWasteEntry(entry: any): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete this waste entry? This action cannot be undone.`,
      'Delete Waste Entry',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteWasteManagement(entry.id).subscribe({
        next: () => {
          this.notificationService.success('Waste Entry Deleted', 'The waste entry has been successfully deleted.');
          if (this.selectedWasteEntry?.id === entry.id) {
            this.selectedWasteEntry = null;
          }
          this.loadWasteEntries();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting waste entry:', error);
          const apiMessage = error.error?.message || 'Failed to delete waste entry. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
          this.notificationService.error('Delete Failed', apiMessage);
        }
      });
    }
  }

  showForm(entry?: any): void {
    this.showAddForm = true;
    this.editingWasteEntry = entry || null;
    this.errorMessage = '';
    this.fieldErrors = {};

    if (entry) {
      this.wasteRows = [{
        wasteType: entry.waste_type || 'INGREDIENT',
        inventoryItemId: entry.inventory_item_id || null,
        recipeId: entry.recipe_id || null,
        itemName: entry.item_name || '',
        quantity: entry.quantity,
        reason: entry.reason || 'SPOILED',
        note: entry.note || '',
        wasteCost: entry.waste_cost || null
      }];
    } else {
      this.wasteRows = [];
      this.addRow();
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.editingWasteEntry = null;
    this.wasteRows = [];
    this.addRow();
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.getWasteEntriesObservable(this.buildWasteParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.wasteEntries = response.data || [];
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching waste entries:', error);
        this.loadingService.hide();
      }
    });
  }

  private getWasteEntriesObservable(params: any): Observable<any> {
    return this.crudService.getWasteManagement(params);
  }

  private buildWasteParams(): any {
    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurant_id: currentUser?.restaurantId
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    if (this.typeFilter && this.typeFilter !== 'all') {
      params.waste_type = this.typeFilter;
    }
    if (this.reasonFilter && this.reasonFilter !== 'all') {
      params.reason = this.reasonFilter;
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

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadWasteEntries();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadWasteEntries();
  }

  filterWasteEntries(): void {
    this.currentPage = 1;
    this.loadWasteEntries();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.searchInput = '';
    this.typeFilter = 'all';
    this.reasonFilter = 'all';
    this.currentPage = 1;
    this.searchSubject.next('');
    this.loadWasteEntries();
  }

  editFromDetails(entry: any): void {
    this.selectedWasteEntry = null;
    this.showForm(entry);
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
    return `${start}-${end}`;
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() ||
              this.typeFilter !== 'all' ||
              this.reasonFilter !== 'all');
  }

  Math = Math;

  addRow(): void {
    this.wasteRows.push({
      wasteType: 'INGREDIENT',
      inventoryItemId: null,
      recipeId: null,
      itemName: '',
      quantity: null,
      reason: 'SPOILED',
      note: '',
      wasteCost: null
    });
  }

  removeRow(index: number): void {
    if (this.wasteRows.length > 1) {
      this.wasteRows.splice(index, 1);
    }
  }

  saveWasteBatch(): void {
    if (this.isSubmitting) return;

    const currentUser = this.authService.getCurrentUser();
    const validRows = this.wasteRows.filter(row => {
      if (row.quantity == null || row.quantity <= 0) return false;
      if (row.wasteType === 'INGREDIENT' && !row.inventoryItemId) return false;
      if (row.wasteType === 'DISH' && !row.recipeId) return false;
      if (row.wasteType === 'OTHER' && !row.itemName?.trim()) return false;
      return true;
    });

    if (validRows.length === 0) {
      this.notificationService.error('Validation Error', 'Please fill at least one valid waste entry');
      return;
    }

    const payload = validRows.map(row => ({
      restaurant_id: currentUser?.restaurantId || 1,
      waste_type: row.wasteType || 'INGREDIENT',
      inventory_item_id: row.wasteType === 'INGREDIENT' ? row.inventoryItemId : null,
      recipe_id: row.wasteType === 'DISH' ? row.recipeId : null,
      item_name: row.wasteType === 'OTHER' ? (row.itemName || null) : null,
      quantity: row.quantity,
      reason: row.reason || 'OTHER',
      note: row.note || '',
      waste_cost: row.wasteCost || 0,
      waste_date: new Date().toISOString(),
      created_by: Number(currentUser?.id) || 1
    }));

    this.isSubmitting = true;
    this.loadingService.show();

    this.crudService.createWasteBatch(payload).subscribe({
      next: (response) => {
        this.notificationService.success('Waste Saved', `${validRows.length} waste entries recorded`);
        this.wasteRows = [];
        this.addRow();
        this.showAddForm = false;
        this.loadWasteEntries();
        this.isSubmitting = false;
        this.loadingService.hide();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to save waste entries';
        this.notificationService.error('Save Failed', this.errorMessage);
        this.isSubmitting = false;
        this.loadingService.hide();
      }
    });
  }
}
