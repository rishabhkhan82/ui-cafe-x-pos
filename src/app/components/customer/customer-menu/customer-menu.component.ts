import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User, MenuItem } from '../../../services/mock-data.service';

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
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  allMenuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  recommendedItems: MenuItem[] = [];
  cart: CartItem[] = [];

  // Filters and search
  searchQuery: string = '';
  activeCategory: string = 'all';

  // Mock data
  pendingOrdersCount = 2;
  cartItemCount = 3;

  categories: MenuCategory[] = [
    { key: 'all', label: 'All', icon: 'fas fa-th' },
    { key: 'starters', label: 'Starters', icon: 'fas fa-leaf' },
    { key: 'mains', label: 'Main Course', icon: 'fas fa-utensils' },
    { key: 'desserts', label: 'Desserts', icon: 'fas fa-birthday-cake' },
    { key: 'beverages', label: 'Beverages', icon: 'fas fa-coffee' }
  ];

  ngOnInit(): void {
    this.initializeData();
    this.loadMenuItems();
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('customer') || null;
  }

  private loadMenuItems(): void {
    this.mockDataService.getMenuItems().subscribe(items => {
      this.allMenuItems = items;
      this.recommendedItems = items.slice(0, 3); // First 3 items as recommended
      this.filterMenuItems();
    });
  }

  filterMenuItems(): void {
    let filtered = [...this.allMenuItems];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(item => {
        switch (this.activeCategory) {
          case 'starters': return item.category === 'Starters';
          case 'mains': return item.category === 'Main Course';
          case 'desserts': return item.category === 'Desserts';
          case 'beverages': return item.category === 'Beverages';
          default: return true;
        }
      });
    }

    this.filteredMenuItems = filtered;
  }

  setActiveCategory(category: string): void {
    this.activeCategory = category;
    this.filterMenuItems();
  }

  getCategoryButtonClass(category: string): string {
    const baseClass = 'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors';
    if (this.activeCategory === category) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }

  getItemsByCategory(category: string): MenuItem[] {
    switch (category) {
      case 'starters':
        return this.filteredMenuItems.filter(item => item.category === 'Starters');
      case 'mains':
        return this.filteredMenuItems.filter(item => item.category === 'Main Course');
      case 'desserts':
        return this.filteredMenuItems.filter(item => item.category === 'Desserts');
      case 'beverages':
        return this.filteredMenuItems.filter(item => item.category === 'Beverages');
      default:
        return [];
    }
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
