import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, User } from '../../../services/mock-data.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  searchTerm = '';
  roleFilter = 'all';
  statusFilter = 'all';
  showAddForm = false;

  newUser: Partial<User> = {
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
  };

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.mockDataService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = [...this.users];
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.phone.includes(this.searchTerm);

      const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter;

      // For now, assume all users are active
      const matchesStatus = this.statusFilter === 'all' || this.statusFilter === 'active';

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  selectUser(user: User): void {
    this.selectedUser = user;
  }

  showAddUserForm(): void {
    this.showAddForm = true;
    this.newUser = {
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
    };
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newUser = {};
  }

  addUser(): void {
    if (this.newUser.name && this.newUser.email && this.newUser.phone) {
      // In a real app, this would call an API to create the user
      console.log('Adding new user:', this.newUser);
      this.showAddForm = false;
      this.newUser = {};
      // Reload users
      this.loadUsers();
    }
  }

  updateUserRole(user: User, newRole: User['role']): void {
    user.role = newRole;
    // In a real app, this would call an API to update the user role
    console.log('Updated user role:', user.id, newRole);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      // In a real app, this would call an API to delete the user
      console.log('Deleting user:', user.id);
      this.users = this.users.filter(u => u.id !== user.id);
      this.filterUsers();
      if (this.selectedUser?.id === user.id) {
        this.selectedUser = null;
      }
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'platform_owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'restaurant_owner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'restaurant_manager': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cashier': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'kitchen_manager': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'waiter': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'customer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'platform_owner': 'Platform Owner',
      'restaurant_owner': 'Restaurant Owner',
      'restaurant_manager': 'Restaurant Manager',
      'cashier': 'Cashier',
      'kitchen_manager': 'Kitchen Manager',
      'waiter': 'Waiter',
      'customer': 'Customer'
    };
    return roleNames[role] || role;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getRolePermissions(role: string): string {
    const permissions: { [key: string]: string } = {
      'platform_owner': 'full platform administration',
      'restaurant_owner': 'restaurant management and analytics',
      'restaurant_manager': 'staff supervision and operations',
      'cashier': 'order processing and payments',
      'kitchen_manager': 'menu management and kitchen operations',
      'waiter': 'table service and customer interaction',
      'customer': 'ordering and account management'
    };
    return permissions[role] || 'basic user access';
  }
}
