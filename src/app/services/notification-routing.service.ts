import { Injectable } from '@angular/core';
import { CommonUserNotificationsService } from './common-user-notifications.service';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { NotificationMessage } from './mock-data.service';

export interface RouteRule {
  toStatus: string;
  targetRoles: string[];
  templateId: string;
  persistToList: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationRoutingService {
  private rules: RouteRule[] = [
    { toStatus: 'PENDING',            targetRoles: ['restaurant_owner', 'restaurant_manager', 'kitchen_manager'], templateId: 'new_order_received', persistToList: true },
    { toStatus: 'PREPARING',            targetRoles: ['customer'], templateId: 'order_status_updated', persistToList: true },
    { toStatus: 'READY',              targetRoles: ['waiter', 'customer'], templateId: 'order_status_updated', persistToList: true },
    { toStatus: 'ON_THE_WAY',            targetRoles: ['customer'], templateId: 'order_status_updated', persistToList: true },
    { toStatus: 'SERVED',            targetRoles: ['customer'], templateId: 'order_status_updated', persistToList: true },
    // { toStatus: 'BILLING_REQUESTED',  targetRoles: ['restaurant_owner'], templateId: 'order_status_updated', persistToList: true },
    // { toStatus: 'COMPLETED',          targetRoles: ['restaurant_owner', 'customer'], templateId: 'order_status_updated', persistToList: true },
  ];

  constructor(
    private notificationService: CommonUserNotificationsService,
    private toastService: NotificationService
  ) {}

  findRule(role: string, status: string): RouteRule | undefined {
    const normalizedStatus = (status || '').toString().toUpperCase();
    const normalizedRole = (role || '').toString().toLowerCase();
    const rule = this.rules.find(r => r.targetRoles.some(tr => tr.toLowerCase() === normalizedRole) && r.toStatus === normalizedStatus);
    if (!rule) {
      console.log('[NotificationRouting] No rule matched', { role: normalizedRole, status: normalizedStatus });
    } else {
      console.log('[NotificationRouting] Rule matched', { role: normalizedRole, status: normalizedStatus, templateId: rule.templateId });
    }
    return rule;
  }

  createNotification(rule: RouteRule, order: any, recipientId: string, recipientRole: string): Observable<any> {
    if (!rule.persistToList) return of(null);

    const tableNo = sessionStorage.getItem('current_customer_table_no') || order.table_number || '';

    const templateData: Record<string, string | number> = {
      order_id: order.order_id || order.id,
      table_no: tableNo,
      table_number: tableNo,
      customer_name: order.customer_name || '',
      total_amount: order.total_amount || 0,
      status: rule.toStatus,
    };

    return this.notificationService.createFromTemplate(rule.templateId, templateData, {
      recipient_id: recipientId,
      recipient_role: recipientRole,
      restaurant_id: order.restaurant_id?.toString(),
      related_order_id: order.order_id || order.id?.toString(),
      priority: order.priority === 'HIGH' ? 'high' : 'medium',
    }).pipe(
      tap((res: any) => {
        console.log('[NotificationRouting] createNotification success', res);
      }),
      catchError((err: any) => {
        console.error('[NotificationRouting] createNotification failed', err);
        return of(null);
      })
    );
  }

  showToast(rule: RouteRule, order: any): void {
    const id = order.order_id || order.id;

    switch (rule.templateId) {
      case 'new_order_received':
        this.toastService.show({
          type: 'order',
          title: 'New Order',
          message: `Order #${id} incoming from ${order.customer_name || 'customer'}`,
          icon: 'fas fa-shopping-cart',
          duration: 6000,
          persistent: false,
          sound: true,
          action: { label: 'View Order', callback: () => {} }
        });
        break;
      case 'order_status_updated':
        const isCustomer = rule.targetRoles.includes('customer');
        this.toastService.show({
          type: isCustomer ? 'order' : 'info',
          title: 'Order Update',
          message: `Order #${id} is now ${rule.toStatus.replace('_', ' ')}`,
          icon: isCustomer ? 'fas fa-utensils' : 'fas fa-sync-alt',
          duration: 5000,
          persistent: false,
          sound: true,
          action: { label: 'View Details', callback: () => {} }
        });
        break;
    }
  }
}
