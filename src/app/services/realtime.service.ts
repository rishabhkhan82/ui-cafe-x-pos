import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MockDataService, Order } from './mock-data.service';
import type { Notification } from './mock-data.service';
import { environment } from '../environments/environment';
import { Client } from '@stomp/stompjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private eventSource: EventSource | null = null;
  private notificationPermission: NotificationPermission = 'default';
  private stompClient: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectExhaustedNotified = false;

  private connectParams: { userId: string; restaurantId: string; role: string } | null = null;
  private connectSequence = 0;
  private disconnectPromise: Promise<void> | null = null;
  private isDisconnecting = false;

  private newOrderSubject = new BehaviorSubject<Order | null>(null);
  public newOrder$ = this.newOrderSubject.asObservable();

  private orderUpdateSubject = new BehaviorSubject<Order | null>(null);
  public orderUpdate$ = this.orderUpdateSubject.asObservable();

  private newNotificationSubject = new BehaviorSubject<Notification | null>(null);
  public newNotification$ = this.newNotificationSubject.asObservable();

  private customerOrderUpdateSubject = new BehaviorSubject<Order | null>(null);
  public customerOrderUpdate$ = this.customerOrderUpdateSubject.asObservable();

  private platformOrdersSubject = new BehaviorSubject<any[] | null>(null);
  public platformOrders$ = this.platformOrdersSubject.asObservable();

  private platformRestaurantsSubject = new BehaviorSubject<any[] | null>(null);
  public platformRestaurants$ = this.platformRestaurantsSubject.asObservable();

  private platformSubscriptionsSubject = new BehaviorSubject<any[] | null>(null);
  public platformSubscriptions$ = this.platformSubscriptionsSubject.asObservable();

  private platformUsersSubject = new BehaviorSubject<any[] | null>(null);
  public platformUsers$ = this.platformUsersSubject.asObservable();

  private platformCustomersSubject = new BehaviorSubject<any[] | null>(null);
  public platformCustomers$ = this.platformCustomersSubject.asObservable();

  private platformSystemPerformanceSubject = new BehaviorSubject<any | null>(null);
  public platformSystemPerformance$ = this.platformSystemPerformanceSubject.asObservable();

  private platformDashboardMetricsSubject = new BehaviorSubject<any | null>(null);
  public platformDashboardMetrics$ = this.platformDashboardMetricsSubject.asObservable();

  private restaurantSubject = new BehaviorSubject<any | null>(null);
  public restaurant$ = this.restaurantSubject.asObservable();

  private ownerDashboardSubject = new BehaviorSubject<any | null>(null);
  public ownerDashboard$ = this.ownerDashboardSubject.asObservable();

  private menuUpdateSubject = new BehaviorSubject<any | null>(null);
  public menuUpdate$ = this.menuUpdateSubject.asObservable();

  private menuCategoryUpdateSubject = new BehaviorSubject<any | null>(null);
  public menuCategoryUpdate$ = this.menuCategoryUpdateSubject.asObservable();

  private promotionalBannerUpdateSubject = new BehaviorSubject<any | null>(null);
  public promotionalBannerUpdate$ = this.promotionalBannerUpdateSubject.asObservable();

  private todayOffersUpdateSubject = new BehaviorSubject<any | null>(null);
  public todayOffersUpdate$ = this.todayOffersUpdateSubject.asObservable();

  private systemSettingsUpdateSubject = new BehaviorSubject<boolean>(false);
  public systemSettingsUpdate$ = this.systemSettingsUpdateSubject.asObservable();

  constructor(private mockDataService: MockDataService, private notificationService: NotificationService) {
    this.requestNotificationPermission();
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
      setTimeout(() => notification.close(), 5000);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

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

  public async disconnect(): Promise<void> {
    if (this.isDisconnecting) {
      console.log('[Realtime] Already disconnecting, skipping duplicate call');
      return;
    }

    console.log('[Realtime] Disconnecting...');
    this.isDisconnecting = true;
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.reconnectExhaustedNotified = true;
    this.connectParams = null;
    this.connectSequence++;

    if (this.stompClient) {
      const client = this.stompClient;
      this.stompClient = null;
      this.isConnected = false;
      try {
        await client.deactivate();
      } catch (e) {
        console.warn('[Realtime] Deactivate error (ignored):', e);
      }
    } else {
      this.isConnected = false;
    }

    this.isDisconnecting = false;
    this.disconnectPromise = null;
    console.log('[Realtime] Disconnected');
  }

  public triggerTestOrder(): void {
    console.log('Test order trigger is disabled in WebSocket mode');
  }

  public triggerTestNotification(): void {
    console.log('Test notification trigger is disabled in WebSocket mode');
  }

  public connect(userId: string, restaurantId: string, role: string): void {
    if (this.isDisconnecting && this.disconnectPromise) {
      console.log('[Realtime] Waiting for pending disconnect before connecting');
      this.disconnectPromise.then(() => this.connect(userId, restaurantId, role));
      return;
    }

    const paramsMatch = this.connectParams &&
      this.connectParams.userId === userId &&
      this.connectParams.restaurantId === restaurantId &&
      this.connectParams.role === role;

    if (this.isConnected && paramsMatch) {
      console.log('[Realtime] Already connected with same params, skipping');
      return;
    }

    if (this.isConnected) {
      console.log('[Realtime] Already connected with different params, disconnecting first');
      this.disconnect();
      setTimeout(() => this.connect(userId, restaurantId, role), 300);
      return;
    }

    if (paramsMatch) {
      console.log('[Realtime] Already connecting with same params, skipping duplicate request');
      return;
    }

    this.reconnectAttempts = 0;
    this.reconnectExhaustedNotified = false;
    this.connectParams = { userId, restaurantId, role };
    const mySequence = ++this.connectSequence;

    try {
      const wsUrl = `${environment.api.baseUrl.replace(/^http/, 'ws')}/ws`;
      console.log('[Realtime] Attempting connect to', wsUrl, 'as user', userId, 'restaurant', restaurantId, 'role', role);

      this.stompClient = new Client({
        brokerURL: wsUrl,
        connectHeaders: {},
        debug: (str) => console.log('[STOMP]', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });

      this.stompClient.onConnect = (frame) => {
        if (mySequence !== this.connectSequence) {
          console.log('[Realtime] Ignoring stale connection callback (sequence mismatch)');
          this.stompClient?.deactivate();
          return;
        }

        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.connectParams = { userId, restaurantId, role };
        console.log('[Realtime] Connected successfully');

        // Platform Admin-specific subscriptions
        if (role === 'platform_owner') {
          this.stompClient!.subscribe(`/topic/platform/dashboard`, (msg) => {
            console.log('[Realtime] Received platform dashboard metrics');
            const data = JSON.parse(msg.body);
            this.platformDashboardMetricsSubject.next(data);
          });
        }

        
        if (
          role === 'restaurant_owner' || role === 'kitchen_manager' || role === 'restaurant_manager' || role === 'cashier' || role === 'waiter'
        ) {
          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}`, (msg) => {
            console.log('[Realtime] Received restaurant update for', restaurantId);
            const data = JSON.parse(msg.body);
            this.restaurantSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/orders/${restaurantId}/new`, (msg) => {
            console.log('[Realtime] Received new order for restaurant', restaurantId);
            const order = JSON.parse(msg.body) as Order;
            this.newOrderSubject.next(order);
          });

          this.stompClient!.subscribe(`/topic/orders/${restaurantId}/updates`, (msg) => {
            console.log('[Realtime] Received order update for restaurant', restaurantId);
            const order = JSON.parse(msg.body) as Order;
            this.orderUpdateSubject.next(order);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/owner-dashboard`, (msg) => {
            console.log('[Realtime] Received owner dashboard update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.ownerDashboardSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/menu-items`, (msg) => {
            console.log('[Realtime] Received menu item update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.menuUpdateSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/menu-categories`, (msg) => {
            console.log('[Realtime] Received menu category update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.menuCategoryUpdateSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/promotional-banners`, (msg) => {
            console.log('[Realtime] Received promotional banner update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.promotionalBannerUpdateSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/todays-offers`, (msg) => {
            console.log('[Realtime] Received today\'s offers update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.todayOffersUpdateSubject.next(data);
          });
        }

        // Customer-specific subscriptions
        if (role === 'customer') {
          this.stompClient!.subscribe(`/topic/users/${userId}/orders`, (msg) => {
            console.log('[Realtime] Received customer order update for user', userId);
            const order = JSON.parse(msg.body) as Order;
            this.customerOrderUpdateSubject.next(order);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}`, (msg) => {
            console.log('[Realtime] Received restaurant update for', restaurantId);
            const data = JSON.parse(msg.body);
            this.restaurantSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/menu-items`, (msg) => {
            console.log('[Realtime] Received menu item update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.menuUpdateSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/menu-categories`, (msg) => {
            console.log('[Realtime] Received menu category update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.menuCategoryUpdateSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/promotional-banners`, (msg) => {
            console.log('[Realtime] Received promotional banner update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.promotionalBannerUpdateSubject.next(data);
          });

          this.stompClient!.subscribe(`/topic/restaurant/${restaurantId}/todays-offers`, (msg) => {
            console.log('[Realtime] Received today\'s offers update for restaurant', restaurantId);
            const data = JSON.parse(msg.body);
            this.todayOffersUpdateSubject.next(data);
          });
        }

        this.stompClient!.subscribe(`/topic/users/${userId}/notifications`, (msg) => {
          const notif = JSON.parse(msg.body) as Notification;
          this.newNotificationSubject.next(notif);
          this.showBrowserNotification(notif.title, notif.message, notif.type || 'info');
        });

        this.stompClient!.subscribe(`/topic/system/settings-updated`, (msg) => {
          console.log('[Realtime] System settings updated');
          this.systemSettingsUpdateSubject.next(true);
        });
      };

      // Spare topics for future
      // this.stompClient!.subscribe(`/topic/orders`, (msg) => {
      //   console.log('[Realtime] Received platform orders');
      //   const data = JSON.parse(msg.body) as any[];
      //   this.platformOrdersSubject.next(data);
      // });

      // this.stompClient!.subscribe(`/topic/restaurants`, (msg) => {
      //   console.log('[Realtime] Received platform restaurants');
      //   const data = JSON.parse(msg.body) as any[];
      //   this.platformRestaurantsSubject.next(data);
      // });

      // this.stompClient!.subscribe(`/topic/restaurant_subscriptions`, (msg) => {
      //   console.log('[Realtime] Received platform subscriptions');
      //   const data = JSON.parse(msg.body) as any[];
      //   this.platformSubscriptionsSubject.next(data);
      // });

      // this.stompClient!.subscribe(`/topic/users`, (msg) => {
      //   console.log('[Realtime] Received platform users');
      //   const data = JSON.parse(msg.body) as any[];
      //   this.platformUsersSubject.next(data);
      // });

      // this.stompClient!.subscribe(`/topic/customers`, (msg) => {
      //   console.log('[Realtime] Received platform customers');
      //   const data = JSON.parse(msg.body) as any[];
      //   this.platformCustomersSubject.next(data);
      // });

      // this.stompClient!.subscribe(`/topic/system-performance`, (msg) => {
      //   console.log('[Realtime] Received system performance');
      //   const data = JSON.parse(msg.body);
      //   this.platformSystemPerformanceSubject.next(data);
      // });

      this.stompClient.onStompError = (frame) => {
        console.error('[Realtime] STOMP error:', frame.headers['message']);
        this.isConnected = false;
      };

      this.stompClient.onWebSocketClose = () => {
        console.error('[Realtime] WebSocket closed');
        this.isConnected = false;
        this.connectParams = null;
        this.attemptReconnect(userId, restaurantId, role);
      };

      this.stompClient.activate();
    } catch (error) {
      console.error('[Realtime] Failed to connect:', error);
    }
  }

  private attemptReconnect(userId: string, restaurantId: string, role: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`[Realtime] Reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
      setTimeout(() => this.connect(userId, restaurantId, role), delay);
    } else {
      if (!this.reconnectExhaustedNotified) {
        this.reconnectExhaustedNotified = true;
        this.notificationService.error(
          'Connection Lost',
          'Real-time connection failed. Please refresh the page.'
        );
      }
    }
  }
}
