import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { GuestAuthService, GuestCustomer } from '../../../services/guest-auth.service';
import { AuthService } from '../../../services/auth.service';
import { CrudService } from '../../../services/crud.service';
import { User } from '../../../services/mock-data.service';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
  category: string;
  isVeg: boolean;
  isPopular: boolean;
  rating?: number;
  tags: string[];
}

interface Category {
  key: string;
  label: string;
  icon: string;
}

interface MenuCategory {
  key: string;
  name: string;
  icon: string;
  colorClass: string;
  itemCount: number;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private guestAuthService = inject(GuestAuthService);
  private authService = inject(AuthService);
  private crudService = inject(CrudService);
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | any = null;
  currentGuest: GuestCustomer | null = null;
  isLoadingGuest: boolean = false;
  guestError: string | null = null;
  restaurantId: number = 1;
  tableNumber: number = 0;
  currentTable: string = '12';
  restaurantRating: string = '4.5';
  estimatedDeliveryTime: string = '25-30';
  searchQuery: string = '';
  activeCategory: string = 'all';
  cartItemCount: number = 0;
  pendingOrdersCount: number = 2;

  // Categories for filtering
  categories: Category[] = [
    { key: 'all', label: 'All', icon: 'fas fa-th-large' },
    { key: 'popular', label: 'Popular', icon: 'fas fa-fire' },
    { key: 'veg', label: 'Vegetarian', icon: 'fas fa-leaf' },
    { key: 'spicy', label: 'Spicy', icon: 'fas fa-pepper-hot' },
    { key: 'top_rated', label: 'Top Rated', icon: 'fas fa-star' },
    { key: 'offers', label: 'Offers', icon: 'fas fa-gift' }
  ];

  // Menu categories
  menuCategories: MenuCategory[] = [
    {
      key: 'starters',
      name: 'Starters',
      icon: 'fas fa-pepper-hot',
      colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-500',
      itemCount: 12
    },
    {
      key: 'mains',
      name: 'Main Course',
      icon: 'fas fa-hamburger',
      colorClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500',
      itemCount: 24
    },
    {
      key: 'salads',
      name: 'Salads',
      icon: 'fas fa-leaf',
      colorClass: 'bg-green-100 dark:bg-green-900/30 text-green-500',
      itemCount: 8
    },
    {
      key: 'desserts',
      name: 'Desserts',
      icon: 'fas fa-ice-cream',
      colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',
      itemCount: 6
    }
  ];

  // Featured items
  featuredItems: MenuItem[] = [
    {
      id: '1',
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken',
      price: 320,
      originalPrice: 380,
      discount: '15% off',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhcHDKHodUP73sbQofmFqGyCRqgBK3_PmA8w&s',
      category: 'mains',
      isVeg: false,
      isPopular: true,
      rating: 4.8,
      tags: ['spicy', 'popular']
    },
    {
      id: '2',
      name: 'Hyderabadi Biryani',
      description: 'Aromatic basmati rice with spiced meat',
      price: 280,
      image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=80&h=80&fit=crop',
      category: 'mains',
      isVeg: false,
      isPopular: true,
      rating: 4.8,
      tags: ['spicy', 'popular']
    },
    {
      id: '3',
      name: 'Margherita Pizza',
      description: 'Classic tomato, mozzarella, and basil',
      price: 250,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=80&h=80&fit=crop',
      category: 'mains',
      isVeg: true,
      isPopular: true,
      rating: 4.5,
      tags: ['veg', 'popular']
    }
  ];

  // Popular items
  popularItems: MenuItem[] = [
    {
      id: '4',
      name: 'Tandoori Chicken',
      description: 'Spiced and grilled chicken',
      price: 350,
      image: 'https://static.vecteezy.com/system/resources/thumbnails/029/858/402/small/of-tandoori-chicken-as-a-dish-in-a-high-end-restaurant-generative-ai-photo.jpg',
      category: 'starters',
      isVeg: false,
      isPopular: true,
      tags: ['spicy', 'grilled']
    },
    {
      id: '5',
      name: 'Paneer Tikka',
      description: 'Grilled cottage cheese',
      price: 220,
      image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=128&fit=crop',
      category: 'starters',
      isVeg: true,
      isPopular: true,
      tags: ['veg', 'grilled']
    }
  ];

