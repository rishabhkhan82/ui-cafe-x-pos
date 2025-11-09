import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
}

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
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | null = null;
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
    this.initializeUser();
    this.loadCartCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeUser(): void {
    // Simulate current user (would come from auth service)
    this.currentUser = {
      id: 'user-1',
      name: 'Amit Patil',
      email: 'amit.patil@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      phone: '+91 98765 43210'
    };
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
}
