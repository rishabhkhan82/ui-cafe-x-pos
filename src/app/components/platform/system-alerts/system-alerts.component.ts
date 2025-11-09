import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, Notification, SystemAlert } from '../../../services/mock-data.service';

@Component({
  selector: 'app-system-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-alerts.component.html',
  styleUrl: './system-alerts.component.css'
})
export class SystemAlertsComponent implements OnInit {
  alerts: SystemAlert[] = [];
  filteredAlerts: SystemAlert[] = [];
  selectedAlert: SystemAlert | null = null;
  typeFilter = 'all';
  severityFilter = 'all';
  statusFilter = 'all';
  showCreateForm = false;

  newAlert: Partial<SystemAlert> = {
    title: '',
    message: '',
    type: 'system',
    priority: 'medium',
    status: 'unread',
    alertType: 'system',
    severity: 'medium'
  };

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.mockDataService.getSystemAlerts().subscribe(alerts => {
      this.alerts = alerts;
      this.filteredAlerts = [...this.alerts];
    });
  }

  filterAlerts(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      const matchesType = this.typeFilter === 'all' || alert.alertType === this.typeFilter;
      const matchesSeverity = this.severityFilter === 'all' || alert.severity === this.severityFilter;
      const matchesStatus = this.statusFilter === 'all' || alert.status === this.statusFilter;

      return matchesType && matchesSeverity && matchesStatus;
    });
  }

  selectAlert(alert: SystemAlert): void {
    this.selectedAlert = alert;
  }

  showCreateAlertForm(): void {
    this.showCreateForm = true;
    this.newAlert = {
      title: '',
      message: '',
      type: 'system',
      priority: 'medium',
      status: 'unread',
      alertType: 'system',
      severity: 'medium'
    };
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newAlert = {};
  }

  createAlert(): void {
    if (this.newAlert.title && this.newAlert.message) {
      const alert: SystemAlert = {
        id: `alert-${Date.now()}`,
        title: this.newAlert.title!,
        message: this.newAlert.message!,
        type: this.newAlert.type!,
        priority: this.newAlert.priority!,
        status: this.newAlert.status!,
        timestamp: new Date(),
        alertType: this.newAlert.alertType!,
        severity: this.newAlert.severity!
      };

      this.mockDataService.addSystemAlert(alert);
      this.showCreateForm = false;
      this.newAlert = {};
      // Reload alerts
      this.loadAlerts();
    }
  }

  markAsRead(alert: SystemAlert): void {
    this.mockDataService.updateSystemAlertStatus(alert.id, 'read');
  }

  resolveAlert(alert: SystemAlert): void {
    this.mockDataService.resolveSystemAlert(alert.id, 'Current User'); // In real app, get from auth service
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getAlertTypeColor(type: string): string {
    switch (type) {
      case 'maintenance': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'performance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'billing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'system': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getAlertTypeIcon(type: string): string {
    switch (type) {
      case 'maintenance': return 'fas fa-tools';
      case 'security': return 'fas fa-shield-alt';
      case 'performance': return 'fas fa-chart-line';
      case 'billing': return 'fas fa-credit-card';
      case 'system': return 'fas fa-server';
      default: return 'fas fa-exclamation-triangle';
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

  getCriticalAlertsCount(): number {
    return this.alerts.filter(a => a.severity === 'critical').length;
  }

  getHighAlertsCount(): number {
    return this.alerts.filter(a => a.severity === 'high').length;
  }

  getMediumAlertsCount(): number {
    return this.alerts.filter(a => a.severity === 'medium').length;
  }

  getLowAlertsCount(): number {
    return this.alerts.filter(a => a.severity === 'low').length;
  }

  getUnreadAlertsCount(): number {
    return this.alerts.filter(a => a.status === 'unread').length;
  }

  getResolvedTodayCount(): number {
    const today = new Date().toDateString();
    return this.alerts.filter(a => a.resolutionTime && new Date(a.resolutionTime).toDateString() === today).length;
  }
}
