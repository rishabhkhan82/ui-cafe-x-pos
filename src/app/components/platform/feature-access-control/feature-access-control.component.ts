import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ManagedFeature, PlanFeatureMapping, RoleFeatureMapping, SubscriptionPlan, MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-feature-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature-access-control.component.html',
  styleUrl: './feature-access-control.component.css'
})
export class FeatureAccessControlComponent implements OnInit, OnDestroy {
  features: ManagedFeature[] = [];
  plans: SubscriptionPlan[] = [];
  planFeatures: PlanFeatureMapping[] = [];
  roleFeatures: RoleFeatureMapping[] = [];

  selectedPlan: SubscriptionPlan | null = null;
  selectedRole: string = 'all';
  selectedCategory = 'all';
  searchTerm = '';

  // Temporary filter values (applied only when filter button is clicked)
  tempSelectedPlan: SubscriptionPlan | null = null;
  tempSelectedRole: string = 'all';
  tempSelectedCategory = 'all';
  tempSearchTerm = '';

  // Computed properties for performance
  filteredFeatures: ManagedFeature[] = [];
  enabledFeaturesCount = 0;
  totalFeaturesCount = 0;
  enabledRoleFeaturesCount = 0;
  totalRoleFeaturesCount = 0;
  coreFeaturesCount = 0;
  advancedFeaturesCount = 0;
  premiumFeaturesCount = 0;
  roleFeatureCounts: { [roleId: string]: number } = {};
  featureStates: { [featureId: string]: { planEnabled: boolean, roleEnabled: boolean } } = {};
  featureRoleStates: { [featureId: string]: { [roleId: string]: boolean } } = {};

  availableRoles = [
    { id: 'all', name: 'All Roles' },
    { id: '1', name: 'Manager' },
    { id: '2', name: 'Cashier' },
    { id: '3', name: 'Kitchen Staff' }
  ];

  moduleIcons: { [key: string]: string } = {
    'GENERAL': 'fas fa-cogs',
    'POS': 'fas fa-cash-register',
    'INVENTORY': 'fas fa-boxes',
    'ORDERS': 'fas fa-clipboard-list',
    'ANALYTICS': 'fas fa-chart-bar',
    'CUSTOMERS': 'fas fa-users',
    'STAFF': 'fas fa-user-friends',
    'INTEGRATION': 'fas fa-plug',
    'SECURITY': 'fas fa-shield-alt',
    'BRANDING': 'fas fa-palette',
    'SUPPORT': 'fas fa-headset',
    'MENU': 'fas fa-utensils',
    'CRM': 'fas fa-handshake'
  };

  categoryColors: { [key: string]: string } = {
    'BASIC': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'PREMIUM': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'ENTERPRISE': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  };

  private subscriptions: Subscription[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadFeatures();
    this.loadPlans();
    // this.loadPlanFeatures();
    this.loadRoleFeatures();
  }

