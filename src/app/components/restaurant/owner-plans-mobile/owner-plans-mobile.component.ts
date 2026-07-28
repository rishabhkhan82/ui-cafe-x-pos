import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, BehaviorSubject, forkJoin, of } from 'rxjs';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { ManagedFeature, PlanFeatureMapping, SubscriptionPlan } from '../../../services/mock-data.service';
import { RestaurantSubscription, SubscriptionHistory, BillingPeriodMonths } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { SubscriptionService } from '../../../services/subscription.service';
import { SystemConfigService } from '../../../services/system-config.service';

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
  // selectedPlanForPlanId: number | null = null;
  // selectedPlan: SubscriptionPlan | null = null;
  expandedFeaturesMap: Map<number, boolean> = new Map();
  private subscriptions: Subscription[] = [];

  // Dynamic subscription data
  currentSubscription$ = new BehaviorSubject<RestaurantSubscription | null>(null);
  subscriptionHistory$ = new BehaviorSubject<SubscriptionHistory[]>([]);

  // Computed properties for template
  currentPlan: SubscriptionPlan | null = null;
  currentPlanFeatures: ManagedFeature[] = [];
  isSubscribed: boolean = false;

  billingPeriodMonths: BillingPeriodMonths[] = [];

  // Trial-related properties
  isOnTrial: boolean = false;
  trialDaysRemaining: number = 0;
  trialEndDate: Date | null = null;
  isTrialEligible: boolean = false;

  constructor(
    public router: Router,
    private crudService: CrudService,
    public loadingService: LoadingService,
    private notificationService: NotificationService,
    public authService: AuthService,
    private subscriptionService: SubscriptionService,
    private systemConfigService: SystemConfigService
  ) {}

  planThemes = [
    'bg-gradient-to-br from-violet-500 to-indigo-700',
    'bg-gradient-to-br from-orange-400 to-red-600',
    'bg-gradient-to-br from-emerald-400 to-teal-600'
  ];

  hoverBorders = [
    'hover:border-violet-300 dark:hover:border-violet-600',
    'hover:border-orange-300 dark:hover:border-orange-600',
    'hover:border-emerald-300 dark:hover:border-emerald-600'
  ];

  getTheme(index: number): string {
    return this.planThemes[index] || this.planThemes[0];
  }

  getHoverBorder(index: number): string {
    return this.hoverBorders[index] || this.hoverBorders[0];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingService.show();
    this.errorMessage = '';

    // Get current user for all operations
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId;

    if (!restaurantId) {
      console.error('No restaurant ID found for current user');
      this.errorMessage = 'Unable to load subscription data. Please login again.';
      this.loadingService.hide();
      return;
    }

    // Load all data in parallel using forkJoin
    const plans$ = this.crudService.getSubscriptionPlans({ isActive: true, isComingSoon: false });
    const features$ = this.crudService.getFeatures();
    const planFeatures$ = this.crudService.getPlanFeatureMapping();
    const billingPeriodMonths$ = this.crudService.getBillingPeriodMonths({ isActive: true, page: 0, size: 0 });
    // Fetch all subscriptions for this restaurant (trial, active, expired, etc.)
    const currentSub$ = this.crudService.getRestaurantSubscriptions({
      restaurantId: restaurantId.toString()
    });
    const history$ = this.crudService.getSubscriptionHistories({ restaurantId: restaurantId.toString() });

    // Check trial eligibility
    const trialCheck$ = restaurantId ? this.crudService.getData(`restaurant-subscriptions/trial/check/${restaurantId}`) : of(false);

    forkJoin([plans$, features$, planFeatures$, billingPeriodMonths$, currentSub$, history$, trialCheck$]).subscribe({
      next: ([plansResponse, featuresResponse, planFeaturesResponse, billingPeriodMonthsResponse, currentSubResponse, historyResponse, trialEligibility]) => {
        // Handle success responses
        const plansResponseData = (plansResponse.data || plansResponse || []) as SubscriptionPlan[];
        const sortedPlans = [...plansResponseData].sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        this.plans$.next(sortedPlans);
        this.features = (featuresResponse.data || featuresResponse || []) as ManagedFeature[];
        this.planFeatures = (planFeaturesResponse.data || planFeaturesResponse || []) as PlanFeatureMapping[];

        const billingMonths = (billingPeriodMonthsResponse.data || billingPeriodMonthsResponse || []) as BillingPeriodMonths[];
        this.billingPeriodMonths = billingMonths;

        // Handle paginated response - extract data array
        const subscriptionResponse = currentSubResponse.data || currentSubResponse || { data: [] };
        const allSubscriptions = Array.isArray(subscriptionResponse) ? subscriptionResponse : (subscriptionResponse.data || []);

        // Find the most recent active or trial subscription
        const subscriptions = allSubscriptions.filter((sub: RestaurantSubscription) =>
          sub.status === 'active' || sub.status === 'trial'
        ).sort((a: RestaurantSubscription, b: RestaurantSubscription) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.currentSubscription$.next(subscriptions.length > 0 ? subscriptions[0] : null);

        this.subscriptionHistory$.next((historyResponse.data || historyResponse || []) as SubscriptionHistory[]);

        // Set trial eligibility
        this.isTrialEligible = trialEligibility as boolean;

        this.updateComputedProperties();
        this.loadingService.hide();
        console.log('Data loaded - Plans:', this.plans$.value.length, 'Current sub:', this.currentSubscription$.value, 'Trial eligible:', this.isTrialEligible);
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

    // Ensure both IDs are numbers for comparison (API may return plan_id as string)
    const subscriptionPlanId = typeof currentSub?.plan_id === 'string' ? parseInt(currentSub.plan_id, 10) : currentSub?.plan_id;
    this.currentPlan = currentSub ? plans.find(plan => plan.id === subscriptionPlanId) || null : null;

    this.currentPlanFeatures = this.currentPlan ? this.getPlanFeatures(this.currentPlan.id) : [];
    this.isSubscribed = !!this.currentPlan;

    // Update trial-related properties
    this.updateTrialProperties();
  }

  private updateTrialProperties(): void {
    const currentSub = this.currentSubscription$.value;

    if (currentSub && currentSub.status === 'trial' && currentSub.trial_end_date) {
      this.isOnTrial = true;
      this.trialEndDate = new Date(currentSub.trial_end_date);

      const now = new Date();
      const timeDiff = this.trialEndDate.getTime() - now.getTime();
      this.trialDaysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // If trial has expired, mark as not on trial
      if (this.trialDaysRemaining < 0) {
        this.isOnTrial = false;
        this.trialDaysRemaining = 0;
      }
    } else {
      this.isOnTrial = false;
      this.trialDaysRemaining = 0;
      this.trialEndDate = null;
    }
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
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId;

    if (!restaurantId) {
      this.notificationService.error('Authentication Required', 'Unable to process subscription. Please login again.');
      return;
    }

    const selectedMonths = this.getSelectedMonths(plan.id);
    const finalAmount = this.getFinalAmount(plan);
    const discountAmount = this.getDiscountAmount(plan);
    const gstAmount = this.getGstAmount(plan);
    const gstPercentage = this.getGstPercentage();
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + selectedMonths);

    // FREE PLAN: skip Razorpay entirely and activate directly
    if (finalAmount === 0) {
      this.activateFreePlan(plan, selectedMonths, discountAmount, gstAmount, gstPercentage);
      return;
    }

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
            this.saveSubscriptionAndHistory(rzpResponse, plan, selectedMonths, finalAmount, discountAmount, gstAmount, gstPercentage, endDate);
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
        this.notificationService.error('Payment Failed', 'Could not start payment. Please try again.');
      }
    });
  }

  private activateFreePlan(plan: SubscriptionPlan, months: number, discountAmount: number, gstAmount: number, gstPercentage: string): void {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId;
    const currentUserId = currentUser?.id;
    const now = new Date();

    const freeOrderId = `FREE-${Date.now()}`;
    const mockRzpResponse = {
      razorpay_order_id: freeOrderId,
      razorpay_payment_id: freeOrderId
    };

    this.loadingService.show();
    this.saveSubscriptionAndHistory(mockRzpResponse, plan, months, 0, discountAmount, gstAmount, gstPercentage, null);
  }

  // closeSubscriptionSelection(): void {
  //   this.selectedPlanForPlanId = null;
  //   this.selectedPlan = null;
  // }

  subscribeToPlan(plan: SubscriptionPlan): void {
    const selectedMonths = this.getSelectedMonths(plan.id);
    const discountAmount = this.getDiscountAmount(plan);
    const finalAmount = this.getFinalAmount(plan);
    const gstAmount = this.getGstAmount(plan);
    const gstPercentage = this.getGstPercentage();

    // Proceed to payment
    this.proceedToPaymentDirect(plan, selectedMonths, finalAmount, discountAmount, gstAmount, gstPercentage);
  }

  openSubscriptionDialog(plan: SubscriptionPlan): void {
    this.subscribeToPlan(plan);
  }

  getSelectedMonths(planId: number): number {
    return this.selectedMonthsMap.get(planId) || 6;
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
    const base = plan.price * months;
    const discountPercentage = plan.offer_discount_percentage || 0;
    return Number((base * (discountPercentage / 100)).toFixed(2));
  }

  getFinalAmount(plan: SubscriptionPlan): number {
    const months = this.getSelectedMonths(plan.id);
    const base = plan.price * months;
    const discount = this.getDiscountAmount(plan);
    const subtotal = base - discount;
    const gstPercentage = parseFloat(this.getGstPercentage());
    const gstAmount = subtotal * (gstPercentage / 100);
    return Number((subtotal + gstAmount).toFixed(2));
  }

  getGstPercentage(): string {
    return this.systemConfigService.gstEnabled ? this.systemConfigService.gstPercentage : '0';
  }

  getGstAmount(plan: SubscriptionPlan): number {
    const months = this.getSelectedMonths(plan.id);
    const base = plan.price * months;
    const discount = this.getDiscountAmount(plan);
    const subtotal = base - discount;
    return Number((subtotal * (parseFloat(this.getGstPercentage()) / 100)).toFixed(2));
  }

  proceedToPaymentDirect(plan: SubscriptionPlan, months: number, finalAmount: number, discountAmount: number, gstAmount: number, gstPercentage: string): void {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId;

    if (!restaurantId) {
      this.notificationService.error('Authentication Required', 'Unable to process payment. Please login again.');
      return;
    }

    // Call API to create Razorpay order
    const payload = {
      planId: plan.id.toString(),
      months: months,
      calculatedAmount: finalAmount,
      restaurantId: restaurantId
    };

    this.crudService.postData('payments/create-order', payload).subscribe({
      next: (response: any) => {
        const order = response;
        this.launchRazorpay(order, plan, months, finalAmount, discountAmount, gstAmount, gstPercentage);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.notificationService.error('Payment Error', 'Failed to create payment order. Please try again.');
      }
    });
  }

  private launchRazorpay(order: any, plan: SubscriptionPlan, months: number, finalAmount: number, discountAmount: number, gstAmount: number, gstPercentage: string): void {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + months);

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
        this.saveSubscriptionAndHistory(response, plan, months, finalAmount, discountAmount, gstAmount, gstPercentage, endDate);
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

  // private saveSubscription(razorpayResponse: any, plan: SubscriptionPlan, months: number, finalAmount: number, discountAmount: number): void {
  //   const currentUser = this.authService.getCurrentUser();
  //   const restaurantId = currentUser?.restaurantId;

  //   if (!restaurantId) {
  //     console.error('No restaurant ID found for current user');
  //     this.notificationService.error('Subscription Error', 'Payment successful but failed to save subscription. Please contact support.');
  //     return;
  //   }

  //   const now = new Date();
  //   const endDate = new Date();
  //   endDate.setMonth(now.getMonth() + months);

  //   const subscriptionPayload = {
  //     subscription_id: razorpayResponse.razorpay_order_id,
  //     restaurant_id: restaurantId,
  //     plan_id: plan.id,
  //     status: 'active',
  //     start_date: now.toISOString(),
  //     end_date: endDate.toISOString(),
  //     billing_cycle: plan.billing_cycle,
  //     cancel_at_period_end: false,
  //     auto_renew: false,
  //     discount_amount: discountAmount,
  //     final_amount: finalAmount,
  //     payment_method_id: razorpayResponse.razorpay_payment_id,
  //     plan_price_at_subscription: plan.price,
  //     offer_name_at_subscription: plan.offer_name || null,
  //     offer_discount_percentage_at_subscription: plan.offer_discount_percentage || 0,
  //     plan_name_at_subscription: plan.display_name || plan.name
  //   };

  //   this.crudService.createRestaurantSubscription(subscriptionPayload).subscribe({
  //     next: (response: any) => {
  //       console.log('Subscription saved:', response);
  //       const currentUser = this.authService.getCurrentUser();
  //       const restaurantId = currentUser?.restaurantId;

  //       if (restaurantId) {
  //         this.updateRestaurantSubscriptionFields(
  //           restaurantId,
  //           plan.display_name || plan.name,
  //           now,
  //           endDate
  //         );
  //       }

  //       this.notificationService.success('Subscription Activated', 'Your subscription has been activated successfully!');
  //       this.subscriptionService.refreshAfterPayment().subscribe();
  //       this.loadData(); // Refresh data
  //     },
  //     error: (error) => {
  //       console.error('Error saving subscription:', error);
  //       this.notificationService.error('Subscription Error', 'Payment successful but failed to save subscription. Contact support.');
  //     }
  //   });
  // }

  private updateRestaurantSubscriptionFields(
    restaurantId: string | number,
    planName: string,
    startDate: Date,
    endDate: Date | null
  ): void {
    this.crudService.updateRestaurantSubscriptionDetails(restaurantId, {
      subscription_plan: planName,
      subscription_start_date: startDate,
      subscription_end_date: endDate
    }).subscribe({
      next: () => {
        console.log('Restaurant subscription fields updated successfully');
      },
      error: (error) => {
        console.error('Error updating restaurant subscription fields:', error);
      }
    });
  }

  startTrial(plan: SubscriptionPlan): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.restaurantId || !currentUser?.id) {
      this.notificationService.error('Authentication Required', 'User information not available. Please login again.');
      return;
    }

    if (!this.isTrialEligible) {
      this.notificationService.warning('Trial Unavailable', 'You have already used your trial period.');
      return;
    }

    this.loadingService.show();
    this.crudService.postData('restaurant-subscriptions/trial', {
      restaurantId: currentUser.restaurantId.toString(),
      planId: plan.id.toString(),
      userId: currentUser.id.toString()
    }).subscribe({
      next: (response: any) => {
        console.log('Trial subscription created:', response);
        const subData = response.data;
        const currentUser = this.authService.getCurrentUser();
        const restaurantId = currentUser?.restaurantId;
        const planFromList = this.plans$.value.find(p => p.id === parseInt(subData?.plan_id));
        const planName = planFromList?.display_name || planFromList?.name || 'Trial';

        if (restaurantId && subData) {
          this.updateRestaurantSubscriptionFields(
            restaurantId,
            planName,
            new Date(subData.trial_start_date),
            new Date(subData.trial_end_date)
          );
        }

        this.notificationService.success('Trial Activated', 'Trial subscription activated! You have 15 days to try all features.');
        this.subscriptionService.refreshAfterPayment().subscribe();
        this.loadData(); // Refresh data to show trial status
      },
      error: (error) => {
        console.error('Error creating trial:', error);
        this.notificationService.error('Trial Failed', 'Failed to start trial. Please try again.');
        this.loadingService.hide();
      }
    });
  }

  private saveSubscriptionAndHistory(razorpayResponse: any, plan: SubscriptionPlan, months: number, finalAmount: number, discountAmount: number, gstAmount: number, gstPercentage: string, endDate: Date | null): void {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId;
    const currentUserId = currentUser?.id;
    const now = new Date();

    const subscriptionPayload: any = {
      subscription_id: razorpayResponse.razorpay_order_id,
      restaurant_id: restaurantId,
      plan_id: plan.id,
      status: 'active',
      start_date: now.toISOString(),
      billing_cycle: plan.billing_cycle,
      cancel_at_period_end: false,
      auto_renew: false,
      created_by : currentUserId,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      gst_amount: gstAmount,
      gst_percentage: gstPercentage,
      payment_method_id: razorpayResponse.razorpay_payment_id,
      plan_price_at_subscription: plan.price,
      offer_name_at_subscription: plan.offer_name || null,
      offer_discount_percentage_at_subscription: plan.offer_discount_percentage || 0,
      plan_name_at_subscription: plan.display_name || plan.name
    };

    if (endDate !== null) {
      subscriptionPayload.end_date = endDate.toISOString();
    }

    // Save subscription first
    this.crudService.createRestaurantSubscription(subscriptionPayload).subscribe({
      next: (subscriptionResponse: any) => {
        console.log('Subscription saved:', subscriptionResponse);

        const currentUser = this.authService.getCurrentUser();
        const restaurantId = currentUser?.restaurantId;

        if (restaurantId) {
          this.updateRestaurantSubscriptionFields(
            restaurantId,
            plan.display_name || plan.name,
            now,
            endDate
          );
        }

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
          retention_actions: null,
          plan_price_at_subscription: plan.price,
          offer_name_at_subscription: plan.offer_name || null,
          offer_discount_percentage_at_subscription: plan.offer_discount_percentage || 0,
          plan_name_at_subscription: plan.display_name || plan.name
        };

        this.crudService.createSubscriptionHistory(historyPayload).subscribe({
          next: (historyResponse: any) => {
            console.log('Subscription history saved:', historyResponse);
            this.notificationService.success('Subscription Activated', 'Your subscription has been activated successfully!');
            this.subscriptionService.refreshAfterPayment().subscribe();
            this.loadData(); // Refresh data
          },
          error: (historyError) => {
            console.error('Error saving subscription history:', historyError);
            this.notificationService.warning('Partial Success', 'Subscription saved but failed to save history. Contact support.');
            this.loadData(); // Still refresh data
          }
        });
      },
      error: (error) => {
        console.error('Error saving subscription:', error);
        this.notificationService.error('Subscription Error', 'Payment successful but failed to save subscription. Contact support.');
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

  // Toggle expanded features view
  toggleFeaturesExpansion(planId: number): void {
    const currentState = this.expandedFeaturesMap.get(planId) || false;
    this.expandedFeaturesMap.set(planId, !currentState);
  }

  // Check if features are expanded for a plan
  isFeaturesExpanded(planId: number): boolean {
    return this.expandedFeaturesMap.get(planId) || false;
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