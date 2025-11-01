import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SystemSetting {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'performance' | 'security' | 'notifications' | 'integrations';
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  value: any;
  defaultValue: any;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  requiresRestart?: boolean;
  lastModified?: Date;
}

@Component({
  selector: 'app-system-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-configuration.component.html',
  styleUrl: './system-configuration.component.css'
})
export class SystemConfigurationComponent implements OnInit {
  settings: SystemSetting[] = [];
  filteredSettings: SystemSetting[] = [];
  selectedCategory = 'all';
  searchTerm = '';
  hasUnsavedChanges = false;

  constructor() {}

  ngOnInit(): void {
    this.loadSystemSettings();
  }

  loadSystemSettings(): void {
    this.settings = [
      // General Settings
      {
        id: 'platform_name',
        name: 'Platform Name',
        description: 'The name displayed across the platform',
        category: 'general',
        type: 'text',
        value: 'CafeX POS',
        defaultValue: 'CafeX POS',
        validation: { required: true }
      },
      {
        id: 'platform_url',
        name: 'Platform URL',
        description: 'Base URL for the platform',
        category: 'general',
        type: 'text',
        value: 'https://cafex.com',
        defaultValue: 'https://cafex.com',
        validation: { required: true, pattern: '^https?://.+' }
      },
      {
        id: 'timezone',
        name: 'Default Timezone',
        description: 'Default timezone for the platform',
        category: 'general',
        type: 'select',
        value: 'Asia/Kolkata',
        defaultValue: 'Asia/Kolkata',
        options: ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London']
      },
      {
        id: 'currency',
        name: 'Default Currency',
        description: 'Default currency for transactions',
        category: 'general',
        type: 'select',
        value: 'INR',
        defaultValue: 'INR',
        options: ['INR', 'USD', 'EUR', 'GBP']
      },

      // Performance Settings
      {
        id: 'max_concurrent_users',
        name: 'Max Concurrent Users',
        description: 'Maximum number of users that can be active simultaneously',
        category: 'performance',
        type: 'number',
        value: 1000,
        defaultValue: 1000,
        validation: { required: true, min: 10, max: 10000 },
        requiresRestart: true
      },
      {
        id: 'cache_enabled',
        name: 'Enable Caching',
        description: 'Enable system-wide caching for better performance',
        category: 'performance',
        type: 'boolean',
        value: true,
        defaultValue: true,
        requiresRestart: true
      },
      {
        id: 'cache_ttl',
        name: 'Cache TTL (seconds)',
        description: 'Time-to-live for cached data',
        category: 'performance',
        type: 'number',
        value: 3600,
        defaultValue: 3600,
        validation: { required: true, min: 60, max: 86400 }
      },

      // Security Settings
      {
        id: 'session_timeout',
        name: 'Session Timeout (minutes)',
        description: 'Automatic logout after inactivity',
        category: 'security',
        type: 'number',
        value: 30,
        defaultValue: 30,
        validation: { required: true, min: 5, max: 480 }
      },
      {
        id: 'password_min_length',
        name: 'Minimum Password Length',
        description: 'Minimum characters required for passwords',
        category: 'security',
        type: 'number',
        value: 8,
        defaultValue: 8,
        validation: { required: true, min: 6, max: 128 }
      },
      {
        id: 'two_factor_required',
        name: 'Require 2FA',
        description: 'Require two-factor authentication for all users',
        category: 'security',
        type: 'boolean',
        value: false,
        defaultValue: false
      },

      // Notification Settings
      {
        id: 'email_notifications',
        name: 'Email Notifications',
        description: 'Enable email notifications system-wide',
        category: 'notifications',
        type: 'boolean',
        value: true,
        defaultValue: true
      },
      {
        id: 'sms_notifications',
        name: 'SMS Notifications',
        description: 'Enable SMS notifications for critical alerts',
        category: 'notifications',
        type: 'boolean',
        value: false,
        defaultValue: false
      },
      {
        id: 'notification_batch_size',
        name: 'Notification Batch Size',
        description: 'Maximum notifications sent per batch',
        category: 'notifications',
        type: 'number',
        value: 100,
        defaultValue: 100,
        validation: { required: true, min: 10, max: 1000 }
      },

      // Integration Settings
      {
        id: 'api_rate_limit',
        name: 'API Rate Limit',
        description: 'Maximum API requests per minute',
        category: 'integrations',
        type: 'number',
        value: 1000,
        defaultValue: 1000,
        validation: { required: true, min: 10, max: 10000 }
      },
      {
        id: 'webhook_retries',
        name: 'Webhook Retry Attempts',
        description: 'Number of retry attempts for failed webhooks',
        category: 'integrations',
        type: 'number',
        value: 3,
        defaultValue: 3,
        validation: { required: true, min: 0, max: 10 }
      },
      {
        id: 'maintenance_mode',
        name: 'Maintenance Mode',
        description: 'Put the platform in maintenance mode',
        category: 'general',
        type: 'boolean',
        value: false,
        defaultValue: false,
        requiresRestart: true
      }
    ];
    this.filteredSettings = [...this.settings];
  }

  filterSettings(): void {
    this.filteredSettings = this.settings.filter(setting => {
      const matchesCategory = this.selectedCategory === 'all' || setting.category === this.selectedCategory;
      const matchesSearch = setting.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           setting.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getSettingsByCategory(category: string): SystemSetting[] {
    return this.settings.filter(s => s.category === category);
  }

  updateSetting(setting: SystemSetting, newValue: any): void {
    setting.value = newValue;
    setting.lastModified = new Date();
    this.hasUnsavedChanges = true;
  }

  resetSetting(setting: SystemSetting): void {
    setting.value = setting.defaultValue;
    setting.lastModified = new Date();
    this.hasUnsavedChanges = true;
  }

  saveSettings(): void {
    // In a real app, this would save settings to backend
    console.log('Saving system settings...');
    this.hasUnsavedChanges = false;

    // Check if any settings require restart
    const requiresRestart = this.settings.some(s => s.requiresRestart && s.lastModified);
    if (requiresRestart) {
      alert('Some changes require a system restart to take effect.');
    }
  }

  resetAllSettings(): void {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      this.settings.forEach(setting => {
        setting.value = setting.defaultValue;
        setting.lastModified = new Date();
      });
      this.hasUnsavedChanges = true;
    }
  }

  exportSettings(): void {
    // In a real app, this would export settings as JSON
    const settingsData = this.settings.map(s => ({
      id: s.id,
      value: s.value,
      lastModified: s.lastModified
    }));
    console.log('Exporting settings:', settingsData);
  }

  importSettings(): void {
    // In a real app, this would allow importing settings from file
    console.log('Importing settings...');
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'performance': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'notifications': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'integrations': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'general': return 'fas fa-cog';
      case 'performance': return 'fas fa-tachometer-alt';
      case 'security': return 'fas fa-shield-alt';
      case 'notifications': return 'fas fa-bell';
      case 'integrations': return 'fas fa-plug';
      default: return 'fas fa-cog';
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
}
