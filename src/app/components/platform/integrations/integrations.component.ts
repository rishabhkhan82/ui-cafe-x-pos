import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Integration, IntegrationMetrics, MockDataService } from '../../../services/mock-data.service';

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
  metrics: IntegrationMetrics | null = null;

  selectedCategory = 'all';
  searchTerm = '';
  showAddIntegrationForm = false;

  newIntegration: Partial<Integration> = {
    name: '',
    category: 'payment',
    config: {}
  };

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations(): void {
    this.mockDataService.getIntegrations().subscribe(integrations => {
      this.integrations = integrations;
      this.filteredIntegrations = [...this.integrations];
    });

    this.mockDataService.getIntegrationMetrics().subscribe(metrics => {
      this.metrics = metrics;
    });
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
    this.mockDataService.updateIntegrationStatus(integration.id, 'configuring');
  }

  disconnectIntegration(integration: Integration): void {
    if (confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      this.mockDataService.updateIntegrationStatus(integration.id, 'disconnected');
      // In a real app, this would call an API to disconnect
      console.log('Disconnecting integration:', integration.id);
    }
  }

  testIntegration(integration: Integration): void {
    // In a real app, this would test the integration connection
    console.log('Testing integration:', integration.id);
    // Simulate test result
    setTimeout(() => {
      const success = Math.random() > 0.2;
      this.mockDataService.updateIntegrationSyncStatus(integration.id, success ? 'success' : 'failed');
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
    if (!this.metrics) return 0;
    return Math.round((this.metrics.activeIntegrations / this.metrics.totalIntegrations) * 100);
  }
}
