import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { CrudService } from '../../../services/crud.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { User } from '../../../services/mock-data.service';
import { MenuItem } from '../../../interfaces';
import { CartService, CartItem } from '../../../services/cart.service';
import { environment } from '../../../environments/environment';
import { AnimateOnScrollDirective } from '../../../directives/animate-on-scroll.directive';
import { RealtimeService } from '../../../services/realtime.service';
import { SubscriptionService } from '../../../services/subscription.service';

interface MenuCategory {
  key: string;
  label: string;
  icon: string;
}

interface MenuItemAddonLink {
  id: number;
  menu_item_id: number;
  addon_id: number;
  is_required: boolean;
  min_quantity: number;
  max_quantity: number;
  display_order: number;
  addon_name?: string;
  addon_price?: number;
  addon_image?: string;
}

@Component({
  selector: 'app-customer-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimateOnScrollDirective],
  templateUrl: './customer-menu.component.html',
  styleUrl: './customer-menu.component.css'
})
export class CustomerMenuComponent implements OnInit, OnDestroy {
  private crudService = inject(CrudService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private realtimeService = inject(RealtimeService);
  private notificationService = inject(NotificationService);
  private subscriptions: Subscription[] = [];
  public subscriptionService = inject(SubscriptionService);

  currentUser: User | null = null;
  allMenuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  recommendedItems: MenuItem[] = [];
  cartItemCount = 0;
  isLoading = false;
  currentPlan: string | null = null;

  searchQuery: string = '';
  activeCategory: string = 'all';
  activeFeatureFilter: 'all' | 'featured' | 'popular' | 'recommended' = 'all';
  private searchSubject = new Subject<string>();

  pendingOrdersCount = 2;

  categories: MenuCategory[] = [
    { key: 'all', label: 'All', icon: 'fas fa-th' }
  ];

  private restaurantId: string | null = null;

  selectedItemForAddons: MenuItem | null = null;
  private menuItemAddonsMap: { [menuItemId: number]: any[] } = {};
  private loadedAddonItemIds = new Set<number>();
  selectedAddonQuantities: { [addonId: number]: number } = {};

  constructor() {
    // Keep local copy in sync
    this.subscriptionService.planName$.subscribe(name => {
      this.currentPlan = name;
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.restaurantId = sessionStorage.getItem('current_customer_restaurant_id');
    this.loadRestaurantMenuCategories();
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.cartItemCount;
    });
    this.readQueryParams();
    this.setupSearch();

    const sub = this.realtimeService.menuUpdate$.subscribe((update: any) => {
      if (update) {
        const currentRestaurantId = this.currentUser?.restaurant_id || this.restaurantId;
        if (currentRestaurantId && String(update.restaurantId) === String(currentRestaurantId)) {
          console.log('Menu item updated successfully: ', update);
          this.loadMenuItems(
            this.activeCategory !== 'all' ? this.activeCategory : undefined,
            this.activeFeatureFilter !== 'all' ? this.activeFeatureFilter : undefined
          );
        }
      }
    });
    this.subscriptions.push(sub);

    const categorySub = this.realtimeService.menuCategoryUpdate$.subscribe((update: any) => {
      if (update) {
        const currentRestaurantId = this.currentUser?.restaurant_id || this.restaurantId;
        if (currentRestaurantId && String(update.restaurant_id ?? update.restaurantId) === String(currentRestaurantId)) {
          console.log('Menu category updated successfully: ', update);
          this.loadRestaurantMenuCategories();
        }
      }
    });
    this.subscriptions.push(categorySub);
  }

  private loadRestaurantMenuCategories(): void {
    const restaurantId = Number(this.restaurantId || this.currentUser?.restaurant_id || 0);
    if (!restaurantId) return;

    this.crudService.getRestaurantMenuCategories({ restaurantId, isActive: true }).subscribe({
      next: (response: any) => {
        const categories = response.data || response || [];
        this.categories = [
          { key: 'all', label: 'All', icon: 'fas fa-th' },
          ...categories.map((category: any) => ({
            key: category.key,
            label: category.name,
            icon: category.icon || 'fas fa-layer-group'
          }))
        ];
      },
      error: (error) => {
        console.error('Error loading restaurant menu categories:', error);
        this.categories = [
          { key: 'all', label: 'All', icon: 'fas fa-th' }
        ];
      }
    });
  }

  private readQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      const isFeatured = params['is_featured'];
      const isPopular = params['is_popular'];
      const isRecommended = params['is_recommended'];

      if (category && typeof category === 'string') {
        this.activeCategory = category;
      }

      if (isFeatured === 'true' || isFeatured === '1') {
        this.activeFeatureFilter = 'featured';
      } else if (isPopular === 'true' || isPopular === '1') {
        this.activeFeatureFilter = 'popular';
      } else if (isRecommended === 'true' || isRecommended === '1') {
        this.activeFeatureFilter = 'recommended';
      } else {
        this.activeFeatureFilter = 'all';
      }

      this.loadMenuItems(
        this.activeCategory !== 'all' ? this.activeCategory : undefined,
        this.activeFeatureFilter !== 'all' ? this.activeFeatureFilter : undefined
      );
    });
  }

  private mapApiMenuItemsToMenuItems(apiMenuItems: any[]): MenuItem[] {
    return apiMenuItems.map(item => ({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      price: item.price || 0,
      half_price: item.half_price || item.halfPrice || undefined,
      category: item.category || '',
      image: item.image || '',
      item_id: item.item_id || '',
      discount: item.discount || '',
      original_price: item.original_price || item.originalPrice || item.price || 0,
      preparation_time: item.preparation_time || 0,
      is_active: item.is_active ?? true,
      is_available: item.is_available ?? true,
      is_popular: item.is_popular ?? false,
      is_featured: item.is_featured ?? false,
      is_recommended: item.is_recommended ?? false,
      is_spicy: item.is_spicy ?? false,
      is_veg: item.is_veg ?? item.is_vegetarian ?? true,
      is_vegetarian: item.is_vegetarian ?? true,
      restaurant_id: item.restaurant_id || 1,
      created_at: item.created_at ? new Date(item.created_at) : undefined,
      updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
      created_by: item.created_by,
      updated_by: item.updated_by
    }));
  }

  private loadMenuItems(category?: string, featureFilter?: string): void {
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');
    const params: any = {
      page: 1,
      size: 999,
      restaurant_id: restaurantId
    };

    if (category && category !== 'all') {
      params.category = category;
    }

    if (featureFilter === 'featured') {
      params.is_featured = '1';
    } else if (featureFilter === 'popular') {
      params.is_popular = '1';
    } else if (featureFilter === 'recommended') {
      params.is_recommended = '1';
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      params.name = this.searchQuery.trim();
    }

    this.isLoading = true;
    this.filteredMenuItems = [];
    this.recommendedItems = [];
    
    this.crudService.getMenuItems(params).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response?.data?.length) {
          this.allMenuItems = this.mapApiMenuItemsToMenuItems(response.data);
          this.recommendedItems = this.allMenuItems.filter(item => item.is_recommended).slice(0, 3);
          this.filterMenuItems();
          this.allMenuItems.forEach(item => this.loadMenuItemAddons(item.id));
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading menu items:', error);
        this.allMenuItems = [];
        this.recommendedItems = [];
        this.filteredMenuItems = [];
      }
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchQuery = term;
        const category = term ? 'all' : this.activeCategory;
        const filter = term ? 'all' : this.activeFeatureFilter;
        return this.getMenuItemsObservable(category, term, filter);
      })
    ).subscribe({
      next: (response: any) => {
        this.allMenuItems = this.mapApiMenuItemsToMenuItems(response.data);
        this.recommendedItems = this.allMenuItems.filter(item => item.is_recommended).slice(0, 3);
        this.filterMenuItems();
        this.allMenuItems.forEach(item => this.loadMenuItemAddons(item.id));
      },
      error: (error) => {
        console.error('Error searching menu items:', error);
        this.allMenuItems = [];
        this.recommendedItems = [];
        this.filterMenuItems();
      }
    });
  }

  private getMenuItemsObservable(category?: string, name?: string, featureFilter?: string): Observable<any> {
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');
    const params: any = {
      page: 1,
      size: 999,
      restaurant_id: restaurantId
    };

    if (category && category !== 'all') {
      params.category = category;
    }

    if (featureFilter === 'featured') {
      params.is_featured = '1'
    } else if (featureFilter === 'popular') {
      params.is_popular = '1';
    } else if (featureFilter === 'recommended') {
      params.is_recommended = '1';
    }

    if (name && name.trim()) {
      params.name = name.trim();
    }

    return this.crudService.getMenuItems(params);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  public filterMenuItems(): void {
    this.filteredMenuItems = this.allMenuItems.filter(item => {
      const categoryMatch = this.activeCategory === 'all' || item.category === this.activeCategory;
      const featureMatch =
        this.activeFeatureFilter === 'all' ||
        (this.activeFeatureFilter === 'featured' && item.is_featured) ||
        (this.activeFeatureFilter === 'popular' && item.is_popular) ||
        (this.activeFeatureFilter === 'recommended' && item.is_recommended);
      return categoryMatch && featureMatch;
    });
  }

  setActiveCategory(category: string): void {
    this.activeCategory = category;
    this.activeFeatureFilter = 'all';
    this.updateUrlAndReload(category, undefined);
  }

  setFeatureFilter(filter: 'all' | 'featured' | 'popular' | 'recommended'): void {
    this.activeFeatureFilter = filter;
    this.activeCategory = 'all';
    this.updateUrlAndReload(undefined, filter);
  }

  private updateUrlAndReload(category?: string, featureFilter?: string): void {
    const queryParams: Record<string, any> = {};

    if (category && category !== 'all') {
      queryParams['category'] = category;
    }

    if (featureFilter === 'featured') {
      queryParams['is_featured'] = '1';
    } else if (featureFilter === 'popular') {
      queryParams['is_popular'] = '1';
    } else if (featureFilter === 'recommended') {
      queryParams['is_recommended'] = '1';
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }

  getCategoryButtonClass(category: string): string {
    const baseClass = 'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors';
    const isActive = this.activeCategory === category && this.activeFeatureFilter === 'all';
    if (isActive) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }

  getFeatureFilterClass(filter: string): string {
    const baseClass = 'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors';
    const isActive = this.activeFeatureFilter === filter && this.activeCategory === 'all';
    if (isActive) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }

  getItemsByCategory(category: string): MenuItem[] {
    return this.filteredMenuItems.filter(item => item.category === category);
  }

  getCategoryItemCount(category: string): number {
    return this.getItemsByCategory(category).length;
  }

  addToCart(item: MenuItem): void {
    const selectedAddons = this.buildSelectedAddons(item);
    this.cartService.addToCart(item, 1, selectedAddons);
  }

  addToCartWithQuantity(item: MenuItem, quantity: number): void {
    const selectedAddons = this.buildSelectedAddons(item);
    this.cartService.addToCart(item, quantity, selectedAddons);
  }

  private buildSelectedAddons(item: MenuItem): CartItem['selectedAddons'] {
    const addons = this.getItemAddons(item);
    if (!addons.length) return [];
    return addons
      .map((addon: any) => ({
        addonId: addon.addon_id,
        addonName: addon.addon_name,
        addonPrice: Number(addon.addon_price || 0),
        quantity: this.selectedAddonQuantities[addon.addon_id] || 0,
        isRequired: !!addon.is_required,
        minQuantity: addon.min_quantity || 0,
        maxQuantity: addon.max_quantity || 0
      }))
      .filter(addon => addon.quantity > 0);
  }

  increaseQuantity(item: MenuItem): void {
    this.cartService.increaseQuantity(item);
  }

  decreaseQuantity(item: MenuItem): void {
    this.cartService.decreaseQuantity(item);
  }

  getItemQuantity(item: MenuItem): number {
    return this.cartService.getItemQuantity(item);
  }

  viewCart(): void {
    this.router.navigate(['/customer/cart']);
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    sessionStorage.setItem('theme', newTheme);
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    return environment.api.baseUrl + imagePath;
  }

  private loadMenuItemAddons(menuItemId: number): void {
    if (this.loadedAddonItemIds.has(menuItemId)) return;
    this.loadedAddonItemIds.add(menuItemId);

    this.crudService.getData(`menu-item-addons/menu-item/${menuItemId}`).subscribe({
      next: (response: any) => {
        const data = response || [];
        this.menuItemAddonsMap[menuItemId] = data.map((item: any) => ({
          id: item.id,
          menu_item_id: item.menu_item_id,
          addon_id: item.addon_id,
          is_required: item.is_required,
          min_quantity: item.min_quantity,
          max_quantity: item.max_quantity,
          display_order: item.display_order,
          addon_name: item.addon_name,
          addon_price: item.addon_price,
          addon_image: item.addon_image
        }));
      },
      error: (error) => {
        console.error('Error loading add-ons for menu item:', error);
        this.menuItemAddonsMap[menuItemId] = [];
      }
    });
  }

  hasAddons(item: MenuItem): boolean {
    return Array.isArray(item.addons)
      ? item.addons.length > 0
      : (this.menuItemAddonsMap[item.id]?.length > 0);
  }

  getItemAddons(item: MenuItem | null): any[] {
    if (!item) return [];
    return this.menuItemAddonsMap[item.id] || item.addons || [];
  }

  openAddons(item: MenuItem): void {
    this.selectedItemForAddons = item;
    this.selectedAddonQuantities = {};
    const addons = this.getItemAddons(item) || [];
    const existingCartItem = this.cartService.cartItems.find(cartItem => cartItem.menuItem.id === item.id);
    const existingAddonMap = new Map(
      (existingCartItem?.selectedAddons || []).map(addon => [addon.addonId, addon.quantity])
    );
    addons.forEach((addon: any) => {
      const restoredQuantity = existingAddonMap.get(addon.addon_id);
      if (restoredQuantity !== undefined) {
        this.selectedAddonQuantities[addon.addon_id] = restoredQuantity;
      } else {
        const defaultValue = addon.is_required ? (addon.min_quantity || 1) : 0;
        this.selectedAddonQuantities[addon.addon_id] = defaultValue;
      }
    });
  }

  closeAddons(): void {
    this.selectedItemForAddons = null;
    this.selectedAddonQuantities = {};
  }

  getSelectedAddonQuantity(addonId: number): number {
    return this.selectedAddonQuantities[addonId] || 0;
  }

  setSelectedAddonQuantity(addonId: number, value: number): void {
    const addon = (this.getItemAddons(this.selectedItemForAddons) || []).find((a: any) => a.addon_id === addonId);
    const min = addon ? (addon.min_quantity || 0) : 0;
    const max = addon ? (addon.max_quantity || 0) : 0;
    let next = value;
    if (next > 0 && next < min) next = min;
    if (max > 0 && next > max) next = max;
    this.selectedAddonQuantities[addonId] = next;
  }

  increaseAddonQuantity(addonId: number): void {
    this.setSelectedAddonQuantity(addonId, (this.selectedAddonQuantities[addonId] || 0) + 1);
  }

  decreaseAddonQuantity(addonId: number): void {
    this.setSelectedAddonQuantity(addonId, (this.selectedAddonQuantities[addonId] || 0) - 1);
  }

  toggleAddonInDialog(addon: any): void {
    const currentQuantity = this.getSelectedAddonQuantity(addon.addon_id);
    if (currentQuantity > 0) {
      this.setSelectedAddonQuantity(addon.addon_id, 0);
    } else {
      const minQty = addon.min_quantity || 1;
      this.setSelectedAddonQuantity(addon.addon_id, minQty);
    }
  }

  isAddonSelectedInDialog(addon: any): boolean {
    return this.getSelectedAddonQuantity(addon.addon_id) > 0;
  }

  confirmAddonsAndAddToCart(): void {
    if (!this.selectedItemForAddons) return;
    const existingCartItem = this.cartService.cartItems.find(cartItem => cartItem.menuItem?.id === this.selectedItemForAddons!.id);
    if (!existingCartItem) {
      this.notificationService.warning('Menu Item Required', 'Please add the menu item to the cart first.');
      return;
    }

    const addons = this.getItemAddons(this.selectedItemForAddons) || [];
    const missingRequired = addons.filter((addon: any) => addon.is_required && (this.selectedAddonQuantities[addon.addon_id] || 0) <= 0);
    if (missingRequired.length > 0) {
      this.notificationService.warning('Required Add-ons', `Please select: ${missingRequired.map((a: any) => a.addon_name).join(', ')}`);
      return;
    }

    const selectedAddons = this.buildSelectedAddons(this.selectedItemForAddons) || [];
    if (!selectedAddons.length) {
      this.notificationService.warning('No Add-ons Selected', 'Please select at least one add-on before adding.');
      return;
    }
    this.cartService.updateCartItemAddons(this.selectedItemForAddons, selectedAddons);
    this.notificationService.success('Add-ons Added', 'Add-ons have been updated in your cart.');
    this.closeAddons();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
