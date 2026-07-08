import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { CrudService } from '../../../services/crud.service';
import { InventoryItem } from '../../../interfaces';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-owner-inventory-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-inventory-mobile.component.html',
  styleUrl: './owner-inventory-mobile.component.css'
})
export class OwnerInventoryMobileComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];
  selectedInventoryItem: InventoryItem | null = null;
  editingInventoryItem: InventoryItem | null = null;
  searchTerm = '';
  categoryFilter = 'all';
  statusFilter = 'all';
  showAddForm = false;
  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
  errorMessage = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  fieldErrors: { [key: string]: string } = {};

  isSubmitting = false;

  categories = [
    {code: 'all', label: 'All'},
    {code: 'raw-materials', label: 'Raw Materials'},
    {code: 'packaged-goods', label: 'Packaged Goods'},
    {code: 'beverages', label: 'Beverages'},
    {code: 'dairy', label: 'Dairy'},
    {code: 'spices', label: 'Spices'},
    {code: 'cleaning', label: 'Cleaning Supplies'}
  ];

  inventoryForm: InventoryItem = {
    id: 0,
    item_id: '',
    name: '',
    description: '',
    category: 'raw-materials',
    unit_of_measure: 'pcs',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    unit_cost: 0,
    selling_price: 0,
    supplier_id: '',
    location_in_store: '',
    is_active: true,
    expiry_date: undefined,
    last_stock_update: undefined,
    restaurant_id: 1,
    created_at: undefined,
    updated_at: undefined,
    created_by: undefined,
    updated_by: undefined
  };

  constructor(
    public router: Router,
    public loadingService: LoadingService,
    private confirmationService: ConfirmationDialogService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private crudService: CrudService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadInventoryItems();
    this.setupSearch();
  }

  loadInventoryItems(): void {
    this.loadingService.show();
    this.errorMessage = '';

    this.getInventoryItemsObservable(this.buildParams()).subscribe({
      next: (response: any) => {
        this.inventoryItems = this.mapApiInventoryItemsToInventoryItems(response.data);
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading inventory items:', error);
        const apiMessage = error.error?.message || 'Failed to load inventory items. Please try again.';
        this.errorMessage = apiMessage;
        this.loadingService.hide();
      }
    });
  }

  private getInventoryItemsObservable(params: any): Observable<any> {
    return this.crudService.getInventoryItems(params);
  }

  private buildParams(): any {
    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurant_id: currentUser?.restaurantId
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.categoryFilter && this.categoryFilter !== 'all') {
      const selectedCategory = this.categories.find(c => c.code === this.categoryFilter);
      params.category = selectedCategory ? selectedCategory.code : this.categoryFilter;
    }

    if (this.statusFilter !== 'all') {
      params.is_active = this.statusFilter === 'active';
    }

    console.log(params);
    return params;
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.getInventoryItemsObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.inventoryItems = this.mapApiInventoryItemsToInventoryItems(response.data);
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching inventory items:', error);
        this.loadingService.hide();
      }
    });
  }

  private mapApiInventoryItemsToInventoryItems(apiInventoryItems: any[]): InventoryItem[] {
    return apiInventoryItems.map(apiInventoryItem => ({
      id: apiInventoryItem.id,
      item_id: apiInventoryItem.item_id || '',
      name: apiInventoryItem.name || '',
      description: apiInventoryItem.description || '',
      category: apiInventoryItem.category || '',
      unit_of_measure: apiInventoryItem.unit_of_measure || 'pcs',
      current_stock: apiInventoryItem.current_stock || 0,
      minimum_stock: apiInventoryItem.minimum_stock || 0,
      maximum_stock: apiInventoryItem.maximum_stock || 0,
      unit_cost: apiInventoryItem.unit_cost || 0,
      selling_price: apiInventoryItem.selling_price || 0,
      supplier_id: apiInventoryItem.supplier_id || '',
      location_in_store: apiInventoryItem.location_in_store || '',
      is_active: apiInventoryItem.is_active ?? true,
      expiry_date: apiInventoryItem.expiry_date ? new Date(apiInventoryItem.expiry_date) : undefined,
      last_stock_update: apiInventoryItem.last_stock_update ? new Date(apiInventoryItem.last_stock_update) : undefined,
      restaurant_id: apiInventoryItem.restaurant_id || 1,
      created_at: apiInventoryItem.created_at ? new Date(apiInventoryItem.created_at) : undefined,
      updated_at: apiInventoryItem.updated_at ? new Date(apiInventoryItem.updated_at) : undefined,
      created_by: apiInventoryItem.created_by,
      updated_by: apiInventoryItem.updated_by
    }));
  }

  filterInventoryItems(): void {
    this.currentPage = 1;
    this.loadInventoryItems();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = 'all';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadInventoryItems();
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
      this.loadInventoryItems();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadInventoryItems();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectInventoryItem(inventoryItem: InventoryItem): void {
    this.selectedInventoryItem = inventoryItem;
  }

  editFromDetails(inventoryItem: InventoryItem): void {
    this.selectedInventoryItem = null;
    this.showInventoryForm(inventoryItem);
  }

  showInventoryForm(inventoryItem?: InventoryItem): void {
    this.showAddForm = true;
    this.editingInventoryItem = inventoryItem || null;
    if (inventoryItem) {
      this.inventoryForm = { ...inventoryItem };
    } else {
      this.inventoryForm = {
        id: Date.now(),
        item_id: '',
        name: '',
        description: '',
        category: 'raw-materials',
        unit_of_measure: 'pcs',
        current_stock: 0,
        minimum_stock: 0,
        maximum_stock: 0,
        unit_cost: 0,
        selling_price: 0,
        supplier_id: '',
        location_in_store: '',
        is_active: true,
        expiry_date: undefined,
        last_stock_update: undefined,
        restaurant_id: 1,
        created_at: undefined,
        updated_at: undefined,
        created_by: undefined,
        updated_by: undefined
      };
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.inventoryForm = {
      id: 0,
      item_id: '',
      name: '',
      description: '',
      category: 'raw-materials',
      unit_of_measure: 'pcs',
      current_stock: 0,
      minimum_stock: 0,
      maximum_stock: 0,
      unit_cost: 0,
      selling_price: 0,
      supplier_id: '',
      location_in_store: '',
      is_active: true,
      expiry_date: undefined,
      last_stock_update: undefined,
      restaurant_id: 1,
      created_at: undefined,
      updated_at: undefined,
      created_by: undefined,
      updated_by: undefined
    };
    this.editingInventoryItem = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitForm(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.fieldErrors = {};
    this.errorMessage = '';

    this.validateName();
    this.validateDescription();
    this.validateCategory();
    this.validateUnitOfMeasure();
    this.validateCurrentStock();
    this.validateMinimumStock();
    this.validateMaximumStock();
    this.validateUnitCost();
    this.validateSellingPrice();

    if (Object.keys(this.fieldErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    if (this.editingInventoryItem) {
      this.updateInventoryItemItem();
    } else {
      this.createInventoryItem();
    }

  }

  validateName(): void {
    const validation = this.validationService.name(this.inventoryForm.name, 'Item name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateDescription(): void {
    if (this.inventoryForm.description && this.inventoryForm.description.length > 500) {
      this.fieldErrors['description'] = 'Description cannot exceed 500 characters';
    } else {
      delete this.fieldErrors['description'];
    }
  }

  validateCategory(): void {
    const validation = this.validationService.required(this.inventoryForm.category, 'Category');
    if (!validation.isValid) {
      this.fieldErrors['category'] = validation.message!;
    } else {
      delete this.fieldErrors['category'];
    }
  }

  validateUnitOfMeasure(): void {
    const validation = this.validationService.required(this.inventoryForm.unit_of_measure, 'Unit of measure');
    if (!validation.isValid) {
      this.fieldErrors['unit_of_measure'] = validation.message!;
    } else {
      delete this.fieldErrors['unit_of_measure'];
    }
  }

  validateCurrentStock(): void {
    const validation = this.validationService.required(this.inventoryForm.current_stock, 'Current stock');
    if (!validation.isValid) {
      this.fieldErrors['current_stock'] = validation.message!;
    } else if (this.inventoryForm.current_stock < 0) {
      this.fieldErrors['current_stock'] = 'Current stock cannot be negative';
    } else {
      delete this.fieldErrors['current_stock'];
    }
  }

  validateMinimumStock(): void {
    const validation = this.validationService.required(this.inventoryForm.minimum_stock, 'Minimum stock');
    if (!validation.isValid) {
      this.fieldErrors['minimum_stock'] = validation.message!;
    } else if (this.inventoryForm.minimum_stock < 0) {
      this.fieldErrors['minimum_stock'] = 'Minimum stock cannot be negative';
    } else {
      delete this.fieldErrors['minimum_stock'];
    }
  }

  validateMaximumStock(): void {
    if (this.inventoryForm.maximum_stock < 0) {
      this.fieldErrors['maximum_stock'] = 'Maximum stock cannot be negative';
    } else {
      delete this.fieldErrors['maximum_stock'];
    }
  }

  validateUnitCost(): void {
    const validation = this.validationService.required(this.inventoryForm.unit_cost, 'Unit cost');
    if (!validation.isValid) {
      this.fieldErrors['unit_cost'] = validation.message!;
    } else if (this.inventoryForm.unit_cost < 0) {
      this.fieldErrors['unit_cost'] = 'Unit cost cannot be negative';
    } else {
      delete this.fieldErrors['unit_cost'];
    }
  }

  validateSellingPrice(): void {
    const value = this.inventoryForm.selling_price;
    if (value === null || value === undefined) {
      delete this.fieldErrors['selling_price'];
      return;
    }
    if (isNaN(value) || value < 0) {
      this.fieldErrors['selling_price'] = 'Selling price cannot be negative';
    } else {
      delete this.fieldErrors['selling_price'];
    }
  }

  generateItemId(): void {
    if (this.inventoryForm.name && this.inventoryForm.name.trim()) {
      this.inventoryForm.item_id = this.inventoryForm.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '_');
    } else {
      this.inventoryForm.item_id = '';
    }
  }

  async createInventoryItem(): Promise<void> {
    this.loadingService.show();

    try {
      const currentTime = new Date();
      const currentUser = this.authService.getCurrentUser();
      const inventoryRequest = {
        item_id: this.inventoryForm.item_id,
        name: this.inventoryForm.name,
        description: this.inventoryForm.description,
        category: this.inventoryForm.category,
        unit_of_measure: this.inventoryForm.unit_of_measure,
        current_stock: this.inventoryForm.current_stock,
        minimum_stock: this.inventoryForm.minimum_stock,
        maximum_stock: this.inventoryForm.maximum_stock,
        unit_cost: this.inventoryForm.unit_cost,
        selling_price: this.inventoryForm.selling_price,
        supplier_id: this.inventoryForm.supplier_id,
        location_in_store: '',
        is_active: this.inventoryForm.is_active,
        expiry_date: this.inventoryForm.expiry_date ? new Date(this.inventoryForm.expiry_date).toISOString() : null,
        restaurant_id: currentUser?.restaurantId || 1,
        created_at: currentTime.toISOString(),
        updated_at: currentTime.toISOString(),
        created_by: Number(currentUser?.id) || 1,
        updated_by: Number(currentUser?.id) || 1
      };

      this.crudService.createInventoryItem(inventoryRequest).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Inventory item created successfully:', response);
          this.notificationService.success('Inventory Item Created', 'The inventory item has been successfully created.');
          this.cancelAdd();
          this.loadInventoryItems();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating inventory item:', error);
          const apiMessage = error.error?.message || 'Failed to create inventory item. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();

          const apiFieldErrors = error.error?.fieldErrors as Record<string, string[]> | undefined;
          if (apiFieldErrors) {
            Object.entries(apiFieldErrors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                this.fieldErrors[field] = messages[0];
              }
            });
          }

          this.notificationService.error('Creation Failed', apiMessage);
        }
      });
    } catch (error) {
      this.isSubmitting = false;
      console.error('Error creating inventory item:', error);
      this.notificationService.error('Processing Failed', 'Failed to create inventory item. Please try again.');
      this.errorMessage = 'Failed to create inventory item. Please try again.';
      this.loadingService.hide();
    }
  }

  async updateInventoryItemItem(): Promise<void> {
    this.loadingService.show();

    try {
      const currentTime = new Date();
      const currentUser = this.authService.getCurrentUser();
      const inventoryRequest = {
        item_id: this.inventoryForm.item_id,
        name: this.inventoryForm.name,
        description: this.inventoryForm.description,
        category: this.inventoryForm.category,
        unit_of_measure: this.inventoryForm.unit_of_measure,
        current_stock: this.inventoryForm.current_stock,
        minimum_stock: this.inventoryForm.minimum_stock,
        maximum_stock: this.inventoryForm.maximum_stock,
        unit_cost: this.inventoryForm.unit_cost,
        selling_price: this.inventoryForm.selling_price,
        supplier_id: this.inventoryForm.supplier_id,
        location_in_store: '',
        is_active: this.inventoryForm.is_active,
        expiry_date: this.inventoryForm.expiry_date ? new Date(this.inventoryForm.expiry_date).toISOString() : null,
        restaurant_id: this.inventoryForm.restaurant_id,
        created_at: this.editingInventoryItem!.created_at?.toISOString() || currentTime.toISOString(),
        updated_at: currentTime.toISOString(),
        created_by: this.editingInventoryItem!.created_by,
        updated_by: Number(currentUser?.id) || 1
      };

      console.log('Updating inventory item, inventoryRequest:', inventoryRequest);

      this.crudService.updateInventoryItem(this.editingInventoryItem!.id, inventoryRequest).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Inventory item updated successfully:', response);
          this.notificationService.success('Inventory Item Updated', 'The inventory item has been successfully updated.');
          this.cancelAdd();
          this.loadInventoryItems();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating inventory item:', error);
          const apiMessage = error.error?.message || 'Failed to update inventory item. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();

          const apiFieldErrors = error.error?.fieldErrors as Record<string, string[]> | undefined;
          if (apiFieldErrors) {
            Object.entries(apiFieldErrors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                this.fieldErrors[field] = messages[0];
              }
            });
          }

          this.notificationService.error('Update Failed', apiMessage);
        }
      });
    } catch (error) {
      this.isSubmitting = false;
      console.error('Error updating inventory item:', error);
      this.notificationService.error('Processing Failed', 'Failed to update inventory item. Please try again.');
      this.errorMessage = 'Failed to update inventory item. Please try again.';
      this.loadingService.hide();
    }
  }

  async deleteInventoryItem(inventoryItem: InventoryItem): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${inventoryItem.name}"? This action cannot be undone.`,
      'Delete Inventory Item',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteInventoryItem(inventoryItem.id).subscribe({
        next: () => {
          console.log('Inventory item deleted successfully:', inventoryItem.id);
          if (this.selectedInventoryItem?.id === inventoryItem.id) {
            this.selectedInventoryItem = null;
          }
          this.loadInventoryItems();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting inventory item:', error);
          const apiMessage = error.error?.message || 'Failed to delete inventory item. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
        }
      });
    }
  }

  Math = Math;

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() ||
              this.categoryFilter !== 'all' ||
              this.statusFilter !== 'all');
  }

  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    return `${start}-${end}`;
  }
}
