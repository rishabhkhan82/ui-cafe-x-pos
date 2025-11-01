import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface APIKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  permissions: string[];
  rateLimit: number;
  status: 'active' | 'inactive' | 'expired';
  usage: {
    requests: number;
    limit: number;
    resetDate: Date;
  };
}

interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  category: 'authentication' | 'restaurants' | 'orders' | 'users' | 'analytics' | 'webhooks';
  version: string;
  rateLimit: number;
  requiresAuth: boolean;
  status: 'active' | 'deprecated' | 'maintenance';
  lastCalled?: Date;
  callCount: number;
}

interface APIMetrics {
  totalRequests: number;
  activeKeys: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  topEndpoints: { endpoint: string; calls: number }[];
}

@Component({
  selector: 'app-api-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-management.component.html',
  styleUrl: './api-management.component.css'
})
export class ApiManagementComponent implements OnInit {
  apiKeys: APIKey[] = [];
  apiEndpoints: APIEndpoint[] = [];
  metrics: APIMetrics = {
    totalRequests: 45280,
    activeKeys: 23,
    failedRequests: 145,
    averageResponseTime: 245,
    uptime: 99.7,
    topEndpoints: [
      { endpoint: '/api/orders', calls: 12500 },
      { endpoint: '/api/restaurants', calls: 8900 },
      { endpoint: '/api/menu', calls: 6700 },
      { endpoint: '/api/users', calls: 5200 },
      { endpoint: '/api/analytics', calls: 3800 }
    ]
  };

  selectedTab = 'keys';
  searchTerm = '';
  showCreateKeyForm = false;

  newKey: Partial<APIKey> = {
    name: '',
    permissions: [],
    rateLimit: 1000
  };

  constructor() {}

  ngOnInit(): void {
    this.loadAPIKeys();
    this.loadAPIEndpoints();
  }

