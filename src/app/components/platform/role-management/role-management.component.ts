import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockDataService, Role } from '../../../services/mock-data.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css'
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  searchTerm = '';
  statusFilter = 'all';
  roleForm: FormGroup;
  isEditing = false;
  editingRoleId: number | null = null;
  showForm = false;
  showViewModal = false;
  selectedRole: Role | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private mockDataService: MockDataService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/)]],
      role_id: ['', [Validators.required]],
      description: ['', [Validators.required]],
      is_active: [true],
      is_system_role: [false]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.mockDataService.getRoles().subscribe(roles => {
      this.roles = roles;
      this.filteredRoles = [...this.roles];
      this.totalItems = this.filteredRoles.length;
    });
  }

  filterRoles(): void {
    this.filteredRoles = this.roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            role.code.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
                            (this.statusFilter === 'active' && role.is_active) ||
                            (this.statusFilter === 'inactive' && !role.is_active);

      return matchesSearch && matchesStatus;
    });

    this.totalItems = this.filteredRoles.length;
    this.currentPage = 1;
  }

  onAddRole(): void {
    this.isEditing = false;
    this.editingRoleId = null;
    this.roleForm.reset({
      is_active: true,
      is_system_role: false
    });
    this.showForm = true;
  }

  onEditRole(role: Role): void {
    this.isEditing = true;
    this.editingRoleId = role.id;
    this.roleForm.patchValue({
      name: role.name,
      code: role.code,
      role_id: role.role_id,
      description: role.description,
      is_active: role.is_active,
      is_system_role: role.is_system_role
    });
    this.showForm = true;
  }

  onDeleteRole(role: Role): void {
    if (role.is_system_role) {
      alert('Cannot delete system roles');
      return;
    }
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.mockDataService.deleteRole(role.id);
    }
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;

      if (this.isEditing && this.editingRoleId) {
        // Update existing role
        const existingRole = this.mockDataService.getRoleById(this.editingRoleId);
        if (existingRole) {
          const updatedRole: Role = {
            ...existingRole,
            ...formValue,
            updated_at: new Date()
          };
          this.mockDataService.updateRole(updatedRole);
        }
      } else {
        // Add new role
        const newRole: Role = {
          id: Math.max(...this.roles.map(r => r.id)) + 1,
          ...formValue,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 'admin' // In real app, get from current user
        };
        this.mockDataService.addRole(newRole);
      }

      this.showForm = false;
      this.roleForm.reset();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.roleForm.controls).forEach(key => {
        this.roleForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.showForm = false;
    this.roleForm.reset();
    this.isEditing = false;
    this.editingRoleId = null;
  }

  viewRole(role: Role): void {
    this.selectedRole = role;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedRole = null;
  }

  toggleRoleStatus(role: Role): void {
    if (role.is_system_role) {
      alert('Cannot deactivate system roles');
      return;
    }
    this.mockDataService.toggleRoleStatus(role.id);
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  // Pagination methods
  get paginatedResults(): Role[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoles.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
