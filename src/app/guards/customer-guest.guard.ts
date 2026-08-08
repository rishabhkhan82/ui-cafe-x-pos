import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerGuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'customer') {
      this.router.navigate(['/customer/scan-qr']);
      return false;
    }

    if (!this.subscriptionService.hasActiveSubscription()) {
      this.router.navigate(['/unauthrized-access'], { queryParams: { reason: 'subscription_inactive' } });
      return false;
    }

    return true;
  }
}
