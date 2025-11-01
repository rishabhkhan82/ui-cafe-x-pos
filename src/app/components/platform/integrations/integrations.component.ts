import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'delivery' | 'communication' | 'analytics' | 'social' | 'pos';
  provider: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync?: Date;
  syncStatus?: 'success' | 'failed' | 'in_progress';
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    additionalSettings?: { [key: string]: any };
  };
  features: string[];
  pricing?: {
    plan: string;
    cost: number;
    billingCycle: 'monthly' | 'yearly';
  };
}

interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  failedSyncs: number;
  dataTransferred: number;
  uptime: number;
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.css'
})
export class IntegrationsComponent implements OnInit {
  integrations: Integration[] = [];
  filteredIntegrations: Integration[] = [];
  metrics: IntegrationMetrics = {
    totalIntegrations: 12,
    activeIntegrations: 9,
    failedSyncs: 2,
    dataTransferred: 245680,
    uptime: 98.5
  };

  selectedCategory = 'all';
  searchTerm = '';
  showAddIntegrationForm = false;

  newIntegration: Partial<Integration> = {
    name: '',
    category: 'payment',
    config: {}
  };

  constructor() {}

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations(): void {
    this.integrations = [
      {
        id: 'stripe',
        name: 'Stripe Payments',
        description: 'Accept credit card payments securely',
        category: 'payment',
        provider: 'Stripe Inc.',
        icon: 'fab fa-stripe-s',
        status: 'connected',
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'sk_test_...',
          webhookUrl: 'https://api.cafex.com/webhooks/stripe'
        },
        features: ['Credit Cards', 'Digital Wallets', 'Refunds', 'Subscriptions'],
        pricing: {
          plan: 'Standard',
          cost: 29,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Indian payment gateway for UPI, cards, and net banking',
        category: 'payment',
        provider: 'Razorpay Software Pvt Ltd',
        icon: 'fas fa-credit-card',
        status: 'connected',
        lastSync: new Date(Date.now() - 15 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'rzp_test_...',
          apiSecret: 'secret_...',
          webhookUrl: 'https://api.cafex.com/webhooks/razorpay'
        },
        features: ['UPI', 'Credit Cards', 'Net Banking', 'Wallets'],
        pricing: {
          plan: 'Business',
          cost: 0,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'swiggy',
        name: 'Swiggy Delivery',
        description: 'Food delivery integration with Swiggy platform',
        category: 'delivery',
        provider: 'Swiggy',
        icon: 'fas fa-truck',
        status: 'connected',
        lastSync: new Date(Date.now() - 45 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'swiggy_api_...',
          webhookUrl: 'https://api.cafex.com/webhooks/swiggy'
        },
        features: ['Order Sync', 'Real-time Tracking', 'Delivery Updates'],
        pricing: {
          plan: 'Premium',
          cost: 499,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'zomato',
        name: 'Zomato Partner',
        description: 'Integration with Zomato food delivery network',
        category: 'delivery',
        provider: 'Zomato',
        icon: 'fas fa-utensils',
        status: 'disconnected',
        syncStatus: 'failed',
        config: {},
        features: ['Menu Sync', 'Order Management', 'Reviews'],
        pricing: {
          plan: 'Gold',
          cost: 799,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'twilio',
        name: 'Twilio SMS',
        description: 'Send SMS notifications to customers and staff',
        category: 'communication',
        provider: 'Twilio Inc.',
        icon: 'fas fa-sms',
        status: 'connected',
        lastSync: new Date(Date.now() - 60 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'SK_...',
          apiSecret: 'secret_...'
        },
        features: ['SMS Notifications', 'OTP Verification', 'Marketing Messages'],
        pricing: {
          plan: 'Starter',
          cost: 15,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'sendgrid',
        name: 'SendGrid Email',
        description: 'Transactional and marketing email delivery',
        category: 'communication',
        provider: 'SendGrid',
        icon: 'fas fa-envelope',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'SG_...'
        },
        features: ['Transactional Emails', 'Marketing Campaigns', 'Templates'],
        pricing: {
          plan: 'Essentials',
          cost: 20,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'google_analytics',
        name: 'Google Analytics',
        description: 'Track website and app usage analytics',
        category: 'analytics',
        provider: 'Google',
        icon: 'fab fa-google',
        status: 'connected',
        lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'GA_...'
        },
        features: ['User Tracking', 'Conversion Tracking', 'Custom Reports'],
        pricing: {
          plan: 'Free',
          cost: 0,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'facebook_pixel',
        name: 'Facebook Pixel',
        description: 'Track conversions and optimize Facebook ads',
        category: 'social',
        provider: 'Meta',
        icon: 'fab fa-facebook',
        status: 'configuring',
        config: {},
        features: ['Conversion Tracking', 'Audience Building', 'Retargeting'],
        pricing: {
          plan: 'Free',
          cost: 0,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'square_pos',
        name: 'Square POS',
        description: 'Alternative POS system integration',
        category: 'pos',
        provider: 'Square Inc.',
        icon: 'fas fa-cash-register',
        status: 'error',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
        syncStatus: 'failed',
        config: {
          apiKey: 'sq0_...'
        },
        features: ['POS Sync', 'Inventory Management', 'Payment Processing'],
        pricing: {
          plan: 'Plus',
          cost: 29,
          billingCycle: 'monthly'
        }
      }
    ];
    this.filteredIntegrations = [...this.integrations];
  }

  filterIntegrations(): void {
    this.filteredIntegrations = this.integrations.filter(integration => {
      const matchesCategory = this.selectedCategory === 'all' || integration.category === this.selectedCategory;
      const matchesSearch = integration.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           integration.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           integration.provider.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'disconnected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'configuring': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'connected': return 'fas fa-check-circle';
      case 'disconnected': return 'fas fa-times-circle';
      case 'error': return 'fas fa-exclamation-triangle';
      case 'configuring': return 'fas fa-cog';
      default: return 'fas fa-question-circle';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'payment': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delivery': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'communication': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'analytics': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'social': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'pos': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getSyncStatusColor(status?: string): string {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      case 'in_progress': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-400';
    }
  }

  connectIntegration(integration: Integration): void {
    // In a real app, this would initiate OAuth flow or API key setup
    console.log('Connecting integration:', integration.id);
    integration.status = 'configuring';
  }

  disconnectIntegration(integration: Integration): void {
    if (confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      integration.status = 'disconnected';
      integration.lastSync = undefined;
      integration.syncStatus = undefined;
      // In a real app, this would call an API to disconnect
      console.log('Disconnecting integration:', integration.id);
    }
  }

  testIntegration(integration: Integration): void {
    // In a real app, this would test the integration connection
    console.log('Testing integration:', integration.id);
    integration.syncStatus = 'in_progress';
    // Simulate test result
    setTimeout(() => {
      integration.syncStatus = Math.random() > 0.2 ? 'success' : 'failed';
      integration.lastSync = new Date();
    }, 2000);
  }

  configureIntegration(integration: Integration): void {
    // In a real app, this would open a configuration modal
    console.log('Configuring integration:', integration.id);
  }

  showAddIntegration(): void {
    this.showAddIntegrationForm = true;
    this.newIntegration = {
      name: '',
      category: 'payment',
      config: {}
    };
  }

  cancelAddIntegration(): void {
    this.showAddIntegrationForm = false;
    this.newIntegration = {};
  }

  addIntegration(): void {
    if (this.newIntegration.name) {
      // In a real app, this would call an API to add the integration
      console.log('Adding new integration:', this.newIntegration);
      this.showAddIntegrationForm = false;
      this.newIntegration = {};
      // Reload integrations
      this.loadIntegrations();
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

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getIntegrationsByCategory(category: string): Integration[] {
    return this.integrations.filter(integration => integration.category === category);
  }

  calculateSuccessRate(): number {
    return Math.round((this.metrics.activeIntegrations / this.metrics.totalIntegrations) * 100);
  }
}
