import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, Notification } from '../../../services/mock-data.service';

interface SystemAlert extends Notification {
  alertType: 'maintenance' | 'security' | 'performance' | 'billing' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers?: number;
  resolutionTime?: Date;
  resolvedBy?: string;
}

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
    // In a real app, this would fetch system alerts from API
    // For now, we'll create mock system alerts
    this.alerts = [
      {
        id: 'alert-1',
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for tonight from 2:00 AM to 4:00 AM IST. Platform will be unavailable during this period.',
        type: 'system',
        priority: 'high',
        status: 'unread',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        alertType: 'maintenance',
        severity: 'medium',
        affectedUsers: 1500
      },
      {
        id: 'alert-2',
        title: 'High CPU Usage Detected',
        message: 'Server CPU usage has exceeded 85% for the last 30 minutes. Performance may be impacted.',
        type: 'system',
        priority: 'high',
        status: 'read',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        alertType: 'performance',
        severity: 'high',
        affectedUsers: 800,
        resolutionTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        resolvedBy: 'System Admin'
      },
      {
        id: 'alert-3',
        title: 'Security Alert: Failed Login Attempts',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100. Account has been temporarily locked.',
        type: 'system',
        priority: 'high',
        status: 'read',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        alertType: 'security',
        severity: 'critical',
        affectedUsers: 1,
        resolutionTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
        resolvedBy: 'Security Team'
      },
      {
        id: 'alert-4',
        title: 'Billing System Update',
        message: 'Monthly billing cycle completed successfully. All subscriptions have been renewed.',
        type: 'system',
        priority: 'medium',
        status: 'read',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        alertType: 'billing',
        severity: 'low',
        affectedUsers: 1200
      }
    ];
    this.filteredAlerts = [...this.alerts];
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
      // In a real app, this would call an API to create the alert
      console.log('Creating new alert:', this.newAlert);
      this.showCreateForm = false;
      this.newAlert = {};
      // Reload alerts
      this.loadAlerts();
    }
  }

  markAsRead(alert: SystemAlert): void {
    alert.status = 'read';
    // In a real app, this would call an API to update the alert status
    console.log('Marked alert as read:', alert.id);
  }

  resolveAlert(alert: SystemAlert): void {
    alert.resolutionTime = new Date();
    alert.resolvedBy = 'Current User'; // In real app, get from auth service
    // In a real app, this would call an API to resolve the alert
    console.log('Resolved alert:', alert.id);
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