  private updateComputedProperties(): void {
    this.filteredFeatures = this.getFilteredFeatures();
    this.enabledFeaturesCount = this.getEnabledFeaturesCount();
    this.totalFeaturesCount = this.getTotalFeaturesCount();
    this.enabledRoleFeaturesCount = this.getEnabledRoleFeaturesCount();
    this.totalRoleFeaturesCount = this.getTotalRoleFeaturesCount();
    this.coreFeaturesCount = this.getFeaturesByCategory('core').length;
    this.advancedFeaturesCount = this.getFeaturesByCategory('advanced').length;
    this.premiumFeaturesCount = this.getFeaturesByCategory('premium').length;
    // Compute role feature counts
    this.roleFeatureCounts = {};
    for (const role of this.getAvailableRoles().slice(1)) {
      this.roleFeatureCounts[role.id] = this.getEnabledRoleFeaturesForRole(role.id);
    }
    // Compute feature states
    this.featureStates = {};
    this.featureRoleStates = {};
    for (const feature of this.features) {
      this.featureStates[feature.feature_id] = {
        planEnabled: this.isPlanFeatureEnabled(feature.feature_id),
        roleEnabled: this.isRoleFeatureEnabled(feature.feature_id)
      };
      this.featureRoleStates[feature.feature_id] = {};
      for (const role of this.getAvailableRoles().slice(1)) {
        this.featureRoleStates[feature.feature_id][role.id] = this.isRoleFeatureEnabledForRole(feature.feature_id, role.id);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadFeatures(): void {
    const subscription = this.mockDataService.getManagedFeatures().subscribe(features => {
      this.features = features;
      this.updateComputedProperties();
    });
    this.subscriptions.push(subscription);
  }

  loadPlans(): void {
    const subscription = this.mockDataService.getSubscriptionPlans().subscribe(plans => {
      this.plans = plans;
      // Auto-select first plan
      if (this.plans.length > 0) {
        this.selectedPlan = this.plans[0];
        this.tempSelectedPlan = this.plans[0];
      }
      this.updateComputedProperties();
    });
    this.subscriptions.push(subscription);
  }

  // loadPlanFeatures(): void {
  //   const subscription = this.mockDataService.getPlanFeaturesMapping().subscribe(planFeatures => {
  //     this.planFeatures = planFeatures;
  //     this.updateComputedProperties();
  //   });
  //   this.subscriptions.push(subscription);
  // }

  loadRoleFeatures(): void {
    const subscription = this.mockDataService.getRoleFeaturesMapping().subscribe(roleFeatures => {
      this.roleFeatures = roleFeatures;
      this.updateComputedProperties();
    });
    this.subscriptions.push(subscription);
  }

  getFilteredFeatures(): ManagedFeature[] {
    return this.features.filter(feature => {
      const matchesCategory = this.selectedCategory === 'all' || feature.category === this.selectedCategory;
      const matchesSearch = feature.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            feature.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getFeaturesByCategory(category: string): ManagedFeature[] {
    return this.features.filter(f => f.category === category);
  }

  // Check if a feature is enabled for the selected plan
  isPlanFeatureEnabled(featureId: string): boolean {
    if (!this.selectedPlan) return false;
    const planFeature = this.planFeatures.find(pf =>
      pf.plan_id === this.selectedPlan!.id && pf.feature_id === featureId
    );
    return planFeature?.is_enabled || false;
  }

  // Check if a feature is enabled for the selected plan and role
  isRoleFeatureEnabled(featureId: string): boolean {
    if (!this.selectedPlan || !this.selectedRole) return false;
    const roleFeature = this.roleFeatures.find(rf =>
      rf.plan_id === this.selectedPlan!.id &&
      rf.role_id.toString() === this.selectedRole &&
      rf.feature_id === featureId
    );
    return roleFeature?.is_enabled || false;
  }

  // Toggle plan feature access
  togglePlanFeature(featureId: string): void {
    if (!this.selectedPlan) return;

    const existingFeature = this.planFeatures.find(pf =>
      pf.plan_id === this.selectedPlan!.id && pf.feature_id === featureId
    );

    if (existingFeature) {
      existingFeature.is_enabled = !existingFeature.is_enabled;
      // In real app, call API to update
      console.log('Updated plan feature:', this.selectedPlan.name, featureId, existingFeature.is_enabled);
    } else {
      // Create new plan feature entry
      const newFeature: PlanFeatureMapping = {
        id: Date.now(), // Temporary ID
        plan_id: this.selectedPlan!.id,
        feature_id: featureId,
        is_enabled: true,
        created_at: new Date().toISOString(),
        created_by: 1, // Current user
        updated_at: new Date().toISOString(),
        updated_by: 1
      };
      this.planFeatures.push(newFeature);
      console.log('Created new plan feature:', this.selectedPlan.name, featureId);
    }
    this.updateComputedProperties();
  }

  // Toggle role feature access
  toggleRoleFeature(featureId: string): void {
    if (!this.selectedPlan || !this.selectedRole) return;

    const existingFeature = this.roleFeatures.find(rf =>
      rf.plan_id === this.selectedPlan!.id &&
      rf.role_id.toString() === this.selectedRole &&
      rf.feature_id === featureId
    );

    if (existingFeature) {
      existingFeature.is_enabled = !existingFeature.is_enabled;
      // In real app, call API to update
      console.log('Updated role feature:', this.selectedPlan.name, this.selectedRole, featureId, existingFeature.is_enabled);
    } else {
      // Create new role feature entry
      const newFeature: RoleFeatureMapping = {
        id: Date.now(), // Temporary ID
        plan_id: this.selectedPlan!.id,
        role_id: parseInt(this.selectedRole),
        feature_id: featureId,
        is_enabled: true,
        created_at: new Date().toISOString(),
        created_by: 1, // Current user
        updated_at: new Date().toISOString(),
        updated_by: 1
      };
      this.roleFeatures.push(newFeature);
      console.log('Created new role feature:', this.selectedPlan.name, this.selectedRole, featureId);
    }
    this.updateComputedProperties();
  }

  // Handle plan selection change
  onPlanChange(): void {
    // Reset role selection when plan changes
    this.selectedRole = 'all';
    this.updateComputedProperties();
    console.log('Plan changed to:', this.selectedPlan?.name);
  }

  // Handle category selection change
  onCategoryChange(): void {
    // Category is stored in temp, will be applied on filter button click
  }

  // Handle search term change
  onSearchChange(): void {
    // Search term is stored in temp, will be applied on filter button click
  }

  // Handle temporary plan selection change
  onTempPlanChange(plan: SubscriptionPlan | null): void {
    // Plan change is stored in temp, will be applied on filter button click
    this.tempSelectedPlan = plan;
  }

  // Apply filters (triggered by filter button)
  applyFilters(): void {
    // Copy temp values to actual filter values
    this.selectedPlan = this.tempSelectedPlan;
    this.selectedRole = this.tempSelectedRole;
    this.selectedCategory = this.tempSelectedCategory;
    this.searchTerm = this.tempSearchTerm;
    
    // Reset role when plan changes
    if (this.selectedPlan) {
      this.selectedRole = 'all';
      this.tempSelectedRole = 'all';
    }
    
    this.updateComputedProperties();
    console.log('Filters applied - Plan:', this.selectedPlan?.name, 'Category:', this.selectedCategory, 'Search:', this.searchTerm);
  }

  // Reset filters to default values
  resetFilters(): void {
    // Reset temp values to defaults - select first plan by default
    this.tempSelectedPlan = this.plans.length > 0 ? this.plans[0] : null;
    this.tempSelectedRole = 'all';
    this.tempSelectedCategory = 'all';
    this.tempSearchTerm = '';
    
    // Reset actual filter values to defaults - select first plan by default
    this.selectedPlan = this.plans.length > 0 ? this.plans[0] : null;
    this.selectedRole = 'all';
    this.selectedCategory = 'all';
    this.searchTerm = '';
    
    this.updateComputedProperties();
    console.log('Filters reset to defaults');
  }

  // Handle role selection change
  onRoleChange(): void {
    this.updateComputedProperties();
  }

  // Check if a feature is enabled for a specific role
  isRoleFeatureEnabledForRole(featureId: string, roleId: string): boolean {
    if (!this.selectedPlan) return false;
    const roleFeature = this.roleFeatures.find(rf =>
      rf.plan_id === this.selectedPlan!.id &&
      rf.role_id.toString() === roleId &&
      rf.feature_id === featureId
    );
    // Only return true if an explicit role mapping exists AND is_enabled is true
    // This ensures all roles show false by default when a feature is first enabled at plan level
    return roleFeature !== undefined && roleFeature.is_enabled === true;
  }

  // Toggle role feature access for a specific role
  toggleRoleFeatureForRole(featureId: string, roleId: string): void {
    if (!this.selectedPlan) return;

    const existingFeature = this.roleFeatures.find(rf =>
      rf.plan_id === this.selectedPlan!.id &&
      rf.role_id.toString() === roleId &&
      rf.feature_id === featureId
    );

    if (existingFeature) {
      existingFeature.is_enabled = !existingFeature.is_enabled;
      // In real app, call API to update
      console.log('Updated role feature:', this.selectedPlan.name, roleId, featureId, existingFeature.is_enabled);
    } else {
      // Create new role feature entry
      const newFeature: RoleFeatureMapping = {
        id: Date.now(), // Temporary ID
        plan_id: this.selectedPlan!.id,
        role_id: parseInt(roleId),
        feature_id: featureId,
        is_enabled: true,
        created_at: new Date().toISOString(),
        created_by: 1, // Current user
        updated_at: new Date().toISOString(),
        updated_by: 1
      };
      this.roleFeatures.push(newFeature);
      console.log('Created new role feature:', this.selectedPlan.name, roleId, featureId);
    }
    this.updateComputedProperties();
  }

  // Get available roles (simplified for demo)
  getAvailableRoles(): {id: string, name: string}[] {
    return [
      { id: 'all', name: 'All Roles' },
      { id: '1', name: 'Manager' },
      { id: '2', name: 'Cashier' },
      { id: '3', name: 'Kitchen Staff' }
    ];
  }

  getCategoryColor(featureType: string): string {
    switch (featureType) {
      case 'BASIC': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PREMIUM': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getModuleIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'GENERAL': 'fas fa-globe',
      'POS': 'fas fa-cash-register',
      'INVENTORY': 'fas fa-boxes',
      'ORDERS': 'fas fa-shopping-cart',
      'ANALYTICS': 'fas fa-chart-bar',
      'CUSTOMERS': 'fas fa-users',
      'STAFF': 'fas fa-user-tie',
      'INTEGRATION': 'fas fa-plug',
      'SECURITY': 'fas fa-shield-alt',
      'BRANDING': 'fas fa-palette',
      'SUPPORT': 'fas fa-headset',
      'MENU': 'fas fa-utensils',
      'CRM': 'fas fa-user-friends'
    };
    return icons[category] || 'fas fa-cog';
  }

  saveChanges(): void {
    // In a real app, this would save all changes to the backend
    console.log('Saving feature access control changes...');
    console.log('Plan features:', this.planFeatures);
    console.log('Role features:', this.roleFeatures);
  }

  resetToDefaults(): void {
    // In a real app, this would reset to default configurations
    console.log('Resetting to default feature access...');
  }

  // Get count of enabled features for current plan
  getEnabledFeaturesCount(): number {
    if (!this.selectedPlan) return 0;
    return this.planFeatures.filter(pf =>
      pf.plan_id === this.selectedPlan!.id && pf.is_enabled
    ).length;
  }

  // Get total features available
  getTotalFeaturesCount(): number {
    return this.getFilteredFeatures().length;
  }

  // Get count of enabled features for current plan and role
  getEnabledRoleFeaturesCount(): number {
    if (!this.selectedPlan || !this.selectedRole) return 0;
    return this.roleFeatures.filter(rf =>
      rf.plan_id === this.selectedPlan!.id &&
      rf.role_id.toString() === this.selectedRole &&
      rf.is_enabled
    ).length;
  }

  // Get count of enabled features for a specific role
  getEnabledRoleFeaturesForRole(roleId: string): number {
    if (!this.selectedPlan) return 0;
    return this.roleFeatures.filter(rf =>
      rf.plan_id === this.selectedPlan!.id &&
      rf.role_id.toString() === roleId &&
      rf.is_enabled
    ).length;
  }

  // Get total features for role view
  getTotalRoleFeaturesCount(): number {
    return this.getFilteredFeatures().length;
  }

  // Get count of plan-enabled features for role sections
  getPlanEnabledFeaturesCount(): number {
    return this.getFilteredFeatures().filter(feature =>
      this.featureStates[feature.feature_id]?.planEnabled
    ).length;
  }

  // Get filtered features that are enabled at plan level
  getPlanEnabledFilteredFeatures(): ManagedFeature[] {
    return this.getFilteredFeatures().filter(feature =>
      this.featureStates[feature.feature_id]?.planEnabled
    );
  }
}
