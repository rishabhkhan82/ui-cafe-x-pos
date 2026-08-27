import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../../services/crud.service';
import { GuestAuthService } from '../../../services/guest-auth.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/mock-data.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../../services/notification.service';
import { SystemConfigService } from '../../../services/system-config.service';
import { AnimateOnScrollDirective } from '../../../directives/animate-on-scroll.directive';

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  label?: string;
  fullAddress?: string;
}

interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  icon?: string;
  iconClass?: string;
  name?: string;
  description?: string;
}

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimateOnScrollDirective],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.css'
})
export class CustomerProfileComponent implements OnInit {
  private crudService: CrudService;
  private guestAuthService: GuestAuthService;
  private authService: AuthService;

  private notificationService = inject(NotificationService);
  private systemConfigService = inject(SystemConfigService);

  constructor(
    crudService: CrudService,
    guestAuthService: GuestAuthService,
    authService: AuthService
  ) {
    this.crudService = crudService;
    this.guestAuthService = guestAuthService;
    this.authService = authService;
  }

  currentUser: User | null = null;
  isLoading = false;
  error: string | null = null;
  selectedFile: File | null = null;
  addresses: Address[] = [];
  paymentCards: PaymentCard[] = [];
  savedAddresses: Address[] = [];
  paymentMethods: PaymentCard[] = [];
  preferences = {
    notifications: true,
    marketing: false,
    darkMode: false
  };

  pendingOrdersCount = 2;
  cartItemCount = 3;

  editForm = {
    name: '',
    email: '',
    phone: '',
    avatar: ''
  };

  showEditProfile = false;

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.error = null;

