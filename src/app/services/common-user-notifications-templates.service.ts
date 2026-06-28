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
    restaurant_created: {
      id: 'restaurant_created',
      title: 'Restaurant Created',
      message: 'Your restaurant "{{restaurant_name}}" has been created successfully at {{address}}.',
      type: 'restaurant',
      priority: 'high',
      action_text: 'View Restaurant',
      action_url: '/restaurants/{{restaurant_id}}',
      icon: 'fas fa-store'
    },
    subscription_activated: {
      id: 'subscription_activated',
      title: 'Subscription Activated',
      message: 'Your subscription plan "{{plan}}" for restaurant "{{restaurant_name}}" has been activated successfully. Amount paid: ₹{{price}}.',
      type: 'subscription',
      priority: 'high',
      action_text: 'View Subscription',
      action_url: '/subscriptions/{{subscription_id}}',
      icon: 'fas fa-check-circle'
    },
    subscription_deactivated: {
      id: 'subscription_deactivated',
      title: 'Subscription Deactivated',
      message: 'Your subscription plan "{{plan}}" for restaurant "{{restaurant_name}}" has been deactivated.',
      type: 'subscription',
      priority: 'high',
      action_text: 'Renew Subscription',
      action_url: '/subscriptions/renew/{{subscription_id}}',
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
    payment_received: {   // on order completed 
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
