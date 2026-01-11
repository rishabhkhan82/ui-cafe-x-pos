import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { MockDataService, User, Restaurant } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  editingUser: User | null = null;
  searchTerm = '';
  restaurantFilter = 'all';
  roleFilter = 'all';
  statusFilter = 'all';
  showAddForm = false;
  restaurants: Restaurant[] = [];
  errorMessage = '';
  selectedFile: File | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  // Field validation errors
  fieldErrors: { [key: string]: string } = {};

  userForm: User = {
    id: '',
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    restaurant_id: '',
    member_since: undefined,
    created_at: undefined,
    updated_at: undefined,
    is_active: 'Y' as any,
    last_login: undefined,
    created_by: ''
  };

  // Getter and setter for is_active to handle Y/N conversion
  get userFormActive(): boolean {
    return this.userForm.is_active === 'Y';
  }

  set userFormActive(value: boolean) {
    this.userForm.is_active = value ? 'Y' : 'N';
  }

  constructor(
    private router: Router,
    private crudService: CrudService,
    private loadingService: LoadingService,
    private mockDataService: MockDataService,
    private authService: AuthService,
    private confirmationService: ConfirmationDialogService,
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRestaurants();
  }

  loadUsers(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.restaurantFilter !== 'all') {
      params.restaurantId = this.restaurantFilter;
    }

    if (this.roleFilter !== 'all') {
      params.role = this.roleFilter;
    }

    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    this.crudService.getUsers(params).subscribe({
      next: (response: any) => {
        this.users = this.mapApiUsersToUsers(response.data);
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private mapApiUsersToUsers(apiUsers: any[]): User[] {
    return apiUsers.map(apiUser => ({
      id: apiUser.id?.toString() || '',
      username: apiUser.username || '',
      password: '', // API doesn't return password
      name: apiUser.name || '',
      email: apiUser.email || '',
      phone: apiUser.phone || '',
      role: apiUser.role || 'customer',
      avatar: apiUser.avatar || '',
      restaurant_id: apiUser.restaurant_id || '',
      member_since: apiUser.member_since ? new Date(apiUser.member_since) : undefined,
      created_at: apiUser.created_at ? new Date(apiUser.created_at) : undefined,
      updated_at: apiUser.updated_at ? new Date(apiUser.updated_at) : undefined,
      is_active: apiUser.is_active || 'Y',
      last_login: apiUser.last_login ? new Date(apiUser.last_login) : undefined,
      created_by: apiUser.created_by?.toString() || ''
    }));
  }

  loadRestaurants(): void {
    this.mockDataService.getRestaurants().subscribe(restaurants => {
      this.restaurants = restaurants;
    });
  }

  filterUsers(): void {
    this.currentPage = 1; // Reset to first page when filters change
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.restaurantFilter = 'all';
    this.roleFilter = 'all';
    this.statusFilter = 'all';
    this.currentPage = 1; // Reset to first page
    this.loadUsers();
  }



  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1; // Reset to first page
    this.loadUsers();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadUsers();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectUser(user: User): void {
    this.selectedUser = user;
  }

  showUserForm(user?: User): void {
    this.showAddForm = true;
    this.editingUser = user || null;
    if (user) {
      // Editing existing user
      this.userForm = {
        ...user,
        password: '' // Don't pre-fill password for security
      };
      this.userFormActive = user.is_active === 'Y';
    } else {
      // Adding new user
      this.userForm = {
        id: '',
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
        restaurant_id: '',
        member_since: undefined,
        created_at: undefined,
        updated_at: undefined,
        is_active: 'Y' as any,
        last_login: undefined,
        created_by: ''
      };
      this.userFormActive = true;
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.userForm = {
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      restaurant_id: '',
      member_since: undefined,
      created_at: undefined,
      updated_at: undefined,
      is_active: 'Y' as any,
      last_login: undefined,
      created_by: ''
    };
    this.editingUser = null;
    this.selectedFile = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitForm(): void {
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';

    const isUpdate = !!this.editingUser;
    let hasErrors = false;

    // Validate all fields
    this.validateName();
    this.validateUsername();
    this.validatePassword(isUpdate);
    this.validateEmail();
    this.validatePhone();
    this.validateRole();
    this.validateRestaurant();

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
    const validation = this.validationService.name(this.userForm.name);
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateUsername(): void {
    const validation = this.validationService.required(this.userForm.username, 'Username');
    if (!validation.isValid) {
      this.fieldErrors['username'] = validation.message!;
    } else {
      delete this.fieldErrors['username'];
    }
  }

  validatePassword(isUpdate: boolean = false): void {
    if (!isUpdate || (this.userForm.password && this.userForm.password.trim() !== '')) {
      const validation = this.validationService.password(this.userForm.password);
      if (!validation.isValid) {
        this.fieldErrors['password'] = validation.message!;
      } else {
        delete this.fieldErrors['password'];
      }
    } else {
      delete this.fieldErrors['password'];
    }
  }

  validateEmail(): void {
    if (this.userForm.email && this.userForm.email.trim() !== '') {
      const validation = this.validationService.email(this.userForm.email);
      if (!validation.isValid) {
        this.fieldErrors['email'] = validation.message!;
      } else {
        delete this.fieldErrors['email'];
      }
    } else {
      delete this.fieldErrors['email'];
    }
  }

  validatePhone(): void {
    if (this.userForm.phone && this.userForm.phone.trim() !== '') {
      const validation = this.validationService.phone(this.userForm.phone);
      if (!validation.isValid) {
        this.fieldErrors['phone'] = validation.message!;
      } else {
        delete this.fieldErrors['phone'];
      }
    } else {
      delete this.fieldErrors['phone'];
    }
  }

  validateRole(): void {
    const validation = this.validationService.required(this.userForm.role, 'User Role');
    if (!validation.isValid) {
      this.fieldErrors['role'] = validation.message!;
    } else {
      delete this.fieldErrors['role'];
      // Clear restaurant selection when platform_owner is selected
      if (this.userForm.role === 'platform_owner') {
        this.userForm.restaurant_id = '';
      }
      // Re-validate restaurant when role changes
      this.validateRestaurant();
    }
  }

  validateRestaurant(): void {
    if (this.userForm.role !== 'platform_owner') {
      const validation = this.validationService.required(this.userForm.restaurant_id, 'Restaurant');
      if (!validation.isValid) {
        this.fieldErrors['restaurant_id'] = validation.message!;
      } else {
        delete this.fieldErrors['restaurant_id'];
      }
    } else {
      delete this.fieldErrors['restaurant_id'];
    }
  }

  private async onSaveForm(): Promise<void> {
    this.loadingService.show();

    try {
      let avatarUrl = this.userForm.avatar;

      // Upload avatar if a file was selected
      if (this.selectedFile) {
        const uploadResult = await this.fileUploadService.uploadFile(this.selectedFile, 'profile').toPromise();
        avatarUrl = uploadResult!.fileUrl;
        this.selectedFile = null; // Clear the selected file after upload
      }

      const currentTime = new Date();
      const userRequest = {
        username: this.userForm.username,
        password: this.userForm.password || undefined, // Only send password if provided
        name: this.userForm.name,
        email: this.userForm.email,
        phone: this.userForm.phone,
        role: this.userForm.role,
        avatar: avatarUrl,
        restaurantId: this.userForm.restaurant_id,
        is_active: this.userForm.is_active,
        member_since: currentTime,
        created_at: currentTime,
        updated_at: undefined,
        last_login: undefined,
        created_by: this.authService.getCurrentUser()?.id // Assuming platform owner ID
      };

      // Create new user
      this.crudService.createUser(userRequest).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.notificationService.success('User Created', 'The user has been successfully created.');
          this.resetForm();
          this.loadUsers(); // Reload users
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.notificationService.error('Creation Failed', 'Failed to create user. Please try again.');
          this.errorMessage = 'Failed to create user. Please try again.';
          this.loadingService.hide();
        }
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      this.notificationService.error('Upload Failed', 'Failed to upload avatar. Please try again.');
      this.errorMessage = 'Failed to upload avatar. Please try again.';
      this.loadingService.hide();
    }
  }

  private async onUpdateForm(): Promise<void> {
    this.loadingService.show();

    try {
      let avatarUrl = this.userForm.avatar;

      const currentTime = new Date();
      const userRequest = {
        username: this.userForm.username,
        password: this.userForm.password || undefined, // Only send password if provided
        name: this.userForm.name,
        email: this.userForm.email,
        phone: this.userForm.phone,
        role: this.userForm.role,
        avatar: avatarUrl,
        restaurantId: this.userForm.restaurant_id,
        is_active: this.userForm.is_active,
        member_since: this.editingUser!.member_since,
        created_at: this.editingUser!.created_at,
        updated_at: currentTime,
        last_login: this.editingUser!.last_login,
        created_by: this.editingUser!.created_by
      };

      // Update existing user
      this.crudService.updateUser(this.editingUser!.id, userRequest).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.notificationService.success('User Updated', 'The user has been successfully updated.');
          this.resetForm();
          this.loadUsers(); // Reload users
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.notificationService.error('Update Failed', 'Failed to update user. Please try again.');
          this.errorMessage = 'Failed to update user. Please try again.';
          this.loadingService.hide();
        }
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      this.errorMessage = 'Failed to upload avatar. Please try again.';
      this.loadingService.hide();
    }
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.userForm = {
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      restaurant_id: '',
      member_since: undefined,
      created_at: undefined,
      updated_at: undefined,
      is_active: 'Y' as any,
      last_login: undefined,
      created_by: ''
    };
    this.editingUser = null;
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      const validation = this.fileUploadService.validateFileForCategory(file, 'profile');
      if (!validation.isValid) {
        this.notificationService.error('Invalid File', validation.message || 'Invalid file selected');
        this.selectedFile = null;
        this.userForm.avatar = "";
        return;
      }

      // Clear any previous error
      this.errorMessage = '';

      // Store the file for later upload
      this.selectedFile = file;

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userForm.avatar = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  updateUserRole(user: User, newRole: User['role']): void {
    this.loadingService.show();
    this.errorMessage = '';

    const currentTime = new Date();
    const userRequest = {
      username: user.username,
      password: user.password, // Note: In real app, password shouldn't be sent unless changing
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: newRole,
      avatar: user.avatar,
      restaurantId: user.restaurant_id,
      is_active: user.is_active,
      member_since: user.member_since,
      created_at: user.created_at,
      updated_at: currentTime,
      last_login: user.last_login,
      created_by: user.created_by
    };

    this.crudService.updateUser(user.id, userRequest).subscribe({
      next: (response) => {
        console.log('User role updated successfully:', response);
        user.role = newRole;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.errorMessage = 'Failed to update user role. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      'Delete User',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteUser(user.id).subscribe({
        next: () => {
          console.log('User deleted successfully:', user.id);
          if (this.selectedUser?.id === user.id) {
            this.selectedUser = null;
          }
          this.loadUsers(); // Reload users from server to get updated pagination
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.errorMessage = 'Failed to delete user. Please try again.';
          this.loadingService.hide();
        }
      });
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

  reloadComponent(): void {
    // Reset all component state
    this.users = [];
    this.selectedUser = null;
    this.editingUser = null;
    this.searchTerm = '';
    this.restaurantFilter = 'all';
    this.roleFilter = 'all';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.errorMessage = '';
    this.selectedFile = null;
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    // Reset user form
    this.userForm = {
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      restaurant_id: '',
      member_since: undefined,
      created_at: undefined,
      updated_at: undefined,
      is_active: 'Y' as any,
      last_login: undefined,
      created_by: ''
    };

    // Reload data
    this.loadUsers();
    this.loadRestaurants();
  }

  // Helper for template Math operations
  Math = Math;
}
