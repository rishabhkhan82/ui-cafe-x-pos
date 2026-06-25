import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MockDataService, Order } from './mock-data.service';
import type { Notification } from './mock-data.service';
import { environment } from '../environments/environment';
import { Client } from '@stomp/stompjs';

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

  private connectParams: { userId: string; restaurantId: string; role: string } | null = null;
  private connectSequence = 0;

  private newOrderSubject = new BehaviorSubject<Order | null>(null);
  public newOrder$ = this.newOrderSubject.asObservable();

  private orderUpdateSubject = new BehaviorSubject<Order | null>(null);
  public orderUpdate$ = this.orderUpdateSubject.asObservable();

  private newNotificationSubject = new BehaviorSubject<Notification | null>(null);
  public newNotification$ = this.newNotificationSubject.asObservable();

  private customerOrderUpdateSubject = new BehaviorSubject<Order | null>(null);
  public customerOrderUpdate$ = this.customerOrderUpdateSubject.asObservable();

  constructor(private mockDataService: MockDataService) {
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

  public disconnect(): void {
    console.log('[Realtime] Disconnecting...');
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.connectParams = null;
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.isConnected = false;
    console.log('[Realtime] Disconnected');
  }

  public triggerTestOrder(): void {
    console.log('Test order trigger is disabled in WebSocket mode');
  }

  public triggerTestNotification(): void {
    console.log('Test notification trigger is disabled in WebSocket mode');
  }

  public connect(userId: string, restaurantId: string, role: string): void {
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
    }

    if (paramsMatch) {
      console.log('[Realtime] Already connecting with same params, skipping duplicate request');
      return;
    }

    this.reconnectAttempts = 0;
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

        if (role !== 'customer') {
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
        } else {
          this.stompClient!.subscribe(`/topic/users/${userId}/orders`, (msg) => {
            console.log('[Realtime] Received customer order update for user', userId);
            const order = JSON.parse(msg.body) as Order;
            this.customerOrderUpdateSubject.next(order);
          });
        }

        this.stompClient!.subscribe('/topic/notifications', (msg) => {
          const notif = JSON.parse(msg.body) as Notification;
          const storedUserId = this.getStoredUserId();
          if (notif.recipientId === storedUserId) {
            this.newNotificationSubject.next(notif);
            this.showBrowserNotification(notif.title, notif.message, notif.type || 'info');
          }
        });
      };

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

  private getStoredUserId(): string | null {
    try {
      const user = sessionStorage.getItem('currentUser') || localStorage.getItem('user');
      return user ? JSON.parse(user).id : null;
    } catch {
      return null;
    }
  }

  private attemptReconnect(userId: string, restaurantId: string, role: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`[Realtime] Reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
      setTimeout(() => this.connect(userId, restaurantId, role), delay);
    }
  }
}
