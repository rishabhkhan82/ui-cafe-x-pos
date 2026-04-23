import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { ManagedFeature, PlanFeatureMapping, SubscriptionPlan } from '../../../services/mock-data.service';
import { RestaurantSubscription, SubscriptionHistory } from '../../../interfaces';

@Component({
  selector: 'app-owner-plans-mobile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-plans-mobile.component.html',
  styleUrl: './owner-plans-mobile.component.css'
})
export class OwnerPlansMobileComponent implements OnInit, OnDestroy {
  showPlan = false;
  plans$ = new BehaviorSubject<SubscriptionPlan[]>([]);
  features: ManagedFeature[] = [];
  planFeatures: PlanFeatureMapping[] = [];
  errorMessage = '';
  selectedPlanForDetails: SubscriptionPlan | undefined | any;
  private subscriptions: Subscription[] = [];

  // Hardcoded subscription history data
  subscriptionHistory: SubscriptionHistory[] = [
    {
      id: 1,
      history_id: 'hist_1234567890',
      restaurant_id: 1,
      change_type: 'subscription_created',
      effective_date: new Date('2026-02-23T00:00:00.000Z'),
      previous_plan_id: null,
      new_plan_id: '7',
      previous_price: null,
      new_price: 499.00,
      price_difference: 499.00,
      prorated_amount: 0,
      payment_id: 'pay_1234567890',
      payment_status: 'paid',
      initiated_by: 'restaurant_owner',
      reason: 'Initial subscription',
      cancellation_reason: null,
      notes: 'Welcome to Super Easy Plan!',
      billing_cycle_change: false,
      churn_risk_score: 0.1,
      retention_actions: null,
      created_at: new Date('2026-02-23T00:00:00.000Z')
    },
    {
      id: 2,
      history_id: 'hist_1234567891',
      restaurant_id: 1,
      change_type: 'billing_cycle_renewal',
      effective_date: new Date('2026-03-23T00:00:00.000Z'),
      previous_plan_id: '7',
      new_plan_id: '7',
      previous_price: 499.00,
      new_price: 499.00,
      price_difference: 0,
      prorated_amount: 0,
      payment_id: 'pay_1234567891',
      payment_status: 'paid',
      initiated_by: 'system',
      reason: 'Monthly renewal',
      cancellation_reason: null,
      notes: 'Automatic renewal payment processed',
      billing_cycle_change: false,
      churn_risk_score: 0.05,
      retention_actions: null,
      created_at: new Date('2026-03-23T00:00:00.000Z')
    }
  ];

  // Hardcoded subscription data based on restaurant_subscriptions table
  currentSubscription: RestaurantSubscription = {
    id: 1,
    subscription_id: 'sub_1234567890',
    restaurant_id: 1,
    plan_id: 7,
    status: 'active',
    billing_cycle: 'monthly',
    auto_renew: true,
    cancel_at_period_end: false,
    discount_amount: 0,
    final_amount: 499.00,
    cancelled_at: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    created_by: 1,
    current_period_end: new Date('2026-01-31T23:59:59.999Z'),
    current_period_start: new Date('2026-01-01T00:00:00.000Z'),
    end_date: null,
    next_billing_date: new Date('2026-02-01T00:00:00.000Z'),
    start_date: new Date('2026-01-01T00:00:00.000Z'),
    trial_end_date: null,
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    cancellation_reason: null,
    discount_code: null,
    payment_method_id: 'pm_1234567890'
  };

  constructor(
    public router: Router,
    private crudService: CrudService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingService.show();
    this.errorMessage = '';

    // Load all data in parallel
    this.loadPlans();
    this.loadFeatures();
    this.loadPlanFeatures();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleView() {
    this.showPlan = !this.showPlan;
    if (this.showPlan) {
      this.selectedPlanForDetails = undefined; // Close plan details when switching to plans view
    }
  }

  reloadData() {
    this.loadData();
  }

  loadPlans(): void {
    const params = { isActive: true };
    const subscription = this.crudService.getSubscriptionPlans(params).subscribe({
      next: (response: any) => {
        this.plans$.next((response.data || response || []) as SubscriptionPlan[]);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.errorMessage = 'Failed to load plans';
        this.checkLoadingComplete();
      }
    });
    this.subscriptions.push(subscription);
  }

  loadFeatures(): void {
    const subscription = this.crudService.getFeatures().subscribe({
      next: (response: any) => {
        this.features = (response.data || response || []) as ManagedFeature[];
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading features:', error);
        this.errorMessage = 'Failed to load features';
        this.checkLoadingComplete();
      }
    });
    this.subscriptions.push(subscription);
  }

  loadPlanFeatures(): void {
    const subscription = this.crudService.getPlanFeatureMapping().subscribe({
      next: (response: any) => {
        this.planFeatures = (response.data || response || []) as PlanFeatureMapping[];
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Error loading plan features:', error);
        this.planFeatures = [] as PlanFeatureMapping[];
        this.errorMessage = 'Failed to load plan features';
        this.checkLoadingComplete();
      }
    });
    this.subscriptions.push(subscription);
  }

  private checkLoadingComplete(): void {
    // Simple check - in a real app, you'd use a more sophisticated approach
    this.loadingService.hide();
  }

  // Get features enabled for a specific plan
  getPlanFeatures(planId: number): ManagedFeature[] {
    const enabledFeatureIds = this.planFeatures
      .filter(pf => pf.plan_id === planId && pf.is_enabled)
      .map(pf => pf.feature_id);

    return this.features.filter(feature =>
      enabledFeatureIds.includes(feature.feature_id)
    );
  }

  // Get the current subscribed plan based on subscription data
  getCurrentPlan(): SubscriptionPlan | null {
    const plans = this.plans$.value;
    return plans.find(plan => plan.id === this.currentSubscription.plan_id) || null;
  }

  // Check if a plan is subscribed based on current subscription
  isPlanSubscribed(planId: number): boolean {
    return planId === this.currentSubscription.plan_id;
  }

  // Handle subscribe button click
  subscribeToPlan(plan: SubscriptionPlan): void {
    // TODO: Integrate Razorpay gateway here
    console.log('Subscribing to plan:', plan.name);

    // Mock subscription success
    alert(`Razorpay integration pending. Plan: ${plan.display_name || plan.name}, Price: $${plan.price}/${plan.billing_cycle}`);

    // In real implementation, after successful payment:
    // this.currentSubscribedPlanId = plan.id;
    // this.loadData(); // Refresh data
  }

  // Handle view details button click
  viewPlanDetails(plan: SubscriptionPlan): void {
    this.selectedPlanForDetails = plan;
    this.showPlan = false; // Hide plan list to show details
  }

  // Close plan details view
  closePlanDetails(): void {
    this.selectedPlanForDetails = undefined;
    this.showPlan = true; // Show plan list again
  }

  // Handle back navigation when in plan details
  handleBackNavigation(): void {
    if (this.selectedPlanForDetails) {
      this.closePlanDetails();
    } else {
      this.router.navigate(['/restaurant-navigation-mobile']);
    }
  }
}
