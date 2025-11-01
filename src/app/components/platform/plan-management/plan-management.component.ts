import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  maxRestaurants: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriberCount: number;
  revenue: number;
}

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'premium';
  isEnabled: boolean;
}

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-management.component.html',
  styleUrl: './plan-management.component.css'
})
export class PlanManagementComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  filteredPlans: SubscriptionPlan[] = [];
  selectedPlan: SubscriptionPlan | null = null;
  availableFeatures: PlanFeature[] = [];
  statusFilter = 'all';
  showCreateForm = false;
  showEditForm = false;
  showViewForm = false;
  editingPlan: SubscriptionPlan | null = null;
  viewingPlan: SubscriptionPlan | null = null;
  expandedSections: { [key: string]: boolean } = {};

  newPlan: Partial<SubscriptionPlan> = {
    name: '',
    displayName: '',
    description: '',
    price: 0,
    currency: 'INR',
    billingCycle: 'monthly',
    maxRestaurants: 1,
    maxUsers: 5,
    features: [],
    isActive: true,
    subscriberCount: 0,
    revenue: 0
  };

  constructor() {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadAvailableFeatures();
  }

  loadPlans(): void {
    // Mock subscription plans
    this.plans = [
      {
        id: 'starter',
        name: 'starter',
        displayName: 'Starter Plan',
        description: 'Perfect for small restaurants getting started with digital transformation',
        price: 999,
        currency: 'INR',
        billingCycle: 'monthly',
        maxRestaurants: 1,
        maxUsers: 5,
        features: ['basic_pos', 'menu_management', 'order_management', 'basic_reports'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        subscriberCount: 45,
        revenue: 44555
      },
      {
        id: 'professional',
        name: 'professional',
        displayName: 'Professional Plan',
        description: 'Advanced features for growing restaurants with multiple locations',
        price: 2499,
        currency: 'INR',
        billingCycle: 'monthly',
        maxRestaurants: 5,
        maxUsers: 25,
        features: ['basic_pos', 'menu_management', 'order_management', 'advanced_reports', 'inventory_management', 'staff_management', 'customer_loyalty'],
        isActive: true,
        isPopular: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        subscriberCount: 28,
        revenue: 69720
      },
      {
        id: 'enterprise',
        name: 'enterprise',
        displayName: 'Enterprise Plan',
        description: 'Complete solution for large restaurant chains with advanced analytics',
        price: 4999,
        currency: 'INR',
        billingCycle: 'monthly',
        maxRestaurants: -1, // unlimited
        maxUsers: -1, // unlimited
        features: ['basic_pos', 'menu_management', 'order_management', 'advanced_reports', 'inventory_management', 'staff_management', 'customer_loyalty', 'advanced_analytics', 'api_access', 'white_label', 'priority_support'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        subscriberCount: 8,
        revenue: 39920
      }
    ];
    this.filteredPlans = [...this.plans];
  }

  loadAvailableFeatures(): void {
    this.availableFeatures = [
      { id: 'basic_pos', name: 'Basic POS System', description: 'Essential point of sale functionality', category: 'core', isEnabled: true },
      { id: 'menu_management', name: 'Menu Management', description: 'Digital menu creation and management', category: 'core', isEnabled: true },
      { id: 'order_management', name: 'Order Management', description: 'Online and offline order processing', category: 'core', isEnabled: true },
      { id: 'basic_reports', name: 'Basic Reports', description: 'Essential sales and performance reports', category: 'core', isEnabled: true },
      { id: 'advanced_reports', name: 'Advanced Reports', description: 'Detailed analytics and custom reports', category: 'advanced', isEnabled: true },
      { id: 'inventory_management', name: 'Inventory Management', description: 'Stock tracking and supplier management', category: 'advanced', isEnabled: true },
      { id: 'staff_management', name: 'Staff Management', description: 'Employee scheduling and performance tracking', category: 'advanced', isEnabled: true },
      { id: 'customer_loyalty', name: 'Customer Loyalty', description: 'Loyalty programs and customer insights', category: 'advanced', isEnabled: true },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'AI-powered insights and predictions', category: 'premium', isEnabled: true },
      { id: 'api_access', name: 'API Access', description: 'Full API access for integrations', category: 'premium', isEnabled: true },
      { id: 'white_label', name: 'White Label Solution', description: 'Custom branding and white-label options', category: 'premium', isEnabled: true },
      { id: 'priority_support', name: 'Priority Support', description: '24/7 priority customer support', category: 'premium', isEnabled: true }
    ];
  }

  filterPlans(): void {
    this.filteredPlans = this.plans.filter(plan => {
      const matchesStatus = this.statusFilter === 'all' || (this.statusFilter === 'active' ? plan.isActive : !plan.isActive);
      return matchesStatus;
    });
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
  }

  showCreatePlanForm(): void {
    this.showCreateForm = true;
    this.newPlan = {
      name: '',
      displayName: '',
      description: '',
      price: 0,
      currency: 'INR',
      billingCycle: 'monthly',
      maxRestaurants: 1,
      maxUsers: 5,
      features: [],
      isActive: true,
      subscriberCount: 0,
      revenue: 0
    };
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newPlan = {};
  }

  viewPlan(plan: SubscriptionPlan): void {
    this.viewingPlan = { ...plan };
    this.showViewForm = true;
  }

  editPlan(plan: SubscriptionPlan): void {
    this.editingPlan = { ...plan };
    this.newPlan = { ...plan };
    this.showEditForm = true;
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingPlan = null;
    this.newPlan = {};
  }

  cancelView(): void {
    this.showViewForm = false;
    this.viewingPlan = null;
  }

  updatePlan(): void {
    if (this.editingPlan && this.newPlan.name && this.newPlan.displayName && this.newPlan.price && this.newPlan.price > 0) {
      // In a real app, this would call an API to update the plan
      console.log('Updating plan:', this.editingPlan.id, this.newPlan);
      this.showEditForm = false;
      this.editingPlan = null;
      this.newPlan = {};
      // Reload plans
      this.loadPlans();
    }
  }

  createPlan(): void {
    if (this.newPlan.name && this.newPlan.displayName && this.newPlan.price && this.newPlan.price > 0) {
      // In a real app, this would call an API to create the plan
      console.log('Creating new plan:', this.newPlan);
      this.showCreateForm = false;
      this.newPlan = {};
      // Reload plans
      this.loadPlans();
    }
  }

  togglePlanStatus(plan: SubscriptionPlan): void {
    plan.isActive = !plan.isActive;
    // In a real app, this would call an API to update the plan status
    console.log('Toggled plan status:', plan.id, plan.isActive);
  }

  deletePlan(plan: SubscriptionPlan): void {
    if (confirm(`Are you sure you want to delete the "${plan.displayName}" plan? This action cannot be undone.`)) {
      // In a real app, this would call an API to delete the plan
      console.log('Deleting plan:', plan.id);
      this.plans = this.plans.filter(p => p.id !== plan.id);
      this.filterPlans();
      if (this.selectedPlan?.id === plan.id) {
        this.selectedPlan = null;
      }
    }
  }

  duplicatePlan(plan: SubscriptionPlan): void {
    const duplicate: Partial<SubscriptionPlan> = {
      ...plan,
      id: undefined,
      name: `${plan.name}_copy`,
      displayName: `${plan.displayName} (Copy)`,
      subscriberCount: 0,
      revenue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // In a real app, this would create a new plan
    console.log('Duplicating plan:', duplicate);
  }

  toggleFeature(plan: SubscriptionPlan, featureId: string): void;
  toggleFeature(featureId: string): void;
  toggleFeature(planOrFeatureId: SubscriptionPlan | string, featureId?: string): void {
    if (typeof planOrFeatureId === 'string') {
      // For new plan creation
      const feature = planOrFeatureId;
      if (!this.newPlan.features) {
        this.newPlan.features = [];
      }
      const index = this.newPlan.features.indexOf(feature);
      if (index > -1) {
        this.newPlan.features.splice(index, 1);
      } else {
        this.newPlan.features.push(feature);
      }
    } else {
      // For existing plan editing
      const plan = planOrFeatureId;
      const featId = featureId!;
      const index = plan.features.indexOf(featId);
      if (index > -1) {
        plan.features.splice(index, 1);
      } else {
        plan.features.push(featId);
      }
      // In a real app, this would call an API to update the plan features
      console.log('Updated plan features:', plan.id, plan.features);
    }
  }

  hasFeature(plan: SubscriptionPlan, featureId: string): boolean {
    return plan.features.includes(featureId);
  }

  getFeatureById(featureId: string): PlanFeature | undefined {
    return this.availableFeatures.find(f => f.id === featureId);
  }

  getFeaturesByCategory(category: string): PlanFeature[] {
    return this.availableFeatures.filter(f => f.category === category);
  }

  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatNumber(num: number): string {
    if (num === -1) return 'Unlimited';
    return num.toLocaleString();
  }

  getTotalRevenue(): number {
    return this.plans.reduce((sum, plan) => sum + plan.revenue, 0);
  }

  getTotalSubscribers(): number {
    return this.plans.reduce((sum, plan) => sum + plan.subscriberCount, 0);
  }

  getActivePlansCount(): number {
    return this.plans.filter(p => p.isActive).length;
  }

  toggleAccordion(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }
}
