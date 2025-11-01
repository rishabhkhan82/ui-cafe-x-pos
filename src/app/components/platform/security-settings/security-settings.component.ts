import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'encryption' | 'monitoring' | 'compliance';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
  violations?: number;
}

interface SecurityLog {
  id: string;
  timestamp: Date;
  event: string;
  user: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
  details: string;
}

interface SecurityMetrics {
  totalUsers: number;
  activeSessions: number;
  failedLoginAttempts: number;
  blockedIPs: number;
  securityAlerts: number;
  lastSecurityScan: Date;
  complianceScore: number;
}

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

  constructor() {}

  ngOnInit(): void {
    this.loadSecurityPolicies();
    this.loadSecurityLogs();
  }

  loadSecurityPolicies(): void {
    this.policies = [
      {
        id: 'password_policy',
        name: 'Password Policy',
        description: 'Enforce strong password requirements and regular changes',
        category: 'authentication',
        enabled: true,
        severity: 'high',
        lastUpdated: new Date(),
        violations: 0
      },
      {
        id: 'two_factor_auth',
        name: 'Two-Factor Authentication',
        description: 'Require 2FA for all administrative accounts',
        category: 'authentication',
        enabled: true,
        severity: 'critical',
        lastUpdated: new Date(),
        violations: 2
      },
      {
        id: 'session_management',
        name: 'Session Management',
        description: 'Automatic session timeout and concurrent session limits',
        category: 'authentication',
        enabled: true,
        severity: 'medium',
        lastUpdated: new Date(),
        violations: 0
      },
      {
        id: 'role_based_access',
        name: 'Role-Based Access Control',
        description: 'Enforce role-based permissions and access restrictions',
        category: 'authorization',
        enabled: true,
        severity: 'high',
        lastUpdated: new Date(),
        violations: 1
      },
      {
        id: 'data_encryption',
        name: 'Data Encryption',
        description: 'Encrypt sensitive data at rest and in transit',
        category: 'encryption',
        enabled: true,
        severity: 'critical',
        lastUpdated: new Date(),
        violations: 0
      },
      {
        id: 'audit_logging',
        name: 'Audit Logging',
        description: 'Log all security-relevant events and activities',
        category: 'monitoring',
        enabled: true,
        severity: 'high',
        lastUpdated: new Date(),
        violations: 0
      },
      {
        id: 'intrusion_detection',
        name: 'Intrusion Detection',
        description: 'Monitor and detect suspicious activities',
        category: 'monitoring',
        enabled: true,
        severity: 'high',
        lastUpdated: new Date(),
        violations: 3
      },
      {
        id: 'gdpr_compliance',
        name: 'GDPR Compliance',
        description: 'Ensure compliance with data protection regulations',
        category: 'compliance',
        enabled: true,
        severity: 'critical',
        lastUpdated: new Date(),
        violations: 0
      }
    ];
  }

  loadSecurityLogs(): void {
    this.securityLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        event: 'Failed Login Attempt',
        user: 'unknown',
        ipAddress: '192.168.1.100',
        severity: 'medium',
        status: 'failure',
        details: 'Multiple failed login attempts from IP address'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        event: 'Password Changed',
        user: 'admin@cafex.com',
        ipAddress: '10.0.0.1',
        severity: 'low',
        status: 'success',
        details: 'User password successfully updated'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        event: 'Suspicious Activity',
        user: 'user@restaurant.com',
        ipAddress: '203.0.113.1',
        severity: 'high',
        status: 'warning',
        details: 'Unusual login pattern detected'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        event: 'Role Permission Changed',
        user: 'admin@cafex.com',
        ipAddress: '10.0.0.1',
        severity: 'medium',
        status: 'success',
        details: 'User role permissions updated'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        event: 'Security Scan Completed',
        user: 'system',
        ipAddress: '127.0.0.1',
        severity: 'low',
        status: 'success',
        details: 'Automated security scan completed successfully'
      }
    ];
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
      // Reload policies
      this.loadSecurityPolicies();
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
