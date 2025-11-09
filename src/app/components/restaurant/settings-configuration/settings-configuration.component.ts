import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MockDataService, RestaurantSettings, User, SettingsFilterOption, PaymentMethodDescription, NotificationConfig } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings-configuration.component.html',
  styleUrls: ['./settings-configuration.component.css']
})
export class SettingsConfigurationComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  currentUser: any;
  restaurantSettings: RestaurantSettings | null = null;
  activeTab = 'general';
  isEditing = false;

  // Filter properties
  searchQuery = '';
  selectedCategory = 'all';
  selectedStatus = 'all';

  // Configuration data from service
  settingsFilterCategories: SettingsFilterOption[] = [];
  settingsFilterStatuses: SettingsFilterOption[] = [];
  paymentMethodDescriptions: PaymentMethodDescription[] = [];
  notificationConfigs: NotificationConfig[] = [];
  businessDays: string[] = [];
  tipOptions: number[] = [];

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadSettings();
    this.loadConfigurationData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadConfigurationData(): void {
    // Load configuration data from service
    const categoriesSub = this.mockDataService.getSettingsFilterCategories().subscribe(categories => {
      this.settingsFilterCategories = categories;
    });
    this.subscriptions.push(categoriesSub);

    const statusesSub = this.mockDataService.getSettingsFilterStatuses().subscribe(statuses => {
      this.settingsFilterStatuses = statuses;
    });
    this.subscriptions.push(statusesSub);

    const descriptionsSub = this.mockDataService.getPaymentMethodDescriptions().subscribe(descriptions => {
      this.paymentMethodDescriptions = descriptions;
    });
    this.subscriptions.push(descriptionsSub);

    const notificationsSub = this.mockDataService.getNotificationConfigs().subscribe(configs => {
      this.notificationConfigs = configs;
    });
    this.subscriptions.push(notificationsSub);

    const businessDaysSub = this.mockDataService.getBusinessDays().subscribe(days => {
      this.businessDays = days;
    });
    this.subscriptions.push(businessDaysSub);

    const tipOptionsSub = this.mockDataService.getTipOptions().subscribe(options => {
      this.tipOptions = options;
    });
    this.subscriptions.push(tipOptionsSub);
  }

  loadSettings(): void {
    this.mockDataService.getRestaurantSettings().subscribe(settings => {
      this.restaurantSettings = settings[0] || null; // Get first settings (assuming single restaurant)
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.loadSettings(); // Reload original settings
  }

  saveSettings(): void {
    if (this.restaurantSettings) {
      // In a real app, this would make an API call to save settings
      console.log('Saving settings:', this.restaurantSettings);
      this.isEditing = false;
      // Show success message
    }
  }

  updateBusinessHour(day: string, field: 'open' | 'close', value: string): void {
    if (this.restaurantSettings?.businessHours) {
      (this.restaurantSettings.businessHours as any)[day][field] = value;
    }
  }

  toggleBusinessDay(day: string): void {
    if (this.restaurantSettings?.businessHours) {
      const daySettings = (this.restaurantSettings.businessHours as any)[day];
      daySettings.closed = !daySettings.closed;
    }
  }

  addPaymentMethod(method: string): void {
    if (this.restaurantSettings && !this.restaurantSettings.paymentSettings.acceptedPayments.includes(method)) {
      this.restaurantSettings.paymentSettings.acceptedPayments.push(method);
    }
  }

  removePaymentMethod(method: string): void {
    if (this.restaurantSettings) {
      this.restaurantSettings.paymentSettings.acceptedPayments =
        this.restaurantSettings.paymentSettings.acceptedPayments.filter(m => m !== method);
    }
  }

  exportSettings(): void {
    if (this.restaurantSettings) {
      const dataStr = JSON.stringify(this.restaurantSettings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `restaurant-settings-${this.restaurantSettings.name.toLowerCase().replace(/\s+/g, '-')}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }

  importSettings(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          this.restaurantSettings = settings;
          console.log('Settings imported successfully');
        } catch (error) {
          console.error('Error importing settings:', error);
          alert('Invalid settings file format');
        }
      };
      reader.readAsText(file);
    }
  }

  toggleTipOption(tip: number): void {
    if (this.restaurantSettings?.paymentSettings.tipOptions) {
      const index = this.restaurantSettings.paymentSettings.tipOptions.indexOf(tip);
      if (index > -1) {
        this.restaurantSettings.paymentSettings.tipOptions.splice(index, 1);
      } else {
        this.restaurantSettings.paymentSettings.tipOptions.push(tip);
      }
    }
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      // Reset to default settings
      this.loadSettings();
      console.log('Settings reset to defaults');
    }
  }

  toggleTheme(): void {
    // Theme toggle logic would go here
  }

  getBusinessDayOpen(day: string): boolean {
    if (this.restaurantSettings?.businessHours) {
      const daySettings = (this.restaurantSettings.businessHours as any)[day];
      return daySettings ? !daySettings.closed : false;
    }
    return false;
  }

  getBusinessHour(day: string, field: 'open' | 'close'): string {
    if (this.restaurantSettings?.businessHours) {
      const daySettings = (this.restaurantSettings.businessHours as any)[day];
      return daySettings ? daySettings[field] || '' : '';
    }
    return '';
  }

  getNotificationValue(key: string): boolean {
    if (this.restaurantSettings?.notifications) {
      return (this.restaurantSettings.notifications as any)[key] || false;
    }
    return false;
  }

  setNotificationValue(key: string, value: boolean): void {
    if (this.restaurantSettings?.notifications) {
      (this.restaurantSettings.notifications as any)[key] = value;
    }
  }

  // New methods for enhanced functionality
  getBusinessHoursCount(): number {
    if (!this.restaurantSettings?.businessHours) return 0;
    let count = 0;
    this.businessDays.forEach(day => {
      if (this.getBusinessDayOpen(day)) count++;
    });
    return count;
  }

  getPaymentMethodsCount(): number {
    return this.restaurantSettings?.paymentSettings?.acceptedPayments?.length || 0;
  }

  getActiveNotificationsCount(): number {
    if (!this.restaurantSettings?.notifications) return 0;
    let count = 0;
    this.notificationConfigs.forEach(config => {
      if (this.getNotificationValue(config.key)) count++;
    });
    return count;
  }

  filterSettings(): void {
    // Filter functionality - could be implemented to show/hide settings based on search
    console.log('Filtering settings with query:', this.searchQuery, 'category:', this.selectedCategory, 'status:', this.selectedStatus);
  }

  getFilteredSettingsCount(): number {
    // Return count of filtered settings - calculate based on actual filtering
    return this.settingsFilterCategories.length + this.settingsFilterStatuses.length + this.notificationConfigs.length;
  }

  getPaymentMethodDescription(method: string): string {
    return this.mockDataService.getPaymentMethodDescription(method);
  }

  backupSettings(): void {
    if (this.restaurantSettings) {
      const dataStr = JSON.stringify(this.restaurantSettings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `restaurant-settings-backup-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      console.log('Settings backup created successfully');
    }
  }
}
