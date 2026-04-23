import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, BehaviorSubject, forkJoin } from 'rxjs';
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

    // Load all data in parallel using forkJoin
    const plans$ = this.crudService.getSubscriptionPlans({ isActive: true });
    const features$ = this.crudService.getFeatures();
    const planFeatures$ = this.crudService.getPlanFeatureMapping();
    const restaurantId = 1; // Assuming restaurant_id is 1 for now
    const currentSub$ = this.crudService.getRestaurantSubscriptions({ restaurantId: restaurantId.toString(), status: 'active' });
    const history$ = this.crudService.getSubscriptionHistories({ restaurantId: restaurantId.toString() });

    forkJoin([plans$, features$, planFeatures$, currentSub$, history$]).subscribe({
      next: ([plansResponse, featuresResponse, planFeaturesResponse, currentSubResponse, historyResponse]) => {
        // Handle success responses
        this.plans$.next((plansResponse.data || plansResponse || []) as SubscriptionPlan[]);
        this.features = (featuresResponse.data || featuresResponse || []) as ManagedFeature[];
        this.planFeatures = (planFeaturesResponse.data || planFeaturesResponse || []) as PlanFeatureMapping[];

        const subscriptions = (currentSubResponse.data || currentSubResponse || []) as RestaurantSubscription[];
        this.currentSubscription$.next(subscriptions.length > 0 ? subscriptions[0] : null);

        this.subscriptionHistory$.next((historyResponse.data || historyResponse || []) as SubscriptionHistory[]);

        this.updateComputedProperties();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.errorMessage = 'Failed to load data';
        this.loadingService.hide();
      }
    });
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
