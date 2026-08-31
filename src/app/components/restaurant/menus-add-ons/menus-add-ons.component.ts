import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { CrudService } from '../../../services/crud.service';
import { SystemConfigService } from '../../../services/system-config.service';
import { environment } from '../../../environments/environment';
import { Subject, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export interface MenuAddon {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  type: string;
  is_active: boolean;
  display_order: number;
  restaurant_id: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

@Component({
  selector: 'app-menus-add-ons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menus-add-ons.component.html',
  styleUrl: './menus-add-ons.component.css'
})
export class MenusAddOnsComponent implements OnInit, OnDestroy {
  addons: MenuAddon[] = [];
  selectedAddon: MenuAddon | null = null;
  editingAddon: MenuAddon | null = null;
  searchTerm = '';
  showAddForm = false;
  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
  errorMessage = '';
  selectedFile: File | null = null;
  private subscriptions: Subscription[] = [];

  currentPage = 1;
  itemsPerPage = 50;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50, 100];

  fieldErrors: { [key: string]: string } = {};

  addonForm: MenuAddon = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    image: '',
    type: 'RAW',
    is_active: true,
    display_order: 0,
    restaurant_id: 1,
    created_at: undefined,
    updated_at: undefined,
    created_by: undefined,
    updated_by: undefined
  };

  constructor(
    public router: Router,
    public loadingService: LoadingService,
    private confirmationService: ConfirmationDialogService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private crudService: CrudService,
    private validationService: ValidationService,
    private systemConfigService: SystemConfigService
  ) {}

  ngOnInit(): void {
    this.loadAddons();
    this.setupSearch();
  }

  loadAddons(): void {
    this.loadingService.show();
    this.errorMessage = '';

    this.getAddonsObservable(this.buildParams()).subscribe({
      next: (response: any) => {
        this.addons = this.mapApiAddonsToAddons(response.data || response);
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || this.addons.length;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading add-ons:', error);
        const apiMessage = error.error?.message || 'Failed to load add-ons. Please try again.';
        this.errorMessage = apiMessage;
        this.loadingService.hide();
      }
    });
  }

  private getAddonsObservable(params: any): Observable<any> {
    return this.crudService.getData('menu-addons', params);
  }

  private buildParams(): any {
    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurant_id: currentUser?.restaurantId
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    console.log(params);
    return params;
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.getAddonsObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.addons = this.mapApiAddonsToAddons(response.data || response);
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || this.addons.length;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching add-ons:', error);
        this.loadingService.hide();
      }
    });
  }

  private mapApiAddonsToAddons(apiAddons: any[]): MenuAddon[] {
    return apiAddons.map((apiAddon: any) => ({
      id: apiAddon.id,
      name: apiAddon.name || '',
      description: apiAddon.description || '',
      price: apiAddon.price || 0,
      image: apiAddon.image || '',
      type: apiAddon.type || 'RAW',
      is_active: apiAddon.is_active ?? true,
      display_order: apiAddon.display_order ?? 0,
      restaurant_id: apiAddon.restaurant_id || 1,
      created_at: apiAddon.created_at ? new Date(apiAddon.created_at) : undefined,
      updated_at: apiAddon.updated_at ? new Date(apiAddon.updated_at) : undefined,
      created_by: apiAddon.created_by,
      updated_by: apiAddon.updated_by
    }));
  }

  filterAddons(): void {
    this.currentPage = 1;
    this.loadAddons();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadAddons();
  }

  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchInput = '';
      this.searchSubject.next('');
    }
  }

  onSearchInputChange(value: string): void {
    this.searchSubject.next(value);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAddons();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadAddons();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectAddon(addon: MenuAddon): void {
    this.selectedAddon = addon;
  }

  showAddonForm(addon?: MenuAddon): void {
    this.showAddForm = true;
    this.editingAddon = addon || null;
    if (addon) {
      this.addonForm = { ...addon };
    } else {
      this.addonForm = {
        id: Date.now(),
        name: '',
        description: '',
        price: 0,
        image: '',
        type: 'RAW',
        is_active: true,
        display_order: 0,
        restaurant_id: 1,
        created_at: undefined,
        updated_at: undefined,
        created_by: undefined,
        updated_by: undefined
      };
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.addonForm = {
      id: 0,
      name: '',
      description: '',
      price: 0,
      image: '',
      type: 'RAW',
      is_active: true,
      display_order: 0,
      restaurant_id: 1,
      created_at: undefined,
      updated_at: undefined,
      created_by: undefined,
      updated_by: undefined
    };
    this.editingAddon = null;
    this.selectedFile = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validateFile(file, 'addon_image');
      if (!validation.isValid) {
        this.notificationService.error('Invalid File', validation.message || 'Invalid file selected');
        this.selectedFile = null;
        this.addonForm.image = '';
        return;
      }

      this.errorMessage = '';
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.addonForm.image = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmitForm(): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    this.validateName();
    this.validatePrice();
    this.validateImage();

    if (Object.keys(this.fieldErrors).length > 0) {
      return;
    }

    if (this.editingAddon) {
      this.updateAddon();
    } else {
      this.createAddon();
    }
  }

  validateName(): void {
    const validation = this.validationService.name(this.addonForm.name, 'Add-on name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validatePrice(): void {
    const validation = this.validationService.menuPrice(this.addonForm.price);
    if (!validation.isValid) {
      this.fieldErrors['price'] = validation.message!;
    } else {
      delete this.fieldErrors['price'];
    }
  }

  validateImage(): void {
    if (!this.addonForm.image || this.addonForm.image.trim() === '') {
      this.fieldErrors['image'] = 'Image is required';
    } else {
      delete this.fieldErrors['image'];
    }
  }

  async createAddon(): Promise<void> {
    this.loadingService.show();

    try {
      let imageBase64: string | undefined;

      if (this.selectedFile) {
        imageBase64 = await this.fileToBase64(this.selectedFile);
        this.selectedFile = null;
      }

      const currentTime = new Date();
      const currentUser = this.authService.getCurrentUser();
      const addonRequest = {
        name: this.addonForm.name,
        description: this.addonForm.description,
        price: this.addonForm.price,
        image: imageBase64 || this.addonForm.image,
        type: this.addonForm.type,
        is_active: this.addonForm.is_active,
        display_order: this.addonForm.display_order,
        restaurant_id: currentUser?.restaurantId || 1,
        created_at: currentTime.toISOString(),
        updated_at: currentTime.toISOString(),
        created_by: Number(currentUser?.id) || 1,
        updated_by: Number(currentUser?.id) || 1
      };

      this.crudService.postData('menu-addons', addonRequest).subscribe({
        next: (response) => {
          console.log('Add-on created successfully:', response);
          this.notificationService.success('Add-on Created', 'The add-on has been successfully created.');
          this.cancelAdd();
          this.loadAddons();
        },
        error: (error) => {
          console.error('Error creating add-on:', error);
          const apiMessage = error.error?.message || 'Failed to create add-on. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();

          const apiFieldErrors = error.error?.fieldErrors as Record<string, string[]> | undefined;
          if (apiFieldErrors) {
            Object.entries(apiFieldErrors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                this.fieldErrors[field] = messages[0];
              }
            });
          }

          this.notificationService.error('Creation Failed', apiMessage);
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      this.notificationService.error('Processing Failed', 'Failed to process image. Please try again.');
      this.errorMessage = 'Failed to process image. Please try again.';
      this.loadingService.hide();
    }
  }

  async updateAddon(): Promise<void> {
    this.loadingService.show();

    try {
      let imageBase64: string | undefined;

      if (this.selectedFile) {
        imageBase64 = await this.fileToBase64(this.selectedFile);
        this.selectedFile = null;
      }

      const currentTime = new Date();
      const currentUser = this.authService.getCurrentUser();
      const addonRequest = {
        name: this.addonForm.name,
        description: this.addonForm.description,
        price: this.addonForm.price,
        image: imageBase64 || this.addonForm.image,
        type: this.addonForm.type,
        is_active: this.addonForm.is_active,
        display_order: this.addonForm.display_order,
        restaurant_id: this.addonForm.restaurant_id,
        updated_at: currentTime.toISOString(),
        updated_by: Number(currentUser?.id) || 1
      };

      console.log('Updating add-on, addonRequest:', addonRequest);

      this.crudService.putData('menu-addons', addonRequest, {}, this.editingAddon!.id).subscribe({
        next: (response) => {
          console.log('Add-on updated successfully:', response);
          this.notificationService.success('Add-on Updated', 'The add-on has been successfully updated.');
          this.cancelAdd();
          this.loadAddons();
        },
        error: (error) => {
          console.error('Error updating add-on:', error);
          const apiMessage = error.error?.message || 'Failed to update add-on. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();

          const apiFieldErrors = error.error?.fieldErrors as Record<string, string[]> | undefined;
          if (apiFieldErrors) {
            Object.entries(apiFieldErrors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                this.fieldErrors[field] = messages[0];
              }
            });
          }

          this.notificationService.error('Update Failed', apiMessage);
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      this.notificationService.error('Processing Failed', 'Failed to process image. Please try again.');
      this.errorMessage = 'Failed to process image. Please try again.';
      this.loadingService.hide();
    }
  }

  async deleteAddon(addon: MenuAddon): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${addon.name}"? This action cannot be undone.`,
      'Delete Add-on',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteData('menu-addons', {}, addon.id).subscribe({
        next: () => {
          console.log('Add-on deleted successfully:', addon.id);
          if (this.selectedAddon?.id === addon.id) {
            this.selectedAddon = null;
          }
          this.loadAddons();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting add-on:', error);
          const apiMessage = error.error?.message || 'Failed to delete add-on. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
        }
      });
    }
  }

  editFromDetails(addon: MenuAddon): void {
    this.selectedAddon = null;
    this.showAddonForm(addon);
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!this.searchTerm?.trim();
  }

  // Calculate pagination range
  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    return `${start}-${end}`;
  }

  get fileUploadMaxSizeMB(): number {
    return this.systemConfigService.fileUploadMaxSizeMB;
  }

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

  private validateFile(file: File, category: string): { isValid: boolean; message?: string } {
    const maxFileSizeMB = this.systemConfigService.fileUploadMaxSizeMB;
    const maxFileSize = maxFileSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxFileSize) {
      return {
        isValid: false,
        message: `File size exceeds maximum allowed size of ${maxFileSizeMB}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: `File type ${file.type} is not allowed. Allowed types: JPEG, PNG, WebP`
      };
    }

    return { isValid: true };
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    return environment.api.baseUrl + imagePath;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
