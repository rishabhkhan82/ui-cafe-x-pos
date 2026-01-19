import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { SubscriptionPlan, MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-management.component.html',
  styleUrl: './plan-management.component.css'
})
export class PlanManagementComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  selectedPlan: SubscriptionPlan | null = null;
  searchTerm = '';
  statusFilter = 'all';
  showAddForm = false;
  showViewForm = false;
  editingPlan: SubscriptionPlan | null = null;
  viewingPlan: SubscriptionPlan | null = null;
  expandedSections: { [key: string]: boolean } = {};
  errorMessage = '';

// ...existing code...

  planForm: SubscriptionPlan = {
    id: 0,
    name: '',
    display_name: '',
    description: '',
    price: 0,
    currency: 'INR',
    billing_cycle: 'monthly',
    max_restaurants: 1,
    max_users: 5,
    is_active: true,
    is_popular: false,
    subscriber_count: 0,
    revenue: 0,
    plan_id: 0,
    setup_fee: 0,
    trial_days: 0,
    created_at: new Date().toISOString(),
    updated_at: '',
    created_by: 0,
    updated_by: 0
  };

// ...existing code...

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  // Field validation errors
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private router: Router,
    private crudService: CrudService,
    private loadingService: LoadingService,
    private mockDataService: MockDataService,
    private authService: AuthService,
    private confirmationService: ConfirmationDialogService,
    private notificationService: NotificationService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    if (this.statusFilter !== 'all') {
      params.isActive = this.statusFilter === 'active' ? 'true' : 'false';
    }

    this.crudService.getSubscriptionPlans(params).subscribe({
      next: (response: any) => {
        this.plans = response.data || response;
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || this.plans.length;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.errorMessage = 'Failed to load plans. Please try again.';
        this.notificationService.error('Error', 'Failed to load plans');
        this.loadingService.hide();
      }
    });
  }


  filterPlans(): void {
    this.loadPlans();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadPlans();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPlans();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1;
    this.loadPlans();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadPlans();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
  }

  showCreatePlanForm(): void {
    this.showAddForm = true;
    this.clearPlanForm();
  }

  showPlanForm(plan?: SubscriptionPlan): void {
    this.showAddForm = true;
    this.editingPlan = plan || null;
    if (plan) {
      // Editing existing plan
      this.planForm = { ...plan };
    } else {
      // Adding new plan
      this.clearPlanForm();
    }
  }

  viewPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
  }

  cancelView(): void {
    this.selectedPlan = null;
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.clearPlanForm();
    this.editingPlan = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  reloadComponent(): void {
    // Reset all component state
    this.plans = [];
    this.selectedPlan = null;
    this.editingPlan = null;
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.showAddForm = false;
    this.showViewForm = false;
    this.errorMessage = '';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.fieldErrors = {};

    // Reset plan form
    this.clearPlanForm();

    // Reload data
    this.loadPlans();
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.statusFilter !== 'all');
  }

  onSubmitForm(): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    const isUpdate = !!this.editingPlan;
    let hasErrors = false;

    // Validate all fields
    this.validateName();
    this.validateDisplayName();
    this.validatePrice();
    this.validateDescription();

    hasErrors = Object.keys(this.fieldErrors).length > 0;

    if (hasErrors) {
      const errorMessages = Object.values(this.fieldErrors);
      this.notificationService.error('Validation Error', errorMessages.join('. '));
      return;
    }

    if (isUpdate) {
      this.onUpdateForm();
    } else {
      this.onSaveForm();
    }
  }

  // Validation methods
  validateName(): void {
    const validation = this.validationService.name(this.planForm.name || '', 'Plan Name');
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateDisplayName(): void {
    const validation = this.validationService.required(this.planForm.display_name || '', 'Display Name');
    if (!validation.isValid) {
      this.fieldErrors['display_name'] = validation.message!;
    } else {
      delete this.fieldErrors['display_name'];
    }
  }

  validatePrice(): void {
    const validation = this.validationService.min(this.planForm.price || 0, 0, 'Price');
    if (!validation.isValid) {
      this.fieldErrors['price'] = validation.message!;
    } else {
      delete this.fieldErrors['price'];
    }
  }

  validateDescription(): void {
    const validation = this.validationService.required(this.planForm.description || '', 'Description');
    if (!validation.isValid) {
      this.fieldErrors['description'] = validation.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  private onSaveForm(): void {
    this.loadingService.show();

    const currentTime = new Date().toISOString();
    const planRequest = {
      name: this.planForm.name,
      display_name: this.planForm.display_name,
      description: this.planForm.description,
      price: this.planForm.price,
      currency: this.planForm.currency,
      billing_cycle: this.planForm.billing_cycle,
      max_restaurants: this.planForm.max_restaurants,
      max_users: this.planForm.max_users,
      is_active: this.planForm.is_active,
      subscriber_count: this.planForm.subscriber_count,
      revenue: this.planForm.revenue,
      plan_id: this.planForm.plan_id,
      setup_fee: this.planForm.setup_fee,
      trial_days: this.planForm.trial_days,
      created_at: currentTime,
      updated_at: currentTime,
      created_by: this.authService.getCurrentUser()?.id || 'system'
    };

    this.crudService.createSubscriptionPlan(planRequest).subscribe({
      next: (response) => {
        console.log('Plan created successfully:', response);
        this.notificationService.success('Plan Created', 'The plan has been successfully created.');
        this.resetForm();
        this.loadPlans();
      },
      error: (error) => {
        console.error('Error creating plan:', error);
        this.notificationService.error('Creation Failed', 'Failed to create plan. Please try again.');
        this.errorMessage = 'Failed to create plan. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private onUpdateForm(): void {
    this.loadingService.show();

    const currentTime = new Date().toISOString();
    const planRequest = {
      id: this.planForm.id,
      name: this.planForm.name,
      display_name: this.planForm.display_name,
      description: this.planForm.description,
      price: this.planForm.price,
      currency: this.planForm.currency,
      billing_cycle: this.planForm.billing_cycle,
      max_restaurants: this.planForm.max_restaurants,
      max_users: this.planForm.max_users,
      is_active: this.planForm.is_active,
      subscriber_count: this.planForm.subscriber_count,
      revenue: this.planForm.revenue,
      plan_id: this.planForm.plan_id,
      setup_fee: this.planForm.setup_fee,
      trial_days: this.planForm.trial_days,
      created_at: this.editingPlan!.created_at,
      updated_at: currentTime,
      created_by: this.editingPlan!.created_by,
      updated_by: this.authService.getCurrentUser()?.id || 'system'
    };

    this.crudService.updateSubscriptionPlan(this.editingPlan!.id, planRequest).subscribe({
      next: (response) => {
        console.log('Plan updated successfully:', response);
        this.notificationService.success('Plan Updated', 'The plan has been successfully updated.');
        this.resetForm();
        this.loadPlans();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating plan:', error);
        this.notificationService.error('Update Failed', 'Failed to update plan. Please try again.');
        this.errorMessage = 'Failed to update plan. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.clearPlanForm();
    this.editingPlan = null;
  }

  togglePlanStatus(plan: SubscriptionPlan): void {
    this.loadingService.show();
    const updatedPlan = { ...plan, is_active: !plan.is_active, updated_at: new Date().toISOString() };

    this.crudService.updateSubscriptionPlan(plan.id, updatedPlan).subscribe({
      next: (response) => {
        console.log('Plan status updated successfully:', response);
        plan.is_active = !plan.is_active;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating plan status:', error);
        this.errorMessage = 'Failed to update plan status. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  async deletePlan(plan: SubscriptionPlan): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${plan.display_name}"? This action cannot be undone.`,
      'Delete Plan',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteSubscriptionPlan(plan.id).subscribe({
        next: () => {
          console.log('Plan deleted successfully:', plan.id);
          if (this.selectedPlan?.id === plan.id) {
            this.selectedPlan = null;
          }
          this.loadPlans();
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting plan:', error);
          this.errorMessage = 'Failed to delete plan. Please try again.';
          this.loadingService.hide();
        }
      });
    }
  }

  duplicatePlan(plan: SubscriptionPlan): void {
    this.planForm = {
      ...plan,
      id: 0,
      plan_id: 0,
      name: `${plan.name}_copy`,
      display_name: `${plan.display_name} (Copy)`,
      subscriber_count: 0,
      revenue: 0,
      created_at: new Date().toISOString(),
      updated_at: '',
      created_by: 0,
      updated_by: 0
    };
    this.editingPlan = null;
    this.showAddForm = true;
  }


  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatNumber(num: number | undefined): string {
    if (num === -1) return 'Unlimited';
    if (num === undefined) return 'N/A';
    return num.toLocaleString();
  }

  getTotalRevenue(): number {
    return this.plans.reduce((sum, plan) => sum + plan.revenue, 0);
  }

  getTotalSubscribers(): number {
    return this.plans.reduce((sum, plan) => sum + plan.subscriber_count, 0);
  }

  getActivePlansCount(): number {
    return this.plans.filter(p => p.is_active).length;
  }

  toggleAccordion(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  clearPlanForm() {
    this.planForm = {
      id: 0,
      name: '',
      display_name: '',
      description: '',
      price: 0,
      currency: 'INR',
      billing_cycle: 'monthly',
      max_restaurants: 1,
      max_users: 5,
      is_active: true,
      is_popular: false,
      subscriber_count: 0,
      revenue: 0,
      plan_id: 0,
      setup_fee: 0,
      trial_days: 0,
      created_at: new Date().toISOString(),
      updated_at: '',
      created_by: 0,
      updated_by: 0
    };
  }
}
