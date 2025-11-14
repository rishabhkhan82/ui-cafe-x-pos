import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettings, MockDataService } from '../../../services/mock-data.service';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-system-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-configuration.component.html',
  styleUrl: './system-configuration.component.css'
})
export class SystemConfigurationComponent implements OnInit, OnDestroy {
  settings: any | null = null;
  selectedCategory = 'all';
  searchTerm = '';
  hasUnsavedChanges = false;
  isLoading = false;
  errorMessage = '';
  private loadingSubscription: Subscription = new Subscription();

  constructor(
    private mockDataService: MockDataService,
    private crudService: CrudService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Subscribe to global loading state
    this.loadingSubscription = this.loadingService.loading$.subscribe(
      loading => this.isLoading = loading
    );

    this.loadSystemSettings();
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.loadingSubscription.unsubscribe();
  }

  loadSystemSettings(): void {
    this.errorMessage = '';

    this.crudService.getData('system-settings/get-system-settings',{}).subscribe({
      next: (response) => {
        this.settings = response;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load system settings. Please try again.';
        console.error('Error loading system settings:', error);
      }
    });
  }

  getSettingsByCategory(category: string): any {
    // Since we now load all settings at once, we can filter locally
    if (this.settings && this.settings[category as keyof typeof this.settings]) {
      return { [category]: this.settings[category as keyof typeof this.settings] };
    }
    return {};
  }

  updateSetting(settingPath: string, newValue: any): void {
    this.mockDataService.updateSystemSetting(settingPath, newValue);
    this.hasUnsavedChanges = true;
  }

  resetSetting(settingPath: string): void {
    // For now, reset locally by reloading settings and updating the specific field
    // In a full implementation, this would call an API to reset the specific setting
    this.errorMessage = '';

    this.crudService.getData('system-settings/get-system-settings').subscribe({
      next: (response) => {
        // Update the local settings object with fresh data
        this.settings = response;
        this.hasUnsavedChanges = true;
        console.log('Settings refreshed after reset');
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to refresh settings after reset.';
        console.error('Error refreshing settings:', error);
      }
    });
  }

  saveSettings(): void {
    if (!this.settings) {
      this.errorMessage = 'No settings to save.';
      return;
    }

    this.errorMessage = '';
    let payload = this.settings;
    this.crudService.putData('system-settings/save-system-settings', payload, this.crudService.getHeaderToken()).subscribe({
      next: (response) => {
        this.hasUnsavedChanges = false;
        console.log('System settings saved successfully:', response);
        // Show success message (you can replace with a toast notification)
        alert('Settings saved successfully!');
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to save settings. Please try again.';
        console.error('Error saving system settings:', error);
      }
    });
  }

  resetAllSettings(): void {
    if (confirm('Are you sure you want to reset all settings to their default values? This will reload all settings from the server.')) {
      this.errorMessage = '';

      this.crudService.getData('system-settings/get-system-settings').subscribe({
        next: (response) => {
          this.settings = response;
          this.hasUnsavedChanges = true;
          console.log('All settings reset to defaults');
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to reset all settings.';
          console.error('Error resetting all settings:', error);
        }
      });
    }
  }

  exportSettings(): void {
    // In a real app, this would export settings as JSON
    if (this.settings) {
      const settingsData = {
        id: this.settings.id,
        updatedBy: this.settings.updatedBy,
        updatedAt: this.settings.updatedAt,
        createdAt: this.settings.createdAt,
        platform_name: this.settings.platform_name,
        platform_url: this.settings.platform_url,
        platform_logo: this.settings.platform_logo,
        default_language: this.settings.default_language,
        maintenance_mode: this.settings.maintenance_mode,
        maintenance_message: this.settings.maintenance_message,
        file_upload_max_size: this.settings.file_upload_max_size,
        backup_enabled: this.settings.backup_enabled,
        backup_frequency: this.settings.backup_frequency,
        support_email: this.settings.support_email,
        support_phone: this.settings.support_phone,
        terms_url: this.settings.terms_url,
        privacy_url: this.settings.privacy_url,
        timezone: this.settings.timezone,
        currency: this.settings.currency,
        max_concurrent_users: this.settings.max_concurrent_users,
        cache_enabled: this.settings.cache_enabled,
        cache_ttl: this.settings.cache_ttl,
        session_timeout: this.settings.session_timeout,
        password_min_length: this.settings.password_min_length,
        two_factor_required: this.settings.two_factor_required,
        email_notifications: this.settings.email_notifications,
        sms_notifications: this.settings.sms_notifications,
        notification_batch_size: this.settings.notification_batch_size,
        api_rate_limit: this.settings.api_rate_limit,
        webhook_retries: this.settings.webhook_retries,
      };
      console.log('Exporting settings:', settingsData);
      // Create and download JSON file
      const dataStr = JSON.stringify(settingsData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'system-settings.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
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
