import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { ManagedFeature } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-feature-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature-management.component.html',
  styleUrl: './feature-management.component.css'
})
export class FeatureManagementComponent implements OnInit {
  features: ManagedFeature[] = [];
  selectedFeature: ManagedFeature | null = null;
  editingFeature: ManagedFeature | null = null;
  searchTerm = '';
  featureTypeFilter = 'all';
  categoryFilter = '';
  statusFilter = 'all';
  showAddForm = false;
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  // Field validation errors
  fieldErrors: { [key: string]: string } = {};

  featureForm: ManagedFeature = {
    id: 0,
    name: '',
    feature_id: '',
    description: '',
    is_enabled: true,
    feature_type: 'BASIC',
    category: '',
    category_icon: '',
    sort_order: 0,
    created_at: '',
    updated_at: '',
    created_by: 0,
    updated_by: 0
  };

  constructor(
    private router: Router,
    private crudService: CrudService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private confirmationService: ConfirmationDialogService,
    private notificationService: NotificationService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadFeatures();
  }

  onCategoryChange(): void {
    this.featureForm.category_icon = this.getCategoryIcon(this.featureForm.category);
  }

  private getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'GENERAL': 'fas fa-cogs',
      'POS': 'fas fa-cash-register',
      'INVENTORY': 'fas fa-boxes',
      'ORDERS': 'fas fa-shopping-cart',
      'ANALYTICS': 'fas fa-chart-bar',
      'CUSTOMERS': 'fas fa-user',
      'STAFF': 'fas fa-users',
      'INTEGRATION': 'fas fa-plug',
      'SECURITY': 'fas fa-shield-alt',
      'BRANDING': 'fas fa-palette',
      'SUPPORT': 'fas fa-headset',
      'MENU': 'fas fa-utensils',
      'CRM': 'fas fa-user-friends'
    };
    return iconMap[category] || '';
  }

  loadFeatures(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.categoryFilter && this.categoryFilter.trim()) {
      params.category = this.categoryFilter.trim();
    }

    if (this.featureTypeFilter !== 'all') {
      params.featureType = this.featureTypeFilter;
    }

    if (this.statusFilter !== 'all') {
      params.isEnabled = this.statusFilter === 'enabled' ? 'true' : 'false';
    }

    this.crudService.getFeatures(params).subscribe({
      next: (response: any) => {
        this.features = response.data;
        this.totalPages = response.page_count;
        this.totalElements = response.total_count;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading features:', error);
        this.errorMessage = 'Failed to load features. Please try again.';
        this.notificationService.error('Error', 'Failed to load features');
        this.loadingService.hide();
      }
    });
  }

  filterFeatures(): void {
    this.loadFeatures();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.featureTypeFilter = 'all';
    this.statusFilter = 'all';
    this.currentPage = 1; // Reset to first page
    this.loadFeatures();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFeatures();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1; // Reset to first page
    this.loadFeatures();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadFeatures();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectFeature(feature: ManagedFeature): void {
    this.selectedFeature = feature;
  }

  showFeatureForm(feature?: ManagedFeature): void {
    this.showAddForm = true;
    this.editingFeature = feature || null;
    if (feature) {
      // Editing existing feature
      this.featureForm = { ...feature };
    } else {
      // Adding new feature
      this.featureForm = {
        id: 0,
        name: '',
        feature_id: '',
        description: '',
        is_enabled: true,
        feature_type: 'BASIC',
        category: '',
        category_icon: '',
        sort_order: 0,
        created_at: '',
        updated_at: '',
        created_by: 0,
        updated_by: 0
      };
    }
    // Set the icon based on category
    this.onCategoryChange();
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.featureForm = {
      id: 0,
      name: '',
      feature_id: '',
      description: '',
      is_enabled: true,
      feature_type: 'BASIC',
      category: '',
      sort_order: 0,
      created_at: '',
      updated_at: '',
      created_by: 0,
      updated_by: 0
    };
    this.editingFeature = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitForm(): void {
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';

    const isUpdate = !!this.editingFeature;
    let hasErrors = false;

    // Validate all fields
    this.validateName();
    this.validateFeatureId();
    this.validateCategory();
    this.validateDescription();

    // Check if there are any errors
    hasErrors = Object.keys(this.fieldErrors).length > 0;

    // If there are validation errors, display them
    if (hasErrors) {
      const errorMessages = Object.values(this.fieldErrors);
      this.notificationService.error('Validation Error', errorMessages.join('. '));
      return;
    }

    // Proceed with save or update
    if (isUpdate) {
      this.onUpdateForm();
    } else {
      this.onSaveForm();
    }
  }

  // Real-time validation methods
  validateName(): void {
    const validation = this.validationService.name(this.featureForm.name, 'Feature Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateFeatureId(): void {
    const validation = this.validationService.required(this.featureForm.feature_id, 'Feature ID');
    if (!validation.isValid) {
      this.fieldErrors['feature_id'] = validation.message!;
    } else {
      // Additional validation for feature_id format (alphanumeric and underscores only)
      const featureIdPattern = /^[a-zA-Z0-9_]+$/;
      if (!featureIdPattern.test(this.featureForm.feature_id)) {
        this.fieldErrors['feature_id'] = 'Feature ID must contain only letters, numbers and underscores';
      } else {
        delete this.fieldErrors['feature_id'];
      }
    }
  }

  validateCategory(): void {
    const validation = this.validationService.required(this.featureForm.category, 'Category');
    if (!validation.isValid) {
      this.fieldErrors['category'] = validation.message!;
    } else {
      delete this.fieldErrors['category'];
    }
  }

  validateDescription(): void {
    const validation = this.validationService.required(this.featureForm.description, 'Description');
    if (!validation.isValid) {
      this.fieldErrors['description'] = validation.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  private onSaveForm(): void {
    this.loadingService.show();

    const currentTime = new Date().toISOString();
    const featureRequest = {
      name: this.featureForm.name,
      feature_id: this.featureForm.feature_id,
      description: this.featureForm.description,
      is_enabled: this.featureForm.is_enabled,
      feature_type: this.featureForm.feature_type,
      category: this.featureForm.category,
      sort_order: this.featureForm.sort_order,
      created_at: currentTime,
      updated_at: currentTime,
      created_by: this.authService.getCurrentUser()?.id || 1
    };

    // Create new feature
    this.crudService.createFeature(featureRequest).subscribe({
      next: (response) => {
        console.log('Feature created successfully:', response);
        this.notificationService.success('Feature Created', 'The feature has been successfully created.');
        this.resetForm();
        this.loadFeatures(); // Reload features
      },
      error: (error) => {
        console.error('Error creating feature:', error);
        this.notificationService.error('Creation Failed', 'Failed to create feature. Please try again.');
        this.errorMessage = 'Failed to create feature. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private onUpdateForm(): void {
    this.loadingService.show();

    const currentTime = new Date().toISOString();
    const featureRequest = {
      name: this.featureForm.name,
      feature_id: this.featureForm.feature_id,
      description: this.featureForm.description,
      is_enabled: this.featureForm.is_enabled,
      feature_type: this.featureForm.feature_type,
      category: this.featureForm.category,
      sort_order: this.featureForm.sort_order,
      created_at: this.editingFeature!.created_at,
      updated_at: currentTime,
      created_by: this.editingFeature!.created_by,
      updated_by: this.authService.getCurrentUser()?.id || 1
    };

    // Update existing feature
    this.crudService.updateFeature(this.editingFeature!.id, featureRequest).subscribe({
      next: (response) => {
        console.log('Feature updated successfully:', response);
        this.notificationService.success('Feature Updated', 'The feature has been successfully updated.');
        this.resetForm();
        this.loadFeatures(); // Reload features
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating feature:', error);
        this.notificationService.error('Update Failed', 'Failed to update feature. Please try again.');
        this.errorMessage = 'Failed to update feature. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.featureForm = {
      id: 0,
      name: '',
      feature_id: '',
      description: '',
      is_enabled: true,
      feature_type: 'BASIC',
      category: '',
      sort_order: 0,
      created_at: '',
      updated_at: '',
      created_by: 0,
      updated_by: 0
    };
    this.editingFeature = null;
  }

  async deleteFeature(feature: ManagedFeature): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${feature.name}"? This action cannot be undone.`,
      'Delete Feature',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteFeature(feature.id).subscribe({
        next: () => {
          console.log('Feature deleted successfully:', feature.id);
          if (this.selectedFeature?.id === feature.id) {
            this.selectedFeature = null;
          }
          this.loadFeatures(); // Reload features from server to get updated pagination
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting feature:', error);
          this.errorMessage = 'Failed to delete feature. Please try again.';
          this.loadingService.hide();
        }
      });
    }
  }

  updateFeatureStatus(feature: ManagedFeature, newStatus: boolean): void {
    this.loadingService.show();
    const updatedFeature = { ...feature, is_enabled: newStatus, updated_at: new Date().toISOString() };

    this.crudService.updateFeature(feature.id, updatedFeature).subscribe({
      next: (response) => {
        console.log('Feature status updated successfully:', response);
        feature.is_enabled = newStatus;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating feature status:', error);
        this.errorMessage = 'Failed to update feature status. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  getStatusBadgeClass(isEnabled: boolean): string {
    return isEnabled
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  getStatusText(isEnabled: boolean): string {
    return isEnabled ? 'Enabled' : 'Disabled';
  }

  getFeatureTypeBadgeClass(featureType: string): string {
    switch (featureType) {
      case 'BASIC':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'ENTERPRISE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  reloadComponent(): void {
    // Reset all component state
    this.features = [];
    this.selectedFeature = null;
    this.editingFeature = null;
    this.searchTerm = '';
    this.categoryFilter = '';
    this.featureTypeFilter = 'all';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    // Reset feature form
    this.featureForm = {
      id: 0,
      name: '',
      feature_id: '',
      description: '',
      is_enabled: true,
      feature_type: 'BASIC',
      category: '',
      sort_order: 0,
      created_at: '',
      updated_at: '',
      created_by: 0,
      updated_by: 0
    };

    // Reload data
    this.loadFeatures();
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.categoryFilter?.trim() || this.featureTypeFilter !== 'all' || this.statusFilter !== 'all');
  }
}
