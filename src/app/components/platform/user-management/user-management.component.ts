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
    return this.mockDataService.getRoleColor(role);
  }

  getRoleDisplayName(role: string): string {
    return this.mockDataService.getRoleDisplayName(role);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getRolePermissions(role: string): string {
    return this.mockDataService.getRolePermissions(role);
  }
}
