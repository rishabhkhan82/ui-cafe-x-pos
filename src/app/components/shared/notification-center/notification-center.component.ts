import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MockDataService, Notification, NotificationSetting, NotificationStats, User } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.css'
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | null = null;
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedNotification: Notification | null = null;

  // Filters and search
  currentFilter: string = 'all';
  searchQuery: string = '';

  // Stats
  notificationStats: NotificationStats = {
    unread: 0,
    today: 0,
    highPriority: 0,
    systemAlerts: 0
  };

  // Create notification form
  showCreateForm: boolean = false;
  canCreateNotifications: boolean = false;
  newNotification: Partial<Notification> & {
    targetAudience?: string;
    scheduleTime?: string;
  } = {
    title: '',
    message: '',
    type: 'system',
    priority: 'medium',
    targetAudience: 'all'
  };

  // Settings
  notificationSettings: NotificationSetting[] = [
    {
      name: 'Order Updates',
      description: 'Get notified about new orders and status changes',
      enabled: true
    },
    {
      name: 'System Alerts',
      description: 'Important system notifications and maintenance alerts',
      enabled: true
    },
    {
      name: 'Staff Messages',
      description: 'Messages from other staff members',
      enabled: true
    },
    {
      name: 'Inventory Alerts',
      description: 'Low stock and inventory management notifications',
      enabled: true
    },
    {
      name: 'Payment Notifications',
      description: 'Payment processing and billing alerts',
      enabled: true
    }
  ];

  constructor(
    private mockDataService: MockDataService,
    private realtimeService: RealtimeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.setupRealtimeSubscriptions();
    this.updateStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeData(): void {
    // Get current user (for demo, we'll use a restaurant manager)
    this.currentUser = this.mockDataService.getUserByRole('restaurant_manager') || null;
    this.canCreateNotifications = this.currentUser?.role === 'restaurant_owner' || this.currentUser?.role === 'restaurant_manager';

    // Load notifications
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.mockDataService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      this.filterNotifications();
      this.updateStats();
    });
  }

  private setupRealtimeSubscriptions(): void {
    // Subscribe to new notifications
    const notificationSub = this.realtimeService.newNotification$.subscribe(notification => {
      if (notification) {
        this.notifications.unshift(notification);
        this.filterNotifications();
        this.updateStats();
      }
    });
    this.subscriptions.push(notificationSub);
  }

  private updateStats(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    this.notificationStats = {
      unread: this.notifications.filter(n => n.status === 'unread').length,
      today: this.notifications.filter(n => new Date(n.timestamp).getTime() >= today.getTime()).length,
      highPriority: this.notifications.filter(n => n.priority === 'high').length,
      systemAlerts: this.notifications.filter(n => n.type === 'system').length
    };
  }

  filterNotifications(): void {
    let filtered = [...this.notifications];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }

    // Apply type/status filter
    switch (this.currentFilter) {
      case 'unread':
        filtered = filtered.filter(n => n.status === 'unread');
        break;
      case 'high':
        filtered = filtered.filter(n => n.priority === 'high');
        break;
      case 'orders':
        filtered = filtered.filter(n => n.type === 'order');
        break;
      case 'system':
        filtered = filtered.filter(n => n.type === 'system');
        break;
      case 'staff':
        filtered = filtered.filter(n => n.type === 'staff');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    this.filteredNotifications = filtered;
  }

  // Public methods
  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.filterNotifications();
  }

  getFilterButtonClass(filter: string): string {
    const baseClass = 'px-3 py-1.5 rounded-full text-xs font-medium transition-colors';
    if (this.currentFilter === filter) {
      return `${baseClass} bg-primary-500 text-white`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }

  markAsRead(notification: Notification): void {
    this.mockDataService.markNotificationAsRead(notification.id);
    this.filterNotifications();
    this.updateStats();
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      if (notification.status === 'unread') {
        this.mockDataService.markNotificationAsRead(notification.id);
      }
    });
    this.filterNotifications();
    this.updateStats();
  }

  deleteNotification(notification: Notification): void {
    // In a real app, this would call a service method to delete the notification
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.filterNotifications();
      this.updateStats();
    }
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.filteredNotifications = [];
    this.updateStats();
  }

  viewNotificationDetails(notification: Notification): void {
    this.selectedNotification = notification;
  }

  closeNotificationDetails(): void {
    this.selectedNotification = null;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetNewNotification();
    }
  }

  createNotification(): void {
    if (!this.newNotification.title || !this.newNotification.message) {
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      title: this.newNotification.title,
      message: this.newNotification.message,
      type: this.newNotification.type as Notification['type'],
      priority: this.newNotification.priority as Notification['priority'],
      status: 'unread',
      timestamp: new Date(),
      recipientId: undefined,
      recipientRole: undefined
    };

    // Add to notifications list
    this.notifications.unshift(notification);
    this.filterNotifications();
    this.updateStats();

    // Reset form
    this.resetNewNotification();
    this.showCreateForm = false;
  }

  private resetNewNotification(): void {
    this.newNotification = {
      title: '',
      message: '',
      type: 'system',
      priority: 'medium',
      targetAudience: 'all'
    };
  }

  viewRelatedOrder(orderId: string): void {
    // Navigate to order details (would need to implement routing)
    this.closeNotificationDetails();
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    sessionStorage.setItem('theme', newTheme);
  }

  // Helper methods
  getNotificationBorderClass(notification: Notification): string {
    switch (notification.priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      default: return 'border-gray-200 dark:border-gray-700';
    }
  }

  getNotificationIconClass(notification: Notification): string {
    const baseClass = 'w-10 h-10 rounded-full flex items-center justify-center text-white';
    switch (notification.type) {
      case 'order': return `${baseClass} bg-blue-500`;
      case 'system': return `${baseClass} bg-purple-500`;
      case 'staff': return `${baseClass} bg-green-500`;
      case 'inventory': return `${baseClass} bg-orange-500`;
      case 'payment': return `${baseClass} bg-indigo-500`;
      case 'promotion': return `${baseClass} bg-pink-500`;
      default: return `${baseClass} bg-gray-500`;
    }
  }

  getNotificationTypeText(type: Notification['type']): string {
    switch (type) {
      case 'order': return 'Order Update';
      case 'system': return 'System Alert';
      case 'staff': return 'Staff Message';
      case 'inventory': return 'Inventory Alert';
      case 'payment': return 'Payment';
      case 'promotion': return 'Promotion';
      default: return type;
    }
  }

  formatNotificationTime(timestamp: Date): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