  loadAPIKeys(): void {
    this.apiKeys = [
      {
        id: '1',
        name: 'Production API Key',
        key: 'cafex_prod_1234567890abcdef',
        maskedKey: 'cafe...cdef',
        createdBy: 'admin@cafex.com',
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        permissions: ['read', 'write', 'delete'],
        rateLimit: 5000,
        status: 'active',
        usage: {
          requests: 15420,
          limit: 5000,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '2',
        name: 'Development API Key',
        key: 'cafex_dev_abcdef1234567890',
        maskedKey: 'cafe...890',
        createdBy: 'dev@cafex.com',
        createdAt: new Date('2024-02-01'),
        lastUsed: new Date(Date.now() - 30 * 60 * 1000),
        permissions: ['read', 'write'],
        rateLimit: 1000,
        status: 'active',
        usage: {
          requests: 450,
          limit: 1000,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '3',
        name: 'Mobile App API Key',
        key: 'cafex_mobile_0987654321fedcba',
        maskedKey: 'cafe...cba',
        createdBy: 'mobile@cafex.com',
        createdAt: new Date('2024-03-10'),
        lastUsed: new Date(Date.now() - 15 * 60 * 1000),
        permissions: ['read'],
        rateLimit: 2000,
        status: 'active',
        usage: {
          requests: 2890,
          limit: 2000,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }
    ];
  }

  loadAPIEndpoints(): void {
    this.apiEndpoints = [
      {
        id: '1',
        path: '/api/auth/login',
        method: 'POST',
        description: 'Authenticate user and return JWT token',
        category: 'authentication',
        version: 'v1',
        rateLimit: 10,
        requiresAuth: false,
        status: 'active',
        lastCalled: new Date(Date.now() - 5 * 60 * 1000),
        callCount: 1250
      },
      {
        id: '2',
        path: '/api/restaurants',
        method: 'GET',
        description: 'Get list of restaurants with filters',
        category: 'restaurants',
        version: 'v1',
        rateLimit: 100,
        requiresAuth: true,
        status: 'active',
        lastCalled: new Date(Date.now() - 2 * 60 * 1000),
        callCount: 8900
      },
      {
        id: '3',
        path: '/api/orders',
        method: 'POST',
        description: 'Create a new order',
        category: 'orders',
        version: 'v1',
        rateLimit: 50,
        requiresAuth: true,
        status: 'active',
        lastCalled: new Date(Date.now() - 1 * 60 * 1000),
        callCount: 12500
      },
      {
        id: '4',
        path: '/api/menu/items',
        method: 'GET',
        description: 'Get menu items for a restaurant',
        category: 'restaurants',
        version: 'v1',
        rateLimit: 200,
        requiresAuth: false,
        status: 'active',
        lastCalled: new Date(Date.now() - 10 * 60 * 1000),
        callCount: 6700
      },
      {
        id: '5',
        path: '/api/analytics/revenue',
        method: 'GET',
        description: 'Get revenue analytics data',
        category: 'analytics',
        version: 'v1',
        rateLimit: 20,
        requiresAuth: true,
        status: 'active',
        lastCalled: new Date(Date.now() - 30 * 60 * 1000),
        callCount: 3800
      },
      {
        id: '6',
        path: '/api/webhooks/orders',
        method: 'POST',
        description: 'Webhook endpoint for order events',
        category: 'webhooks',
        version: 'v1',
        rateLimit: 1000,
        requiresAuth: false,
        status: 'active',
        lastCalled: new Date(Date.now() - 3 * 60 * 1000),
        callCount: 450
      }
    ];
  }

  filterKeys(): APIKey[] {
    return this.apiKeys.filter(key =>
      key.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      key.createdBy.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  filterEndpoints(): APIEndpoint[] {
    return this.apiEndpoints.filter(endpoint =>
      endpoint.path.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  showCreateKey(): void {
    this.showCreateKeyForm = true;
    this.newKey = {
      name: '',
      permissions: [],
      rateLimit: 1000
    };
  }

  cancelCreateKey(): void {
    this.showCreateKeyForm = false;
    this.newKey = {};
  }

  createKey(): void {
    if (this.newKey.name) {
      // In a real app, this would call an API to create the key
      console.log('Creating new API key:', this.newKey);
      this.showCreateKeyForm = false;
      this.newKey = {};
      // Reload keys
      this.loadAPIKeys();
    }
  }

  revokeKey(key: APIKey): void {
    if (confirm(`Are you sure you want to revoke the API key "${key.name}"? This action cannot be undone.`)) {
      key.status = 'inactive';
      // In a real app, this would call an API to revoke the key
      console.log('Revoking API key:', key.id);
    }
  }

  regenerateKey(key: APIKey): void {
    if (confirm(`Are you sure you want to regenerate the API key "${key.name}"? The old key will be invalidated.`)) {
      // In a real app, this would call an API to regenerate the key
      console.log('Regenerating API key:', key.id);
    }
  }

  togglePermission(key: APIKey, permission: string): void {
    const index = key.permissions.indexOf(permission);
    if (index > -1) {
      key.permissions.splice(index, 1);
    } else {
      key.permissions.push(permission);
    }
    // In a real app, this would call an API to update permissions
    console.log('Updated permissions for key:', key.id, key.permissions);
  }

  getMethodColor(method: string): string {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'PATCH': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'expired': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'deprecated': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'maintenance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'authentication': return 'fas fa-key';
      case 'restaurants': return 'fas fa-utensils';
      case 'orders': return 'fas fa-shopping-cart';
      case 'users': return 'fas fa-users';
      case 'analytics': return 'fas fa-chart-bar';
      case 'webhooks': return 'fas fa-plug';
      default: return 'fas fa-code';
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

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log('Copied to clipboard:', text);
    });
  }

  calculateUsagePercentage(key: APIKey): number {
    return Math.round((key.usage.requests / key.usage.limit) * 100);
  }
}
