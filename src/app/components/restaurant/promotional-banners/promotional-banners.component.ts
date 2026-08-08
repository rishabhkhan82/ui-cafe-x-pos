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
import { Subject, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PromotionalBanner } from '../../../interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-promotional-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotional-banners.component.html',
  styleUrl: './promotional-banners.component.css'
})
export class PromotionalBannersComponent implements OnInit, OnDestroy {
  banners: PromotionalBanner[] = [];
  selectedBanner: PromotionalBanner | null = null;
  editingBanner: PromotionalBanner | null = null;
  searchTerm = '';
  statusFilter = 'all';
  showAddForm = false;
  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
  errorMessage = '';

  currentPage = 1;
  itemsPerPage = 50;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  fieldErrors: { [key: string]: string } = {};

  bannerForm: PromotionalBanner = {
    id: 0,
    restaurantId: 0,
    title: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true,
    createdBy: undefined,
    updatedBy: undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  selectedFile: File | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    public router: Router,
    public loadingService: LoadingService,
    private confirmationService: ConfirmationDialogService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private crudService: CrudService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadBanners();
    this.setupSearch();
  }

  get restaurantId(): number {
    return Number(this.authService.getCurrentUser()?.restaurantId || this.authService.getCurrentUser()?.restaurant_id || 0);
  }

