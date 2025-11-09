import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { NotificationMessage } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private notificationQueue: NotificationMessage[] = [];
  private maxNotifications = 5;

  constructor() {}

  // ===============================
  // NOTIFICATION MANAGEMENT
  // ===============================

  /**
   * Show success notification
   */
  success(title: string, message: string, options?: Partial<NotificationMessage>): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration: 5000,
      icon: 'fas fa-check-circle',
      sound: false,
      ...options
    });
  }

  /**
   * Show error notification
   */
  error(title: string, message: string, options?: Partial<NotificationMessage>): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 7000,
      icon: 'fas fa-exclamation-triangle',
      sound: true,
      ...options
    });
  }

  /**
   * Show warning notification
   */
  warning(title: string, message: string, options?: Partial<NotificationMessage>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration: 6000,
      icon: 'fas fa-exclamation-circle',
      sound: false,
      ...options
    });
  }

  /**
   * Show info notification
   */
  info(title: string, message: string, options?: Partial<NotificationMessage>): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration: 5000,
      icon: 'fas fa-info-circle',
      sound: false,
      ...options
    });
  }

  /**
   * Show order-related notification
   */
  order(title: string, message: string, options?: Partial<NotificationMessage>): string {
    return this.show({
      type: 'order',
      title,
      message,
      duration: 0, // Persistent for orders
      icon: 'fas fa-utensils',
      sound: true,
      persistent: true,
      ...options
    });
  }

  /**
   * Show payment notification
   */
  payment(title: string, message: string, options?: Partial<NotificationMessage>): string {
    return this.show({
      type: 'payment',
      title,
      message,
      duration: 8000,
      icon: 'fas fa-credit-card',
      sound: true,
      ...options
    });
  }

  /**
   * Show inventory alert
   */
  inventory(title: string, message: string, options?: Partial<NotificationMessage>): string {
    return this.show({
      type: 'inventory',
      title,
      message,
      duration: 10000,
      icon: 'fas fa-boxes',
      sound: true,
      ...options
    });
  }

  /**
   * Show staff notification
   */
  staff(title: string, message: string, options?: Partial<NotificationMessage>): string {
    return this.show({
      type: 'staff',
      title,
      message,
      duration: 6000,
      icon: 'fas fa-users',
      sound: false,
      ...options
    });
  }

  /**
   * Show custom notification
   */
  show(notification: Omit<NotificationMessage, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const fullNotification: NotificationMessage = {
      id,
      timestamp: new Date(),
      duration: 5000,
      sound: false,
      persistent: false,
      ...notification
    };

    this.addNotification(fullNotification);
    this.playSoundIfEnabled(fullNotification);

    // Auto-remove if not persistent
    if (!fullNotification.persistent && fullNotification.duration && fullNotification.duration > 0) {
      timer(fullNotification.duration).subscribe(() => {
        this.removeNotification(id);
      });
    }

    return id;
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id: string): void {
    this.notificationQueue = this.notificationQueue.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.notificationQueue]);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationQueue = [];
    this.notificationsSubject.next([]);
  }

  /**
   * Clear notifications by type
   */
  clearByType(type: NotificationMessage['type']): void {
    this.notificationQueue = this.notificationQueue.filter(n => n.type !== type);
    this.notificationsSubject.next([...this.notificationQueue]);
  }

  /**
   * Get current notifications
   */
  getNotifications(): NotificationMessage[] {
    return [...this.notificationQueue];
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: NotificationMessage['type']): NotificationMessage[] {
    return this.notificationQueue.filter(n => n.type === type);
  }

  // ===============================
  // POS-SPECIFIC NOTIFICATIONS
  // ===============================

  /**
   * New order notification
   */
  notifyNewOrder(orderId: string, customerName: string, tableNumber?: string): string {
    const title = 'New Order Received';
    const message = `Order #${orderId} from ${customerName}${tableNumber ? ` (Table ${tableNumber})` : ''}`;

    return this.order(title, message, {
      action: {
        label: 'View Order',
        callback: () => this.navigateToOrder(orderId)
      }
    });
  }

  /**
   * Order status update
   */
  notifyOrderStatusUpdate(orderId: string, newStatus: string, customerName?: string): string {
    const title = 'Order Status Updated';
    const message = `Order #${orderId}${customerName ? ` for ${customerName}` : ''} is now ${newStatus}`;

    return this.info(title, message, {
      action: {
        label: 'View Details',
        callback: () => this.navigateToOrder(orderId)
      }
    });
  }

  /**
   * Payment received
   */
  notifyPaymentReceived(orderId: string, amount: number, method: string): string {
    const title = 'Payment Received';
    const message = `₹${amount.toLocaleString()} received for Order #${orderId} via ${method}`;

    return this.payment(title, message);
  }

  /**
   * Low inventory alert
   */
  notifyLowInventory(itemName: string, currentStock: number, minStock: number): string {
    const title = 'Low Inventory Alert';
    const message = `${itemName} stock is low (${currentStock} remaining, minimum: ${minStock})`;

    return this.inventory(title, message, {
      action: {
        label: 'Manage Inventory',
        callback: () => this.navigateToInventory()
      }
    });
  }

  /**
   * Staff clock in/out
   */
  notifyStaffActivity(staffName: string, action: 'clocked_in' | 'clocked_out', time: string): string {
    const title = 'Staff Activity';
    const message = `${staffName} ${action.replace('_', ' ')} at ${time}`;

    return this.staff(title, message);
  }

  /**
   * System alerts
   */
  notifySystemAlert(title: string, message: string, severity: 'low' | 'medium' | 'high' = 'medium'): string {
    const type = severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info';
    return this.show({
      type: type as any,
      title,
      message,
      duration: severity === 'high' ? 0 : 10000,
      persistent: severity === 'high',
      sound: severity !== 'low'
    });
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  private addNotification(notification: NotificationMessage): void {
    this.notificationQueue.unshift(notification); // Add to beginning

    // Maintain max notifications limit
    if (this.notificationQueue.length > this.maxNotifications) {
      this.notificationQueue = this.notificationQueue.slice(0, this.maxNotifications);
    }

    this.notificationsSubject.next([...this.notificationQueue]);
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private playSoundIfEnabled(notification: NotificationMessage): void {
    if (notification.sound && 'Audio' in window) {
      try {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.warn('Could not play notification sound:', error);
      }
    }
  }

  // ===============================
  // NAVIGATION HELPERS (TO BE IMPLEMENTED)
  // ===============================

  private navigateToOrder(orderId: string): void {
    // TODO: Implement navigation to order details
    console.log('Navigate to order:', orderId);
  }

  private navigateToInventory(): void {
    // TODO: Implement navigation to inventory management
    console.log('Navigate to inventory');
  }

  // ===============================
  // CONFIGURATION
  // ===============================

  /**
   * Configure notification settings
   */
  configure(settings: {
    maxNotifications?: number;
    enableSounds?: boolean;
    defaultDuration?: number;
  }): void {
    if (settings.maxNotifications) {
      this.maxNotifications = settings.maxNotifications;
    }
    // Additional settings can be added here
  }
}