import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const subscriptionService = inject(SubscriptionService);

  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role || authService.getUserRole();
  const restaurantId = currentUser?.role === 'customer' ? currentUser.restaurant_id : currentUser?.restaurantId;

  if (!restaurantId) {
    router.navigate(['/admin/login']);
    return false;
  }

  if (subscriptionService.hasActiveSubscription()) {
    return true;
  }

  if (subscriptionService.isLoading()) {
    return true;
  }

  if (userRole === 'restaurant_owner' || userRole === 'restaurant_manager') {
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
