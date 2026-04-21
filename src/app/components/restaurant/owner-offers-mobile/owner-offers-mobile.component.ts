import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { CrudService } from '../../../services/crud.service';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface Offer {
  id: number;
  title: string;
  name: string;
  description: string;
  code: string;
  offer_id: string;
  type: string;
  discount_value: number;
  value: number;
  min_order_value: number;
  max_usage_per_customer: number;
  usage_count: number;
  usage_limit: number;
  start_date: string;
  end_date: string;
  terms: string;
  auto_apply: boolean;
  is_active: boolean;
  restaurant_id: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

@Component({
  selector: 'app-owner-offers-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-offers-mobile.component.html',
  styleUrl: './owner-offers-mobile.component.css'
})
export class OwnerOffersMobileComponent implements OnInit {
  offers: Offer[] = [];
  selectedOffer: Offer | null = null;
  editingOffer: Offer | null = null;
  searchTerm = '';
  typeFilter = 'all';
  statusFilter = 'all';
  showAddForm = false;
  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
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

  // Offer Types
  offerTypes = [
    'percentage',
    'fixed',
    'buy_one_get_one',
    'free_delivery'
  ];

  offerForm: Offer = {
    id: 0,
    title: '',
    name: '',
    description: '',
    code: '',
    offer_id: '',
    type: 'percentage',
    discount_value: 0,
    value: 0,
    min_order_value: 0,
    max_usage_per_customer: 1,
    usage_count: 0,
    usage_limit: 100,
    start_date: '',
    end_date: '',
    terms: '',
    auto_apply: false,
    is_active: true,
    restaurant_id: 1,
    created_at: undefined,
    updated_at: undefined,
    created_by: undefined,
    updated_by: undefined
  };

  constructor(
    public router: Router,
    private loadingService: LoadingService,
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

  loadOffers(): void {
    this.loadingService.show();
    this.errorMessage = '';

    this.getOffersObservable(this.buildParams()).subscribe({
      next: (response: any) => {
        this.offers = this.mapApiOffersToOffers(response.data);
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.errorMessage = 'Failed to load offers. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private getOffersObservable(params: any): Observable<any> {
    return this.crudService.getOffers(params);
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

    if (this.typeFilter !== 'all') {
      params.type = this.typeFilter;
    }

    if (this.statusFilter !== 'all') {
      params.is_active = this.statusFilter === 'active';
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
        return this.getOffersObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.offers = this.mapApiOffersToOffers(response.data);
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching offers:', error);
        this.loadingService.hide();
      }
    });
  }

  private mapApiOffersToOffers(apiOffers: any[]): Offer[] {
    return apiOffers.map(apiOffer => ({
      id: apiOffer.id,
      title: apiOffer.title || '',
      name: apiOffer.name || '',
      description: apiOffer.description || '',
      code: apiOffer.code || '',
      offer_id: apiOffer.offer_id || '',
      type: apiOffer.type || 'percentage',
      discount_value: apiOffer.discount_value || 0,
      value: apiOffer.value || 0,
      min_order_value: apiOffer.min_order_value || 0,
      max_usage_per_customer: apiOffer.max_usage_per_customer || 1,
      usage_count: apiOffer.usage_count || 0,
      usage_limit: apiOffer.usage_limit || 100,
      start_date: apiOffer.start_date || '',
      end_date: apiOffer.end_date || '',
      terms: apiOffer.terms || '',
      auto_apply: apiOffer.auto_apply ?? false,
      is_active: apiOffer.is_active ?? true,
      restaurant_id: apiOffer.restaurant_id || 1,
      created_at: apiOffer.created_at ? new Date(apiOffer.created_at) : undefined,
      updated_at: apiOffer.updated_at ? new Date(apiOffer.updated_at) : undefined,
      created_by: apiOffer.created_by,
      updated_by: apiOffer.updated_by
    }));
  }

  filterOffers(): void {
    this.currentPage = 1;
    this.loadOffers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = 'all';
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

  selectOffer(offer: Offer): void {
    this.selectedOffer = offer;
  }

  showOfferForm(offer?: Offer): void {
    this.showAddForm = true;
    this.editingOffer = offer || null;
    if (offer) {
      this.offerForm = { ...offer };
    } else {
      this.offerForm = {
        id: Date.now(),
        title: '',
        name: '',
        description: '',
        code: '',
        offer_id: '',
        type: 'percentage',
        discount_value: 0,
        value: 0,
        min_order_value: 0,
        max_usage_per_customer: 1,
        usage_count: 0,
        usage_limit: 100,
        start_date: '',
        end_date: '',
        terms: '',
        auto_apply: false,
        is_active: true,
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
    this.offerForm = {
      id: 0,
      title: '',
      name: '',
      description: '',
      code: '',
      offer_id: '',
      type: 'percentage',
      discount_value: 0,
      value: 0,
      min_order_value: 0,
      max_usage_per_customer: 1,
      usage_count: 0,
      usage_limit: 100,
      start_date: '',
      end_date: '',
      terms: '',
      auto_apply: false,
      is_active: true,
      restaurant_id: 1,
      created_at: undefined,
      updated_at: undefined,
      created_by: undefined,
      updated_by: undefined
    };
    this.editingOffer = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitForm(): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    this.validateTitle();
    this.validateName();
    this.validateDescription();
    this.validateCode();
    this.validateType();
    if (this.offerForm.type === 'percentage') {
      this.validateDiscountValue();
    } else if (this.offerForm.type === 'fixed') {
      this.validateValue();
    }

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
    const validation = this.validationService.required(this.offerForm.title, 'Title');
    if (!validation.isValid) {
      this.fieldErrors['title'] = validation.message!;
    } else {
      delete this.fieldErrors['title'];
    }
  }

  validateName(): void {
    const validation = this.validationService.required(this.offerForm.name, 'Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateDescription(): void {
    const validation = this.validationService.required(this.offerForm.description, 'Description');
    if (!validation.isValid) {
      this.fieldErrors['description'] = validation.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  validateCode(): void {
    const validation = this.validationService.required(this.offerForm.code, 'Code');
    if (!validation.isValid) {
      this.fieldErrors['code'] = validation.message!;
    } else {
      delete this.fieldErrors['code'];
    }
  }

  validateOfferId(): void {
    const validation = this.validationService.required(this.offerForm.offer_id, 'Offer ID');
    if (!validation.isValid) {
      this.fieldErrors['offer_id'] = validation.message!;
    } else {
      delete this.fieldErrors['offer_id'];
    }
  }

  validateType(): void {
    const validation = this.validationService.required(this.offerForm.type, 'Type');
    if (!validation.isValid) {
      this.fieldErrors['type'] = validation.message!;
    } else {
      delete this.fieldErrors['type'];
    }
  }

  validateDiscountValue(): void {
    const validation = this.validationService.required(this.offerForm.discount_value.toString(), 'Discount Percentage');
    if (!validation.isValid) {
      this.fieldErrors['discount_value'] = validation.message!;
    } else {
      delete this.fieldErrors['discount_value'];
    }
  }

  validateValue(): void {
    const validation = this.validationService.required(this.offerForm.value.toString(), 'Value');
    if (!validation.isValid) {
      this.fieldErrors['value'] = validation.message!;
    } else {
      delete this.fieldErrors['value'];
    }
  }

  createOffer(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const currentUser = this.authService.getCurrentUser();
    const offerRequest = {
      title: this.offerForm.title,
      name: this.offerForm.name,
      description: this.offerForm.description,
      code: this.offerForm.code,
      offer_id: this.offerForm.offer_id,
      type: this.offerForm.type,
      discount_value: this.offerForm.discount_value,
      value: this.offerForm.value,
      min_order_value: this.offerForm.min_order_value,
      max_usage_per_customer: this.offerForm.max_usage_per_customer,
      usage_count: this.offerForm.usage_count,
      usage_limit: this.offerForm.usage_limit,
      start_date: this.offerForm.start_date,
      end_date: this.offerForm.end_date,
      terms: this.offerForm.terms,
      auto_apply: this.offerForm.auto_apply,
      is_active: this.offerForm.is_active,
      restaurant_id: currentUser?.restaurantId || 1,
      created_at: currentTime.toISOString(),
      updated_at: currentTime.toISOString(),
      created_by: Number(currentUser?.id) || 1,
      updated_by: Number(currentUser?.id) || 1
    };

    // Create new offer
    this.crudService.createOffer(offerRequest).subscribe({
      next: (response) => {
        console.log('Offer created successfully:', response);
        this.notificationService.success('Offer Created', 'The offer has been successfully created.');
        this.cancelAdd();
        this.loadOffers();
      },
      error: (error) => {
        console.error('Error creating offer:', error);
        this.notificationService.error('Creation Failed', 'Failed to create offer. Please try again.');
        this.errorMessage = 'Failed to create offer. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  updateOffer(): void {
    this.loadingService.show();

    const currentTime = new Date();
    const currentUser = this.authService.getCurrentUser();
    const offerRequest = {
      title: this.offerForm.title,
      name: this.offerForm.name,
      description: this.offerForm.description,
      code: this.offerForm.code,
      offer_id: this.offerForm.offer_id,
      type: this.offerForm.type,
      discount_value: this.offerForm.discount_value,
      value: this.offerForm.value,
      min_order_value: this.offerForm.min_order_value,
      max_usage_per_customer: this.offerForm.max_usage_per_customer,
      usage_count: this.offerForm.usage_count,
      usage_limit: this.offerForm.usage_limit,
      start_date: this.offerForm.start_date,
      end_date: this.offerForm.end_date,
      terms: this.offerForm.terms,
      auto_apply: this.offerForm.auto_apply,
      is_active: this.offerForm.is_active,
      restaurant_id: this.offerForm.restaurant_id,
      created_at: this.editingOffer!.created_at?.toISOString() || currentTime.toISOString(),
      updated_at: currentTime.toISOString(),
      created_by: this.editingOffer!.created_by,
      updated_by: Number(currentUser?.id) || 1
    };

    console.log('Updating offer, offerRequest:', offerRequest);

    // Update existing offer
    this.crudService.updateOffer(this.editingOffer!.id, offerRequest).subscribe({
      next: (response) => {
        console.log('Offer updated successfully:', response);
        this.notificationService.success('Offer Updated', 'The offer has been successfully updated.');
        this.cancelAdd();
        this.loadOffers();
      },
      error: (error) => {
        console.error('Error updating offer:', error);
        this.notificationService.error('Update Failed', 'Failed to update offer. Please try again.');
        this.errorMessage = 'Failed to update offer. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  async deleteOffer(offer: Offer): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${offer.title}"? This action cannot be undone.`,
      'Delete Offer',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteOffer(offer.id).subscribe({
        next: () => {
          console.log('Offer deleted successfully:', offer.id);
          if (this.selectedOffer?.id === offer.id) {
            this.selectedOffer = null;
          }
          this.loadOffers();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting offer:', error);
          this.errorMessage = 'Failed to delete offer. Please try again.';
          this.loadingService.hide();
        }
      });
    }
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() ||
              this.typeFilter !== 'all' ||
              this.statusFilter !== 'all');
  }

  // Calculate pagination range to avoid Math.min in template
  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    return `${start}-${end}`;
  }

  getOfferTypeColor(type: string): string {
    switch (type) {
      case 'percentage': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'fixed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'buy_one_get_one': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'free_delivery': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
