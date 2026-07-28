import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { AuthService } from './auth.service';
import { CommonUserNotificationsTemplatesService, NotificationTemplate } from './common-user-notifications-templates.service';

export interface Notification {
  id: string;
  notification_id: string;
  recipient_id: string;
  recipient_role: string;
  restaurant_id?: string;
  type: string;
  title: string;
  message: string;
  action_text?: string;
  action_url?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'sent' | 'delivered' | 'read' | 'archived' | 'unread';
  related_entity_type?: string;
  related_entity_id?: string;
  related_order_id?: string;
  sent_at: Date;
  created_at: Date;
  read_at?: Date;
  expires_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommonUserNotificationsService {
  private readonly API_NOTIFICATIONS = 'notifications';

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private crudService: CrudService,
    private authService: AuthService,
    private templatesService: CommonUserNotificationsTemplatesService
  ) {}

  // ===============================
  // PUBLIC API
  // ===============================

  loadNotifications(recipientId: string, filter: 'unread' | 'read' | 'all' = 'unread', page: number = 1, size: number = 100): Observable<Notification[]> {
    const params: any = { recipient_id: recipientId, page, size };
    if (filter === 'unread') {
      params.status = 'unread';
    } else if (filter === 'read') {
      params.status = 'read';
    }

    return this.crudService.getData(this.API_NOTIFICATIONS, params).pipe(
      map((response: any) => {
        const data = Array.isArray(response) ? response : (response?.data ?? []);
        const total = response?.totalRowCount ?? (Array.isArray(response) ? response.length : data.length);
        return { notifications: this.mapToNotifications(data), total };
      }),
      tap(({ notifications, total }) => {
        this.notificationsSubject.next(notifications);
        if (filter === 'unread') {
          this.unreadCountSubject.next(total);
        } else {
          this.recalculateUnreadCount();
        }
      }),
      map(({ notifications }) => notifications),
      catchError(err => {
        console.error('Failed to load notifications', err);
        return of([]);
      })
    );
  }

  getUnreadCount(recipientId: string): Observable<number> {
    return this.crudService.getData(this.API_NOTIFICATIONS, {
      recipient_id: recipientId,
      status: 'unread',
      page: 1,
      size: 1
    }).pipe(
      map((response: any) => {
        if (Array.isArray(response)) return response.length;
        if (response && typeof response === 'object') {
          return response.totalRowCount ?? response.count ?? (response.data ? Math.min(1, response.data.length) : 0);
        }
        return 0;
      }),
      tap(count => this.unreadCountSubject.next(count)),
      catchError(() => of(0))
    );
  }

  markAsRead(notificationId: string): Observable<any> {
    const payload = {
      status: 'read',
      read_at: new Date().toISOString()
    };

    return this.crudService.patchData(this.API_NOTIFICATIONS, payload, {}, notificationId).pipe(
      tap(() => {
        console.log('[NotifService] markAsRead success', notificationId);
        const updated = this.notificationsSubject.value.map(n =>
          n.id === notificationId ? ({ ...n, status: 'read', read_at: new Date() } as Notification) : n
        );
        this.notificationsSubject.next(updated);
        this.recalculateUnreadCount();
      }),
      catchError(err => {
        console.error('[NotifService] markAsRead failed', notificationId, err);
        return of(null);
      })
    );
  }

  markAllAsRead(recipientId: string): Observable<any> {
    const payload = {
      recipient_id: recipientId,
      status: 'read',
      read_at: new Date().toISOString()
    };

    return this.crudService.patchData(`${this.API_NOTIFICATIONS}/mark-all-read`, payload).pipe(
      tap(() => {
        console.log('[NotifService] markAllAsRead success', recipientId);
        const updated = this.notificationsSubject.value.map(n => ({ ...n, status: 'read', read_at: new Date() } as Notification));
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(0);
      }),
      catchError(err => {
        console.error('[NotifService] markAllAsRead failed', recipientId, err);
        return of(null);
      })
    );
  }

