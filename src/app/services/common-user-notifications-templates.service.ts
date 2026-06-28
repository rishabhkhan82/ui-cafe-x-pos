import { Injectable } from '@angular/core';

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  action_text?: string;
  action_url?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommonUserNotificationsTemplatesService {
  private readonly TEMPLATES: Record<string, NotificationTemplate> = {
    restaurant_subscription_approved: {
      id: 'restaurant_subscription_approved',
      title: 'Subscription Approved',
      message: 'Your restaurant "{{restaurant_name}}" subscription has been approved successfully.',
      type: 'subscription',
      priority: 'high',
      action_text: 'View Restaurant',
      action_url: '/restaurants/{{restaurant_id}}',
      icon: 'fas fa-check-circle'
    },
    restaurant_subscription_rejected: {
      id: 'restaurant_subscription_rejected',
      title: 'Subscription Rejected',
      message: 'Your restaurant "{{restaurant_name}}" subscription has been rejected. Reason: {{reason}}.',
      type: 'subscription',
      priority: 'high',
      action_text: 'Contact Support',
      action_url: '/support',
      icon: 'fas fa-times-circle'
    },
    new_order_received: {
      id: 'new_order_received',
      title: 'New Order #{{order_id}}',
      message: 'A new order has been placed for restaurant "{{restaurant_name}}". Table: {{table_no}}.',
      type: 'order',
      priority: 'high',
      action_text: 'View Order',
      action_url: '/orders/{{order_id}}',
      icon: 'fas fa-receipt'
    },
    order_status_updated: {
      id: 'order_status_updated',
      title: 'Order #{{order_id}} Updated',
      message: 'Your order status has been changed to "{{status}}".',
      type: 'order',
      priority: 'medium',
      action_text: 'Track Order',
      action_url: '/orders/{{order_id}}',
      icon: 'fas fa-sync-alt'
    },
    payment_received: {
      id: 'payment_received',
      title: 'Payment Received',
      message: 'Payment of ₹{{amount}} received for order #{{order_id}}. Method: {{payment_method}}.',
      type: 'payment',
      priority: 'medium',
      action_text: 'View Receipt',
      action_url: '/payments/{{payment_id}}',
      icon: 'fas fa-rupee-sign'
    },
    inventory_low_stock: {
      id: 'inventory_low_stock',
      title: 'Low Stock Alert',
      message: 'Item "{{item_name}}" is running low. Current stock: {{stock_quantity}} {{unit}}. Minimum: {{min_stock}}.',
      type: 'inventory',
      priority: 'high',
      action_text: 'Restock Now',
      action_url: '/inventory/{{item_id}}',
      icon: 'fas fa-exclamation-triangle'
    },
    subscription_expiring_soon: {
      id: 'subscription_expiring_soon',
      title: 'Subscription Expiring Soon',
      message: 'Your restaurant "{{restaurant_name}}" subscription will expire on {{expiry_date}}. Renew now to avoid interruption.',
      type: 'subscription',
      priority: 'high',
      action_text: 'Renew Now',
      action_url: '/subscriptions/renew/{{subscription_id}}',
      icon: 'fas fa-clock'
    },
    user_created: {
      id: 'user_created',
      title: 'New User Created',
      message: 'A new user "{{username}}" ({{role}}) has been created for restaurant "{{restaurant_name}}".',
      type: 'user',
      priority: 'low',
      action_text: 'View User',
      action_url: '/users/{{user_id}}',
      icon: 'fas fa-user-plus'
    }
  };

  render(templateId: string, data: Record<string, string | number>): NotificationTemplate {
    const template = this.TEMPLATES[templateId];
    if (!template) {
      throw new Error(`Unknown notification template: ${templateId}`);
    }

    return {
      ...template,
      title: this.replacePlaceholders(template.title, data),
      message: this.replacePlaceholders(template.message, data),
      action_text: template.action_text ? this.replacePlaceholders(template.action_text, data) : undefined,
      action_url: template.action_url ? this.replacePlaceholders(template.action_url, data) : undefined
    };
  }

  getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.TEMPLATES[templateId];
  }

  getAllTemplates(): NotificationTemplate[] {
    return Object.values(this.TEMPLATES);
  }

  private replacePlaceholders(text: string, data: Record<string, string | number>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }
}
