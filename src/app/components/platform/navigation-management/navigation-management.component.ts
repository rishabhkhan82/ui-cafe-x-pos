import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, NavigationMenu, MenuAccess } from '../../../services/mock-data.service';

@Component({
  selector: 'app-navigation-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navigation-management.component.html',
  styleUrl: './navigation-management.component.css'
})
export class NavigationManagementComponent implements OnInit {
  navigationMenus: NavigationMenu[] = [];
  filteredMenus: NavigationMenu[] = [];
  selectedMenu: NavigationMenu | null = null;
  isEditing = false;
  showAddForm = false;
  showModal = false;

  // Filters
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  selectedParent = '';

  // Available options for filters
  roles = ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'cashier', 'kitchen_manager', 'waiter', 'customer', 'all'];
  statuses = ['active', 'inactive'];
  parentMenus: NavigationMenu[] = [];

  // Current menu for modal
  currentMenu: Partial<NavigationMenu> = {
    rolePermissions: {}
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  newMenu: Partial<NavigationMenu> = {
    name: '',
    rolePermissions: {
      'platform_owner': {
        canView: true,
        canEdit: true,
        canDelete: true,
        canCreate: true,
        allowedRoles: ['platform_owner'],
        permissions: []
      }
    },
    isActive: true,
    order: 0
  };

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadNavigationMenus();
  }

  loadNavigationMenus(): void {
    this.mockDataService.getNavigationMenus().subscribe(menus => {
      this.navigationMenus = menus;
      this.parentMenus = menus.filter(menu => !menu.parentId && menu.type === 'parent');
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.navigationMenus];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(menu =>
        menu.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (menu.path && menu.path.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    // Role filter
    if (this.selectedRole) {
      filtered = filtered.filter(menu => menu.rolePermissions && menu.rolePermissions[this.selectedRole]);
    }

    // Status filter
    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter(menu => menu.isActive === isActive);
    }

    // Parent filter
    if (this.selectedParent) {
      filtered = filtered.filter(menu => menu.parentId === this.selectedParent);
    }

    this.filteredMenus = filtered;
    this.totalPages = Math.ceil(this.filteredMenus.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when filters change
  }

  get paginatedMenus(): NavigationMenu[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredMenus.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedParent = '';
    this.applyFilters();
  }

  selectMenu(menu: NavigationMenu): void {
    this.selectedMenu = menu;
    this.isEditing = false;
  }

  startEditing(menu: NavigationMenu): void {
    this.selectedMenu = { ...menu };
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.selectedMenu = null;
    this.isEditing = false;
  }

  saveMenu(): void {
    if (this.selectedMenu) {
      // In a real app, this would call an API to update the menu
      console.log('Saving menu:', this.selectedMenu);
      this.closeModal();
      this.loadNavigationMenus(); // Refresh the list
    }
  }

  toggleMenuStatus(menu: NavigationMenu): void {
    menu.isActive = !menu.isActive;
    // In a real app, this would call an API to update the menu status
    console.log('Toggled menu status:', menu);
  }

  deleteMenu(menu: NavigationMenu): void {
    if (confirm('Are you sure you want to delete this menu item?')) {
      // In a real app, this would call an API to delete the menu
      console.log('Deleting menu:', menu);
    }
  }

  showAddMenuForm(): void {
    this.showModal = true;
    this.isEditing = false;
    this.currentMenu = {
      name: '',
      rolePermissions: {
        'platform_owner': {
          canView: true,
          canEdit: true,
          canDelete: true,
          canCreate: true,
          allowedRoles: ['platform_owner'],
          permissions: []
        }
      },
      isActive: true,
      order: this.navigationMenus.length,
      type: 'action'
    };
  }

  cancelAdd(): void {
    this.showModal = false;
    this.currentMenu = {};
  }

  addMenu(): void {
    if (this.currentMenu.name) {
      // In a real app, this would call an API to create the menu
      console.log('Adding new menu:', this.currentMenu);
      this.showModal = false;
      this.currentMenu = {};
      this.loadNavigationMenus(); // Refresh the list
    }
  }

  openEditModal(menu: NavigationMenu): void {
    this.selectedMenu = { ...menu };
    this.currentMenu = { ...menu };
    this.isEditing = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMenu = null;
    this.isEditing = false;
    this.currentMenu = {};
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'platform_owner': 'Platform Owner',
      'restaurant_owner': 'Restaurant Owner',
      'restaurant_manager': 'Restaurant Manager',
      'cashier': 'Cashier',
      'kitchen_manager': 'Kitchen Manager',
      'waiter': 'Waiter',
      'customer': 'Customer',
      'all': 'All Roles'
    };
    return roleNames[role] || role;
  }

  getMenuRoles(menu: NavigationMenu): string[] {
    return Object.keys(menu.rolePermissions || {});
  }

  getMenuAccessForRole(menu: NavigationMenu, role: string): MenuAccess | null {
    return menu.rolePermissions?.[role] || null;
  }

  toggleRole(role: string): void {
    if (!this.currentMenu.rolePermissions) {
      this.currentMenu.rolePermissions = {};
    }

    if (this.currentMenu.rolePermissions[role]) {
      // Remove role
      delete this.currentMenu.rolePermissions[role];
    } else {
      // Add role with default permissions
      this.currentMenu.rolePermissions[role] = {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        allowedRoles: [role as any],
        permissions: []
      };
    }
  }

  isRoleSelected(role: string): boolean {
    return !!(this.currentMenu.rolePermissions && this.currentMenu.rolePermissions[role]);
  }

  getSelectedRoles(): string[] {
    return this.currentMenu.rolePermissions ? Object.keys(this.currentMenu.rolePermissions) : [];
  }

  updateRolePermission(role: string, permission: keyof MenuAccess, value: boolean): void {
    if (this.currentMenu.rolePermissions && this.currentMenu.rolePermissions[role]) {
      (this.currentMenu.rolePermissions[role] as any)[permission] = value;
    }
  }

  getParentName(parentId: string): string {
    const parent = this.navigationMenus.find(menu => menu.id === parentId);
    return parent ? parent.name : 'Unknown';
  }
}
