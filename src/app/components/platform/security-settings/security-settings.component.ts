import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityPolicy, SecurityLog, SecurityMetrics, MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.css'
})
export class SecuritySettingsComponent implements OnInit {
  policies: SecurityPolicy[] = [];
  securityLogs: SecurityLog[] = [];
  metrics: SecurityMetrics = {
    totalUsers: 245,
    activeSessions: 89,
    failedLoginAttempts: 23,
    blockedIPs: 5,
    securityAlerts: 3,
    lastSecurityScan: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    complianceScore: 94.2
  };

  selectedCategory = 'all';
  searchTerm = '';
  showAddPolicyForm = false;

  newPolicy: Partial<SecurityPolicy> = {
    name: '',
    description: '',
    category: 'authentication',
    enabled: true,
    severity: 'medium'
  };

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.mockDataService.getSecurityPolicies().subscribe(policies => {
      this.policies = policies;
    });

    this.mockDataService.getSecurityLogs().subscribe(logs => {
      this.securityLogs = logs;
    });

    this.mockDataService.getSecurityMetrics().subscribe(metrics => {
      if (metrics) {
        this.metrics = metrics;
      }
    });
  }


  filterPolicies(): SecurityPolicy[] {
    return this.policies.filter(policy => {
      const matchesCategory = this.selectedCategory === 'all' || policy.category === this.selectedCategory;
      const matchesSearch = policy.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           policy.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  filterLogs(): SecurityLog[] {
    return this.securityLogs.filter(log => {
      const matchesSearch = log.event.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           log.user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           log.details.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  togglePolicy(policy: SecurityPolicy): void {
    policy.enabled = !policy.enabled;
    policy.lastUpdated = new Date();
    // In a real app, this would call an API to update the policy
    console.log('Toggled policy:', policy.id, policy.enabled);
  }

  showAddPolicy(): void {
    this.showAddPolicyForm = true;
    this.newPolicy = {
      name: '',
      description: '',
      category: 'authentication',
      enabled: true,
      severity: 'medium'
    };
  }

  cancelAddPolicy(): void {
    this.showAddPolicyForm = false;
    this.newPolicy = {};
  }

  addPolicy(): void {
    if (this.newPolicy.name && this.newPolicy.description) {
      // In a real app, this would call an API to create the policy
      console.log('Adding new policy:', this.newPolicy);
      this.showAddPolicyForm = false;
      this.newPolicy = {};
      // Reload policies - data will be updated through the service subscription
    }
  }

  runSecurityScan(): void {
    // In a real app, this would trigger a security scan
    console.log('Running security scan...');
    this.metrics.lastSecurityScan = new Date();
  }

  exportSecurityReport(): void {
    // In a real app, this would export security logs and reports
    console.log('Exporting security report...');
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failure': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'authentication': return 'fas fa-key';
      case 'authorization': return 'fas fa-user-shield';
      case 'encryption': return 'fas fa-lock';
      case 'monitoring': return 'fas fa-eye';
      case 'compliance': return 'fas fa-gavel';
      default: return 'fas fa-shield-alt';
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
