import { Component, OnInit, AfterViewInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RealtimeService } from './services/realtime.service';
import { AuthService } from './services/auth.service';
import { GuestAuthService } from './services/guest-auth.service';
import { SystemConfigService } from './services/system-config.service';
import { NavigationMenuComponent } from './components/shared/navigation-menu/navigation-menu.component';
import { LoadingService } from './services/loading.service';
import { ToastNotifierComponent } from './components/common/toast-notifier/app-toast-notifier';
import { ConfirmationDialogComponent } from './components/common/confirmation-dialog/confirmation-dialog.component';
import { CommonUserNotificationsComponent } from './components/common/common-user-notifications/common-user-notifications.component';
import { NavigationMenu } from './services/mock-data.service';
import { environment } from './environments/environment';
import { CartService } from './services/cart.service';
import { PendingordersService } from './services/pendingorders.service';
import { PendingBillsService } from './services/pending-bills.service';
import { NotificationService } from './services/notification.service';
import { NotificationRoutingService } from './services/notification-routing.service';
import { GetRestAndPlatformUsersService } from './services/get-rest-and-platform-users.service';
import { SubscriptionService } from './services/subscription.service';
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
  imports: [CommonModule, RouterModule, RouterOutlet, NavigationMenuComponent, ToastNotifierComponent, ConfirmationDialogComponent, CommonUserNotificationsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'cafe-x-pos';

  currentUser: User | any = "";
  notificationPermission: NotificationPermission = 'default';
  showNotificationPrompt = false;
  isLoggedIn: boolean = false;
  isLoading = false;
  isProfileMenuOpen: boolean = false;
  pendingOrdersCount: number = 0;

  currentDateTime: string = '';
  lastBackupTime: string = '2 hours ago';

  private realtimeService = inject(RealtimeService);
  private authService = inject(AuthService);
  private guestAuthService = inject(GuestAuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private cartService = inject(CartService);
  private pendingOrdersService = inject(PendingordersService);
  private pendingBillsService = inject(PendingBillsService);
  private systemConfigService = inject(SystemConfigService);
  private notificationService = inject(NotificationService);
  private routingService = inject(NotificationRoutingService);
  private getRestAndPlatformUsersService = inject(GetRestAndPlatformUsersService);
  private subscriptionService = inject(SubscriptionService);
  cartItemCount = 0;

  @ViewChild(NavigationMenuComponent) navMenu!: NavigationMenuComponent;

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
          email: user.email || '',
          role: user.role as any,
          restaurantId: user.restaurantId || user.restaurant_id || '',
          avatar: user.avatar ? (user.avatar.startsWith('data:') || user.avatar.startsWith('http://') || user.avatar.startsWith('https://') ? user.avatar : environment.api.baseUrl + '/' + user.avatar.replace(/^\//, '')) : user.avatar
        };
        this.isLoggedIn = true;
        console.log('[AppComponent] Current user set:', this.currentUser);
        const restaurantId = user.role === 'customer'
          ? sessionStorage.getItem('current_customer_restaurant_id') || ''
          : (user.role === 'platform_owner' ? null : (this.currentUser.restaurantId || ''));
        this.realtimeService.connect(user.id, String(restaurantId), user.role);
        // Subscribe to pending orders and bills if the user is a customer
        if (this.isLoggedIn && this.currentUser?.role === 'customer') {
          this.pendingOrdersService.pendingCount$.subscribe(count => {
            this.pendingOrdersCount = count;
          });
          this.pendingOrdersService.refreshCount().subscribe();
          this.pendingBillsService.refreshPendingBills().subscribe();
        }
        // Get notification recipients for the restaurant
        this.loadNotificationRecipients(restaurantId ?? '');
        this.subscriptionService.loadActiveSubscription().subscribe();
      } else {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.realtimeService.disconnect();
      }
    });

    // Initialize date/time updates
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);


    // Subscribe to global loading state
    this.loadingService.loading$.subscribe(
      loading => this.isLoading = loading
    );

    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.cartItemCount;
    });

    this.systemConfigService.getSystemSettings().subscribe();
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
    this.realtimeService.newOrder$.subscribe(order => {
      console.log('New order received:', order);
      console.log('Current user:', this.currentUser);
      if (order && this.currentUser) {
        this.processOrderNotification(order);
      }
    });

    this.realtimeService.orderUpdate$.subscribe(order => {
      console.log('Order updated:', order);
      console.log('Current user:', this.currentUser);
      if (order && this.currentUser) {
        this.processOrderNotification(order);
      }
    });

    this.realtimeService.customerOrderUpdate$.subscribe(order => {
      if (order && this.currentUser) {
        this.processOrderNotification(order);
      }
    });


    this.realtimeService.newNotification$.subscribe(notification => {
      if (notification && this.currentUser) {
        if (notification.type === 'order') return;
        const mappedType = this.mapNotificationType(notification.type || 'info');
        this.notificationService.show({
          type: mappedType,
          title: notification.title,
          message: notification.message,
          icon: notification.icon || 'fas fa-bell',
          duration: 5000
        });
      }
    });
  }

  private processOrderNotification(order: any): void {
    if (!this.currentUser) {
      console.log('[AppComponent] processOrderNotification skipped: no currentUser');
      return;
    }

    const rule = this.routingService.findRule(this.currentUser.role, order.status);
    if (!rule) return;

    console.log('[AppComponent] Showing toast + saving notification', { role: this.currentUser.role, status: order.status });
    this.routingService.showToast(rule, order);
    this.routingService.createNotification(rule, order, this.currentUser.id, this.currentUser.role).subscribe({
      next: (res) => console.log('[AppComponent] createNotification success', res),
      error: (err) => console.error('[AppComponent] createNotification failed', err)
    });
  }

  private mapNotificationType(type: string): 'success' | 'error' | 'warning' | 'info' | 'order' | 'payment' | 'inventory' | 'staff' {
    const validTypes: Record<string, 'success' | 'error' | 'warning' | 'info' | 'order' | 'payment' | 'inventory' | 'staff'> = {
      'system': 'info',
      'promotion': 'info',
      'order': 'order',
      'payment': 'payment',
      'inventory': 'inventory',
      'staff': 'staff',
    };
    return validTypes[type] || 'info';
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

  logout(): void {
    this.authService.logout();
    this.cartService.clearCart();
  }

  private loadNotificationRecipients(restaurantId: string | null): void {
    const rolesArr = ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'kitchen_manager', 'waiter', 'cashier'];
    this.getRestAndPlatformUsersService.getNotificationRecipients(restaurantId, rolesArr).subscribe({
      next: (recipients) => {
        console.log('[AppComponent] Notification recipients loaded:', recipients);
      },
      error: (err) => {
        console.error('[AppComponent] Failed to load notification recipients:', err);
      }
    });
  }

  viewCart(): void {
    this.router.navigate(['/customer/cart']);
  }

  get actionMenus(): NavigationMenu[] {
    if (!this.navMenu?.hierarchicalMenus) return [];

    const actions: NavigationMenu[] = [];

    const collectActions = (menus: NavigationMenu[]) => {
      menus.forEach(menu => {
        if (menu.type === 'ACTION') {
          actions.push(menu);
        }
        if (menu.children) {
          collectActions(menu.children);
        }
      });
    };

    collectActions(this.navMenu.hierarchicalMenus);
    return actions;
  }

  /**
   * Gets the customer home route with the current restaurant and table number.
   * Used for the home button navigation in the customer footer.
   */
  get customerHomeRoute(): any[] {
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');
    const tableNo = sessionStorage.getItem('current_customer_table_no');
    return ['/customer/dashboard', restaurantId, tableNo];
  }
}
