import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { CrudService } from '../../../services/crud.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/mock-data.service';
import { MenuItem } from '../../../interfaces';
import { CartService, CartItem } from '../../../services/cart.service';
import { environment } from '../../../environments/environment';
import { AnimateOnScrollDirective } from '../../../directives/animate-on-scroll.directive';

interface MenuCategory {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-customer-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimateOnScrollDirective],
  templateUrl: './customer-menu.component.html',
  styleUrl: './customer-menu.component.css'
})
export class CustomerMenuComponent implements OnInit {
  private crudService = inject(CrudService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  currentUser: User | null = null;
  allMenuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  recommendedItems: MenuItem[] = [];
  cartItemCount = 0;
  isLoading = false;

  searchQuery: string = '';
  activeCategory: string = 'all';
  activeFeatureFilter: 'all' | 'featured' | 'popular' | 'recommended' = 'all';
  private searchSubject = new Subject<string>();

  pendingOrdersCount = 2;

  categories: MenuCategory[] = [
    { key: 'all', label: 'All', icon: 'fas fa-th' },
    { key: 'starters', label: 'Starters', icon: 'fas fa-leaf' },
    { key: 'main-course', label: 'Main Course', icon: 'fas fa-utensils' },
    { key: 'salads', label: 'Salads', icon: 'fas fa-leaf' },
    { key: 'desserts', label: 'Desserts', icon: 'fas fa-birthday-cake' },
    { key: 'beverages', label: 'Beverages', icon: 'fas fa-coffee' },
    { key: 'snacks', label: 'Snacks', icon: 'fas fa-cookie' }
  ];

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.cartItemCount;
    });
    this.readQueryParams();
    // this.setupSearch();
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
      },
      error: (error) => {
        console.error('Error searching menu items:', error);
        this.allMenuItems = [];
        this.recommendedItems = [];
        this.filterMenuItems();
      }
    });

    this.loadMenuItems();
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
    this.cartService.addToCart(item);
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
}
