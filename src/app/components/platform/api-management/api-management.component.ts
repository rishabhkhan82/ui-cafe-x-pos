import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { APIKey, APIEndpoint, APIMetrics } from '../../../services/mock-data.service';
import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-api-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-management.component.html',
  styleUrl: './api-management.component.css'
})
export class ApiManagementComponent implements OnInit, OnDestroy {
  apiKeys: APIKey[] = [];
  apiEndpoints: APIEndpoint[] = [];
  metrics: APIMetrics | null = null;

  selectedTab = 'keys';
  searchTerm = '';
  showCreateKeyForm = false;

  newKey: Partial<APIKey> = {
    name: '',
    permissions: [],
    rateLimit: 1000
  };

  private subscriptions: Subscription[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadAPIKeys();
    this.loadAPIEndpoints();
    this.loadAPIMetrics();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAPIKeys(): void {
    const subscription = this.mockDataService.getAPIKeys().subscribe(keys => {
      this.apiKeys = keys;
    });
    this.subscriptions.push(subscription);
  }

  loadAPIEndpoints(): void {
    const subscription = this.mockDataService.getAPIEndpoints().subscribe(endpoints => {
      this.apiEndpoints = endpoints;
    });
    this.subscriptions.push(subscription);
  }

  loadAPIMetrics(): void {
    const subscription = this.mockDataService.getAPIMetrics().subscribe(metrics => {
      this.metrics = metrics;
    });
    this.subscriptions.push(subscription);
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
      this.mockDataService.updateAPIKeyStatus(key.id, 'inactive');
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
