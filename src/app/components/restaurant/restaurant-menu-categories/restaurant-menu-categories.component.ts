import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { CrudService } from '../../../services/crud.service';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { RestaurantMenuCategory } from '../../../interfaces';

@Component({
  selector: 'app-restaurant-menu-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-menu-categories.component.html',
  styleUrl: './restaurant-menu-categories.component.css'
})
export class RestaurantMenuCategoriesComponent implements OnInit {
  categories: RestaurantMenuCategory[] = [];
  selectedCategory: RestaurantMenuCategory | null = null;
  editingCategory: RestaurantMenuCategory | null = null;
  searchTerm = '';
  statusFilter = 'all';
  showAddForm = false;
  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
  errorMessage = '';

  currentPage = 1;
  itemsPerPage = 50;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  fieldErrors: { [key: string]: string } = {};

  availableIcons = [
    { label: 'Burger', value: 'fas fa-hamburger' },
    { label: 'Pizza', value: 'fas fa-pizza-slice' },
    { label: 'Coffee', value: 'fas fa-coffee' },
    { label: 'Ice Cream', value: 'fas fa-ice-cream' },
    { label: 'Cookie', value: 'fas fa-cookie' },
    { label: 'Apple', value: 'fas fa-apple-alt' },
    { label: 'Carrot', value: 'fas fa-carrot' },
    { label: 'Bread', value: 'fas fa-bread-slice' },
    { label: 'Utensils', value: 'fas fa-utensils' },
    { label: 'Wine', value: 'fas fa-wine-glass' },
    { label: 'Beer', value: 'fas fa-beer' },
    { label: 'Glass', value: 'fas fa-glass-martini' },
    { label: 'Blender', value: 'fas fa-blender' },
    { label: 'Egg', value: 'fas fa-egg' },
    { label: 'Cheese', value: 'fas fa-cheese' },
    { label: 'Hotdog', value: 'fas fa-hotdog' },
    { label: 'Sandwich', value: 'fas fa-solid fa-burger' },
    { label: 'Drumstick', value: 'fas fa-drumstick-bite' },
    { label: 'Fish', value: 'fas fa-fish' },
    { label: 'Shrimp', value: 'fas fa-shrimp' },
    { label: 'Pepper', value: 'fas fa-pepper-hot' },
    { label: 'Bowl', value: 'fas fa-bowl-rice' },
    { label: 'Soup', value: 'fas fa-solid fa-bowl-food' },
    { label: 'Cookie Bite', value: 'fas fa-cookie-bite' },
    { label: 'Candy', value: 'fas fa-candy-cane' },
    { label: 'Birthday Cake', value: 'fas fa-birthday-cake' },
    { label: 'Leaf', value: 'fas fa-leaf' },
    { label: 'Fire', value: 'fas fa-fire' },
    { label: 'Clock', value: 'fas fa-clock' },
    { label: 'Star', value: 'fas fa-star' },
    { label: 'Heart', value: 'fas fa-heart' },
    { label: 'Tag', value: 'fas fa-tag' },
    { label: 'Layer Group', value: 'fas fa-layer-group' },
    { label: 'Th List', value: 'fas fa-th-list' },
    { label: 'Utensil Spoon', value: 'fas fa-utensil-spoon' }
  ];

  isIconPickerOpen = false;

  categoryForm: RestaurantMenuCategory = {
    id: 0,
    category_id: '',
    name: '',
    key: '',
    description: '',
    icon: '',
    color: '',
    display_order: 0,
    is_active: true,
    is_default: false,
    parent_category_id: '',
    restaurant_id: 0,
    item_count: 0,
    total_value: 0,
    popularity_score: 0,
    last_ordered: undefined,
    created_by: '',
    updated_by: '',
    created_at: new Date(),
    updated_at: new Date()
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
    this.loadCategories();
    this.setupSearch();
  }

  get restaurantId(): number {
    return Number(this.authService.getCurrentUser()?.restaurantId || this.authService.getCurrentUser()?.restaurant_id || 0);
  }

