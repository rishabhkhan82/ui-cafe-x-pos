import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { UserType } from '../../../interfaces';

@Component({
  selector: 'app-user-type-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-type-master.component.html'
})
export class UserTypeMasterComponent implements OnInit {
  items: UserType[] = [];
  selectedItem: UserType | null = null;
  editingItem: UserType | null = null;
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

  itemForm: UserType = {
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
    this.loadItems();
  }

  loadItems(): void {
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

    this.crudService.getUserTypes(params).subscribe({
      next: (response: any) => {
        this.items = response.data || [];
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading user types:', error);
        const apiMessage = error.error?.message || 'Failed to load user types. Please try again.';
        this.errorMessage = apiMessage;
        this.notificationService.error('Error', apiMessage);
        this.loadingService.hide();
      }
    });
  }

  filterItems(): void {
    this.loadItems();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadItems();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadItems();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1;
    this.loadItems();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadItems();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectItem(item: UserType): void {
    this.selectedItem = item;
  }

  showItemForm(item?: UserType): void {
    this.showAddForm = true;
    this.editingItem = item || null;
    if (item) {
      this.itemForm = { ...item };
    } else {
      this.itemForm = {
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
    this.itemForm = {
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
    this.editingItem = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitForm(): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    const isUpdate = !!this.editingItem;
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
    const validation = this.validationService.name(this.itemForm.name, 'Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateKey(): void {
    const validation = this.validationService.required(this.itemForm.key, 'Key');
    if (!validation.isValid) {
      this.fieldErrors['key'] = validation.message!;
    } else {
      delete this.fieldErrors['key'];
    }
  }

  validateDescription(): void {
    const validation = this.validationService.required(this.itemForm.description, 'Description');
    if (!validation.isValid) {
      this.fieldErrors['description'] = validation.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  private onSaveForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const itemRequest = {
      name: this.itemForm.name,
      key: this.itemForm.key,
      description: this.itemForm.description,
      is_active: this.itemForm.is_active,
      display_order: this.itemForm.display_order,
      created_at: currentTime,
      updated_at: currentTime,
      created_by: this.authService.getCurrentUser()?.id || 'system'
    };

    this.crudService.createUserType(itemRequest).subscribe({
      next: (response) => {
        console.log('User type created successfully:', response);
        this.notificationService.success('Item Created', 'The user type has been successfully created.');
        this.resetForm();
        this.loadItems();
      },
      error: (error) => {
        console.error('Error creating user type:', error);
        const apiMessage = error.error?.message || 'Failed to create user type. Please try again.';
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
    const itemRequest = {
      name: this.itemForm.name,
      key: this.itemForm.key,
      description: this.itemForm.description,
      is_active: this.itemForm.is_active,
      display_order: this.itemForm.display_order,
      created_at: this.editingItem!.created_at,
      updated_at: currentTime,
      created_by: this.editingItem!.created_by,
      updated_by: this.authService.getCurrentUser()?.id || 'system'
    };

    this.crudService.updateUserType(this.editingItem!.id, itemRequest).subscribe({
      next: (response) => {
        console.log('User type updated successfully:', response);
        this.notificationService.success('Item Updated', 'The user type has been successfully updated.');
        this.resetForm();
        this.loadItems();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating user type:', error);
        const apiMessage = error.error?.message || 'Failed to update user type. Please try again.';
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
    this.itemForm = {
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
    this.editingItem = null;
  }

  async deleteItem(item: UserType): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      'Delete User Type',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteUserType(item.id).subscribe({
        next: () => {
          console.log('User type deleted successfully:', item.id);
          if (this.selectedItem?.id === item.id) {
            this.selectedItem = null;
          }
          this.loadItems();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting user type:', error);
          const apiMessage = error.error?.message || 'Failed to delete user type. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
        }
      });
    }
  }

  updateItemStatus(item: UserType, newStatus: boolean): void {
    this.loadingService.show();
    const updatedItem = { ...item, is_active: newStatus, updated_at: new Date() };

    this.crudService.updateUserType(item.id, updatedItem).subscribe({
      next: (response) => {
        console.log('User type status updated successfully:', response);
        item.is_active = newStatus;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating user type status:', error);
        const apiMessage = error.error?.message || 'Failed to update user type status. Please try again.';
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
    this.items = [];
    this.selectedItem = null;
    this.editingItem = null;
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    this.itemForm = {
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

    this.loadItems();
  }

  Math = Math;

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.statusFilter !== 'all');
  }
}
