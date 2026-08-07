import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { GuestAuthService, GuestCustomer } from '../../../services/guest-auth.service';
import { AuthService } from '../../../services/auth.service';
import { CrudService } from '../../../services/crud.service';
import { User } from '../../../services/mock-data.service';
import { MenuItem, PromotionalBanner } from '../../../interfaces';
import { CartService } from '../../../services/cart.service';
import { environment } from '../../../environments/environment';
import { AnimateOnScrollDirective } from '../../../directives/animate-on-scroll.directive';
import { RealtimeService } from '../../../services/realtime.service';
import { SubscriptionService } from '../../../services/subscription.service';
import { RestaurantDataService } from '../../../services/restaurant-data.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimateOnScrollDirective],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private guestAuthService = inject(GuestAuthService);
  private authService = inject(AuthService);
  private crudService = inject(CrudService);
  private cartService = inject(CartService);
  private realtimeService = inject(RealtimeService);
  public subscriptionService = inject(SubscriptionService);
  private restaurantDataService = inject(RestaurantDataService);
  private subscriptions: Subscription[] = [];

  currentUser: User | any = null;
  currentGuest: GuestCustomer | null = null;
  isLoadingGuest: boolean = false;
  guestError: string | null = null;
  restaurantId: number = 0;
  tableNumber: number = 0;
  estimatedDeliveryTime: string = '05-10';
  activeCategory: string = 'all';
  cartItemCount: number = 0;
  currentPlan: string | null = null;
  restaurantName: string = '';

  menuCategories = [
    { key: 'starters', name: 'Starters', icon: 'fas fa-pepper-hot', colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-500', itemCount: 0 },
    { key: 'main-course', name: 'Main Course', icon: 'fas fa-utensils', colorClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500', itemCount: 0 },
    { key: 'salads', name: 'Salads', icon: 'fas fa-leaf', colorClass: 'bg-green-100 dark:bg-green-900/30 text-green-500', itemCount: 0 },
    { key: 'desserts', name: 'Desserts', icon: 'fas fa-ice-cream', colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500', itemCount: 0 },
    { key: 'beverages', name: 'Beverages', icon: 'fas fa-coffee', colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500', itemCount: 0 },
    { key: 'snacks', name: 'Snacks', icon: 'fas fa-cookie', colorClass: 'bg-pink-100 dark:bg-pink-900/30 text-pink-500', itemCount: 0 }
  ];

  featuredItems: MenuItem[] = [];
  popularItems: MenuItem[] = [];
  private allMenuItems: MenuItem[] = [];

  promotionalBanners: PromotionalBanner[] = [];
  currentBannerIndex = 0;
  private bannerAutoSlideInterval: any;

  isDashboardReady = false;
  private dashboardDataLoadCount = 0;

  constructor() {
    // Keep local copy in sync
    this.subscriptionService.planName$.subscribe(name => {
      this.currentPlan = name;
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    const restaurantIdParam = params['restaurantId'];
    const tableNumberParam = params['tableNumber'];

    if (restaurantIdParam && tableNumberParam) {
      this.restaurantId = parseInt(restaurantIdParam, 10);
      this.tableNumber = parseInt(tableNumberParam, 10);

      localStorage.setItem(`guest_table_no_${this.restaurantId}`, this.tableNumber.toString());
      this.guestAuthService.setCurrentRestaurantContext(this.restaurantId);
    }

    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.cartItemCount;
    });

    this.initializeGuest();

    const sub = this.realtimeService.menuUpdate$.subscribe((update: any) => {
      if (update) {
        const currentRestaurantId = this.restaurantId || this.guestAuthService.getCurrentRestaurantId();
        if (currentRestaurantId && String(update.restaurantId) === String(currentRestaurantId)) {
          console.log('Menu item updated successfully: ', update);
          this.loadMenuData();
        }
      }
    });
    
    this.restaurantDataService.restaurant$.subscribe((restaurant: any) => {
      console.log('[CustomerDashboard] Current restaurant data:', restaurant);
      if (restaurant && restaurant.name) {
        this.restaurantName = restaurant.name;
      } else {
        this.restaurantName = '';
      }
    });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.stopBannerAutoSlide();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeComponent(): void {
    this.isDashboardReady = false;
    this.dashboardDataLoadCount = 0;
    this.loadMenuData();
    this.loadPromotionalBanners();
  }

  private onDashboardDataLoaded(): void {
    this.dashboardDataLoadCount++;
    if (this.dashboardDataLoadCount >= 2) {
      this.isDashboardReady = true;
    }
  }

  private initializeGuest(): void {
    const isAvailable = this.guestAuthService.isGuestAvailable(this.restaurantId);
    if (isAvailable) {
      this.loadExistingGuest();
    } else {
      this.createNewGuest();
    }
  }

  private loadExistingGuest(): void {
    this.isLoadingGuest = true;
    this.guestError = null;

    const currentGuestUser = this.guestAuthService.getCurrentGuestUser(this.restaurantId);
    const guestId = this.guestAuthService.getStoredGuestId(this.restaurantId);

    if (guestId) {
      const sub = this.crudService.validateCustomer(guestId, this.restaurantId).pipe(
        timeout(15000),
        catchError(error => {
          console.error('Guest validation timeout or error:', error);
          throw error;
        })
      ).subscribe({
        next: (response: any) => {
          try {
            const key = `currentGuestUser_${this.restaurantId}`;
            localStorage.setItem(key, JSON.stringify(response));

            this.currentGuest = response.customer;
            this.setCurrentUserFromGuest(response);
            this.isLoadingGuest = false;
            setTimeout(() => this.initializeComponent(), 100);
          } catch (error) {
            console.error('Error in validate response handler:', error);
            const guest = currentGuestUser.customer;
            this.currentGuest = guest;
            this.setCurrentUserFromGuest(currentGuestUser);
            this.isLoadingGuest = false;
            setTimeout(() => this.initializeComponent(), 100);
          }
        },
        error: (error: any) => {
          console.error('Failed to refresh guest data:', error);
          if (currentGuestUser && currentGuestUser.customer) {
            const guest = currentGuestUser.customer;
            this.currentGuest = guest;
            this.setCurrentUserFromGuest(currentGuestUser);
          } else {
            this.createNewGuest();
            return;
          }
          this.isLoadingGuest = false;
          setTimeout(() => this.initializeComponent(), 100);
        }
      });
      this.subscriptions.push(sub);
    } else {
      this.createNewGuest();
    }
  }

  private createNewGuest(): void {
    this.isLoadingGuest = true;
    this.guestError = null;

    const sub = this.guestAuthService.ensureGuestExists(this.restaurantId).pipe(
      timeout(15000),
      catchError(error => {
        console.error('Guest creation timeout or error:', error);
        throw new Error('Unable to create guest session. Please check your connection and try again.');
      })
    ).subscribe({
      next: (guestResponse) => {
        this.currentGuest = guestResponse.customer;
        this.isLoadingGuest = false;
        if (guestResponse) {
          this.setCurrentUserFromGuest(guestResponse);
          setTimeout(() => this.initializeComponent(), 100);
        } else {
          this.guestError = 'Failed to create guest session. Please refresh the page.';
        }
      },
      error: (error: any) => {
        console.error('Guest creation error:', error);
        this.guestError = error instanceof Error ? error.message : 'Unable to create guest session. Please check your connection and try again.';
        this.isLoadingGuest = false;
      }
    });
    this.subscriptions.push(sub);
  }

  private setCurrentUserFromGuest(guestResponse: any): void {
    const guest = guestResponse.customer;
    const accessToken = guestResponse.accessToken;
    const customerId = guest.customerId || 'guest-' + Date.now();

    this.currentUser = {
      id: guest.id,
      name: guest.name || 'Guest',
      email: guest.email || '',
      avatar: guest.avatar || '',
      phone: guest.phone || '',
      role: 'customer',
      username: customerId,
      password: '',
      user_type: 'customer',
      is_active: 'true',
      restaurant_id: guest.restaurantId?.toString() || this.restaurantId.toString(),
      member_since: guest.createdAt ? new Date(guest.createdAt) : new Date(),
      created_at: guest.createdAt ? new Date(guest.createdAt) : new Date(),
      updated_at: guest.updatedAt ? new Date(guest.updatedAt) : new Date()
    };

    this.authService.setCurrentUser(this.currentUser);
    if (accessToken) {
      this.authService.setGuestAccessToken(accessToken);
    }
  }

  private loadMenuData(): void {
    const restaurantIdParam = this.restaurantId || this.guestAuthService.getCurrentRestaurantId();
    if (!restaurantIdParam) return;

    const sub = this.crudService.getMenuItems({ page: 1, size: 999, restaurant_id: restaurantIdParam as number }).subscribe({
      next: (response: any) => {
        const raw = response.data || [];
        this.allMenuItems = raw.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          description: item.description || '',
          price: item.price || 0,
          category: item.category || '',
          image: item.image || '',
          item_id: item.item_id || '',
          discount: item.discount || '',
          original_price: item.original_price || item.originalPrice || undefined,
          preparation_time: item.preparation_time || 0,
          is_active: item.is_active ?? true,
          is_available: item.is_available ?? true,
          is_popular: item.is_popular ?? false,
          is_featured: item.is_featured ?? false,
          is_spicy: item.is_spicy ?? false,
          is_veg: item.is_veg ?? item.is_vegetarian ?? true,
          is_vegetarian: item.is_vegetarian ?? true,
          restaurant_id: item.restaurant_id || this.restaurantId,
          created_at: item.created_at ? new Date(item.created_at) : undefined,
          updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
          created_by: item.created_by,
          updated_by: item.updated_by
        }));
        this.featuredItems = this.allMenuItems.filter(item => item.is_featured).slice(0, 3);
        this.popularItems = this.allMenuItems.filter(item => item.is_popular).slice(0, 2);

        this.menuCategories = this.menuCategories.map(cat => ({
          ...cat,
          itemCount: raw.filter((item: any) => item.category === cat.key).length
        }));
        this.onDashboardDataLoaded();
      },
      error: (error) => {
        console.error('Failed to load menu data:', error);
        this.featuredItems = [];
        this.popularItems = [];
        this.onDashboardDataLoaded();
      }
    });
    this.subscriptions.push(sub);
  }

  setActiveCategory(categoryKey: string): void {
    this.activeCategory = categoryKey;
    this.router.navigate(['/customer/menu'], { queryParams: { category: categoryKey } });
  }

  getCategoryButtonClass(categoryKey: string): string {
    const baseClass = 'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300';
    if (this.activeCategory === categoryKey) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`;
  }

  addToCart(item: MenuItem): void {
    this.cartService.addToCart(item as any);
  }

  increaseQuantity(item: MenuItem): void {
    this.cartService.increaseQuantity(item as any);
  }

  decreaseQuantity(item: MenuItem): void {
    this.cartService.decreaseQuantity(item as any);
  }

  getItemQuantity(item: MenuItem): number {
    return this.cartService.getItemQuantity(item as any);
  }

  viewFeaturedAll(): void {
    this.router.navigate(['/customer/menu'], { queryParams: { is_featured: true } });
  }

  viewPopularAll(): void {
    this.router.navigate(['/customer/menu'], { queryParams: { is_popular: true } });
  }

  viewCart(): void {
    this.router.navigate(['/customer/cart']);
  }

  retryGuestInitialization(): void {
    this.initializeGuest();
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/images/placeholder.png';
    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
      return imagePath;
    }
    return environment.api.baseUrl + imagePath;
  }

  private loadPromotionalBanners(): void {
    const restaurantIdParam = this.restaurantId || this.guestAuthService.getCurrentRestaurantId();
    if (!restaurantIdParam) return;

    const params: any = {
      page: 1,
      size: 10,
      restaurantId: restaurantIdParam,
      isActive: 'true'
    };

    this.crudService.getPromotionalBanners(params).subscribe({
      next: (response: any) => {
        const raw = response.data || [];
        this.promotionalBanners = raw.map((banner: any) => ({
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
        })).sort((a: any, b: any) => a.displayOrder - b.displayOrder);

        this.currentBannerIndex = 0;
        this.startBannerAutoSlide();
        this.onDashboardDataLoaded();
      },
      error: (error) => {
        console.error('Failed to load promotional banners:', error);
        this.promotionalBanners = [];
        this.onDashboardDataLoaded();
      }
    });
  }

  private startBannerAutoSlide(): void {
    this.stopBannerAutoSlide();
    if (this.promotionalBanners.length > 1) {
      this.bannerAutoSlideInterval = setInterval(() => {
        this.nextBanner();
      }, 4000);
    }
  }

  private stopBannerAutoSlide(): void {
    if (this.bannerAutoSlideInterval) {
      clearInterval(this.bannerAutoSlideInterval);
      this.bannerAutoSlideInterval = null;
    }
  }

  nextBanner(): void {
    if (this.promotionalBanners.length === 0) return;
    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.promotionalBanners.length;
  }

  prevBanner(): void {
    if (this.promotionalBanners.length === 0) return;
    this.currentBannerIndex = (this.currentBannerIndex - 1 + this.promotionalBanners.length) % this.promotionalBanners.length;
  }

  goToBanner(index: number): void {
    this.currentBannerIndex = index;
  }

  pauseBannerAutoSlide(): void {
    this.stopBannerAutoSlide();
  }

  resumeBannerAutoSlide(): void {
    this.startBannerAutoSlide();
  }

  get currentBanner(): PromotionalBanner | null {
    if (this.promotionalBanners.length === 0) return null;
    return this.promotionalBanners[this.currentBannerIndex] || null;
  }

  shareProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurant_id || currentUser?.restaurantId;
    if (!restaurantId) return;

    const shareUrl = `${window.location.origin}/restaurant-profile/${restaurantId}`;
    const shareData = {
      title: this.restaurantName ? `${this.restaurantName} - Restaurant Profile` : 'Restaurant Profile',
      text: this.restaurantName
        ? `Check out ${this.restaurantName}'s profile!`
        : 'Check out this restaurant profile!',
      url: shareUrl
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Profile link copied to clipboard:', text);
    }).catch(() => {
      console.error('Failed to copy profile link:', text);
    });
  }
}
