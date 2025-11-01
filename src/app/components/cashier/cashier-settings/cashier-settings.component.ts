import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, User } from '../../../services/mock-data.service';

interface CashierSettings {
  // Display Settings
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';

  // Cash Management
  enableCashDrawer: boolean;
  cashDrawerPort: string;
  autoOpenDrawer: boolean;
  cashAlertThreshold: number;

  // Security Settings
  sessionTimeout: number;
  requirePasswordForSettings: boolean;
  enableBiometricLogin: boolean;
  auditTrailEnabled: boolean;

  // Notification Settings
  orderReadySound: boolean;
  paymentSuccessSound: boolean;
  errorAlerts: boolean;
  lowCashAlerts: boolean;

  // Keyboard Shortcuts
  shortcuts: { [key: string]: string };
}

interface Printer {
  id: string;
  name: string;
  type: 'thermal' | 'laser' | 'dot_matrix';
  status: 'online' | 'offline' | 'error';
}

@Component({
  selector: 'app-cashier-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-settings.component.html',
  styleUrl: './cashier-settings.component.css'
})
export class CashierSettingsComponent implements OnInit {
  currentUser: User | null = null;

  settings: CashierSettings = {
    // Display Settings
    theme: 'auto',
    language: 'en-IN',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',

    // Cash Management
    enableCashDrawer: true,
    cashDrawerPort: 'COM1',
    autoOpenDrawer: true,
    cashAlertThreshold: 500,

    // Security Settings
    sessionTimeout: 30,
    requirePasswordForSettings: true,
    enableBiometricLogin: false,
    auditTrailEnabled: true,

    // Notification Settings
    orderReadySound: true,
    paymentSuccessSound: true,
    errorAlerts: true,
    lowCashAlerts: true,

    // Keyboard Shortcuts
    shortcuts: {
      'F1': 'New Order',
      'F2': 'Search Order',
      'F3': 'Payment',
      'F4': 'Print Receipt',
      'F5': 'Hold Bill',
      'F6': 'Void Item',
      'F7': 'Discount',
      'F8': 'Split Bill',
      'F9': 'Manager Override',
      'F10': 'Cash Management',
      'F11': 'Settings',
      'F12': 'Logout'
    }
  };

  availablePrinters: Printer[] = [
    { id: 'thermal-1', name: 'Thermal Printer 1', type: 'thermal', status: 'online' },
    { id: 'thermal-2', name: 'Thermal Printer 2', type: 'thermal', status: 'offline' },
    { id: 'laser-1', name: 'Laser Printer', type: 'laser', status: 'online' }
  ];

  availableLanguages = [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'हिंदी (India)' },
    { code: 'mr-IN', name: 'मराठी (India)' },
    { code: 'en-US', name: 'English (US)' }
  ];

  availableCurrencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' }
  ];

  activeTab = 'display';

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSettings();
  }

  private loadCurrentUser(): void {
    this.mockDataService.getUsers().subscribe(users => {
      this.currentUser = users.find(user => user.role === 'cashier') || null;
    });
  }

  private loadSettings(): void {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('cashierSettings');
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
  }

  saveSettings(): void {
    // Save to localStorage (in real app, save to API)
    localStorage.setItem('cashierSettings', JSON.stringify(this.settings));
    alert('Settings saved successfully!');
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      localStorage.removeItem('cashierSettings');
      this.settings = {
        // Display Settings
        theme: 'auto',
        language: 'en-IN',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',

        // Cash Management
        enableCashDrawer: true,
        cashDrawerPort: 'COM1',
        autoOpenDrawer: true,
        cashAlertThreshold: 500,

        // Security Settings
        sessionTimeout: 30,
        requirePasswordForSettings: true,
        enableBiometricLogin: false,
        auditTrailEnabled: true,

        // Notification Settings
        orderReadySound: true,
        paymentSuccessSound: true,
        errorAlerts: true,
        lowCashAlerts: true,

        // Keyboard Shortcuts
        shortcuts: {
          'F1': 'New Order',
          'F2': 'Search Order',
          'F3': 'Payment',
          'F4': 'Print Receipt',
          'F5': 'Hold Bill',
          'F6': 'Void Item',
          'F7': 'Discount',
          'F8': 'Split Bill',
          'F9': 'Manager Override',
          'F10': 'Cash Management',
          'F11': 'Settings',
          'F12': 'Logout'
        }
      };
      this.saveSettings();
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