  ngOnInit(): void {
    // Extract route parameters first
    const params = this.route.snapshot.params;
    const restaurantIdParam = params['restaurantId'];
    const tableNumberParam = params['tableNumber'];
    this.restaurantId = restaurantIdParam ? +restaurantIdParam : 1;
    this.tableNumber = tableNumberParam ? +tableNumberParam : 0;

    // Store table number for guest session
    localStorage.setItem('guest_table_no', this.tableNumber.toString());

    console.log('Route params:', params);
    console.log('Parsed restaurantId:', this.restaurantId, 'tableNumber:', this.tableNumber);

    this.initializeGuest();
    this.loadCartCount();
  }



  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeUser(): void {
    // Check if guest user is already stored
    const storedGuestUser = this.guestAuthService.getCurrentGuestUser();
    if (storedGuestUser) {
      this.currentUser = {
        id: storedGuestUser.customer.id,
        customer_id: storedGuestUser.customer.customerId,
        name: storedGuestUser.customer.name + '-' + storedGuestUser.customer.id,
        email: storedGuestUser.customer.email || '',
        avatar: storedGuestUser.customer.avatar || '',
        phone: storedGuestUser.customer.phone || '',
        role: 'customer',
        username: storedGuestUser.customer.customerId,
        password: '',
        user_type: 'customer',
        is_active: 'true',
        restaurant_id: storedGuestUser.customer.restaurant?.id?.toString(),
        member_since: storedGuestUser.customer.createdAt ? new Date(storedGuestUser.customer.createdAt) : new Date(),
        created_at: storedGuestUser.customer.createdAt ? new Date(storedGuestUser.customer.createdAt) : new Date(),
        updated_at: storedGuestUser.customer.updatedAt ? new Date(storedGuestUser.customer.updatedAt) : new Date()
      };
      this.authService.setCurrentUser(this.currentUser);
    }
  }

  private initializeGuest(): void {
    // Check if guest is already available
    if (this.guestAuthService.isGuestAvailable()) {
      // Guest exists, try to load data
      this.loadExistingGuest();
    } else {
      // No guest, create new one
      this.createNewGuest();
    }
  }

  private loadExistingGuest(): void {
    this.isLoadingGuest = true;
    this.guestError = null;

    // Try to get existing guest data from localStorage
    const currentGuestUser = this.guestAuthService.getCurrentGuestUser();
    if (currentGuestUser && currentGuestUser.customer) {
      // Use stored guest data
      const guest = currentGuestUser.customer;
      this.currentGuest = guest;
      this.setCurrentUserFromGuest(guest);
      this.isLoadingGuest = false;
      setTimeout(() => {
        this.initializeUser();
      }, 100);
    } else {
      // No stored guest data, create new guest
      this.createNewGuest();
    }
  }

  private createNewGuest(): void {
    this.isLoadingGuest = true;
    this.guestError = null;

    console.log('Creating new guest for restaurantId:', this.restaurantId);

    this.guestAuthService.ensureGuestExists(this.restaurantId).pipe(
      timeout(15000),
      catchError(error => {
        console.error('Guest creation timeout or error:', error);
        throw new Error('Unable to create guest session. Please check your connection and try again.');
      })
    ).subscribe({
      next: (guest) => {
        this.currentGuest = guest;
        this.isLoadingGuest = false;
        if (guest) {
          this.setCurrentUserFromGuest(guest);
          setTimeout(() => {
            this.initializeUser();
          }, 100);
        } else {
          this.guestError = 'Failed to create guest session. Please refresh the page.';
        }
      },
      error: (error) => {
        console.error('Guest creation error:', error);
        this.guestError = 'Unable to create guest session. Please check your connection and try again.';
        this.isLoadingGuest = false;
      }
    });
  }

  private setCurrentUserFromGuest(guest: GuestCustomer): void {
    const customerId = guest.customerId || 'guest-' + Date.now();

    this.currentUser = {
      id: customerId,
      name: guest.name || 'Guest',
      email: guest.email || '',
      avatar: guest.avatar || '',
      phone: guest.phone || '',
      role: 'customer',
      username: customerId,
      password: '',
      user_type: 'customer',
      is_active: 'true',
      restaurant_id: guest.restaurant?.id?.toString() || this.restaurantId.toString(),
      member_since: guest.createdAt ? new Date(guest.createdAt) : new Date(),
      created_at: guest.createdAt ? new Date(guest.createdAt) : new Date(),
      updated_at: guest.updatedAt ? new Date(guest.updatedAt) : new Date()
    };

    this.authService.setCurrentUser(this.currentUser);
  }

  private loadCartCount(): void {
    // Simulate cart count (would come from cart service)
    this.cartItemCount = 3;
  }

  // Theme toggle
  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    sessionStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  // Category filtering
  setActiveCategory(categoryKey: string): void {
    this.activeCategory = categoryKey;
    // In a real app, this would filter the menu items
    console.log('Active category:', categoryKey);
  }

  getCategoryButtonClass(categoryKey: string): string {
    const baseClass = 'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300';

    if (this.activeCategory === categoryKey) {
      return `${baseClass} bg-primary-500 text-white`;
    }

    return `${baseClass} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`;
  }

  // Search functionality
  filterMenuItems(): void {
    // In a real app, this would filter items based on search query
    console.log('Searching for:', this.searchQuery);
  }

  // Cart functionality
  addToCart(item: MenuItem): void {
    this.cartItemCount++;
    // In a real app, this would add item to cart service
    console.log('Added to cart:', item.name);
  }

  viewCart(): void {
    // Navigate to cart or show cart modal
    console.log('Viewing cart');
  }

  retryGuestInitialization(): void {
    this.initializeGuest();
  }
}
