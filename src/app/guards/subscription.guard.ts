import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';
import { NotificationService } from '../services/notification.service';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const subscriptionService = inject(SubscriptionService);
  const notificationService = inject(NotificationService)

  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role || authService.getUserRole();
  const restaurantId = currentUser?.role === 'customer' ? currentUser.restaurant_id : currentUser?.restaurantId;

  if (!restaurantId) {
    router.navigate(['/admin/login']);
    return false;
  }

  const sub = subscriptionService.getActiveSubscription();

  const allowedSubscriptionPlans: string[] = (route.data as any)?.allowedSubscriptionPlans || [];
  let planAllowed = true;
  if (allowedSubscriptionPlans.length && sub) {
    const userPlan = sub?.plan_name_at_subscription || '';
    console.log(userPlan);
    planAllowed = allowedSubscriptionPlans.includes(userPlan);
  }

  if (planAllowed && subscriptionService.hasActiveSubscription()) {
    return true;
  }

  if (planAllowed && subscriptionService.isLoading()) {
    return true;
  }

  if (userRole === 'restaurant_owner' || userRole === 'restaurant_manager') {
    notificationService.error('Subscription Update Required', 'Please contact to our sales team');
    router.navigate(['/owner-plans-mobile']);
    return false;
  }

  if (userRole === 'customer') {
    router.navigate(['/unauthrized-access'], { queryParams: { reason: 'subscription_inactive' } });
    return false;
  }

  router.navigate(['/admin/login']);
  return false;
};
