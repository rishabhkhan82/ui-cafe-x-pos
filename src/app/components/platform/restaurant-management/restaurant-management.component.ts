import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { Restaurant } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-restaurant-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-management.component.html',
  styleUrl: './restaurant-management.component.css'
})
export class RestaurantManagementComponent implements OnInit {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  editingRestaurant: Restaurant | null = null;
  searchTerm = '';
  subscriptionPlanFilter = 'all';
  cityFilter = '';
  statusFilter = 'all';
  showAddForm = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];
  showDetailsModal = false;
  showEditForm = false;

  // States for dropdown
  states = [
    { id: '37', name: 'Andhra Pradesh' },
    { id: '12', name: 'Arunachal Pradesh' },
    { id: '18', name: 'Assam' },
    { id: '10', name: 'Bihar' },
    { id: '22', name: 'Chhattisgarh' },
    { id: '30', name: 'Goa' },
    { id: '24', name: 'Gujarat' },
    { id: '06', name: 'Haryana' },
    { id: '02', name: 'Himachal Pradesh' },
    { id: '20', name: 'Jharkhand' },
    { id: '29', name: 'Karnataka' },
    { id: '32', name: 'Kerala' },
    { id: '23', name: 'Madhya Pradesh' },
    { id: '27', name: 'Maharashtra' },
    { id: '14', name: 'Manipur' },
    { id: '17', name: 'Meghalaya' },
    { id: '15', name: 'Mizoram' },
    { id: '13', name: 'Nagaland' },
    { id: '21', name: 'Odisha' },
    { id: '03', name: 'Punjab' },
    { id: '08', name: 'Rajasthan' },
    { id: '11', name: 'Sikkim' },
    { id: '33', name: 'Tamil Nadu' },
    { id: '36', name: 'Telangana' },
    { id: '16', name: 'Tripura' },
    { id: '09', name: 'Uttar Pradesh' },
    { id: '05', name: 'Uttarakhand' },
    { id: '19', name: 'West Bengal' },
    { id: '35', name: 'Andaman and Nicobar Islands' },
    { id: '04', name: 'Chandigarh' },
    { id: '26', name: 'Dadra and Nagar Haveli and Daman and Diu' },
    { id: '07', name: 'Delhi' },
    { id: '01', name: 'Jammu and Kashmir' },
    { id: '38', name: 'Ladakh' },
    { id: '31', name: 'Lakshadweep' },
    { id: '34', name: 'Puducherry' }
  ];


  restaurantForm: Restaurant = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    subscription_plan: '',
    subscription_start_date: new Date(),
    subscription_end_date: new Date(),
    gst_number: '',
    license_number: '',
    status: 'ACTIVE',
    is_active: true,
    description: '',
    state: 0,
    city: '',
    pincode: 0,
    address: '',
    lat: 0,
    long: 0,
    created_at: new Date(),
    created_by: 0,
    updated_at: null,
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
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.subscriptionPlanFilter !== 'all') {
      params.subscription_plan = this.subscriptionPlanFilter;
    }

    if (this.cityFilter) {
      params.city = this.cityFilter;
    }

    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    this.crudService.getRestaurants(params).subscribe({
      next: (response: any) => {
        this.restaurants = response.data;
        this.filteredRestaurants = [...this.restaurants];
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.errorMessage = 'Failed to load restaurants. Please try again.';
        this.notificationService.error('Error', 'Failed to load restaurants');
        this.loadingService.hide();
      }
    });
  }

  filterRestaurants(): void {
    this.currentPage = 1; // Reset to first page when filters change
    this.loadRestaurants();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.subscriptionPlanFilter = 'all';
    this.cityFilter = '';
    this.statusFilter = 'all';
    this.currentPage = 1; // Reset to first page
    this.loadRestaurants();
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRestaurant = null;
  }

  showEditRestaurantForm(): void {
    this.showEditForm = true;
    this.editingRestaurant = this.selectedRestaurant;
    if (this.selectedRestaurant) {
      this.restaurantForm = { ...this.selectedRestaurant } as Restaurant;
    }
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.editingRestaurant = null;
    this.restaurantForm = {
      id: 0,
      name: '',
      email: '',
      phone: '',
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      subscription_plan: 'Starter',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(),
      gst_number: '',
      license_number: '',
      status: 'ACTIVE',
      is_active: true,
      description: '',
      state: 0,
      city: '',
      pincode: 0,
      address: '',
      lat: 0,
      long: 0,
      created_at: new Date(),
      created_by: 0,
      updated_at: new Date(),
      updated_by: 0
    };
  }

  showAddRestaurantForm(): void {
    this.showAddForm = true;
    this.editingRestaurant = null;
    this.restaurantForm = {
      id: 0,
      name: '',
      email: '',
      phone: '',
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      subscription_plan: '',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(),
      gst_number: '',
      license_number: '',
      status: 'ACTIVE',
      is_active: true,
      description: '',
      state: 0,
      city: '',
      pincode: 0,
      address: '',
      lat: 0,
      long: 0,
      created_at: new Date(),
      created_by: 0,
      updated_at: new Date(),
      updated_by: 0
    };
  }

  cancelAdd(): void {
    this.resetForm();
  }

  onSubmitForm(): void {
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';

    const isUpdate = !!this.editingRestaurant;
    let hasErrors = false;

    // Validate all fields
    this.validateName();
    this.validateEmail();
    this.validatePhone();
    this.validateCity();
    this.validateSubscriptionPlan();
    this.validateOwnerName();
    this.validateOwnerEmail();
    this.validateOwnerPhone();
    this.validateDescription();
    this.validateState();
    this.validatePincode();
    this.validateGeolocation();
    this.validateGstNumber();
    this.validateLicenseNumber();

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

  // Validation methods
  validateName(): void {
    const validation = this.validationService.name(this.restaurantForm.name, 'Restaurant Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateEmail(): void {
    const validation = this.validationService.required(this.restaurantForm.email, 'Email Address');
    if (!validation.isValid) {
      this.fieldErrors['email'] = validation.message!;
    } else {
      const emailValidation = this.validationService.email(this.restaurantForm.email);
      if (!emailValidation.isValid) {
        this.fieldErrors['email'] = emailValidation.message!;
      } else {
        delete this.fieldErrors['email'];
      }
    }
  }

  validatePhone(): void {
    const validation = this.validationService.required(this.restaurantForm.phone, 'Phone Number');
    if (!validation.isValid) {
      this.fieldErrors['phone'] = validation.message!;
    } else {
      const phoneValidation = this.validationService.phone(this.restaurantForm.phone);
      if (!phoneValidation.isValid) {
        this.fieldErrors['phone'] = phoneValidation.message!;
      } else {
        delete this.fieldErrors['phone'];
      }
    }
  }

  validateOwnerName(): void {
    const validation = this.validationService.required(this.restaurantForm.owner_name, 'Owner Name');
    if (!validation.isValid) {
      this.fieldErrors['owner_name'] = validation.message!;
    } else {
      delete this.fieldErrors['owner_name'];
    }
  }

  validateOwnerEmail(): void {
    const validation = this.validationService.required(this.restaurantForm.owner_email, 'Owner Email');
    if (!validation.isValid) {
      this.fieldErrors['owner_email'] = validation.message!;
    } else {
      const emailValidation = this.validationService.email(this.restaurantForm.owner_email);
      if (!emailValidation.isValid) {
        this.fieldErrors['owner_email'] = emailValidation.message!;
      } else {
        delete this.fieldErrors['owner_email'];
      }
    }
  }

  validateOwnerPhone(): void {
    const validation = this.validationService.required(this.restaurantForm.owner_phone, 'Owner Phone');
    if (!validation.isValid) {
      this.fieldErrors['owner_phone'] = validation.message!;
    } else {
      const phoneValidation = this.validationService.phone(this.restaurantForm.owner_phone);
      if (!phoneValidation.isValid) {
        this.fieldErrors['owner_phone'] = phoneValidation.message!;
      } else {
        delete this.fieldErrors['owner_phone'];
      }
    }
  }

  validateGstNumber(): void {
    if (this.restaurantForm.gst_number && this.restaurantForm.gst_number.trim() !== '') {
      // Basic GST format validation (15 characters)
      if (this.restaurantForm.gst_number.length !== 15) {
        this.fieldErrors['gst_number'] = 'GST number must be 15 characters';
      } else {
        delete this.fieldErrors['gst_number'];
      }
    } else {
      delete this.fieldErrors['gst_number'];
    }
  }

  validateLicenseNumber(): void {
    if (this.restaurantForm.license_number && this.restaurantForm.license_number.trim() !== '') {
      if (this.restaurantForm.license_number.trim().length < 5) {
        this.fieldErrors['license_number'] = 'License number must be at least 5 characters';
      } else {
        delete this.fieldErrors['license_number'];
      }
    } else {
      delete this.fieldErrors['license_number'];
    }
  }

  validateState(): void {
    if (this.restaurantForm.state === 0) {
      this.fieldErrors['state'] = 'Please select a state';
    } else {
      delete this.fieldErrors['state'];
    }
  }

  validatePincode(): void {
    const validation = this.validationService.required(this.restaurantForm.pincode.toString(), 'Pin Code');
    if (!validation.isValid) {
      this.fieldErrors['pincode'] = validation.message!;
    } else {
      const pincodeValidation = this.validationService.pincode(this.restaurantForm.pincode.toString());
      if (!pincodeValidation.isValid) {
        this.fieldErrors['pincode'] = pincodeValidation.message!;
      } else {
        delete this.fieldErrors['pincode'];
      }
    }
  }

  validateCity(): void {
    const validation = this.validationService.required(this.restaurantForm.city, 'City');
    if (!validation.isValid) {
      this.fieldErrors['city'] = validation.message!;
    } else {
      delete this.fieldErrors['city'];
    }
  }

  validateSubscriptionPlan(): void {
    if (!this.restaurantForm.subscription_plan || this.restaurantForm.subscription_plan.trim() === '') {
      this.fieldErrors['subscription_plan'] = 'Subscription Plan is required';
    } else {
      delete this.fieldErrors['subscription_plan'];
    }
  }

  validateDescription(): void {
    const validation = this.validationService.required(this.restaurantForm.description, 'Description');
    if (!validation.isValid) {
      this.fieldErrors['description'] = validation.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  validateGeolocation(): void {
    if (this.restaurantForm.lat === 0 || this.restaurantForm.long === 0) {
      this.fieldErrors['geolocation'] = 'Geolocation is required. Please provide latitude and longitude.';
    } else {
      delete this.fieldErrors['geolocation'];
    }
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.restaurantForm.status = target.checked ? 'ACTIVE' : 'INACTIVE';
  }

  onPlanChange(): void {
    if (this.restaurantForm.subscription_plan) {
      const now = new Date();
      this.restaurantForm.subscription_start_date = now;
      this.restaurantForm.subscription_end_date = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.restaurantForm.lat = position.coords.latitude;
          this.restaurantForm.long = position.coords.longitude;
        },
        (error) => {
          console.error('Error getting location:', error);
          this.notificationService.error('Location Error', 'Unable to retrieve your location. Please enter manually.');
        }
      );
    } else {
      this.notificationService.error('Geolocation Not Supported', 'Your browser does not support geolocation.');
    }
  }

  private formatDateForInput(date: Date): string {
    if (!date) {
      return '';
    }
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('Invalid date for input formatting:', date);
      return '';
    }
  }

  get subscriptionStartDateStr(): string {
    return this.formatDateForInput(this.restaurantForm.subscription_start_date);
  }

  set subscriptionStartDateStr(value: string) {
    this.restaurantForm.subscription_start_date = new Date(value);
  }

  get subscriptionEndDateStr(): string {
    return this.formatDateForInput(this.restaurantForm.subscription_end_date);
  }

  set subscriptionEndDateStr(value: string) {
    this.restaurantForm.subscription_end_date = new Date(value);
  }

  private onSaveForm(): void {
    this.loadingService.show();
    this.crudService.createRestaurant(this.restaurantForm).subscribe({
      next: (response) => {
        this.loadingService.hide();
        this.notificationService.success('Success', 'Restaurant created successfully');
        this.showAddForm = false;
        this.resetForm();
        this.loadRestaurants();
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error creating restaurant:', error);
        this.errorMessage = 'Failed to create restaurant. Please try again.';
        this.notificationService.error('Error', 'Failed to create restaurant');
      }
    });
  }

  private onUpdateForm(): void {
    if (this.editingRestaurant) {
      this.loadingService.show();
      this.crudService.updateRestaurant(this.editingRestaurant.id, this.restaurantForm).subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.notificationService.success('Success', 'Restaurant updated successfully');
          this.closeEditForm();
          this.closeDetailsModal();
          this.resetForm();
          this.loadRestaurants();
        },
        error: (error) => {
          this.loadingService.hide();
          console.error('Error updating restaurant:', error);
          this.errorMessage = 'Failed to update restaurant. Please try again.';
          this.notificationService.error('Error', 'Failed to update restaurant');
        }
      });
    }
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingRestaurant = null;
    this.restaurantForm = {
      id: 0,
      name: '',
      email: '',
      phone: '',
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      subscription_plan: '',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(),
      gst_number: '',
      license_number: '',
      status: 'ACTIVE',
      is_active: true,
      description: '',
      state: 0,
      city: '',
      pincode: 0,
      address: '',
      lat: 0,
      long: 0,
      created_at: new Date(),
      created_by: 0,
      updated_at: new Date(),
      updated_by: 0
    };
    this.fieldErrors = {};
    this.errorMessage = '';
  }



  updateRestaurantStatus(restaurant: Restaurant, status: Restaurant['status']): void {
    this.loadingService.show();
    const updatedRestaurant = { ...restaurant, status };
    this.crudService.updateRestaurant(restaurant.id, updatedRestaurant).subscribe({
      next: (response) => {
        this.loadingService.hide();
        this.notificationService.success('Success', 'Restaurant status updated successfully');
        this.loadRestaurants();
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error updating restaurant status:', error);
        this.notificationService.error('Error', 'Failed to update restaurant status');
      }
    });
  }

  deleteRestaurant(restaurant: Restaurant): void {
    this.confirmationService.confirm(
      'Delete Restaurant',
      `Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`,
      'Delete',
      'Cancel'
    ).then((confirmed: boolean) => {
      if (confirmed) {
        this.loadingService.show();
        this.crudService.deleteRestaurant(restaurant.id).subscribe({
          next: (response) => {
            this.loadingService.hide();
            this.notificationService.success('Success', 'Restaurant deleted successfully');
            this.loadRestaurants();
            if (this.selectedRestaurant?.id === restaurant.id) {
              this.selectedRestaurant = null;
            }
          },
          error: (error) => {
            this.loadingService.hide();
            console.error('Error deleting restaurant:', error);
            this.notificationService.error('Error', 'Failed to delete restaurant');
          }
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'INACTIVE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'SUSPENDED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'PENDING_VERIFICATION': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    let dateObj: Date;
    try {
      dateObj = typeof date === 'string' ? new Date(date) : date;
    } catch (error) {
      console.warn('Invalid date string:', date);
      return '';
    }
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    try {
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.warn('Error formatting date:', date);
      return '';
    }
  }



  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRestaurants();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1; // Reset to first page
    this.loadRestaurants();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadRestaurants();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  reloadComponent(): void {
    // Reset all component state
    this.restaurants = [];
    this.filteredRestaurants = [];
    this.selectedRestaurant = null;
    this.editingRestaurant = null;
    this.searchTerm = '';
    this.subscriptionPlanFilter = 'all';
    this.cityFilter = '';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.showDetailsModal = false;
    this.showEditForm = false;
    this.fieldErrors = {};

    // Reset restaurant form
    this.restaurantForm = {
      id: 0,
      name: '',
      email: '',
      phone: '',
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      subscription_plan: '',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(),
      gst_number: '',
      license_number: '',
      status: 'ACTIVE',
      is_active: true,
      description: '',
      state: 0,
      city: '',
      pincode: 0,
      address: '',
      lat: 0,
      long: 0,
      created_at: new Date(),
      created_by: 0,
      updated_at: new Date(),
      updated_by: 0
    };

    // Reload data
    this.loadRestaurants();
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() ||
              this.subscriptionPlanFilter !== 'all' ||
              this.cityFilter?.trim() ||
              this.statusFilter !== 'all');
  }
}
