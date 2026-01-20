import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Feature, PlanFeatureAccess, RoleFeatureAccess, MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-feature-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature-access-control.component.html',
  styleUrl: './feature-access-control.component.css'
})
export class FeatureAccessControlComponent implements OnInit, OnDestroy {
  features: Feature[] = [];
  planAccess: PlanFeatureAccess[] = [];
  roleAccess: RoleFeatureAccess[] = [];

  selectedView = 'plans';
  selectedCategory = 'all';
  searchTerm = '';

  private subscriptions: Subscription[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadFeatures();
    this.loadPlanAccess();
    this.loadRoleAccess();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadFeatures(): void {
    const subscription = this.mockDataService.getFeatures().subscribe(features => {
      this.features = features;
    });
    this.subscriptions.push(subscription);
  }

  loadPlanAccess(): void {
    const subscription = this.mockDataService.getPlanFeatureAccess().subscribe(planAccess => {
      this.planAccess = planAccess;
    });
    this.subscriptions.push(subscription);
  }

  loadRoleAccess(): void {
    const subscription = this.mockDataService.getRoleFeatureAccess().subscribe(roleAccess => {
      this.roleAccess = roleAccess;
    });
    this.subscriptions.push(subscription);
  }

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

  hasFeatureAccess(planAccess: PlanFeatureAccess, featureId: string | number): boolean {
    return planAccess.features[featureId] || false;
  }

  hasRoleAccess(roleAccess: RoleFeatureAccess, featureId: string | number): boolean {
    return roleAccess.features[featureId] || false;
  }

  togglePlanFeatureAccess(planAccess: PlanFeatureAccess, featureId: string | number): void {
    const newValue = !planAccess.features[featureId];
    this.mockDataService.updatePlanFeatureAccess(planAccess.planId, featureId, newValue);
    console.log('Updated plan feature access:', planAccess.planId, featureId, newValue);
  }

  toggleRoleFeatureAccess(roleAccess: RoleFeatureAccess, featureId: string | number): void {
    const newValue = !roleAccess.features[featureId];
    this.mockDataService.updateRoleFeatureAccess(roleAccess.roleId, featureId, newValue);
    console.log('Updated role feature access:', roleAccess.roleId, featureId, newValue);
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
