import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'premium';
  module: string;
  isEnabled: boolean;
  requiresPlan: string[];
  dependencies?: string[];
  restrictions?: {
    maxUsage?: number;
    timeLimit?: number;
    userLimit?: number;
  };
}

interface PlanFeatureAccess {
  planId: string;
  planName: string;
  features: { [featureId: string]: boolean };
  limits: { [featureId: string]: any };
}

interface RoleFeatureAccess {
  roleId: string;
  roleName: string;
  features: { [featureId: string]: boolean };
  permissions: { [featureId: string]: string[] };
}

@Component({
  selector: 'app-feature-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature-access-control.component.html',
  styleUrl: './feature-access-control.component.css'
})
export class FeatureAccessControlComponent implements OnInit {
  features: Feature[] = [
    {
      id: 'basic_pos',
      name: 'Basic POS System',
      description: 'Essential point of sale functionality with order processing',
      category: 'core',
      module: 'POS',
      isEnabled: true,
      requiresPlan: ['starter', 'professional', 'enterprise']
    },
    {
      id: 'menu_management',
      name: 'Menu Management',
      description: 'Create and manage digital menus with categories and pricing',
      category: 'core',
      module: 'Menu',
      isEnabled: true,
      requiresPlan: ['starter', 'professional', 'enterprise']
    },
    {
      id: 'inventory_management',
      name: 'Inventory Management',
      description: 'Track stock levels, suppliers, and automatic reorder alerts',
      category: 'advanced',
      module: 'Inventory',
      isEnabled: true,
      requiresPlan: ['professional', 'enterprise'],
      restrictions: { maxUsage: 1000 }
    },
    {
      id: 'staff_management',
      name: 'Staff Management',
      description: 'Employee scheduling, time tracking, and performance analytics',
      category: 'advanced',
      module: 'Staff',
      isEnabled: true,
      requiresPlan: ['professional', 'enterprise'],
      restrictions: { userLimit: 25 }
    },
    {
      id: 'customer_loyalty',
      name: 'Customer Loyalty Program',
      description: 'Loyalty points, rewards, and customer retention tools',
      category: 'advanced',
      module: 'CRM',
      isEnabled: true,
      requiresPlan: ['professional', 'enterprise']
    },
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'AI-powered insights, predictive analytics, and custom reports',
      category: 'premium',
      module: 'Analytics',
      isEnabled: true,
      requiresPlan: ['enterprise'],
      dependencies: ['basic_reports']
    },
    {
      id: 'api_access',
      name: 'API Access',
      description: 'Full REST API access for custom integrations',
      category: 'premium',
      module: 'Integration',
      isEnabled: true,
      requiresPlan: ['enterprise']
    },
    {
      id: 'white_label',
      name: 'White Label Solution',
      description: 'Custom branding, domain, and white-label options',
      category: 'premium',
      module: 'Branding',
      isEnabled: true,
      requiresPlan: ['enterprise']
    }
  ];

  planAccess: PlanFeatureAccess[] = [
    {
      planId: 'starter',
      planName: 'Starter Plan',
      features: {
        basic_pos: true,
        menu_management: true,
        inventory_management: false,
        staff_management: false,
        customer_loyalty: false,
        advanced_analytics: false,
        api_access: false,
        white_label: false
      },
      limits: {}
    },
    {
      planId: 'professional',
      planName: 'Professional Plan',
      features: {
        basic_pos: true,
        menu_management: true,
        inventory_management: true,
        staff_management: true,
        customer_loyalty: true,
        advanced_analytics: false,
        api_access: false,
        white_label: false
      },
      limits: {
        inventory_management: { maxUsage: 1000 },
        staff_management: { userLimit: 25 }
      }
    },
    {
      planId: 'enterprise',
      planName: 'Enterprise Plan',
      features: {
        basic_pos: true,
        menu_management: true,
        inventory_management: true,
        staff_management: true,
        customer_loyalty: true,
        advanced_analytics: true,
        api_access: true,
        white_label: true
      },
      limits: {}
    }
  ];

  roleAccess: RoleFeatureAccess[] = [
    {
      roleId: 'platform_owner',
      roleName: 'Platform Owner',
      features: {
        basic_pos: true,
        menu_management: true,
        inventory_management: true,
        staff_management: true,
        customer_loyalty: true,
        advanced_analytics: true,
        api_access: true,
        white_label: true
      },
      permissions: {
        basic_pos: ['create', 'read', 'update', 'delete'],
        menu_management: ['create', 'read', 'update', 'delete'],
        inventory_management: ['create', 'read', 'update', 'delete'],
        staff_management: ['create', 'read', 'update', 'delete'],
        customer_loyalty: ['create', 'read', 'update', 'delete'],
        advanced_analytics: ['read'],
        api_access: ['create', 'read', 'update', 'delete'],
        white_label: ['create', 'read', 'update', 'delete']
      }
    },
    {
      roleId: 'restaurant_owner',
      roleName: 'Restaurant Owner',
      features: {
        basic_pos: true,
        menu_management: true,
        inventory_management: true,
        staff_management: true,
        customer_loyalty: true,
        advanced_analytics: false,
        api_access: false,
        white_label: false
      },
      permissions: {
        basic_pos: ['create', 'read', 'update', 'delete'],
        menu_management: ['create', 'read', 'update', 'delete'],
        inventory_management: ['create', 'read', 'update', 'delete'],
        staff_management: ['create', 'read', 'update', 'delete'],
        customer_loyalty: ['create', 'read', 'update', 'delete']
      }
    }
  ];

  selectedView = 'plans';
  selectedCategory = 'all';
  searchTerm = '';

  constructor() {}

  ngOnInit(): void {}

  getFilteredFeatures(): Feature[] {
    return this.features.filter(feature => {
      const matchesCategory = this.selectedCategory === 'all' || feature.category === this.selectedCategory;
      const matchesSearch = feature.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           feature.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getFeaturesByCategory(category: string): Feature[] {
    return this.features.filter(f => f.category === category);
  }

  hasFeatureAccess(planAccess: PlanFeatureAccess, featureId: string): boolean {
    return planAccess.features[featureId] || false;
  }

  hasRoleAccess(roleAccess: RoleFeatureAccess, featureId: string): boolean {
    return roleAccess.features[featureId] || false;
  }

  togglePlanFeatureAccess(planAccess: PlanFeatureAccess, featureId: string): void {
    planAccess.features[featureId] = !planAccess.features[featureId];
    // In a real app, this would call an API to update feature access
    console.log('Updated plan feature access:', planAccess.planId, featureId, planAccess.features[featureId]);
  }

  toggleRoleFeatureAccess(roleAccess: RoleFeatureAccess, featureId: string): void {
    roleAccess.features[featureId] = !roleAccess.features[featureId];
    // In a real app, this would call an API to update role access
    console.log('Updated role feature access:', roleAccess.roleId, featureId, roleAccess.features[featureId]);
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getModuleIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'POS': 'fas fa-cash-register',
      'Menu': 'fas fa-utensils',
      'Inventory': 'fas fa-boxes',
      'Staff': 'fas fa-users',
      'CRM': 'fas fa-user-friends',
      'Analytics': 'fas fa-chart-bar',
      'Integration': 'fas fa-plug',
      'Branding': 'fas fa-palette'
    };
    return icons[module] || 'fas fa-cog';
  }

  saveChanges(): void {
    // In a real app, this would save all changes to the backend
    console.log('Saving feature access control changes...');
  }

  resetToDefaults(): void {
    // In a real app, this would reset to default configurations
    console.log('Resetting to default feature access...');
  }

  getEnabledFeaturesCount(plan: PlanFeatureAccess): number {
    return Object.values(plan.features).filter(enabled => enabled).length;
  }

  getTotalFeaturesCount(plan: PlanFeatureAccess): number {
    return Object.keys(plan.features).length;
  }

  getEnabledRoleFeaturesCount(role: RoleFeatureAccess): number {
    return Object.values(role.features).filter(enabled => enabled).length;
  }

  getTotalRoleFeaturesCount(role: RoleFeatureAccess): number {
    return Object.keys(role.features).length;
  }
}
