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

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'customer') {
      this.router.navigate(['/customer/scan-qr']);
      return false;
    }

    const sub = this.subscriptionService.getActiveSubscription();

    // Data not loaded yet — trigger load and wait for it
    if (sub === null) {
      if (!this.subscriptionService.isLoading()) {
        this.subscriptionService.loadActiveSubscription().subscribe();
      }

      // Wait until either data arrives or 5 seconds pass
      await new Promise<void>(resolve => {
        const timeout = setTimeout(() => resolve(), 5000);

        const subscription = this.subscriptionService.activeSubscription$.subscribe(() => {
          clearTimeout(timeout);
          subscription.unsubscribe();
          resolve();
        });
      });
    }

    if (!this.subscriptionService.hasActiveSubscription()) {
      this.router.navigate(['/unauthrized-access'], { queryParams: { reason: 'subscription_inactive' } });
      return false;
    }

    return true;
  }

  getActiveSubscription() {
    return new Promise((resolve, reject) => {
      this.subscriptionService.activeSubscription$.subscribe(
        (subscription) => {
          resolve(subscription);
        }
      );
    });
  }
}