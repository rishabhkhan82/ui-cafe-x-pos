import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User } from '../../../services/mock-data.service';

interface RestaurantNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'inventory' | 'staff' | 'system' | 'activity';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  recipients: number;
  sentBy: string;
  targetRoles: User['role'][];
  readCount?: number;
  isRead: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  icon: string;
  recipients: string;
  frequency: string;
  enabled: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;

  // Filters
  searchQuery: string = '';
  typeFilter: string = 'all';
  statusFilter: string = 'all';
  dateFilter: string = 'all';

  // All notifications
  allNotifications: RestaurantNotification[] = [];
  filteredNotifications: RestaurantNotification[] = [];

  // Alert rules
  alertRules: AlertRule[] = [
    {
      id: '1',
      name: 'New Order Alerts',
      description: 'Notify kitchen when new orders are placed',
      icon: 'fas fa-utensils',
      recipients: 'Kitchen Staff',
      frequency: 'Real-time',
      enabled: true
    },
    {
      id: '2',
      name: 'Payment Failures',
      description: 'Alert managers about failed payment attempts',
      icon: 'fas fa-credit-card',
      recipients: 'Managers',
      frequency: 'Immediate',
      enabled: true
    },
    {
      id: '3',
      name: 'Low Inventory',
      description: 'Warn about items running low in stock',
      icon: 'fas fa-boxes',
      recipients: 'Managers',
      frequency: 'Daily',
      enabled: false
    },
    {
      id: '4',
      name: 'Staff Shift Reminders',
      description: 'Send shift start/end reminders to staff',
      icon: 'fas fa-clock',
      recipients: 'All Staff',
      frequency: '15 min before',
      enabled: true
    }
  ];

  ngOnInit(): void {
    this.initializeData();
    this.loadNotifications();
    this.filterNotifications();
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
  }

  private loadNotifications(): void {
    // Mock data for restaurant notifications received by restaurant owner
    this.allNotifications = [
      {
        id: 'notif-1',
        title: 'New Order Received',
        message: 'Order #ORD-2025-1045 for Hyderabadi Biryani has been placed. Please confirm preparation.',
        type: 'order',
        status: 'delivered',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        recipients: 1,
        sentBy: 'System',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: false,
        priority: 'high'
      },
      {
        id: 'notif-2',
        title: 'Payment Failed Alert',
        message: 'Card payment of ₹760 failed for Order #ORD-2025-1044. Customer needs to retry payment.',
        type: 'payment',
        status: 'sent',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        recipients: 1,
        sentBy: 'Payment Gateway',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: false,
        priority: 'high'
      },
      {
        id: 'notif-3',
        title: 'Low Inventory Alert',
        message: 'Margherita Pizza base running low (5 units remaining). Consider reordering soon.',
        type: 'inventory',
        status: 'read',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        recipients: 1,
        sentBy: 'Inventory System',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: true,
        priority: 'medium'
      },
      {
        id: 'notif-4',
        title: 'Staff Shift Update',
        message: 'Emma Thompson started her evening shift at 6:00 PM. All staff are now present.',
        type: 'staff',
        status: 'delivered',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        recipients: 1,
        sentBy: 'Staff Management',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: true,
        priority: 'low'
      },
      {
        id: 'notif-5',
        title: 'Menu Item Updated',
        message: 'You successfully updated the price of Chicken Biryani from ₹250 to ₹280.',
        type: 'activity',
        status: 'delivered',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        recipients: 1,
        sentBy: 'Menu Management',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: true,
        priority: 'low'
      },
      {
        id: 'notif-6',
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM. System may be temporarily unavailable.',
        type: 'system',
        status: 'failed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        recipients: 1,
        sentBy: 'Platform Admin',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: false,
        priority: 'medium'
      },
      {
        id: 'notif-7',
        title: 'Daily Sales Report',
        message: 'Today\'s sales: ₹12,450 with 45 orders. 15% increase from yesterday.',
        type: 'activity',
        status: 'delivered',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        recipients: 1,
        sentBy: 'Reports System',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: true,
        priority: 'low'
      },
      {
        id: 'notif-8',
        title: 'New Customer Registration',
        message: 'John Doe registered as a new customer and placed their first order.',
        type: 'activity',
        status: 'sent',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
        recipients: 1,
        sentBy: 'Customer System',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: false,
        priority: 'low'
      }
    ];
  }

  // Filter notifications
  filterNotifications(): void {
    this.filteredNotifications = this.allNotifications.filter(notification => {
      const matchesSearch = !this.searchQuery ||
        notification.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesType = this.typeFilter === 'all' || notification.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || notification.status === this.statusFilter;

      let matchesDate = true;
      if (this.dateFilter !== 'all') {
        const now = new Date();
        const notificationDate = notification.timestamp;
        const diffTime = now.getTime() - notificationDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (this.dateFilter) {
          case 'today':
            matchesDate = diffDays <= 1;
            break;
          case 'week':
            matchesDate = diffDays <= 7;
            break;
          case 'month':
            matchesDate = diffDays <= 30;
            break;
          case 'quarter':
            matchesDate = diffDays <= 90;
            break;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }

  // Statistics methods
  getTotalNotifications(): number {
    return this.allNotifications.length;
  }

  getUnreadCount(): number {
    return this.allNotifications.filter(n => !n.isRead).length;
  }

  getTodayCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allNotifications.filter(n => {
      const notificationDate = new Date(n.timestamp);
      notificationDate.setHours(0, 0, 0, 0);
      return notificationDate.getTime() === today.getTime();
    }).length;
  }

  // Action methods
  markAllAsRead(): void {
    this.allNotifications.forEach(notification => {
      notification.isRead = true;
    });
    this.filterNotifications();
    alert('All notifications marked as read');
  }

  toggleReadStatus(notification: RestaurantNotification): void {
    notification.isRead = !notification.isRead;
    this.filterNotifications();
  }

  deleteNotification(notification: RestaurantNotification): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      const index = this.allNotifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        this.allNotifications.splice(index, 1);
        this.filterNotifications();
        alert('Notification deleted successfully');
      }
    }
  }

  viewNotificationDetails(notification: RestaurantNotification): void {
    alert(`Viewing details for: ${notification.title}`);
  }

  // Helper methods
  getNotificationCardClass(notification: RestaurantNotification): string {
    let baseClass = 'bg-white dark:bg-gray-800';
    if (!notification.isRead) {
      baseClass += ' border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
    }
    return baseClass;
  }

  getReadButtonClass(notification: RestaurantNotification): string {
    return notification.isRead
      ? 'text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
      : 'text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30';
  }

  getPriorityBadgeClass(priority?: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  // Action methods
  createNewNotification(): void {
    alert('Create new notification - would open notification composer modal');
  }

  sendBroadcast(): void {
    alert('Send broadcast message - would open broadcast composer');
  }

  manageTemplates(): void {
    alert('Manage notification templates - would open template management');
  }

  viewAnalytics(): void {
    this.router.navigate(['/restaurant/analytics']);
  }

  viewNotification(notification: RestaurantNotification): void {
    alert(`View notification: ${notification.title} - would open detailed view modal`);
  }

  resendNotification(notification: RestaurantNotification): void {
    alert(`Resend notification: ${notification.title} - would resend to recipients`);
  }

  addRule(): void {
    alert('Add new alert rule - would open rule creation modal');
  }

  editRule(rule: AlertRule): void {
    alert(`Edit rule: ${rule.name} - would open rule editor modal`);
  }

  // Helper methods
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'order': 'fas fa-utensils',
      'payment': 'fas fa-credit-card',
      'inventory': 'fas fa-boxes',
      'staff': 'fas fa-user-clock',
      'system': 'fas fa-cog',
      'promotional': 'fas fa-bullhorn'
    };
    return icons[type] || 'fas fa-bell';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'sent':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'read':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'platform_owner': 'Platform Owner',
      'restaurant_owner': 'Restaurant Owner',
      'restaurant_manager': 'Restaurant Manager',
      'cashier': 'Cashier',
      'kitchen_manager': 'Kitchen Manager',
      'waiter': 'Waiter',
      'customer': 'Customer'
    };
    return roleNames[role] || role;
  }
}
