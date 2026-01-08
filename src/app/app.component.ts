import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RealtimeService } from './services/realtime.service';
import { AuthService } from './services/auth.service';
import { NavigationMenuComponent } from './components/shared/navigation-menu/navigation-menu.component';
import { LoadingService } from './services/loading.service';
import { ToastNotifierComponent } from './components/common/toast-notifier/app-toast-notifier';
import { ConfirmationDialogComponent } from './components/common/confirmation-dialog/confirmation-dialog.component';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'platform_owner' | 'restaurant_owner' | 'manager' | 'kitchen_manager' | 'cashier' | 'waiter' | 'customer';
  restaurantId?: string;
  avatar?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NavigationMenuComponent, ToastNotifierComponent, ConfirmationDialogComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'cafe-x-pos';

  currentUser: User | null = null;
  notificationPermission: NotificationPermission = 'default';
  showNotificationPrompt = false;
  isLoggedIn: boolean = false;
  isLoading = false;

  // Header properties
  currentDateTime: string = '';
  lastBackupTime: string = '2 hours ago';

  private realtimeService = inject(RealtimeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  ngOnInit() {
    // Load theme preference
    const savedTheme = sessionStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    // Check notification permission
    this.checkNotificationPermission();

    // Subscribe to real-time events
    this.setupRealtimeSubscriptions();

    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = {
          id: user.id,
          name: user.name,
          email: '', // AuthService doesn't have email, so we'll leave it empty
          role: user.role as any,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' // Default avatar
        };
        this.isLoggedIn = true;
      } else {
        this.currentUser = null;
        this.isLoggedIn = false;
      }
    });

    // Initialize date/time updates
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);

    // Initialize authentication state on app start
    this.initializeAuthState();

    // Subscribe to global loading state
    this.loadingService.loading$.subscribe(
      loading => this.isLoading = loading
    );
  }

  private initializeAuthState(): void {
    // Check if user is already logged in from sessionStorage
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isLoggedIn = true;
      this.currentUser = {
        id: currentUser.id,
        name: currentUser.name,
        email: '',
        role: currentUser.role as any,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      };
    } else {
      this.isLoggedIn = false;
      this.currentUser = null;
    }
  }

  private updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  // Remove the isLoggedIn() method since we're using the variable now

  private checkNotificationPermission(): void {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      if (Notification.permission === 'default') {
        // Show prompt after a short delay
        setTimeout(() => {
          this.showNotificationPrompt = true;
        }, 3000);
      }
    }
  }

  private setupRealtimeSubscriptions(): void {
    // Listen for new orders
    this.realtimeService.newOrder$.subscribe(order => {
      if (order) {
        console.log('New order received:', order);
        // Could show in-app notification or update UI
      }
    });

    // Listen for order updates
    this.realtimeService.orderUpdate$.subscribe(order => {
      if (order) {
        console.log('Order updated:', order);
        // Could show in-app notification or update UI
      }
    });

    // Listen for new notifications
    this.realtimeService.newNotification$.subscribe(notification => {
      if (notification) {
        console.log('New notification:', notification);
        // Could show in-app notification or update UI
      }
    });
  }

  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (isDark) {
      html.classList.remove('dark');
      sessionStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      sessionStorage.setItem('theme', 'dark');
    }
  }

  async requestNotificationPermission(): Promise<void> {
    try {
      this.notificationPermission = await this.realtimeService.requestNotificationPermissionManually();
      this.showNotificationPrompt = false;
    } catch (error) {
      console.warn('Error requesting notification permission:', error);
    }
  }

  dismissNotificationPrompt(): void {
    this.showNotificationPrompt = false;
  }

  // Method to switch user roles for demo purposes
  // switchUserRole(role: User['role']) {
  //   const users: Record<string, User> = {
  //     platform_owner: {
  //       id: '1',
  //       name: 'Platform Owner',
  //       email: 'owner@cafexpos.com',
  //       role: 'platform_owner'
  //     },
  //     restaurant_owner: {
  //       id: '2',
  //       name: 'Rishabh Khandekar',
  //       email: 'rishabh@cafe.com',
  //       role: 'restaurant_owner',
  //       restaurantId: 'cafe-1'
  //     },
  //     kitchen_manager: {
  //       id: '3',
  //       name: 'Chef Kumar',
  //       email: 'chef@cafe.com',
  //       role: 'kitchen_manager',
  //       restaurantId: 'cafe-1'
  //     },
  //     cashier: {
  //       id: '4',
  //       name: 'Priya Singh',
  //       email: 'priya@cafe.com',
  //       role: 'cashier',
  //       restaurantId: 'cafe-1'
  //     },
  //     waiter: {
  //       id: '5',
  //       name: 'Rahul Verma',
  //       email: 'rahul@cafe.com',
  //       role: 'waiter',
  //       restaurantId: 'cafe-1'
  //     },
  //     customer: {
  //       id: '6',
  //       name: 'Amit Patil',
  //       email: 'amit@gmail.com',
  //       role: 'customer'
  //     }
  //   };

  //   this.currentUser = users[role] || users['platform_owner'];
  // }

  // Test methods for demo
  triggerTestOrder(): void {
    this.realtimeService.triggerTestOrder();
  }

  triggerTestNotification(): void {
    this.realtimeService.triggerTestNotification();
  }

  login(): void {
    // For demo purposes, simulate login by setting a user
    this.currentUser = {
      id: '1',
      name: 'Demo User',
      email: 'demo@cafex.com',
      role: 'platform_owner'
    };
  }

  logout(): void {
    this.authService.logout();
  }
}
