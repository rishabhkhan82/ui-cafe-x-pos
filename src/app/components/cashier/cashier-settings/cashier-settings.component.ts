import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashierSettings, MockDataService, Printer, User } from '../../../services/mock-data.service';

@Component({
  selector: 'app-cashier-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-settings.component.html',
  styleUrl: './cashier-settings.component.css'
})
export class CashierSettingsComponent implements OnInit {
  currentUser: User | null = null;
  settings: CashierSettings = {} as CashierSettings;
  availablePrinters: Printer[] = [];
  availableLanguages: any[] = [];
  availableCurrencies: any[] = [];

  activeTab = 'display';

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSettings();
    this.loadAvailableOptions();
  }

  private loadCurrentUser(): void {
    this.mockDataService.getUsers().subscribe(users => {
      this.currentUser = users.find(user => user.role === 'cashier') || null;
    });
  }

  private loadSettings(): void {
    // Load default settings from service
    this.mockDataService.getDefaultCashierSettings().subscribe(defaultSettings => {
      if (defaultSettings && defaultSettings.length > 0) {
        this.settings = { ...defaultSettings[0] };
      }

      // Override with saved settings from sessionStorage
      const savedSettings = sessionStorage.getItem('cashierSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          // Only keep properties that exist in current interface
          const filteredSettings: Partial<CashierSettings> = {};
          Object.keys(this.settings).forEach(key => {
            if (parsed.hasOwnProperty(key)) {
              (filteredSettings as any)[key] = parsed[key];
            }
          });
          this.settings = { ...this.settings, ...filteredSettings };
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    });
  }

  private loadAvailableOptions(): void {
    // Load available printers
    this.mockDataService.getAvailablePrinters().subscribe(printers => {
      this.availablePrinters = printers;
    });

    // Load available languages
    this.mockDataService.getAvailableLanguages().subscribe(languages => {
      this.availableLanguages = languages;
    });

    // Load available currencies
    this.mockDataService.getAvailableCurrencies().subscribe(currencies => {
      this.availableCurrencies = currencies;
    });
  }

  saveSettings(): void {
    // Save to sessionStorage (in real app, save to API)
    sessionStorage.setItem('cashierSettings', JSON.stringify(this.settings));
    alert('Settings saved successfully!');
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      sessionStorage.removeItem('cashierSettings');
      // Reload default settings from service
      this.mockDataService.getDefaultCashierSettings().subscribe(defaultSettings => {
        if (defaultSettings && defaultSettings.length > 0) {
          this.settings = { ...defaultSettings[0] };
          this.saveSettings();
        }
      });
    }
  }

  testPrinter(): void {
    alert('Printer testing functionality removed - receipt settings tab was removed');
  }

  testCashDrawer(): void {
    alert('Testing cash drawer connection...');
  }

  exportSettings(): void {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'cashier-settings.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  importSettings(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          this.settings = { ...this.settings, ...importedSettings };
          this.saveSettings();
          alert('Settings imported successfully!');
        } catch (error) {
          alert('Invalid settings file!');
        }
      };
      reader.readAsText(file);
    }
  }

  getPrinterStatusColor(status: string): string {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-gray-500';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  }

  getPrinterStatusIcon(status: string): string {
    switch (status) {
      case 'online': return 'fas fa-circle text-green-500';
      case 'offline': return 'fas fa-circle text-gray-400';
      case 'error': return 'fas fa-exclamation-triangle text-red-500';
      default: return 'fas fa-circle text-gray-400';
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  updateShortcut(key: string, action: string): void {
    this.settings.shortcuts[key] = action;
  }
}
