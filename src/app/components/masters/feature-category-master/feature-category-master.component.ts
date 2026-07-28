import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { FeatureCategory } from '../../../interfaces';

@Component({
  selector: 'app-feature-category-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature-category-master.component.html'
})
export class FeatureCategoryMasterComponent implements OnInit {
  categories: FeatureCategory[] = [];
  selectedCategory: FeatureCategory | null = null;
  editingCategory: FeatureCategory | null = null;
  searchTerm = '';
  statusFilter = 'all';
  showAddForm = false;
  errorMessage = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  fieldErrors: { [key: string]: string } = {};

  categoryForm: FeatureCategory = {
    id: 0,
    name: '',
    key: '',
    description: '',
    is_active: true,
    display_order: 0,
    created_by: '',
    updated_by: '',
    created_at: new Date(),
    updated_at: new Date()
  };

  constructor(
    private crudService: CrudService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private confirmationService: ConfirmationDialogService,
    private notificationService: NotificationService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.statusFilter !== 'all') {
      params.isActive = this.statusFilter === 'active' ? 'true' : 'false';
    }

    this.crudService.getFeatureCategories(params).subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading feature categories:', error);
        const apiMessage = error.error?.message || 'Failed to load feature categories. Please try again.';
        this.errorMessage = apiMessage;
        this.notificationService.error('Error', apiMessage);
        this.loadingService.hide();
      }
    });
  }

  filterCategories(): void {
    this.loadCategories();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadCategories();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1;
    this.loadCategories();
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

  selectCategory(category: FeatureCategory): void {
    this.selectedCategory = category;
  }

  showCategoryForm(category?: FeatureCategory): void {
    this.showAddForm = true;
    this.editingCategory = category || null;
    if (category) {
      this.categoryForm = { ...category };
    } else {
      this.categoryForm = {
        id: 0,
        name: '',
        key: '',
        description: '',
        is_active: true,
        display_order: 0,
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
      name: '',
      key: '',
      description: '',
      is_active: true,
      display_order: 0,
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

    const isUpdate = !!this.editingCategory;
    let hasErrors = false;

    this.validateName();
    this.validateKey();
    this.validateDescription();

    hasErrors = Object.keys(this.fieldErrors).length > 0;

    if (hasErrors) {
      const errorMessages = Object.values(this.fieldErrors);
      this.notificationService.error('Validation Error', errorMessages.join('. '));
      return;
    }

    if (isUpdate) {
      this.onUpdateForm();
    } else {
      this.onSaveForm();
    }
  }

  validateName(): void {
    const validation = this.validationService.name(this.categoryForm.name, 'Category Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateKey(): void {
    const validation = this.validationService.required(this.categoryForm.key, 'Key');
    if (!validation.isValid) {
      this.fieldErrors['key'] = validation.message!;
    } else {
      delete this.fieldErrors['key'];
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

  private onSaveForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const categoryRequest = {
      name: this.categoryForm.name,
      key: this.categoryForm.key,
      description: this.categoryForm.description,
      is_active: this.categoryForm.is_active,
      display_order: this.categoryForm.display_order,
      created_at: currentTime,
      updated_at: currentTime,
      created_by: this.authService.getCurrentUser()?.id || 'system'
    };

    this.crudService.createFeatureCategory(categoryRequest).subscribe({
      next: (response) => {
        console.log('Feature category created successfully:', response);
        this.notificationService.success('Category Created', 'The feature category has been successfully created.');
        this.resetForm();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error creating feature category:', error);
        const apiMessage = error.error?.message || 'Failed to create feature category. Please try again.';
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

  private onUpdateForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const categoryRequest = {
      name: this.categoryForm.name,
      key: this.categoryForm.key,
      description: this.categoryForm.description,
      is_active: this.categoryForm.is_active,
      display_order: this.categoryForm.display_order,
      created_at: this.editingCategory!.created_at,
      updated_at: currentTime,
      created_by: this.editingCategory!.created_by,
      updated_by: this.authService.getCurrentUser()?.id || 'system'
    };

    this.crudService.updateFeatureCategory(this.editingCategory!.id, categoryRequest).subscribe({
      next: (response) => {
        console.log('Feature category updated successfully:', response);
        this.notificationService.success('Category Updated', 'The feature category has been successfully updated.');
        this.resetForm();
        this.loadCategories();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating feature category:', error);
        const apiMessage = error.error?.message || 'Failed to update feature category. Please try again.';
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

  private resetForm(): void {
    this.showAddForm = false;
    this.categoryForm = {
      id: 0,
      name: '',
      key: '',
      description: '',
      is_active: true,
      display_order: 0,
      created_by: '',
      updated_by: '',
      created_at: new Date(),
      updated_at: new Date()
    };
    this.editingCategory = null;
  }

  async deleteCategory(category: FeatureCategory): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      'Delete Feature Category',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteFeatureCategory(category.id).subscribe({
        next: () => {
          console.log('Feature category deleted successfully:', category.id);
          if (this.selectedCategory?.id === category.id) {
            this.selectedCategory = null;
          }
          this.loadCategories();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting feature category:', error);
          const apiMessage = error.error?.message || 'Failed to delete feature category. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
        }
      });
    }
  }

  updateCategoryStatus(category: FeatureCategory, newStatus: boolean): void {
    this.loadingService.show();
    const updatedCategory = { ...category, is_active: newStatus, updated_at: new Date() };

    this.crudService.updateFeatureCategory(category.id, updatedCategory).subscribe({
      next: (response) => {
        console.log('Feature category status updated successfully:', response);
        category.is_active = newStatus;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating feature category status:', error);
        const apiMessage = error.error?.message || 'Failed to update feature category status. Please try again.';
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

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    this.categoryForm = {
      id: 0,
      name: '',
      key: '',
      description: '',
      is_active: true,
      display_order: 0,
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
}
