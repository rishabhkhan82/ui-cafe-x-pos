import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { MockDataService, Order } from './mock-data.service';
import type { Notification } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private eventSource: EventSource | null = null;
  private notificationPermission: NotificationPermission = 'default';

  // Real-time event streams
  private newOrderSubject = new BehaviorSubject<Order | null>(null);
  public newOrder$ = this.newOrderSubject.asObservable();

  private orderUpdateSubject = new BehaviorSubject<Order | null>(null);
  public orderUpdate$ = this.orderUpdateSubject.asObservable();

  private newNotificationSubject = new BehaviorSubject<Notification | null>(null);
  public newNotification$ = this.newNotificationSubject.asObservable();

  constructor(private mockDataService: MockDataService) {
    this.initializeRealtimeConnection();
    this.requestNotificationPermission();
  }

  private initializeRealtimeConnection(): void {
    // For demo purposes, we'll simulate real-time updates using intervals
    // In production, this would connect to a WebSocket or SSE endpoint

    // Simulate new orders every 45-90 seconds
    interval(Math.random() * 45000 + 45000).subscribe(() => {
      this.simulateNewOrder();
    });

    // Simulate order status updates every 30-60 seconds
    interval(Math.random() * 30000 + 30000).subscribe(() => {
      this.simulateOrderUpdate();
    });

    // Simulate notifications every 60-120 seconds
    interval(Math.random() * 60000 + 60000).subscribe(() => {
      this.simulateNewNotification();
    });
  }

  private simulateNewOrder(): void {
    // This would normally come from the server
    // For demo, we'll trigger the mock data service to create a new order
    const mockService = this.mockDataService as any;
    if (mockService.addRandomOrder) {
      mockService.addRandomOrder();
      // Get the latest order and emit it
      this.mockDataService.getOrders().subscribe(orders => {
        const latestOrder = orders[orders.length - 1];
        if (latestOrder && new Date(latestOrder.createdAt).getTime() > Date.now() - 5000) {
          this.newOrderSubject.next(latestOrder);
          this.showBrowserNotification(
            'New Order Received',
            `Order ${latestOrder.id} for ${latestOrder.customerName}`,
            'order'
          );
        }
      });
    }
  }

  private simulateOrderUpdate(): void {
    // Simulate order status changes
    this.mockDataService.getOrders().subscribe(orders => {
      const activeOrders = orders.filter(order =>
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      );

      if (activeOrders.length > 0) {
        const randomOrder = activeOrders[Math.floor(Math.random() * activeOrders.length)];
        const statusProgression = {
          'pending': 'confirmed',
          'confirmed': 'preparing',
          'preparing': 'ready'
        };

        const newStatus = statusProgression[randomOrder.status as keyof typeof statusProgression];
        if (newStatus) {
          this.mockDataService.updateOrderStatus(randomOrder.id, newStatus as any);
          this.orderUpdateSubject.next(randomOrder);

          this.showBrowserNotification(
            'Order Status Updated',
            `Order ${randomOrder.id} is now ${newStatus}`,
            'order'
          );
        }
      }
    });
  }

  private simulateNewNotification(): void {
    // This would normally come from the server
    const mockService = this.mockDataService as any;
    if (mockService.addRandomNotification) {
      mockService.addRandomNotification();
      // Get the latest notification and emit it
      this.mockDataService.getNotifications().subscribe(notifications => {
        const latestNotification = notifications[notifications.length - 1];
        if (latestNotification && new Date(latestNotification.timestamp).getTime() > Date.now() - 5000) {
          this.newNotificationSubject.next(latestNotification);
          this.showBrowserNotification(
            latestNotification.title,
            latestNotification.message,
            latestNotification.type
          );
        }
      });
    }
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;

      if (Notification.permission === 'default') {
        try {
          this.notificationPermission = await Notification.requestPermission();
        } catch (error) {
          console.warn('Error requesting notification permission:', error);
        }
      }
    }
  }

  private showBrowserNotification(title: string, body: string, type: string): void {
    if (this.notificationPermission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `cafe-x-${type}`,
        requireInteraction: false,
        silent: false
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  // Public methods
  public updateOrder(order: Order): void {
    this.mockDataService.updateOrderStatus(order.id, order.status);
    this.orderUpdateSubject.next(order);
  }

  public requestNotificationPermissionManually(): Promise<NotificationPermission> {
    return this.requestNotificationPermission().then(() => this.notificationPermission);
  }

  public getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Method to manually trigger real-time events for testing
  public triggerTestOrder(): void {
    this.simulateNewOrder();
  }

  public triggerTestNotification(): void {
    this.simulateNewNotification();
  }
}