  loadBanners(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params = this.buildParams();

    this.crudService.getPromotionalBanners(params).subscribe({
      next: (response: any) => {
        this.banners = (response.data || []).map((banner: any) => ({
          id: banner.id,
          restaurantId: banner.restaurant_id || banner.restaurantId || 0,
          title: banner.title || '',
          imageUrl: banner.image_url || banner.imageUrl || '',
          displayOrder: banner.display_order ?? banner.displayOrder ?? 0,
          isActive: banner.is_active ?? banner.isActive ?? true,
          createdBy: banner.created_by ?? banner.createdBy,
          updatedBy: banner.updated_by ?? banner.updatedBy,
          createdAt: banner.created_at ? new Date(banner.created_at) : undefined,
          updatedAt: banner.updated_at ? new Date(banner.updated_at) : undefined
        }));
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading promotional banners:', error);
        const apiMessage = error.error?.message || 'Failed to load promotional banners. Please try again.';
        this.errorMessage = apiMessage;
        this.notificationService.error('Error', apiMessage);
        this.loadingService.hide();
      }
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.getBannersObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.banners = (response.data || []).map((banner: any) => ({
          id: banner.id,
          restaurantId: banner.restaurant_id || banner.restaurantId || 0,
          title: banner.title || '',
          imageUrl: banner.image_url || banner.imageUrl || '',
          displayOrder: banner.display_order ?? banner.displayOrder ?? 0,
          isActive: banner.is_active ?? banner.isActive ?? true,
          createdBy: banner.created_by ?? banner.createdBy,
          updatedBy: banner.updated_by ?? banner.updatedBy,
          createdAt: banner.created_at ? new Date(banner.created_at) : undefined,
          updatedAt: banner.updated_at ? new Date(banner.updated_at) : undefined
        }));
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching promotional banners:', error);
        this.loadingService.hide();
      }
    });
  }

  private getBannersObservable(params: any): Observable<any> {
    return this.crudService.getPromotionalBanners(params);
  }

  private buildParams(): any {
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurantId: this.restaurantId
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.title = this.searchTerm.trim();
    }

    if (this.statusFilter !== 'all') {
      params.isActive = this.statusFilter === 'active' ? 'true' : 'false';
    }

    return params;
  }

  filterBanners(): void {
    this.currentPage = 1;
    this.loadBanners();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadBanners();
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
      this.loadBanners();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadBanners();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectBanner(banner: PromotionalBanner): void {
    this.selectedBanner = banner;
  }

  showBannerForm(banner?: PromotionalBanner): void {
    this.showAddForm = true;
    this.editingBanner = banner || null;
    this.selectedFile = null;

    if (banner) {
      this.bannerForm = { ...banner };
    } else {
      this.bannerForm = {
        id: 0,
        restaurantId: this.restaurantId,
        title: '',
        imageUrl: '',
        displayOrder: this.banners.length,
        isActive: true,
        createdBy: undefined,
        updatedBy: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.bannerForm = {
      id: 0,
      restaurantId: this.restaurantId,
      title: '',
      imageUrl: '',
      displayOrder: 0,
      isActive: true,
      createdBy: undefined,
      updatedBy: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.editingBanner = null;
    this.selectedFile = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        this.notificationService.error('Invalid File', validation.message || 'Invalid file selected');
        this.selectedFile = null;
        this.bannerForm.imageUrl = '';
        return;
      }

      this.errorMessage = '';
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.bannerForm.imageUrl = e.target?.result as string;
        this.validateImage();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmitForm(): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    this.validateTitle();
    this.validateImage();
    this.validateDisplayOrder();

    if (Object.keys(this.fieldErrors).length > 0) {
      return;
    }

    if (this.editingBanner) {
      this.updateBanner();
    } else {
      this.createBanner();
    }
  }

  validateTitle(): void {
    if (!this.bannerForm.title || this.bannerForm.title.trim() === '') {
      this.fieldErrors['title'] = 'Title is required';
    } else {
      delete this.fieldErrors['title'];
    }
  }

  validateImage(): void {
    if (!this.bannerForm.imageUrl || this.bannerForm.imageUrl.trim() === '') {
      this.fieldErrors['imageUrl'] = 'Image is required';
    } else {
      delete this.fieldErrors['imageUrl'];
    }
  }

  validateDisplayOrder(): void {
    if (this.bannerForm.displayOrder === null || this.bannerForm.displayOrder === undefined || this.bannerForm.displayOrder < 0) {
      this.fieldErrors['displayOrder'] = 'Display order must be a non-negative number';
    } else {
      delete this.fieldErrors['displayOrder'];
    }
  }

  async createBanner(): Promise<void> {
    this.loadingService.show();

    try {
      const currentUser = this.authService.getCurrentUser();
      const bannerRequest = {
        restaurant_id: this.restaurantId,
        title: this.bannerForm.title,
        image_url: this.bannerForm.imageUrl,
        display_order: this.bannerForm.displayOrder,
        is_active: this.bannerForm.isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: Number(currentUser?.id) || 0,
        updated_by: Number(currentUser?.id) || 0
      };

      this.crudService.createPromotionalBanner(bannerRequest).subscribe({
        next: (response) => {
          console.log('Promotional banner created successfully:', response);
          this.notificationService.success('Banner Created', 'The promotional banner has been successfully created.');
          this.cancelAdd();
          this.loadBanners();
        },
        error: (error) => {
          console.error('Error creating promotional banner:', error);
          const apiMessage = error.error?.message || 'Failed to create promotional banner. Please try again.';
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

  async updateBanner(): Promise<void> {
    this.loadingService.show();

    try {
      const currentUser = this.authService.getCurrentUser();
      const bannerRequest = {
        restaurant_id: this.restaurantId,
        title: this.bannerForm.title,
        image_url: this.bannerForm.imageUrl,
        display_order: this.bannerForm.displayOrder,
        is_active: this.bannerForm.isActive,
        updated_at: new Date().toISOString(),
        updated_by: Number(currentUser?.id) || 0
      };

      this.crudService.updatePromotionalBanner(this.editingBanner!.id, bannerRequest).subscribe({
        next: (response) => {
          console.log('Promotional banner updated successfully:', response);
          this.notificationService.success('Banner Updated', 'The promotional banner has been successfully updated.');
          this.cancelAdd();
          this.loadBanners();
        },
        error: (error) => {
          console.error('Error updating promotional banner:', error);
          const apiMessage = error.error?.message || 'Failed to update promotional banner. Please try again.';
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

  async deleteBanner(banner: PromotionalBanner): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete this promotional banner? This action cannot be undone.`,
      'Delete Promotional Banner',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deletePromotionalBanner(banner.id).subscribe({
        next: () => {
          console.log('Promotional banner deleted successfully:', banner.id);
          if (this.selectedBanner?.id === banner.id) {
            this.selectedBanner = null;
          }
          this.loadBanners();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting promotional banner:', error);
          const apiMessage = error.error?.message || 'Failed to delete promotional banner. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
        }
      });
    }
  }

  updateBannerStatus(banner: PromotionalBanner, newStatus: boolean): void {
    this.loadingService.show();
    const updatedBanner = { ...banner, isActive: newStatus, updatedAt: new Date() };

    const bannerRequest = {
      restaurant_id: this.restaurantId,
      title: updatedBanner.title,
      image_url: updatedBanner.imageUrl,
      display_order: updatedBanner.displayOrder,
      is_active: newStatus,
      updated_at: new Date().toISOString()
    };

    this.crudService.updatePromotionalBanner(banner.id, bannerRequest).subscribe({
      next: (response) => {
        console.log('Promotional banner status updated successfully:', response);
        banner.isActive = newStatus;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating promotional banner status:', error);
        const apiMessage = error.error?.message || 'Failed to update banner status. Please try again.';
        this.errorMessage = apiMessage;
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

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  reloadComponent(): void {
    this.banners = [];
    this.selectedBanner = null;
    this.editingBanner = null;
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 50;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    this.bannerForm = {
      id: 0,
      restaurantId: this.restaurantId,
      title: '',
      imageUrl: '',
      displayOrder: 0,
      isActive: true,
      createdBy: undefined,
      updatedBy: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.loadBanners();
  }

  Math = Math;

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.statusFilter !== 'all');
  }

  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    return `${start}-${end}`;
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    return environment.api.baseUrl + imagePath;
  }

  private validateFile(file: File): { isValid: boolean; message?: string } {
    const maxFileSizeMB = 5;
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
