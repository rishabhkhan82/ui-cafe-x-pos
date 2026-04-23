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

  // Dynamic subscription data
  currentSubscription$ = new BehaviorSubject<RestaurantSubscription | null>(null);
  subscriptionHistory$ = new BehaviorSubject<SubscriptionHistory[]>([]);

  // Computed properties for template
  currentPlan: SubscriptionPlan | null = null;
  currentPlanFeatures: ManagedFeature[] = [];
  isSubscribed: boolean = false;

  constructor(
    public router: Router,
    private crudService: CrudService,
    public loadingService: LoadingService
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
    this.loadCurrentSubscription();
    this.loadSubscriptionHistory();
  }

  private updateComputedProperties(): void {
    const currentSub = this.currentSubscription$.value;
    const plans = this.plans$.value;
    this.currentPlan = currentSub ? plans.find(plan => plan.id === currentSub.plan_id) || null : null;
    this.currentPlanFeatures = this.currentPlan ? this.getPlanFeatures(this.currentPlan.id) : [];
    this.isSubscribed = !!this.currentPlan;
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
        this.updateComputedProperties();
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

  loadCurrentSubscription(): void {
    // Assuming restaurant_id is 1 for now; in real app, get from session/user context
    const restaurantId = 1;
    const params = { restaurantId: restaurantId.toString(), status: 'active' };
    const subscription = this.crudService.getRestaurantSubscriptions(params).subscribe({
      next: (response: any) => {
        const subscriptions = (response.data || response || []) as RestaurantSubscription[];
        // Assuming the first active subscription is the current one
        this.currentSubscription$.next(subscriptions.length > 0 ? subscriptions[0] : null);
        this.updateComputedProperties();
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading current subscription:', error);
        this.errorMessage = 'Failed to load current subscription';
        this.currentSubscription$.next(null);
        this.checkLoadingComplete();
      }
    });
    this.subscriptions.push(subscription);
  }

  loadSubscriptionHistory(): void {
    // Assuming restaurant_id is 1 for now; in real app, get from session/user context
    const restaurantId = 1;
    const params = { restaurantId: restaurantId.toString() };
    const subscription = this.crudService.getSubscriptionHistories(params).subscribe({
      next: (response: any) => {
        this.subscriptionHistory$.next((response.data || response || []) as SubscriptionHistory[]);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading subscription history:', error);
        this.errorMessage = 'Failed to load subscription history';
        this.subscriptionHistory$.next([]);
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
