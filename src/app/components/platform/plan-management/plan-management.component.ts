import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionPlan, PlanFeature, MockDataService } from '../../../services/mock-data.service';

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

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadAvailableFeatures();
  }

  loadPlans(): void {
    this.mockDataService.getSubscriptionPlans().subscribe(plans => {
      this.plans = plans;
      this.filteredPlans = [...this.plans];
    });
  }

  loadAvailableFeatures(): void {
    this.mockDataService.getPlanFeatures().subscribe(features => {
      this.availableFeatures = features;
    });
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
    return this.mockDataService.getFeatureById(featureId);
  }

  getFeaturesByCategory(category: string): PlanFeature[] {
    return this.mockDataService.getFeaturesByCategory(category);
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
