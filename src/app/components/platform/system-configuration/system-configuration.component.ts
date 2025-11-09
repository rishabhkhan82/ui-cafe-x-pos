import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSetting, MockDataService } from '../../../services/mock-data.service';

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

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadSystemSettings();
  }

  loadSystemSettings(): void {
    this.mockDataService.getSystemSettings().subscribe(settings => {
      this.settings = settings;
      this.filteredSettings = [...this.settings];
    });
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
    return this.mockDataService.getSystemSettingsByCategory(category);
  }

  updateSetting(setting: SystemSetting, newValue: any): void {
    this.mockDataService.updateSystemSetting(setting.id, newValue);
    this.hasUnsavedChanges = true;
  }

  resetSetting(setting: SystemSetting): void {
    this.mockDataService.resetSystemSetting(setting.id);
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
      this.mockDataService.resetAllSystemSettings();
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
