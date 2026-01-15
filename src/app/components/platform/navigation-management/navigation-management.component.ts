import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { NavigationMenu } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-navigation-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navigation-management.component.html',
  styleUrl: './navigation-management.component.css'
})
export class NavigationManagementComponent implements OnInit {
  navigationMenus: NavigationMenu[] = [];
  allNavigationMenus: NavigationMenu[] = []; // For auto-generation
  parentNavigationMenus: NavigationMenu[] = [];
  selectedMenu: NavigationMenu | null = null;
  editingMenu: NavigationMenu | null = null;
  searchTerm = '';
  codeFilter = '';
  statusFilter = 'all';
  typeFilter = 'all';
  showAddForm = false;
  showViewModal = false;
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  // Field validation errors
  fieldErrors: { [key: string]: string } = {};

  menuForm: NavigationMenu = {
    id: 0,
    name: '',
    parent_id: '',
    path: '',
    icon: '',
    is_active: true,
    display_order: 0,
    type: 'ACTION',
    menu_id: '',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: '',
    updated_by: ''
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
    this.loadNavigationMenus();
    this.loadParentMenus();
  }

  loadNavigationMenus(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.codeFilter && this.codeFilter.trim()) {
      params.menu_id = this.codeFilter.trim();
    }

    if (this.statusFilter !== 'all') {
      params.isActive = this.statusFilter === 'active' ? 'true' : 'false';
    }

    if (this.typeFilter !== 'all') {
      params.type = this.typeFilter;
    }

