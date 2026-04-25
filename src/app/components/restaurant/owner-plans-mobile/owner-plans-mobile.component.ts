import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, BehaviorSubject, forkJoin } from 'rxjs';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { ManagedFeature, PlanFeatureMapping, SubscriptionPlan } from '../../../services/mock-data.service';
import { RestaurantSubscription, SubscriptionHistory } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-owner-plans-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-plans-mobile.component.html',
  styleUrl: './owner-plans-mobile.component.css'
})
export class OwnerPlansMobileComponent implements OnInit, OnDestroy {
  showPlan = false;
  plans$ = new BehaviorSubject<SubscriptionPlan[]>([]);
  features: ManagedFeature[] = [];
  planFeatures: PlanFeatureMapping[] = [];
  errorMessage : any = '';
  selectedPlanForDetails: SubscriptionPlan | undefined | any;
  selectedMonthsMap: Map<number, number> = new Map();
  selectedPlanForPlanId: number | null = null;
  selectedPlan: SubscriptionPlan | null = null;
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
    public loadingService: LoadingService,
    public authService: AuthService
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
        console.log('Data loaded - Plans:', this.plans$.value.length, 'Current sub:', this.currentSubscription$.value);
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
    console.log('Toggled showPlan to:', this.showPlan);
    if (this.showPlan) {
      this.selectedPlanForDetails = undefined; // Close plan details when switching to plans view
      this.errorMessage = ''; // Reset to allow plans to show
      console.log('Reset selectedPlanForDetails:', this.selectedPlanForDetails);
      console.log('Reset errorMessage:', this.errorMessage);
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
  openSubscriptionForPlan(plan: SubscriptionPlan): void {
    const selectedMonths = this.getSelectedMonths(plan.id);
    const finalAmount = this.getFinalAmount(plan);
    const discountAmount = this.getDiscountAmount(plan);
    const restaurantId = 1;

    // 1) Tell backend to create a Razorpay order
    this.crudService.postData('payments/create-order', {
      planId: plan.id,
      months: selectedMonths,
      calculatedAmount: finalAmount,
      restaurantId: restaurantId
    }).subscribe({
      next: (order: any) => {
        // 2) Launch Razorpay Checkout
        const options = {
          key: order.keyId,
          amount: order.amount * 100,
          currency: 'INR',
          order_id: order.orderId,
          name: 'Cafe-X POS Subscription',
          description: `Subscription for ${selectedMonths} months`,
          handler: (rzpResponse: any) => {
            // 3) On success -> save subscription and history via backend
            this.saveSubscriptionAndHistory(rzpResponse, plan, selectedMonths, finalAmount, discountAmount);
          },
          prefill: {
            name: 'Restaurant Owner',
            email: 'owner@example.com',
            contact: '9999999999'
          },
          theme: { color: '#F37254' }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      },
      error: (err) => {
        console.error('Failed to create Razorpay order', err);
        alert('Could not start payment. Please try again.');
      }
    });
  }

  closeSubscriptionSelection(): void {
    this.selectedPlanForPlanId = null;
    this.selectedPlan = null;
  }

  subscribeToPlan(plan: SubscriptionPlan): void {
    const selectedMonths = this.getSelectedMonths(plan.id);
    const discountAmount = this.getDiscountAmount(plan);
    const finalAmount = this.getFinalAmount(plan);

    // Proceed to payment
    this.proceedToPaymentDirect(plan, selectedMonths, finalAmount, discountAmount);
  }

  openSubscriptionDialog(plan: SubscriptionPlan): void {
    this.subscribeToPlan(plan);
  }

  private getDiscountMonths(months: number): number {
    switch (months) {
      case 1: return 0;
      case 3: return 1;
      case 6: return 2;
      case 12: return 3;
      default: return 0;
    }
  }

  getSelectedMonths(planId: number): number {
    return this.selectedMonthsMap.get(planId) || 1;
  }

  setSelectedMonths(planId: number, months: number): void {
    this.selectedMonthsMap.set(planId, months);
  }

  onMonthsChange(planId: number, event: any): void {
    const months = parseInt(event.target.value, 10);
    this.setSelectedMonths(planId, months);
  }

  getDiscountAmount(plan: SubscriptionPlan): number {
    const months = this.getSelectedMonths(plan.id);
    const discountMonths = this.getDiscountMonths(months);
    return plan.price * discountMonths;
  }

  getFinalAmount(plan: SubscriptionPlan): number {
    const months = this.getSelectedMonths(plan.id);
    const base = plan.price * months;
    const discount = this.getDiscountAmount(plan);
    return base - discount;
  }

  proceedToPaymentDirect(plan: SubscriptionPlan, months: number, finalAmount: number, discountAmount: number): void {
    const restaurantId = 1; // From earlier code

    // Call API to create Razorpay order
    const payload = {
      planId: plan.id,
      months: months,
      calculatedAmount: finalAmount,
      restaurantId: restaurantId
    };

    this.crudService.postData('payments/create-order', payload).subscribe({
      next: (response: any) => {
        const order = response;
        this.launchRazorpay(order, plan, months, finalAmount, discountAmount);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('Failed to create payment order. Please try again.');
      }
    });
  }

  private launchRazorpay(order: any, plan: SubscriptionPlan, months: number, finalAmount: number, discountAmount: number): void {
    const options = {
      key: order.keyId,
      amount: order.amount * 100, // In paise
      currency: 'INR',
      order_id: order.orderId,
      name: 'Cafe-X POS Subscription',
      description: `Subscription for ${months} months`,
      handler: (response: any) => {
        // Payment successful
        console.log('Payment successful:', response);
        this.saveSubscriptionAndHistory(response, plan, months, finalAmount, discountAmount);
      },
      prefill: {
        name: 'Restaurant Owner',
        email: 'owner@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#F37254'
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  private saveSubscription(razorpayResponse: any, plan: SubscriptionPlan, months: number, finalAmount: number, discountAmount: number): void {
    const restaurantId = 1;
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + months);

    const subscriptionPayload = {
      subscription_id: razorpayResponse.razorpay_order_id,
      restaurant_id: restaurantId,
      plan_id: plan.id,
      status: 'active',
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      billing_cycle: plan.billing_cycle,
      cancel_at_period_end: false,
      auto_renew: false,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      payment_method_id: razorpayResponse.razorpay_payment_id
    };

    this.crudService.createRestaurantSubscription(subscriptionPayload).subscribe({
      next: (response: any) => {
        console.log('Subscription saved:', response);
        alert('Subscription activated successfully!');
        this.loadData(); // Refresh data
      },
      error: (error) => {
        console.error('Error saving subscription:', error);
        alert('Payment successful but failed to save subscription. Contact support.');
      }
    });
  }

  private saveSubscriptionAndHistory(razorpayResponse: any, plan: SubscriptionPlan, months: number, finalAmount: number, discountAmount: number): void {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId;
    const currentUserId = currentUser?.id;
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + months);

    const subscriptionPayload = {
      subscription_id: razorpayResponse.razorpay_order_id,
      restaurant_id: restaurantId,
      plan_id: plan.id,
      status: 'active',
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      billing_cycle: plan.billing_cycle,
      cancel_at_period_end: false,
      auto_renew: false,
      created_by : currentUserId, // You need to get current user ID from auth service or context
      discount_amount: discountAmount,
      final_amount: finalAmount,
      payment_method_id: razorpayResponse.razorpay_payment_id
    };

    // Save subscription first
    this.crudService.createRestaurantSubscription(subscriptionPayload).subscribe({
      next: (subscriptionResponse: any) => {
        console.log('Subscription saved:', subscriptionResponse);

        // Now save history
        const historyPayload = {
          history_id: razorpayResponse.razorpay_order_id, // Use order_id as unique history_id
          restaurant_id: restaurantId,
          change_type: 'new_subscription',
          effective_date: now.toISOString(),
          previous_plan_id: null,
          new_plan_id: plan.id.toString(),
          previous_price: null,
          new_price: plan.price, // Plan's base price
          price_difference: 0,
          prorated_amount: 0,
          payment_id: razorpayResponse.razorpay_payment_id,
          payment_status: 'completed',
          initiated_by: currentUserId,
          reason: 'New subscription purchase',
          cancellation_reason: null,
          notes: `Subscribed for ${months} months with discount ${discountAmount}`,
          billing_cycle_change: false,
          churn_risk_score: 0,
          retention_actions: null
        };

        this.crudService.createSubscriptionHistory(historyPayload).subscribe({
          next: (historyResponse: any) => {
            console.log('Subscription history saved:', historyResponse);
            alert('Subscription activated successfully!');
            this.loadData(); // Refresh data
          },
          error: (historyError) => {
            console.error('Error saving subscription history:', historyError);
            alert('Subscription saved but failed to save history. Contact support.');
            this.loadData(); // Still refresh data
          }
        });
      },
      error: (error) => {
        console.error('Error saving subscription:', error);
        alert('Payment successful but failed to save subscription. Contact support.');
      }
    });
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