  createNotification(payload: {
    notification_id: string;
    recipient_id: string;
    recipient_role: string;
    restaurant_id?: string;
    type: string;
    title: string;
    message: string;
    action_text?: string;
    action_url?: string;
    icon?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'sent' | 'delivered' | 'read' | 'archived' | 'unread';
    related_entity_type?: string;
    related_entity_id?: string;
    related_order_id?: string;
    expires_at?: string;
  }): Observable<any> {
    const normalizedPayload = {
      ...payload,
      status: payload.status ?? 'unread',
      priority: payload.priority ?? 'medium',
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    return this.crudService.postData(this.API_NOTIFICATIONS, normalizedPayload);
  }

  createFromTemplate(
    templateId: string,
    data: Record<string, string | number>,
    extra: {
      notification_id?: string;
      recipient_id: string;
      recipient_role: string;
      restaurant_id?: string;
      priority?: 'low' | 'medium' | 'high';
      status?: 'sent' | 'delivered' | 'read' | 'archived' | 'unread';
      related_entity_type?: string;
      related_entity_id?: string;
      related_order_id?: string;
      expires_at?: string;
    }
  ): Observable<any> {
    const template = this.templatesService.render(templateId, data);

    const normalizedPayload = {
      notification_id: extra.notification_id || this.generateNotificationId(),
      recipient_id: extra.recipient_id,
      recipient_role: extra.recipient_role,
      restaurant_id: extra.restaurant_id,
      type: template.type,
      title: template.title,
      message: template.message,
      action_text: template.action_text,
      action_url: template.action_url,
      icon: template.icon,
      priority: extra.priority ?? template.priority,
      status: extra.status ?? 'unread',
      related_entity_type: extra.related_entity_type,
      related_entity_id: extra.related_entity_id,
      related_order_id: extra.related_order_id,
      expires_at: extra.expires_at,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    return this.crudService.postData(this.API_NOTIFICATIONS, normalizedPayload).pipe(
      tap((response: any) => {
        const notifData = response?.data ?? response;
        if (notifData) {
          const newNotif = this.mapSingleNotification(notifData);
          const current = this.notificationsSubject.value;
          this.notificationsSubject.next([newNotif, ...current]);
          if (newNotif.status === 'unread') {
            this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
          }
        }
      }),
      catchError(err => {
        console.error('Failed to create notification from template', err);
        return of(null);
      })
    );
  }

  getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templatesService.getTemplate(templateId);
  }

  getAllTemplates(): NotificationTemplate[] {
    return this.templatesService.getAllTemplates();
  }

  private generateNotificationId(): string {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  // ===============================
  // HELPERS
  // ===============================

  private mapToNotifications(items: any[]): Notification[] {
    return items.map(this.mapSingleNotification);
  }

  private mapSingleNotification(item: any): Notification {
    return {
      id: item.id?.toString() ?? '',
      notification_id: item.notification_id ?? '',
      recipient_id: item.recipient_id ?? '',
      recipient_role: item.recipient_role ?? '',
      restaurant_id: item.restaurant_id,
      type: item.type ?? '',
      title: item.title ?? '',
      message: item.message ?? '',
      action_text: item.action_text,
      action_url: item.action_url,
      icon: item.icon,
      priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
      status: ['sent', 'delivered', 'read', 'archived', 'unread'].includes(item.status) ? item.status : 'sent',
      related_entity_type: item.related_entity_type,
      related_entity_id: item.related_entity_id,
      related_order_id: item.related_order_id,
      sent_at: item.sent_at ? new Date(item.sent_at) : new Date(),
      created_at: item.created_at ? new Date(item.created_at) : new Date(),
      read_at: item.read_at ? new Date(item.read_at) : undefined,
      expires_at: item.expires_at
    };
  }

  private recalculateUnreadCount(): void {
    const count = this.notificationsSubject.value.filter(n => n.status === 'unread').length;
    this.unreadCountSubject.next(count);
  }
}