    this.crudService.getNavigationMenus(params).subscribe({
      next: (response: any) => {
        this.navigationMenus = response.data.map((menu: any) => ({
          ...menu,
          created_at: new Date(menu.created_at),
          updated_at: new Date(menu.updated_at)
        }));
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading navigation menus:', error);
        this.errorMessage = 'Failed to load navigation menus. Please try again.';
        this.notificationService.error('Error', 'Failed to load navigation menus');
        this.loadingService.hide();
      }
    });
  }

  loadParentMenus(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      type: 'PARENT'
    };

    this.crudService.getNavigationMenus(params).subscribe({
      next: (response: any) => {
        this.parentNavigationMenus = response.data.map((menu: any) => ({
          ...menu,
          created_at: new Date(menu.created_at),
          updated_at: new Date(menu.updated_at)
        }));
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading navigation menus:', error);
        this.errorMessage = 'Failed to load navigation menus. Please try again.';
        this.notificationService.error('Error', 'Failed to load navigation menus');
        this.loadingService.hide();
      }
    });
  }

  loadAllNavigationMenus(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadingService.show();
      this.errorMessage = '';
      this.crudService.getNavigationMenus({}).subscribe({
        next: (response: any) => {
          this.allNavigationMenus = response.data.map((menu: any) => ({
            ...menu,
            created_at: new Date(menu.created_at),
            updated_at: new Date(menu.updated_at)
          }));
          this.loadingService.hide();
          resolve();
        },
        error: (error) => {
          console.error('Error loading all navigation menus:', error);
          this.errorMessage = 'Failed to load navigation menus. Please try again.';
          this.notificationService.error('Error', 'Failed to load navigation menus');
          this.loadingService.hide();
          reject(error);
        }
      });
    });
  }

  filterMenus(): void {
    this.loadNavigationMenus();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.codeFilter = '';
    this.statusFilter = 'all';
    this.typeFilter = 'all';
    this.typeFilter = 'all';
    this.currentPage = 1; // Reset to first page
    this.loadNavigationMenus();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadNavigationMenus();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1; // Reset to first page
    this.loadNavigationMenus();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadNavigationMenus();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectMenu(menu: NavigationMenu): void {
    this.selectedMenu = menu;
    this.showViewModal = true;
  }

  async showMenuForm(menu?: NavigationMenu): Promise<void> {
    this.showAddForm = true;
    this.editingMenu = menu || null;

    // Load all menus for auto-generation
    try {
      await this.loadAllNavigationMenus();
    } catch (error) {
      // Handle error if needed
    }

    if (menu) {
      // Editing existing menu
      this.menuForm = { ...menu };
    } else {
      // Adding new menu
      this.menuForm = {
        id: 0,
        name: '',
        parent_id: '',
        path: '',
        icon: '',
        is_active: true,
        display_order: 1, // Default to 1, will be updated when parent changes
        type: 'ACTION',
        menu_id: this.generateNextMenuId(), // Generate next menu_id
        created_at: new Date(),
        updated_at: new Date(),
        created_by: '',
        updated_by: ''
      };
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.menuForm = {
      id: 0,
      name: '',
      parent_id: '',
      path: '',
      icon: '',
      is_active: true,
      display_order: 0,
      type: 'ACTION',
      menu_id: '',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: '',
      updated_by: ''
    };
    this.editingMenu = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedMenu = null;
  }

  onSubmitForm(): void {
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';

    const isUpdate = !!this.editingMenu;

    // Validate all fields
    this.validateName();
    this.validateMenuId();
    this.validatePath();

    // Check if there are any errors
    const hasErrors = Object.keys(this.fieldErrors).length > 0;

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
    const validation = this.validationService.required(this.menuForm.name, 'Menu Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateMenuId(): void {
    const validation = this.validationService.required(this.menuForm.menu_id, 'Menu ID');
    if (!validation.isValid) {
      this.fieldErrors['menu_id'] = validation.message!;
    } else {
      delete this.fieldErrors['menu_id'];
    }
  }

  validatePath(): void {
    // Path is optional for parent menus
    if (this.menuForm.type === 'ACTION' && !this.menuForm.path?.trim()) {
      this.fieldErrors['path'] = 'Path is required for action menus';
    } else {
      delete this.fieldErrors['path'];
    }
  }

  onTypeChange(): void {
    if (this.menuForm.type === 'ACTION') {
      this.menuForm.parent_id = '';
    }
  }

  generateNextMenuId(): string {
    if (this.allNavigationMenus.length === 0) {
      return 'nav-menu-001';
    }

    // Extract numbers from menu_id (e.g., "nav-menu-020" -> 20)
    const numbers = this.allNavigationMenus
      .map(menu => {
        const match = menu.menu_id.match(/nav-menu-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    return `nav-menu-${nextNumber.toString().padStart(3, '0')}`;
  }

  getNextDisplayOrder(parentId: string): number {
    if (!parentId) {
      return 1;
    }

    const siblings = this.allNavigationMenus.filter(menu => menu.parent_id === parentId);
    if (siblings.length === 0) {
      return 1;
    }

    const maxOrder = Math.max(...siblings.map(menu => menu.display_order));
    return maxOrder + 1;
  }

  onParentChange(): void {
    this.menuForm.display_order = this.getNextDisplayOrder(this.menuForm.parent_id || '');
  }

  private onSaveForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const menuRequest = {
      name: this.menuForm.name,
      parent_id: this.menuForm.parent_id || null,
      path: this.menuForm.path,
      icon: this.menuForm.icon,
      is_active: this.menuForm.is_active,
      display_order: this.menuForm.display_order,
      type: this.menuForm.type,
      menu_id: this.menuForm.menu_id,
      created_at: currentTime,
      updated_at: currentTime,
      created_by: this.authService.getCurrentUser()?.id || 0
    };

    // Create new menu
    this.crudService.createNavigationMenu(menuRequest).subscribe({
      next: (response) => {
        console.log('Menu created successfully:', response);
        this.notificationService.success('Menu Created', 'The menu has been successfully created.');
        this.resetForm();
        this.loadNavigationMenus(); // Reload menus
      },
      error: (error) => {
        console.error('Error creating menu:', error);
        this.notificationService.error('Creation Failed', 'Failed to create menu. Please try again.');
        this.errorMessage = 'Failed to create menu. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private onUpdateForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const menuRequest = {
      name: this.menuForm.name,
      parent_id: this.menuForm.parent_id || null,
      path: this.menuForm.path,
      icon: this.menuForm.icon,
      is_active: this.menuForm.is_active,
      display_order: this.menuForm.display_order,
      type: this.menuForm.type,
      menu_id: this.menuForm.menu_id,
      created_at: this.editingMenu!.created_at,
      updated_at: currentTime,
      created_by: this.editingMenu!.created_by,
      updated_by: this.authService.getCurrentUser()?.id || 0
    };

    // Update existing menu
    this.crudService.updateNavigationMenu(this.editingMenu!.id, menuRequest).subscribe({
      next: (response) => {
        console.log('Menu updated successfully:', response);
        this.notificationService.success('Menu Updated', 'The menu has been successfully updated.');
        this.resetForm();
        this.loadNavigationMenus(); // Reload menus
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating menu:', error);
        this.notificationService.error('Update Failed', 'Failed to update menu. Please try again.');
        this.errorMessage = 'Failed to update menu. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.menuForm = {
      id: 0,
      name: '',
      parent_id: '',
      path: '',
      icon: '',
      is_active: true,
      display_order: 0,
      type: 'ACTION',
      menu_id: '',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 0,
      updated_by: 0
    };
    this.editingMenu = null;
  }

  async deleteMenu(menu: NavigationMenu): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${menu.name}"? This action cannot be undone.`,
      'Delete Menu',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteNavigationMenu(menu.id).subscribe({
        next: () => {
          console.log('Menu deleted successfully:', menu.id);
          if (this.selectedMenu?.id === menu.id) {
            this.selectedMenu = null;
          }
          this.loadNavigationMenus(); // Reload menus from server to get updated pagination
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting menu:', error);
          this.errorMessage = 'Failed to delete menu. Please try again.';
          this.loadingService.hide();
        }
      });
    }
  }

  updateMenuStatus(menu: NavigationMenu, newStatus: boolean): void {
    this.loadingService.show();
    const updatedMenu = { ...menu, is_active: newStatus, updated_at: new Date() };

    this.crudService.updateNavigationMenu(menu.id, updatedMenu).subscribe({
      next: (response) => {
        console.log('Menu status updated successfully:', response);
        menu.is_active = newStatus;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating menu status:', error);
        this.errorMessage = 'Failed to update menu status. Please try again.';
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

  getTypeText(type: string): string {
    return type === 'PARENT' ? 'Parent Menu' : 'Action Menu';
  }

  getParentName(parentId: any): string {
    if (!parentId) return 'Root';
    const parent = this.parentNavigationMenus.find(p => p.menu_id === parentId);
    return parent ? parent.name : 'Unknown';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  reloadComponent(): void {
    // Reset all component state
    this.navigationMenus = [];
    this.selectedMenu = null;
    this.editingMenu = null;
    this.searchTerm = '';
    this.codeFilter = '';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.showViewModal = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    // Reset menu form
    this.menuForm = {
      id: 0,
      name: '',
      parent_id: '',
      path: '',
      icon: '',
      is_active: true,
      display_order: 0,
      type: 'ACTION',
      menu_id: '',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: '',
      updated_by: ''
    };

    // Reload data
    this.loadNavigationMenus();
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.codeFilter?.trim() || this.statusFilter !== 'all' || this.typeFilter !== 'all');
  }
}
