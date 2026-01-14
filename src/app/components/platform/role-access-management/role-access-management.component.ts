import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { MenuAccessPermission } from '../../../services/mock-data.service';

export interface Menu {
  id: number;
  name: string;
  path?: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-role-access-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-access-management.component.html',
  styleUrl: './role-access-management.component.css'
})
export class RoleAccessManagementComponent implements OnInit {
  permissions: MenuAccessPermission[] = [];
  menus: Menu[] = [];
  roles: Role[] = [];
  selectedPermission: MenuAccessPermission | null = null;
  editingPermission: MenuAccessPermission | null = null;
  showViewModal = false;
  searchTerm = '';
  menuFilter = '';
  roleFilter = '';
  permissionIdFilter = '';
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

  permissionForm: MenuAccessPermission = {
    id: 0,
    menu_id: 0,
    role_id: 0,
    can_view: false,
    can_edit: false,
    can_create: false,
    can_delete: false,
    permission_id: '',
    created_at: new Date(),
    updated_at: new Date(),
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
    // Check if user has permission to manage permissions
    if (!this.canManagePermissions()) {
      this.notificationService.error('Access Denied', 'You do not have permission to manage role access permissions.');
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadMenus();
    this.loadRoles();
    this.loadPermissions();
  }

  loadMenus(): void {
    // Load menus for dropdown - assuming we have a simple endpoint
    this.crudService.getNavigationMenus().subscribe({
      next: (response: any) => {
        const allMenus = response.data || response;
        // Filter menus to include only those with type 'ACTION'
        this.menus = allMenus.filter((menu: any) => menu.type === 'ACTION');
      },
      error: (error) => {
        console.error('Error loading menus:', error);
      }
    });
  }

  loadRoles(): void {
    // Load roles for dropdown - assuming we have a simple endpoint
    this.crudService.getUserRoles().subscribe({
      next: (response: any) => {
        this.roles = response.data || response;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  loadPermissions(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    if (this.menuFilter) {
      params.menuId = this.menuFilter;
    }

    if (this.roleFilter) {
      params.roleId = this.roleFilter;
    }

    if (this.permissionIdFilter && this.permissionIdFilter.trim()) {
      params.permissionId = this.permissionIdFilter.trim();
    }

    this.crudService.getMenuAccessPermissions(params).subscribe({
      next: (response: any) => {
        this.permissions = response.data || [];
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || this.permissions.length;

        // Enrich permissions with menu and role names
        this.enrichPermissionsWithNames();

        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.errorMessage = 'Failed to load permissions. Please try again.';
        this.notificationService.error('Error', 'Failed to load permissions');
        this.loadingService.hide();
      }
    });
  }

  private enrichPermissionsWithNames(): void {
    this.permissions.forEach(permission => {
      const menu = this.menus.find(m => m.id === permission.menu_id);
      const role = this.roles.find(r => r.id === permission.role_id);
      permission.menu_name = menu?.name || `Menu ${permission.menu_id}`;
      permission.role_name = role?.name || `Role ${permission.role_id}`;
    });
  }

  filterPermissions(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.loadPermissions();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.menuFilter = '';
    this.roleFilter = '';
    this.permissionIdFilter = '';
    this.currentPage = 1;
    this.loadPermissions();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPermissions();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1;
    this.loadPermissions();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadPermissions();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectPermission(permission: MenuAccessPermission): void {
    this.selectedPermission = permission;
  }

  openViewModal(permission: MenuAccessPermission): void {
    this.selectedPermission = permission;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedPermission = null;
  }

  showPermissionForm(permission?: MenuAccessPermission): void {
    this.showAddForm = true;
    this.editingPermission = permission || null;
    if (permission) {
      // Editing existing permission
      this.permissionForm = { ...permission };
    } else {
      // Adding new permission
      this.permissionForm = {
        id: 0,
        menu_id: 0,
        role_id: 0,
        can_view: false,
        can_edit: false,
        can_create: false,
        can_delete: false,
        permission_id: '',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 0,
        updated_by: 0
      };
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.permissionForm = {
      id: 0,
      menu_id: 0,
      role_id: 0,
      can_view: false,
      can_edit: false,
      can_create: false,
      can_delete: false,
      permission_id: '',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 0,
      updated_by: 0
    };
    this.editingPermission = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitForm(): void {
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';

    const isUpdate = !!this.editingPermission;
    let hasErrors = false;

    // Validate all fields
    this.validateMenuId();
    this.validateRoleId();
    this.validateAtLeastOnePermission();
    if (!isUpdate) {
      this.validateDuplicateCombination();
    }

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
  validateMenuId(): void {
    if (!this.permissionForm.menu_id || this.permissionForm.menu_id === 0) {
      this.fieldErrors['menu_id'] = 'Please select a menu';
    } else {
      delete this.fieldErrors['menu_id'];
    }
  }

  validateRoleId(): void {
    if (!this.permissionForm.role_id || this.permissionForm.role_id === 0) {
      this.fieldErrors['role_id'] = 'Please select a role';
    } else {
      delete this.fieldErrors['role_id'];
    }
  }

  validateAtLeastOnePermission(): void {
    const hasPermission = this.permissionForm.can_view || this.permissionForm.can_create ||
                         this.permissionForm.can_edit || this.permissionForm.can_delete;
    if (!hasPermission) {
      this.fieldErrors['permissions'] = 'Please select at least one permission';
    } else {
      delete this.fieldErrors['permissions'];
    }
  }

  validateDuplicateCombination(): void {
    const existingPermission = this.permissions.find(p =>
      p.menu_id === this.permissionForm.menu_id && p.role_id === this.permissionForm.role_id
    );
    if (existingPermission) {
      this.fieldErrors['duplicate'] = 'A permission for this menu and role combination already exists';
    } else {
      delete this.fieldErrors['duplicate'];
    }
  }

  private onSaveForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const permissionRequest = {
      menu_id: this.permissionForm.menu_id,
      role_id: this.permissionForm.role_id,
      can_view: this.permissionForm.can_view,
      can_edit: this.permissionForm.can_edit,
      can_create: this.permissionForm.can_create,
      can_delete: this.permissionForm.can_delete,
      permission_id: this.permissionForm.permission_id || null,
      created_at: currentTime,
      updated_at: currentTime,
      created_by: this.authService.getCurrentUser()?.id || 'system'
    };

    this.crudService.createMenuAccessPermission(permissionRequest).subscribe({
      next: (response) => {
        console.log('Permission created successfully:', response);
        this.notificationService.success('Permission Created', 'The permission has been successfully created.');
        this.resetForm();
        this.loadPermissions();
      },
      error: (error) => {
        console.error('Error creating permission:', error);
        this.notificationService.error('Creation Failed', 'Failed to create permission. Please try again.');
        this.errorMessage = 'Failed to create permission. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private onUpdateForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const permissionRequest = {
      menu_id: this.permissionForm.menu_id,
      role_id: this.permissionForm.role_id,
      can_view: this.permissionForm.can_view,
      can_edit: this.permissionForm.can_edit,
      can_create: this.permissionForm.can_create,
      can_delete: this.permissionForm.can_delete,
      permission_id: this.permissionForm.permission_id || null,
      created_at: this.editingPermission!.created_at,
      updated_at: currentTime,
      created_by: this.editingPermission!.created_by,
      updated_by: this.authService.getCurrentUser()?.id || 'system'
    };

    this.crudService.updateMenuAccessPermission(this.editingPermission!.id, permissionRequest).subscribe({
      next: (response) => {
        console.log('Permission updated successfully:', response);
        this.notificationService.success('Permission Updated', 'The permission has been successfully updated.');
        this.resetForm();
        this.loadPermissions();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating permission:', error);
        this.notificationService.error('Update Failed', 'Failed to update permission. Please try again.');
        this.errorMessage = 'Failed to update permission. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.permissionForm = {
      id: 0,
      menu_id: 0,
      role_id: 0,
      can_view: false,
      can_edit: false,
      can_create: false,
      can_delete: false,
      permission_id: '',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 0,
      updated_by: 0
    };
    this.editingPermission = null;
  }

  async deletePermission(permission: MenuAccessPermission): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete the permission for "${permission.menu_name}" and "${permission.role_name}"? This action cannot be undone.`,
      'Delete Permission',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteMenuAccessPermission(permission.id).subscribe({
        next: () => {
          console.log('Permission deleted successfully:', permission.id);
          if (this.selectedPermission?.id === permission.id) {
            this.selectedPermission = null;
          }
          this.loadPermissions();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting permission:', error);
          this.errorMessage = 'Failed to delete permission. Please try again.';
          this.loadingService.hide();
        }
      });
    }
  }

  getMenuName(menuId: number): string {
    const menu = this.menus.find(m => m.id === menuId);
    return menu?.name || `Menu ${menuId}`;
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role?.name || `Role ${roleId}`;
  }

  formatDate(date: Date | string): string {
    // Handle ISO date strings by converting them to Date objects
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  reloadComponent(): void {
    // Reset all component state
    this.permissions = [];
    this.selectedPermission = null;
    this.editingPermission = null;
    this.searchTerm = '';
    this.menuFilter = '';
    this.roleFilter = '';
    this.permissionIdFilter = '';
    this.showAddForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    // Reset form
    this.permissionForm = {
      id: 0,
      menu_id: 0,
      role_id: 0,
      can_view: false,
      can_edit: false,
      can_create: false,
      can_delete: false,
      permission_id: '',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 0,
      updated_by: 0
    };

    // Reload data
    this.loadMenus();
    this.loadRoles();
    this.loadPermissions();
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.menuFilter || this.roleFilter || this.permissionIdFilter?.trim());
  }

  // Role-based access control
  canManagePermissions(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // Check if user has admin role or specific permission to manage permissions
    // For now, assume only logged-in users can access (further checks can be added)
    return true; // TODO: Implement proper role-based permission checking
  }

  // Navigation system integration methods
  getPermissionsByRole(roleId: number): MenuAccessPermission[] {
    return this.permissions.filter(p => p.role_id === roleId);
  }

  checkSpecificPermission(roleId: number, menuId: number, permission: 'view' | 'create' | 'edit' | 'delete'): boolean {
    const permissionRecord = this.permissions.find(p => p.role_id === roleId && p.menu_id === menuId);
    if (!permissionRecord) return false;

    switch (permission) {
      case 'view': return permissionRecord.can_view;
      case 'create': return permissionRecord.can_create;
      case 'edit': return permissionRecord.can_edit;
      case 'delete': return permissionRecord.can_delete;
      default: return false;
    }
  }
}