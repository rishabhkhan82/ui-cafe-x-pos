import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonUserNotificationsService, Notification } from '../../../services/common-user-notifications.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-common-user-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-user-notifications.component.html',
  styleUrl: './common-user-notifications.component.css'
})
export class CommonUserNotificationsComponent implements OnInit, OnDestroy {
  isOpen = false;
  filter: 'unread' | 'read' | 'all' = 'unread';
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    public notificationService: CommonUserNotificationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.load();
    }

    const notifSub = this.notificationService.notifications$.subscribe(list => {
      this.notifications = list;
    });
    this.subscriptions.push(notifSub);

    const countSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.push(countSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.refresh();
    }
  }

  setFilter(f: 'unread' | 'read' | 'all'): void {
    this.filter = f;
    this.load();
  }

  onNotificationClick(notification: Notification): void {
    if (notification.status === 'unread') {
      this.notificationService.markAsRead(notification.id).subscribe(() => this.load());
    }
    if (notification.action_url) {
      // window.open(notification.action_url, '_blank');
    }
  }

  markAllAsRead(): void {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.notificationService.markAllAsRead(user.id).subscribe(() => this.load());
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-dropdown-container')) {
      this.isOpen = false;
    }
  }

  load(): void {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.notificationService.loadNotifications(user.id, this.filter).subscribe();
    }
  }

  private refresh(): void {
    this.load();
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'order': 'fas fa-utensils',
      'payment': 'fas fa-credit-card',
      'inventory': 'fas fa-boxes',
      'staff': 'fas fa-user-clock',
      'system': 'fas fa-cog',
      'promotion': 'fas fa-bullhorn'
    };
    return icons[type] || 'fas fa-bell';
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  }
}