    // Get current user from auth service
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser) {
      // Ensure member_since is set for display
      if (!this.currentUser.member_since) {
        this.currentUser.member_since = this.currentUser.created_at || new Date();
      }

      // Initialize edit form with current user data
      this.editForm = {
        name: this.currentUser.name,
        email: this.currentUser.email || '',
        phone: this.currentUser.phone || '',
        avatar: this.currentUser.avatar || ''
      };
    } else {
      this.error = 'No user data available. Please log in.';
    }

    this.isLoading = false;

    // Mock address and payment data (can be made dynamic later if needed)
    this.addresses = [
      {
        id: 'addr-1',
        type: 'Home',
        street: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        isDefault: true
      },
      {
        id: 'addr-2',
        type: 'Work',
        street: '456 Business Park, Tower A',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400002',
        isDefault: false
      }
    ];

    this.savedAddresses = this.addresses;

    this.paymentCards = [
      {
        id: 'card-1',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true
      },
      {
        id: 'card-2',
        last4: '8888',
        brand: 'Mastercard',
        expiryMonth: 8,
        expiryYear: 2025,
        isDefault: false
      }
    ];

    this.paymentMethods = this.paymentCards.map(card => ({
      ...card,
      icon: card.brand === 'Visa' ? 'fab fa-cc-visa' : 'fab fa-cc-mastercard',
      iconClass: `bg-${card.brand === 'Visa' ? 'blue' : 'red'}-100 dark:bg-${card.brand === 'Visa' ? 'blue' : 'red'}-900/30 text-${card.brand === 'Visa' ? 'blue' : 'red'}-600`,
      name: `${card.brand} **** ${card.last4}`,
      description: `Expires ${card.expiryMonth}/${card.expiryYear}`
    }));
  }

  toggleTheme(): void {
    this.preferences.darkMode = !this.preferences.darkMode;
    // Apply theme change
    document.documentElement.classList.toggle('dark', this.preferences.darkMode);
  }

  editProfile(): void {
    this.showEditProfile = true;
  }

  closeEditProfile(): void {
    this.showEditProfile = false;
    this.error = null;
    this.selectedFile = null;
    // Reset form
    if (this.currentUser) {
      this.editForm = {
        name: this.currentUser.name,
        email: this.currentUser.email || '',
        phone: this.currentUser.phone || '',
        avatar: this.currentUser.avatar || ''
      };
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        this.error = validation.message || 'Invalid file selected';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editForm.avatar = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private validateFile(file: File): { isValid: boolean; message?: string } {
    const maxFileSizeMB = this.systemConfigService.fileUploadMaxSizeMB;
    const maxFileSize = maxFileSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        message: `File size exceeds maximum allowed size of ${maxFileSizeMB}MB`
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

  get fileUploadMaxSizeMB(): number {
    return this.systemConfigService.fileUploadMaxSizeMB;
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
    if (!imagePath || imagePath.trim() === '') {
      return this.getDefaultAvatar();
    }
    if (imagePath.startsWith('data:')) {
      // It's a base64 data URL, return as is
      return imagePath;
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // It's already a full URL, return as is
      return imagePath;
    }
    // It's a relative path, ensure it starts with /
    const normalizedPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    // Concat with base URL
    return `${environment.api.baseUrl}${normalizedPath}`;
  }

  // Method to handle image load errors
  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultAvatar();
  }

  // Method to get default avatar
  private getDefaultAvatar(): string {
    // Return a default avatar data URL (simple colored circle with user icon)
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="#E5E7EB"/>
        <circle cx="24" cy="18" r="8" fill="#9CA3AF"/>
        <path d="M8 40c0-8.8 7.2-16 16-16s16 7.2 16 16" fill="#9CA3AF"/>
      </svg>
    `);
  }

  async saveProfile(): Promise<void> {
    if (!this.currentUser) {
      this.error = 'No user data available';
      return;
    }

    // Check if access token is available
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      this.error = 'Authentication token not found. Please refresh the page.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      let avatarBase64: string | undefined;

      // Convert selected file to base64 if available
      if (this.selectedFile) {
        avatarBase64 = await this.fileToBase64(this.selectedFile);
        this.selectedFile = null;
      }

    // Get customer ID - for guests, it's the customer.id, for regular users it might be different
    let customerId: string | number;

    if (this.currentUser.role === 'customer' && this.currentUser.user_type === 'customer') {
      // This is a guest user, get ID from guest auth service
      // We need restaurant ID to get the stored guest data
      const restaurantId = this.currentUser.restaurant_id ? parseInt(this.currentUser.restaurant_id) : 1;
      const guestData = this.guestAuthService.getCurrentGuestUser(restaurantId);
      if (guestData && guestData.customer) {
        customerId = guestData.customer.id;
      } else {
        this.error = 'Unable to find guest customer data';
        this.isLoading = false;
        return;
      }
    } else {
      // Regular user, use user ID
      customerId = this.currentUser.id;
    }

    // Get restaurant ID from current user
    const restaurantId = this.currentUser.restaurant_id ? parseInt(this.currentUser.restaurant_id) : 1;

    // Prepare update payload
    const updatePayload = {
      id: customerId, // Include the database ID
      name: this.editForm.name,
      email: this.editForm.email,
      phone: this.editForm.phone || undefined, // Send undefined instead of empty string
      avatar: avatarBase64 || this.editForm.avatar,
      restaurant_id: restaurantId,
      customer_id: this.currentUser.username // Include customerId from current user
    };

    // Call API to update customer
    this.crudService.updateCustomer(customerId, updatePayload).subscribe({
        next: (response) => {
      // Compute updated avatar (prefer API path, fallback to edited avatar)
      const updatedAvatar = response.avatar || this.editForm.avatar || this.currentUser!.avatar;

      // Update local currentUser
      this.currentUser!.name = this.editForm.name;
      this.currentUser!.email = this.editForm.email;
      this.currentUser!.phone = this.editForm.phone;
      this.currentUser!.avatar = updatedAvatar; // Use updated avatar from response if available, else edited avatar

      // Update in auth service (sessionStorage)
      this.authService.setCurrentUser(this.currentUser!);

      // If this is a guest user, update the stored guest data and ensure localStorage reflects avatar
      if (this.currentUser!.role === 'customer' && this.currentUser!.user_type === 'customer') {
        const restaurantId = this.currentUser!.restaurant_id ? parseInt(this.currentUser!.restaurant_id) : 1;
        const guestData = this.guestAuthService.getCurrentGuestUser(restaurantId);
        if (guestData && guestData.customer) {
          guestData.customer.name = this.editForm.name;
          guestData.customer.email = this.editForm.email;
          guestData.customer.phone = this.editForm.phone;
          guestData.customer.avatar = updatedAvatar;
          // Update the stored guest data in localStorage
          this.guestAuthService.storeCurrentGuestUser(guestData, restaurantId);
        }
      }

      this.showEditProfile = false;
      this.isLoading = false;
      this.notificationService.success('Profile Updated', 'Your profile has been updated successfully!');
    },
      error: (error) => {
          console.error('Error updating profile:', error);
          this.error = 'Failed to update profile. Please try again.';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error processing avatar:', error);
      this.error = 'Failed to process avatar. Please try again.';
      this.isLoading = false;
    }
  }

  formatMemberSince(date: Date | string | undefined): string {
    if (!date) return 'N/A';

    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  addNewAddress(): void {
    this.notificationService.info('Coming Soon', 'Address management feature is coming soon!');
  }

  editAddress(address: Address): void {
    this.notificationService.info('Coming Soon', `Address editing for ${address.type} is coming soon!`);
  }

  removeAddress(address: Address): void {
    if (confirm(`Remove ${address.type} address?`)) {
      this.addresses = this.addresses.filter(a => a.id !== address.id);
    }
  }

  addNewCard(): void {
    this.notificationService.info('Coming Soon', 'Payment card management feature is coming soon!');
  }

  manageCard(card: PaymentCard): void {
    this.notificationService.info('Coming Soon', `Card management for ****${card.last4} is coming soon!`);
  }

  changePassword(): void {
    this.notificationService.info('Coming Soon', 'Password change feature is coming soon!');
  }

  contactSupport(): void {
    this.notificationService.info('Support', 'Support feature will open chat/email interface soon!');
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      // Logout logic
      this.authService.logout();
      this.notificationService.success('Logged Out', 'You have been logged out successfully!');
    }
  }

  viewCart(): void {
    this.notificationService.info('Navigation', 'Navigating to cart page...');
    // TODO: Implement navigation to cart page
  }

}