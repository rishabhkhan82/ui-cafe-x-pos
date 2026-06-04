import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { CrudService } from '../../../services/crud.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/mock-data.service';
import { MenuItem } from '../../../interfaces';

interface MenuCategory {
  key: string;
  label: string;
  icon: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

@Component({
  selector: 'app-customer-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-menu.component.html',
  styleUrl: './customer-menu.component.css'
})
export class CustomerMenuComponent implements OnInit {
  private crudService = inject(CrudService);
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser: User | null = null;
  allMenuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  recommendedItems: MenuItem[] = [];
  cart: CartItem[] = [];

  searchQuery: string = '';
  activeCategory: string = 'all';
  private searchSubject = new Subject<string>();

  pendingOrdersCount = 2;
  cartItemCount = 3;

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
    this.setupSearch();
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
      original_price: item.original_price || item.price || 0,
      preparation_time: item.preparation_time || 0,
      is_active: item.is_active ?? true,
      is_available: item.is_available ?? true,
      is_popular: item.is_popular ?? false,
      is_spicy: item.is_spicy ?? false,
      is_veg: item.is_veg ?? true,
      is_vegetarian: item.is_vegetarian ?? true,
      restaurant_id: item.restaurant_id || 1,
      created_at: item.created_at ? new Date(item.created_at) : undefined,
      updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
      created_by: item.created_by,
      updated_by: item.updated_by
    }));
  }

  private loadMenuItems(category?: string, name?: string): void {
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');
    const params: any = {
      page: 1,
      size: 999,
      restaurant_id: restaurantId
    };

    if (category && category !== 'all') {
      params.category = category;
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      params.name = this.searchQuery.trim();
    }

    this.crudService.getMenuItems(params).subscribe({
      next: (response: any) => {
        this.allMenuItems = this.mapApiMenuItemsToMenuItems(response.data);
        this.recommendedItems = this.allMenuItems.slice(0, 3);
        this.filterMenuItems();
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.allMenuItems = [];
        this.recommendedItems = [];
        this.filterMenuItems();
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
        return this.getMenuItemsObservable(category, term);
      })
    ).subscribe({
      next: (response: any) => {
        this.allMenuItems = this.mapApiMenuItemsToMenuItems(response.data);
        this.recommendedItems = this.allMenuItems.slice(0, 3);
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

  private getMenuItemsObservable(category?: string, name?: string): Observable<any> {
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');
    const params: any = {
      page: 1,
      size: 999,
      restaurant_id: restaurantId
    };

    if (category && category !== 'all') {
      params.category = category;
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
    this.filteredMenuItems = this.activeCategory === 'all'
      ? [...this.allMenuItems]
      : this.allMenuItems.filter(item => item.category === this.getCategoryCode(this.activeCategory));
  }

  getCategoryCode(label: string): string {
    const category = this.categories.find(c => c.label === label);
    return category ? category.key : label;
  }

  setActiveCategory(category: string): void {
    this.activeCategory = category;
    this.loadMenuItems(category);
  }

  getCategoryButtonClass(category: string): string {
    const baseClass = 'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors';
    if (this.activeCategory === category) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }

  getItemsByCategory(category: string): MenuItem[] {
    return this.allMenuItems.filter(item => item.category === category);
  }

  getCategoryItemCount(category: string): number {
    return this.getItemsByCategory(category).length;
  }

  addToCart(item: MenuItem): void {
    const existingItem = this.cart.find(cartItem => cartItem.menuItem.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ menuItem: item, quantity: 1 });
    }
    this.updateCartCount();
    alert(`${item.name} added to cart!`);
  }

  increaseQuantity(item: MenuItem): void {
    const cartItem = this.cart.find(cartItem => cartItem.menuItem.id === item.id);
    if (cartItem) {
      cartItem.quantity++;
      this.updateCartCount();
    }
  }

  decreaseQuantity(item: MenuItem): void {
    const cartItem = this.cart.find(cartItem => cartItem.menuItem.id === item.id);
    if (cartItem && cartItem.quantity > 0) {
      cartItem.quantity--;
      if (cartItem.quantity === 0) {
        this.cart = this.cart.filter(cartItem => cartItem.menuItem.id !== item.id);
      }
      this.updateCartCount();
    }
  }

  getItemQuantity(item: MenuItem): number {
    const cartItem = this.cart.find(cartItem => cartItem.menuItem.id === item.id);
    return cartItem ? cartItem.quantity : 0;
  }

  private updateCartCount(): void {
    this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    sessionStorage.setItem('theme', newTheme);
  }

  viewCart(): void {
    alert('Navigate to cart page');
  }
}