  loadCategories(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurantId: this.restaurantId
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.statusFilter !== 'all') {
      params.isActive = this.statusFilter === 'active' ? 'true' : 'false';
    }

    this.crudService.getRestaurantMenuCategories(params).subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading restaurant menu categories:', error);
        const apiMessage = error.error?.message || 'Failed to load menu categories. Please try again.';
        this.errorMessage = apiMessage;
        this.notificationService.error('Error', apiMessage);
        this.loadingService.hide();
      }
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.getCategoriesObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching restaurant menu categories:', error);
        this.loadingService.hide();
      }
    });
  }

  private getCategoriesObservable(params: any): Observable<any> {
    return this.crudService.getRestaurantMenuCategories(params);
  }

  private buildParams(): any {
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurantId: this.restaurantId
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.statusFilter !== 'all') {
      params.isActive = this.statusFilter === 'active' ? 'true' : 'false';
    }

    return params;
  }

  filterCategories(): void {
    this.currentPage = 1;
    this.loadCategories();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadCategories();
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
      this.loadCategories();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadCategories();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectCategory(category: RestaurantMenuCategory): void {
    this.selectedCategory = category;
  }

  showCategoryForm(category?: RestaurantMenuCategory): void {
    this.showAddForm = true;
    this.editingCategory = category || null;
    if (category) {
      this.categoryForm = { ...category };
    } else {
      this.categoryForm = {
        id: 0,
        category_id: '',
        name: '',
        key: '',
        description: '',
        icon: '',
        color: '',
        display_order: 0,
        is_active: true,
        is_default: false,
        parent_category_id: '',
        restaurant_id: this.restaurantId,
        item_count: 0,
        total_value: 0,
        popularity_score: 0,
        last_ordered: undefined,
        created_by: '',
        updated_by: '',
        created_at: new Date(),
        updated_at: new Date()
      };
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.categoryForm = {
      id: 0,
      category_id: '',
      name: '',
      key: '',
      description: '',
      icon: '',
      color: '',
      display_order: 0,
      is_active: true,
      is_default: false,
      parent_category_id: '',
      restaurant_id: this.restaurantId,
      item_count: 0,
      total_value: 0,
      popularity_score: 0,
      last_ordered: undefined,
      created_by: '',
      updated_by: '',
      created_at: new Date(),
      updated_at: new Date()
    };
    this.editingCategory = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitForm(): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    this.validateName();
    this.validateDescription();
    this.validateIcon();

    if (Object.keys(this.fieldErrors).length > 0) {
      return;
    }

    if (this.editingCategory) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  validateName(): void {
    const validation = this.validationService.required(this.categoryForm.name, 'Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateDescription(): void {
    const validation = this.validationService.required(this.categoryForm.description, 'Description');
    if (!validation.isValid) {
      this.fieldErrors['description'] = validation.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  validateIcon(): void {
    if (!this.categoryForm.icon || this.categoryForm.icon.trim() === '') {
      this.fieldErrors['icon'] = 'Icon is required';
    } else {
      delete this.fieldErrors['icon'];
    }
  }

  onNameChange(name: string): void {
    this.categoryForm.key = this.generateKeyFromName(name);
  }

  generateKeyFromName(name: string): string {
    return name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
  }

  private createCategory(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const currentUser = this.authService.getCurrentUser();
    const categoryRequest = {
      name: this.categoryForm.name,
      key: this.categoryForm.key,
      description: this.categoryForm.description,
      icon: this.categoryForm.icon,
      color: this.categoryForm.color,
      display_order: this.categoryForm.display_order,
      is_active: this.categoryForm.is_active,
      is_default: this.categoryForm.is_default,
      parent_category_id: this.categoryForm.parent_category_id,
      restaurant_id: this.restaurantId,
      created_at: currentTime.toISOString(),
      updated_at: currentTime.toISOString(),
      created_by: Number(currentUser?.id) || 0,
      updated_by: Number(currentUser?.id) || 0
    };

    this.crudService.createRestaurantMenuCategory(categoryRequest).subscribe({
      next: (response) => {
        console.log('Restaurant menu category created successfully:', response);
        this.notificationService.success('Category Created', 'The menu category has been successfully created.');
        this.cancelAdd();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error creating restaurant menu category:', error);
        const apiMessage = error.error?.message || 'Failed to create menu category. Please try again.';
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
  }

  private updateCategory(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const currentUser = this.authService.getCurrentUser();
    const categoryRequest = {
      name: this.categoryForm.name,
      key: this.categoryForm.key,
      description: this.categoryForm.description,
      icon: this.categoryForm.icon,
      color: this.categoryForm.color,
      display_order: this.categoryForm.display_order,
      is_active: this.categoryForm.is_active,
      is_default: this.categoryForm.is_default,
      parent_category_id: this.categoryForm.parent_category_id,
      restaurant_id: this.restaurantId,
      created_at: this.editingCategory!.created_at instanceof Date
        ? this.editingCategory!.created_at.toISOString()
        : (this.editingCategory!.created_at as string | undefined || currentTime.toISOString()),
      updated_at: currentTime.toISOString(),
      created_by: this.editingCategory!.created_by,
      updated_by: Number(currentUser?.id) || 0
    };

    this.crudService.updateRestaurantMenuCategory(this.restaurantId, this.editingCategory!.id, categoryRequest).subscribe({
      next: (response) => {
        console.log('Restaurant menu category updated successfully:', response);
        this.notificationService.success('Category Updated', 'The menu category has been successfully updated.');
        this.cancelAdd();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error updating restaurant menu category:', error);
        const apiMessage = error.error?.message || 'Failed to update menu category. Please try again.';
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
  }

  async deleteCategory(category: RestaurantMenuCategory): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      'Delete Menu Category',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteRestaurantMenuCategory(this.restaurantId, category.id).subscribe({
        next: () => {
          console.log('Restaurant menu category deleted successfully:', category.id);
          if (this.selectedCategory?.id === category.id) {
            this.selectedCategory = null;
          }
          this.loadCategories();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting restaurant menu category:', error);
          const apiMessage = error.error?.message || 'Failed to delete menu category. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
        }
      });
    }
  }

  updateCategoryStatus(category: RestaurantMenuCategory, newStatus: boolean): void {
    this.loadingService.show();
    const updatedCategory = { ...category, is_active: newStatus, updated_at: new Date() };

    this.crudService.updateRestaurantMenuCategory(this.restaurantId, category.id, updatedCategory).subscribe({
      next: (response) => {
        console.log('Restaurant menu category status updated successfully:', response);
        category.is_active = newStatus;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating restaurant menu category status:', error);
        const apiMessage = error.error?.message || 'Failed to update menu category status. Please try again.';
        this.errorMessage = apiMessage;
        this.loadingService.hide();
      }
    });
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getSelectedIconLabel(): string {
    const icon = this.availableIcons.find(i => i.value === this.categoryForm.icon);
    return icon ? icon.label : 'None';
  }

  selectIcon(iconValue: string): void {
    this.categoryForm.icon = iconValue;
    this.isIconPickerOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.icon-picker-container')) {
      this.isIconPickerOpen = false;
    }
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  reloadComponent(): void {
    this.categories = [];
    this.selectedCategory = null;
    this.editingCategory = null;
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 50;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    this.categoryForm = {
      id: 0,
      category_id: '',
      name: '',
      key: '',
      description: '',
      icon: '',
      color: '',
      display_order: 0,
      is_active: true,
      is_default: false,
      parent_category_id: '',
      restaurant_id: this.restaurantId,
      item_count: 0,
      total_value: 0,
      popularity_score: 0,
      last_ordered: undefined,
      created_by: '',
      updated_by: '',
      created_at: new Date(),
      updated_at: new Date()
    };

    this.loadCategories();
  }

  Math = Math;

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.statusFilter !== 'all');
  }

  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    return `${start}-${end}`;
  }
}
