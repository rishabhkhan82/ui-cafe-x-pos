import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { NotificationMessage } from '../../../services/mock-data.service';

@Component({
  selector: 'app-toast-notifier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-toast-notifier.html',
  styleUrls: ['./app-toast-notifier.css']
})
export class ToastNotifierComponent implements OnInit, OnDestroy {
  toasts: NotificationMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.toasts = notifications.filter(n => 
          !n.persistent && 
          (n.type === 'success' || n.type === 'error' || n.type === 'warning' || n.type === 'info' ||
           n.type === 'order' || n.type === 'payment' || n.type === 'inventory' || n.type === 'staff')
        ).slice(0, 3);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(toastId: string): void {
    this.notificationService.removeNotification(toastId);
  }

  getToastClasses(toast: NotificationMessage): string {
    const baseClasses = 'flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg transition-all duration-300 max-w-sm';
    
    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200 dark:bg-red-800 dark:text-red-100 dark:border-red-700`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-700`;
      case 'info':
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-700`;
      case 'order':
        return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-800 dark:text-orange-100 dark:border-orange-700`;
      case 'payment':
        return `${baseClasses} bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 dark:border-emerald-700`;
      case 'inventory':
        return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-800 dark:text-purple-100 dark:border-purple-700`;
      case 'staff':
        return `${baseClasses} bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-800 dark:text-indigo-100 dark:border-indigo-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700`;
    }
  }
}
