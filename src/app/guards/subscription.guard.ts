import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';
import { NotificationService } from '../services/notification.service';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const subscriptionService = inject(SubscriptionService);
  const notificationService = inject(NotificationService);

  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role || authService.getUserRole();
  const restaurantId =  currentUser?.role === 'customer' ? currentUser.restaurant_id : currentUser?.restaurantId;

  if (!restaurantId) {
    return router.parseUrl('/admin/login');
  }

  if (subscriptionService.hasActiveSubscription()) {
    return true;
  }

  if (subscriptionService.isLoading()) {
    return router.parseUrl(state.url);
  }

  if (userRole === 'restaurant_owner' || userRole === 'restaurant_manager') {
    return router.parseUrl('/owner-plans-mobile');
  }

  if (userRole === 'customer') {
    return router.parseUrl('/unauthrized-access?reason=subscription_inactive');
  }

  return false;
};
