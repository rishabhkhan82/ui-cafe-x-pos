import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { CrudService } from '../../../services/crud.service';
import { environment } from '../../../environments/environment';
import { Subscription, forkJoin } from 'rxjs';
import { Restaurant } from '../../../services/mock-data.service';
import { MenuItem } from '../../../interfaces';

const CATEGORY_COLORS: Record<string, string> = {
  'Starters': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Main Course': 'bg-red-700 text-white dark:bg-red-600 dark:text-white',
  'Salads': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Desserts': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'Beverages': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Snacks': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
};

const DISPLAY_CATEGORIES = [
  { code: 'all', label: 'All' },
  { code: 'starters', label: 'Starters' },
  { code: 'main-course', label: 'Main Course' },
  { code: 'salads', label: 'Salads' },
  { code: 'desserts', label: 'Desserts' },
  { code: 'beverages', label: 'Beverages' },
  { code: 'snacks', label: 'Snacks' }
];

const STATE_ID_TO_NAME: Record<number, string> = {
  1: 'Jammu and Kashmir', 2: 'Himachal Pradesh', 3: 'Punjab',
  4: 'Chandigarh', 5: 'Uttarakhand', 6: 'Haryana', 7: 'Delhi',
  8: 'Rajasthan', 9: 'Uttar Pradesh', 10: 'Bihar', 11: 'Sikkim',
  12: 'Arunachal Pradesh', 13: 'Nagaland', 14: 'Manipur',
  15: 'Mizoram', 16: 'Tripura', 17: 'Meghalaya', 18: 'Assam',
  19: 'West Bengal', 20: 'Jharkhand', 21: 'Odisha', 22: 'Chhattisgarh',
  23: 'Madhya Pradesh', 24: 'Gujarat', 25: 'Daman and Diu',
  26: 'Dadra and Nagar Haveli', 27: 'Maharashtra', 29: 'Karnataka',
  30: 'Goa', 31: 'Lakshadweep', 32: 'Kerala', 33: 'Tamil Nadu',
  34: 'Puducherry', 35: 'Andaman and Nicobar Islands', 36: 'Telangana',
  37: 'Andhra Pradesh', 38: 'Ladakh'
};

@Component({
  selector: 'app-restaurant-profile',
  standalone: true,
  imports: [CommonModule, HttpClient],
  templateUrl: './restaurant-profile.component.html',
  styleUrl: './restaurant-profile.component.css'
})
export class RestaurantProfileComponent implements OnInit {
  restaurantId: number | null = null;

  restaurant: Restaurant | null = null;
  menus: MenuItem[] = [];
  allMenus: MenuItem[] = [];

  loading = true;
  menusLoading = true;
  errorMessage = '';
  menusErrorMessage = '';

  selectedCategoryFilter = 'all';

  private queryParamSub!: Subscription;

  formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.queryParamSub = this.route.queryParams.subscribe(params => {
      const id = params['restaurantId'];
      if (id !== undefined && id !== null) {
        this.restaurantId = parseInt(id, 10);
        this.loadRestaurantProfile();
      } else {
        this.loading = false;
        this.menusLoading = false;
        this.errorMessage = 'Restaurant ID is missing from the URL.';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.queryParamSub) {
      this.queryParamSub.unsubscribe();
    }
  }

  private loadRestaurantProfile(): void {
    this.loading = true;
    this.menusLoading = true;
    this.errorMessage = '';
    this.menusErrorMessage = '';

    forkJoin({
      restaurant: this.crudService.getRestaurantById(this.restaurantId!),
      menus: this.crudService.getMenuItems(this.buildMenuParams())
    }).subscribe({
      next: ({ restaurant, menus }) => {
        try {
          this.restaurant = this.mapRestaurant(restaurant.data || restaurant);
        } catch {
          this.restaurant = null;
          this.errorMessage = 'Failed to parse restaurant data.';
        }
        try {
          this.allMenus = this.mapApiMenuItems(menus.data || []);
          this.applyCategoryFilter();
        } catch {
          this.allMenus = [];
          this.menusErrorMessage = 'Failed to load menus.';
        }
        this.loading = false;
        this.menusLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
        this.menusLoading = false;
        this.errorMessage = 'Unable to load restaurant profile. Please try again later.';
        this.notificationService.error('Error', 'Failed to load restaurant profile');
        this.loadingService.hide();
      }
    });
  }

  private buildMenuParams(restaurantId?: number): any {
    const params: any = {
      restaurant_id: restaurantId ?? this.restaurantId,
      page: 1,
      size: 100
    };
    return params;
  }

  private mapRestaurant(data: any): Restaurant {
    return {
      id: data.id ?? 0,
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      owner_name: data.owner_name ?? '',
      owner_email: data.owner_email ?? '',
      owner_phone: data.owner_phone ?? '',
      subscription_plan: data.subscription_plan ?? '',
      subscription_start_date: data.subscription_start_date
        ? new Date(data.subscription_start_date)
        : new Date(),
      subscription_end_date: data.subscription_end_date
        ? new Date(data.subscription_end_date)
        : new Date(),
      gst_number: data.gst_number ?? '',
      license_number: data.license_number ?? '',
      status: data.status ?? 'ACTIVE',
      is_active: data.is_active ?? true,
      description: data.description ?? '',
      state: data.state ?? 0,
      city: data.city ?? '',
      pincode: data.pincode ?? 0,
      address: data.address ?? '',
      lat: data.lat ?? 0,
      long: data.long ?? 0,
      logo_image: data.logo_image,
      created_at: new Date(data.created_at?.toString() ?? Date.now()),
      created_by: data.created_by ?? 0,
      updated_at: data.updated_at ? new Date(data.updated_at.toString()) : null,
      updated_by: data.updated_by ?? 0
    };
  }

  private mapApiMenuItems(apiItems: any[]): MenuItem[] {
    return apiItems.map((item: any) => ({
      id: item.id ?? 0,
      name: item.name ?? '',
      description: item.description ?? '',
      price: item.price ?? 0,
      category: this.normalizeCategory(item.category ?? ''),
      image: item.image ?? environment.api.baseUrl + '/uploads/images/default/menu-default.png',
      item_id: item.item_id ?? '',
      discount: item.discount ?? '',
      original_price: item.original_price ?? item.price ?? 0,
      preparation_time: item.preparation_time ?? 0,
      is_active: item.is_active ?? true,
      is_available: item.is_available ?? true,
      is_popular: item.is_popular ?? false,
      is_featured: item.is_featured ?? false,
      is_recommended: item.is_recommended ?? false,
      is_spicy: item.is_spicy ?? false,
      is_veg: item.is_veg ?? true,
      is_vegetarian: item.is_vegetarian ?? true,
      restaurant_id: item.restaurant_id ?? this.restaurantId ?? 1,
      created_at: item.created_at ? new Date(item.created_at) : undefined,
      updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
      created_by: item.created_by,
      updated_by: item.updated_by
    }));
  }

  private normalizeCategory(cat: string): string {
    const lower = cat.toLowerCase().replace(/[\s-]/g, '');
    const map: Record<string, string> = {
      starters: 'Starters',
      maincourse: 'Main Course',
      maindish: 'Main Course',
      salads: 'Salads',
      desserts: 'Desserts',
      beverages: 'Beverages',
      drinks: 'Beverages',
      snacks: 'Snacks'
    };
    return map[lower] || cat;
  }

  get stateName(): string {
    if (!this.restaurant) return '';
    const name = STATE_ID_TO_NAME[this.restaurant.state];
    return name ?? `State #${this.restaurant.state}`;
  }

  get menuCategories(): string[] {
    const cats = new Set(this.allMenus.map(m => m.category));
    return Array.from(cats).sort();
  }

  onCategoryFilter(category: string): void {
    this.selectedCategoryFilter = category;
    this.applyCategoryFilter();
  }

  private applyCategoryFilter(): void {
    if (this.selectedCategoryFilter === 'all') {
      this.menus = [...this.allMenus];
    } else {
      this.menus = this.allMenus.filter(m => m.category === this.selectedCategoryFilter);
    }
  }

  getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'PENDING_VERIFICATION':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'INACTIVE': return 'Inactive';
      case 'SUSPENDED': return 'Suspended';
      case 'PENDING_VERIFICATION': return 'Pending Verification';
      default: return status;
    }
  }

  getImageUrl(image: string): string {
    if (!image) return environment.api.baseUrl + '/uploads/images/default/menu-default.png';
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http')) return image;
    return environment.api.baseUrl + image;
  }

  get heroImage(): string {
    if (this.restaurant?.logo_image) {
      return this.getImageUrl(this.restaurant.logo_image);
    }
    return '';
  }

  get initialLetter(): string {
    return (this.restaurant?.name?.charAt(0) ?? 'R').toUpperCase();
  }

  shareProfile(): void {
    const url = this.formatShareUrl();
    if (navigator.share) {
      navigator.share({
        title: `${this.restaurant?.name ?? 'Restaurant'}`,
        text: `Check out ${this.restaurant?.name ?? 'this restaurant'}!`,
        url
      }).catch(() => {
        this.copyToClipboard(url);
      });
    } else {
      this.copyToClipboard(url);
    }
  }

  private formatShareUrl(): string {
    const base = window.location.origin;
    const path = this.router.serializeUrl(
      this.router.createUrlTree(['/restaurant-profile'], {
        queryParams: { restaurantId: this.restaurantId }
      })
    );
    return base + path;
  }

  private copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.notificationService.success('Copied!', 'Restaurant profile link copied to clipboard.');
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string): void {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      this.notificationService.success('Copied!', 'Restaurant profile link copied to clipboard.');
    } catch {
      this.notificationService.error('Error', 'Unable to copy link.');
    }
    document.body.removeChild(el);
  }
}
