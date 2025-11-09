import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, Notification, User, UserNotification } from '../../../services/mock-data.service';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-notifications.component.html',
  styleUrl: './user-notifications.component.css'
})
export class UserNotificationsComponent implements OnInit {
  notifications: UserNotification[] = [];
  filteredNotifications: UserNotification[] = [];
  selectedNotification: UserNotification | null = null;
  users: User[] = [];
  typeFilter = 'all';
  statusFilter = 'all';
  roleFilter = 'all';
  showCreateForm = false;

  newNotification: Partial<UserNotification> = {
    title: '',
    message: '',
    type: 'staff',
    priority: 'medium',
    status: 'unread',
    targetUsers: [],
    targetRoles: [],
    deliveryStatus: 'pending',
    readCount: 0,
    totalRecipients: 0
  };

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadNotifications();
  }

  loadUsers(): void {
    this.mockDataService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  loadNotifications(): void {
    this.mockDataService.getUserNotifications().subscribe(notifications => {
      this.notifications = notifications;
      this.filteredNotifications = [...this.notifications];
    });
  }

  filterNotifications(): void {
    this.filteredNotifications = this.notifications.filter(notification => {
      const matchesType = this.typeFilter === 'all' || notification.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || notification.deliveryStatus === this.statusFilter;
      const matchesRole = this.roleFilter === 'all' ||
        notification.targetRoles.includes(this.roleFilter as User['role']) ||
        (this.roleFilter === 'specific' && notification.targetUsers.length > 0);

      return matchesType && matchesStatus && matchesRole;
    });
  }

  selectNotification(notification: UserNotification): void {
    this.selectedNotification = notification;
  }

  showCreateNotificationForm(): void {
    this.showCreateForm = true;
    this.newNotification = {
      title: '',
      message: '',
      type: 'staff',
      priority: 'medium',
      status: 'unread',
      targetUsers: [],
      targetRoles: [],
      deliveryStatus: 'pending',
      readCount: 0,
      totalRecipients: 0
    };
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newNotification = {};
  }

  createNotification(): void {
    if (this.newNotification.title && this.newNotification.message) {
      // Calculate total recipients
      let totalRecipients = 0;
      if (this.newNotification.targetRoles && this.newNotification.targetRoles.length > 0) {
        totalRecipients += this.users.filter(user =>
          this.newNotification.targetRoles!.includes(user.role)
        ).length;
      }
      if (this.newNotification.targetUsers && this.newNotification.targetUsers.length > 0) {
        totalRecipients += this.newNotification.targetUsers.length;
      }

      this.newNotification.totalRecipients = totalRecipients;

      // In a real app, this would call an API to create the notification
      console.log('Creating new notification:', this.newNotification);
      this.showCreateForm = false;
      this.newNotification = {};
      // Reload notifications
      this.loadNotifications();
    }
  }

  toggleUserSelection(userId: string): void {
    if (!this.newNotification.targetUsers) {
      this.newNotification.targetUsers = [];
    }

    const index = this.newNotification.targetUsers.indexOf(userId);
    if (index > -1) {
      this.newNotification.targetUsers.splice(index, 1);
    } else {
      this.newNotification.targetUsers.push(userId);
    }
  }

  toggleRoleSelection(role: string): void {
    if (!this.newNotification.targetRoles) {
      this.newNotification.targetRoles = [];
    }

    const index = this.newNotification.targetRoles.indexOf(role as User['role']);
    if (index > -1) {
      this.newNotification.targetRoles.splice(index, 1);
    } else {
      this.newNotification.targetRoles.push(role as User['role']);
    }
  }

  isUserSelected(userId: string): boolean {
    return this.newNotification.targetUsers?.includes(userId) || false;
  }

  isRoleSelected(role: string): boolean {
    return this.newNotification.targetRoles?.includes(role as User['role']) || false;
  }

  getRoleDisplayName(role: string): string {
    return this.mockDataService.getRoleDisplayName(role);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getDeliveryStatusColor(status: string): string {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
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

  getDeliveredCount(): number {
    return this.notifications.filter(n => n.deliveryStatus === 'delivered').length;
  }

  getSentCount(): number {
    return this.notifications.filter(n => n.deliveryStatus === 'sent').length;
  }

  getTotalReads(): number {
    return this.notifications.reduce((sum, n) => sum + n.readCount, 0);
  }

  getTotalRecipients(): number {
    return this.notifications.reduce((sum, n) => sum + n.totalRecipients, 0);
  }
}
