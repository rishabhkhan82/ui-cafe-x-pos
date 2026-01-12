import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { Role } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css'
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  selectedRole: Role | null = null;
  editingRole: Role | null = null;
  searchTerm = '';
  codeFilter = '';
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

  roleForm: Role = {
    id: 0,
    name: '',
    code: '',
    role_id: '',
    description: '',
    is_active: true,
    is_system_role: false,
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
    this.loadRoles();
  }

  loadRoles(): void {
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
      params.code = this.codeFilter.trim();
    }

    if (this.statusFilter !== 'all') {
      params.isActive = this.statusFilter === 'active' ? 'true' : 'false';
    }

    this.crudService.getUserRoles(params).subscribe({
      next: (response: any) => {
        this.roles = response.data;
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.errorMessage = 'Failed to load roles. Please try again.';
        this.notificationService.error('Error', 'Failed to load roles');
        this.loadingService.hide();
      }
    });
  }

  filterRoles(): void {
    this.loadRoles();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.codeFilter = '';
    this.statusFilter = 'all';
    this.currentPage = 1; // Reset to first page
    this.loadRoles();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRoles();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1; // Reset to first page
    this.loadRoles();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadRoles();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectRole(role: Role): void {
    this.selectedRole = role;
  }

  showRoleForm(role?: Role): void {
    this.showAddForm = true;
    this.editingRole = role || null;
    if (role) {
      // Editing existing role
      this.roleForm = { ...role };
    } else {
      // Adding new role
      this.roleForm = {
        id: 0,
        name: '',
        code: '',
        role_id: '',
        description: '',
        is_active: true,
        is_system_role: false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: '',
        updated_by: ''
      };
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.roleForm = {
      id: 0,
      name: '',
      code: '',
      role_id: '',
      description: '',
      is_active: true,
      is_system_role: false,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: '',
      updated_by: ''
    };
    this.editingRole = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitForm(): void {
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';

    const isUpdate = !!this.editingRole;
    let hasErrors = false;

    // Validate all fields
    this.validateName();
    this.validateCode();
    this.validateRoleId();
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
    const validation = this.validationService.name(this.roleForm.name, 'Role Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateCode(): void {
    const validation = this.validationService.required(this.roleForm.code, 'Role Code');
    if (!validation.isValid) {
      this.fieldErrors['code'] = validation.message!;
    } else {
      // Additional validation for code format (uppercase letters and underscores only)
      const codePattern = /^[A-Z_]+$/;
      if (!codePattern.test(this.roleForm.code)) {
        this.fieldErrors['code'] = 'Role code must contain only uppercase letters and underscores';
      } else {
        delete this.fieldErrors['code'];
      }
    }
  }

  validateRoleId(): void {
    const validation = this.validationService.required(this.roleForm.role_id, 'Role ID');
    if (!validation.isValid) {
      this.fieldErrors['role_id'] = validation.message!;
    } else {
      delete this.fieldErrors['role_id'];
    }
  }

  validateDescription(): void {
    const validation = this.validationService.required(this.roleForm.description, 'Description');
    if (!validation.isValid) {
      this.fieldErrors['description'] = validation.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  private onSaveForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const roleRequest = {
      name: this.roleForm.name,
      code: this.roleForm.code,
      role_id: this.roleForm.role_id,
      description: this.roleForm.description,
      is_active: this.roleForm.is_active,
      is_system_role: this.roleForm.is_system_role,
      created_at: currentTime,
      updated_at: currentTime,
      created_by: this.authService.getCurrentUser()?.id || 'system'
    };

    // Create new role
    this.crudService.createUserRole(roleRequest).subscribe({
      next: (response) => {
        console.log('Role created successfully:', response);
        this.notificationService.success('Role Created', 'The role has been successfully created.');
        this.resetForm();
        this.loadRoles(); // Reload roles
      },
      error: (error) => {
        console.error('Error creating role:', error);
        this.notificationService.error('Creation Failed', 'Failed to create role. Please try again.');
        this.errorMessage = 'Failed to create role. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private onUpdateForm(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const roleRequest = {
      name: this.roleForm.name,
      code: this.roleForm.code,
      role_id: this.roleForm.role_id,
      description: this.roleForm.description,
      is_active: this.roleForm.is_active,
      is_system_role: this.roleForm.is_system_role,
      created_at: this.editingRole!.created_at,
      updated_at: currentTime,
      created_by: this.editingRole!.created_by,
      updated_by: this.authService.getCurrentUser()?.id || 'system'
    };

    // Update existing role
    this.crudService.updateUserRole(this.editingRole!.id, roleRequest).subscribe({
      next: (response) => {
        console.log('Role updated successfully:', response);
        this.notificationService.success('Role Updated', 'The role has been successfully updated.');
        this.resetForm();
        this.loadRoles(); // Reload roles
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.notificationService.error('Update Failed', 'Failed to update role. Please try again.');
        this.errorMessage = 'Failed to update role. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.roleForm = {
      id: 0,
      name: '',
      code: '',
      role_id: '',
      description: '',
      is_active: true,
      is_system_role: false,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: '',
      updated_by: ''
    };
    this.editingRole = null;
  }

  async deleteRole(role: Role): Promise<void> {
    if (role.is_system_role) {
      this.notificationService.error('Delete Failed', 'Cannot delete system roles');
      return;
    }

    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
      'Delete Role',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteUserRole(role.id).subscribe({
        next: () => {
          console.log('Role deleted successfully:', role.id);
          if (this.selectedRole?.id === role.id) {
            this.selectedRole = null;
          }
          this.loadRoles(); // Reload roles from server to get updated pagination
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.errorMessage = 'Failed to delete role. Please try again.';
          this.loadingService.hide();
        }
      });
    }
  }

  updateRoleStatus(role: Role, newStatus: boolean): void {
    this.loadingService.show();
    const updatedRole = { ...role, is_active: newStatus, updated_at: new Date() };

    this.crudService.updateUserRole(role.id, updatedRole).subscribe({
      next: (response) => {
        console.log('Role status updated successfully:', response);
        role.is_active = newStatus;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating role status:', error);
        this.errorMessage = 'Failed to update role status. Please try again.';
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
    // Reset all component state
    this.roles = [];
    this.selectedRole = null;
    this.editingRole = null;
    this.searchTerm = '';
    this.codeFilter = '';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    // Reset role form
    this.roleForm = {
      id: 0,
      name: '',
      code: '',
      role_id: '',
      description: '',
      is_active: true,
      is_system_role: false,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: '',
      updated_by: ''
    };

    // Reload data
    this.loadRoles();
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.codeFilter?.trim() || this.statusFilter !== 'all');
  }
}
