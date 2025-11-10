import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettings, MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-system-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-configuration.component.html',
  styleUrl: './system-configuration.component.css'
})
export class SystemConfigurationComponent implements OnInit {
  settings: SystemSettings | null = null;
  selectedCategory = 'all';
  searchTerm = '';
  hasUnsavedChanges = false;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadSystemSettings();
  }

  loadSystemSettings(): void {
    this.mockDataService.getSystemSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  getSettingsByCategory(category: string): any {
    return this.mockDataService.getSystemSettingsByCategory(category);
  }

  updateSetting(settingPath: string, newValue: any): void {
    this.mockDataService.updateSystemSetting(settingPath, newValue);
    this.hasUnsavedChanges = true;
  }

  resetSetting(settingPath: string): void {
    this.mockDataService.resetSystemSetting(settingPath);
    this.hasUnsavedChanges = true;
  }

  saveSettings(): void {
    // In a real app, this would save settings to backend
    console.log('Saving system settings...');
    this.hasUnsavedChanges = false;

    // For now, just show a success message
    alert('Settings saved successfully!');
  }

  resetAllSettings(): void {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      this.mockDataService.resetAllSystemSettings();
      this.hasUnsavedChanges = true;
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
        general: this.settings.general,
        performance: this.settings.performance,
        security: this.settings.security,
        notifications: this.settings.notifications,
        integrations: this.settings.integrations
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
