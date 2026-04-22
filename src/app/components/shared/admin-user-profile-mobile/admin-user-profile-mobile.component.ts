import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { MockDataService, User, Restaurant } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-admin-user-profile-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-user-profile-mobile.component.html',
  styleUrl: './admin-user-profile-mobile.component.css'
})
export class AdminUserProfileMobileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  selectedFile: File | null = null;
  restaurants: Restaurant[] = [];
  fieldErrors: { [key: string]: string } = {};

  // Editable form data
  userForm = {
    name: '',
    email: '',
    phone: '',
    avatar: ''
  };

  private crudService = inject(CrudService);
  private loadingService = inject(LoadingService);
  private mockDataService = inject(MockDataService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationDialogService);

  private notificationService = inject(NotificationService);
  private validationService = inject(ValidationService);
  public router = inject(Router);

  ngOnInit(): void {
    this.loadingService.show();
    this.loadUserProfile();
    this.loadRestaurants();
  }

  private loadUserProfile(): void {
    this.loadingService.show();

    // Get current user ID from session storage
    const storedUser = sessionStorage.getItem('currentUser');
    console.log(storedUser);
    if (!storedUser) {
      this.notificationService.error('Error', 'User not logged in');
      this.router.navigate(['/admin/login']);
      return;
    }

    const currentUser = JSON.parse(storedUser);
    const userId : any = currentUser.id;
    console.log(userId);

    // Call API to get user by ID
    this.crudService.getUserById(userId).subscribe({
      next: (response: any) => {
        if (response) {
          this.user = this.mapApiUserToUser(response);
          this.populateForm();
        } else {
          this.notificationService.error('Error', 'User not found');
        }
        this.loadingService.hide();
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
        this.notificationService.error('Error', 'Failed to load user profile');
        this.loadingService.hide();
      }
    });
  }

  private mapApiUserToUser(apiUser: any): User {
    return {
      id: apiUser.id?.toString() || '',
      username: apiUser.username || '',
      password: '', // Don't expose password
      name: apiUser.name || '',
      email: apiUser.email || '',
      phone: apiUser.phone || '',
      role: apiUser.role || 'customer',
      user_type: apiUser.user_type || 'admin',
      avatar: apiUser.avatar || '',
      restaurant_id: apiUser.restaurant_id || '',
      member_since: apiUser.member_since ? new Date(apiUser.member_since) : undefined,
      created_at: apiUser.created_at ? new Date(apiUser.created_at) : undefined,
      updated_at: apiUser.updated_at ? new Date(apiUser.updated_at) : undefined,
      is_active: apiUser.is_active || 'Y',
      last_login: apiUser.last_login ? new Date(apiUser.last_login) : undefined,
      created_by: apiUser.created_by?.toString() || ''
    };
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm = {
        name: this.user.name,
        email: this.user.email || '',
        phone: this.user.phone || '',
        avatar: this.user.avatar || ''
      };
    }
  }

  private loadRestaurants(): void {
    this.mockDataService.getRestaurants().subscribe(restaurants => {
      this.restaurants = restaurants;
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.populateForm(); // Reset form if canceling edit
      this.fieldErrors = {};
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validateFile(file, 'avatar');
      if (!validation.isValid) {
        this.notificationService.error('Invalid File', validation.message || 'Invalid file selected');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userForm.avatar = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  validateForm(): boolean {
    this.fieldErrors = {};

    // Name validation
    const nameValidation = this.validationService.name(this.userForm.name);
    if (!nameValidation.isValid) {
      this.fieldErrors['name'] = nameValidation.message!;
    }

    // Email validation
    if (this.userForm.email) {
      const emailValidation = this.validationService.email(this.userForm.email);
      if (!emailValidation.isValid) {
        this.fieldErrors['email'] = emailValidation.message!;
      }
    }

    // Phone validation
    if (this.userForm.phone) {
      const phoneValidation = this.validationService.phone(this.userForm.phone);
      if (!phoneValidation.isValid) {
        this.fieldErrors['phone'] = phoneValidation.message!;
      }
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  async onSave(): Promise<void> {
    if (!this.validateForm() || !this.user) {
      return;
    }

    this.loadingService.show();

    try {
      let avatarBase64: string | undefined;

      // Convert selected file to base64 if available
      if (this.selectedFile) {
        avatarBase64 = await this.fileToBase64(this.selectedFile);
        this.selectedFile = null;
      }

      // Construct the update payload using the user object data
      const updateData = {
        username: this.user!.username,
        name: this.userForm.name,
        email: this.userForm.email,
        phone: this.userForm.phone,
        role: this.user!.role,
        user_type: this.user!.user_type,
        avatar: avatarBase64 || this.userForm.avatar, // Use base64 if available, else keep existing
        restaurant_id: this.user!.restaurant_id,
        is_active: this.user!.is_active,
        member_since: this.user!.member_since,
        created_at: this.user!.created_at,
        updated_at: new Date(),
        last_login: this.user!.last_login,
        created_by: this.user!.created_by
      };

      this.crudService.updateUser(this.user.id, updateData).subscribe({
        next: (response) => {
          this.notificationService.success('Success', 'Profile updated successfully');
          this.user!.name = this.userForm.name;
          this.user!.email = this.userForm.email || '';
          this.user!.phone = this.userForm.phone || '';
          this.user!.avatar = response.avatar || this.userForm.avatar; // Use updated avatar from response if available
          this.isEditing = false;
          this.loadingService.hide();

          // Update session storage
          const storedUser = sessionStorage.getItem('currentUser');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.name = this.userForm.name;
            parsed.email = this.userForm.email;
            parsed.phone = this.userForm.phone;
            parsed.avatar = this.user!.avatar;
            sessionStorage.setItem('currentUser', JSON.stringify(parsed));
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.notificationService.error('Error', 'Failed to update profile');
          this.loadingService.hide();
        }
      });
    } catch (error) {
      console.error('Error processing avatar:', error);
      this.notificationService.error('Processing Failed', 'Failed to process avatar. Please try again.');
      this.loadingService.hide();
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

  // Helper method to convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Helper method to get full image URL
  getFullImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) {
      // It's a base64 data URL, return as is
      return imagePath;
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // It's already a full URL, return as is
      return imagePath;
    }
    // It's a relative path, concat with baseImgUrl
    return environment.api.baseUrl + imagePath;
  }

  // Helper method to validate file
  private validateFile(file: File, category: string): { isValid: boolean; message?: string } {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        message: `File size exceeds maximum allowed size of 5MB`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: `File type ${file.type} is not allowed. Allowed types: JPEG, PNG, WebP`
      };
    }

    return { isValid: true };
  }
}
