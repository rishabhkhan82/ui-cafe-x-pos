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
import { TodaysOffer } from '../../../interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-todays-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todays-offers.component.html',
  styleUrl: './todays-offers.component.css'
})
export class TodaysOffersComponent implements OnInit, OnDestroy {
  offers: TodaysOffer[] = [];
  selectedOffer: TodaysOffer | null = null;
  editingOffer: TodaysOffer | null = null;
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

  offerForm: TodaysOffer = {
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
    this.loadOffers();
    this.setupSearch();
  }

  get restaurantId(): number {
    return Number(this.authService.getCurrentUser()?.restaurantId || this.authService.getCurrentUser()?.restaurant_id || 0);
  }

  loadOffers(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params = this.buildParams();

    this.crudService.getTodaysOffers(params).subscribe({
      next: (response: any) => {
        this.offers = (response.data || []).map((offer: any) => ({
          id: offer.id,
          restaurantId: offer.restaurant_id || offer.restaurantId || 0,
          title: offer.title || '',
          imageUrl: offer.image_url || offer.imageUrl || '',
          displayOrder: offer.display_order ?? offer.displayOrder ?? 0,
          isActive: offer.is_active ?? offer.isActive ?? true,
          createdBy: offer.created_by ?? offer.createdBy,
          updatedBy: offer.updated_by ?? offer.updatedBy,
          createdAt: offer.created_at ? new Date(offer.created_at) : undefined,
          updatedAt: offer.updated_at ? new Date(offer.updated_at) : undefined
        }));
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading today\'s offers:', error);
        const apiMessage = error.error?.message || 'Failed to load today\'s offers. Please try again.';
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
        return this.getOffersObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.offers = (response.data || []).map((offer: any) => ({
          id: offer.id,
          restaurantId: offer.restaurant_id || offer.restaurantId || 0,
          title: offer.title || '',
          imageUrl: offer.image_url || offer.imageUrl || '',
          displayOrder: offer.display_order ?? offer.displayOrder ?? 0,
          isActive: offer.is_active ?? offer.isActive ?? true,
          createdBy: offer.created_by ?? offer.createdBy,
          updatedBy: offer.updated_by ?? offer.updatedBy,
          createdAt: offer.created_at ? new Date(offer.created_at) : undefined,
          updatedAt: offer.updated_at ? new Date(offer.updated_at) : undefined
        }));
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching today\'s offers:', error);
        this.loadingService.hide();
      }
    });
  }

  private getOffersObservable(params: any): Observable<any> {
    return this.crudService.getTodaysOffers(params);
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

  filterOffers(): void {
    this.currentPage = 1;
    this.loadOffers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadOffers();
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
      this.loadOffers();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadOffers();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectOffer(offer: TodaysOffer): void {
    this.selectedOffer = offer;
  }

  showOfferForm(offer?: TodaysOffer): void {
    this.showAddForm = true;
    this.editingOffer = offer || null;
    this.selectedFile = null;

    if (offer) {
      this.offerForm = { ...offer };
    } else {
      this.offerForm = {
        id: 0,
        restaurantId: this.restaurantId,
        title: '',
        imageUrl: '',
        displayOrder: this.offers.length,
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
    this.offerForm = {
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
    this.editingOffer = null;
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
        this.offerForm.imageUrl = '';
        return;
      }

      this.errorMessage = '';
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.offerForm.imageUrl = e.target?.result as string;
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

    if (this.editingOffer) {
      this.updateOffer();
    } else {
      this.createOffer();
    }
  }

  validateTitle(): void {
    if (!this.offerForm.title || this.offerForm.title.trim() === '') {
      this.fieldErrors['title'] = 'Title is required';
    } else {
      delete this.fieldErrors['title'];
    }
  }

  validateImage(): void {
    if (!this.offerForm.imageUrl || this.offerForm.imageUrl.trim() === '') {
      this.fieldErrors['imageUrl'] = 'Image is required';
    } else {
      delete this.fieldErrors['imageUrl'];
    }
  }

  validateDisplayOrder(): void {
    if (this.offerForm.displayOrder === null || this.offerForm.displayOrder === undefined || this.offerForm.displayOrder < 0) {
      this.fieldErrors['displayOrder'] = 'Display order must be a non-negative number';
    } else {
      delete this.fieldErrors['displayOrder'];
    }
  }

  async createOffer(): Promise<void> {
    this.loadingService.show();

    try {
      const currentUser = this.authService.getCurrentUser();
      const offerRequest = {
        restaurant_id: this.restaurantId,
        title: this.offerForm.title,
        image_url: this.offerForm.imageUrl,
        display_order: this.offerForm.displayOrder,
        is_active: this.offerForm.isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: Number(currentUser?.id) || 0,
        updated_by: Number(currentUser?.id) || 0
      };

      this.crudService.createTodaysOffer(offerRequest).subscribe({
        next: (response) => {
          console.log('Today\'s offer created successfully:', response);
          this.notificationService.success('Offer Created', 'The today\'s offer has been successfully created.');
          this.cancelAdd();
          this.loadOffers();
        },
        error: (error) => {
          console.error('Error creating today\'s offer:', error);
          const apiMessage = error.error?.message || 'Failed to create today\'s offer. Please try again.';
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

  async updateOffer(): Promise<void> {
    this.loadingService.show();

    try {
      const currentUser = this.authService.getCurrentUser();
      const offerRequest = {
        restaurant_id: this.restaurantId,
        title: this.offerForm.title,
        image_url: this.offerForm.imageUrl,
        display_order: this.offerForm.displayOrder,
        is_active: this.offerForm.isActive,
        updated_at: new Date().toISOString(),
        updated_by: Number(currentUser?.id) || 0
      };

      this.crudService.updateTodaysOffer(this.editingOffer!.id, offerRequest).subscribe({
        next: (response) => {
          console.log('Today\'s offer updated successfully:', response);
          this.notificationService.success('Offer Updated', 'The today\'s offer has been successfully updated.');
          this.cancelAdd();
          this.loadOffers();
        },
        error: (error) => {
          console.error('Error updating today\'s offer:', error);
          const apiMessage = error.error?.message || 'Failed to update today\'s offer. Please try again.';
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

  async deleteOffer(offer: TodaysOffer): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete this today's offer? This action cannot be undone.`,
      'Delete Today\'s Offer',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteTodaysOffer(offer.id).subscribe({
        next: () => {
          console.log('Today\'s offer deleted successfully:', offer.id);
          if (this.selectedOffer?.id === offer.id) {
            this.selectedOffer = null;
          }
          this.loadOffers();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting today\'s offer:', error);
          const apiMessage = error.error?.message || 'Failed to delete today\'s offer. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
        }
      });
    }
  }

  updateOfferStatus(offer: TodaysOffer, newStatus: boolean): void {
    this.loadingService.show();
    const updatedOffer = { ...offer, isActive: newStatus, updatedAt: new Date() };

    const offerRequest = {
      restaurant_id: this.restaurantId,
      title: updatedOffer.title,
      image_url: updatedOffer.imageUrl,
      display_order: updatedOffer.displayOrder,
      is_active: newStatus,
      updated_at: new Date().toISOString()
    };

    this.crudService.updateTodaysOffer(offer.id, offerRequest).subscribe({
      next: (response) => {
        console.log('Today\'s offer status updated successfully:', response);
        offer.isActive = newStatus;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating today\'s offer status:', error);
        const apiMessage = error.error?.message || 'Failed to update offer status. Please try again.';
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
    this.offers = [];
    this.selectedOffer = null;
    this.editingOffer = null;
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 50;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    this.offerForm = {
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

    this.loadOffers();
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
