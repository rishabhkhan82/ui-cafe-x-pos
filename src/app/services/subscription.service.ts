import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private activeSubscriptionSubject = new BehaviorSubject<any | null>(null);
  public activeSubscription$ = this.activeSubscriptionSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // --- NEW: dedicated plan-name state ---
  private planNameSubject = new BehaviorSubject<string | null>(null);
  public planName$ = this.planNameSubject.asObservable();

  public notificationService = inject(NotificationService);

  constructor(
    private crudService: CrudService,
    private authService: AuthService
  ) {}

  // hasActiveSubscription(): boolean {
  //   const sub = this.activeSubscriptionSubject.value;
  //   if (!sub) return false;
  //   const status = (sub.status || '').toLowerCase();
  //   return status === 'active' || status === 'trial';
  // }

  hasActiveSubscription(): boolean {
    const sub = this.activeSubscriptionSubject.value;
    if (!sub) return false;

    const status = (sub.status || '').toLowerCase();
    const now = new Date();
    const planName = sub.plan_name_at_subscription || 'your plan';

    if (status === 'active') {
      if (sub.end_date) {
        if (new Date(sub.end_date).getTime() > now.getTime()) {
          return true;
        }
        this.notificationService.warning(
          'Plan Expired',
          `Your current plan "${planName}" has expired. Please renew to continue.`
        );
        return false;
      }
      return true; // active plan with no end_date is always valid
    }

    if (status === 'trial' && sub.trial_end_date) {
      if (new Date(sub.trial_end_date).getTime() > now.getTime()) {
        return true;
      }
      this.notificationService.warning(
        'Trial Expired',
        `Your current trial plan "${planName}" has expired. Please subscribe to continue.`
      );
      return false;
    }

    return false;
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  getActiveSubscription(): any | null {
    return this.activeSubscriptionSubject.value;
  }

  // NEW: synchronous getter
  getPlanName(): string | null {
    return this.planNameSubject.value;
  }

  private syncPlanName(sub: any | null): void {
    this.planNameSubject.next(sub?.plan_name_at_subscription ?? null);
  }

  loadActiveSubscription(forceRefresh = false): Observable<any | null> {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId =  currentUser?.role === 'customer' ? currentUser.restaurant_id : currentUser?.restaurantId;

    if (!restaurantId) {
      this.activeSubscriptionSubject.next(null);
      this.syncPlanName(null);
      return of(null);
    }

    this.loadingSubject.next(true);

    return timer(forceRefresh ? 0 : 0).pipe(
      switchMap(() => this.crudService.getRestaurantSubscriptions({ restaurantId: restaurantId.toString() })),
      switchMap((response: any) => {
        const subscriptionResponse = response.data || response || { data: [] };
        const allSubscriptions = Array.isArray(subscriptionResponse)
          ? subscriptionResponse
          : (subscriptionResponse.data || []);

        const now = new Date();
        const activeSub = allSubscriptions
          .filter((sub: any) => {
            if (sub.status === 'active') {
              if (sub.end_date) {
                return new Date(sub.end_date).getTime() > now.getTime();
              }
              return true; // no end_date means perpetual/free plan
            }
            if (sub.status === 'trial' && sub.trial_end_date) {
              return new Date(sub.trial_end_date).getTime() > now.getTime();
            }
            return false;
          })
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

        this.activeSubscriptionSubject.next(activeSub);
        this.syncPlanName(activeSub);
        this.loadingSubject.next(false);
        return of(activeSub);
      })
    );
  }

  refreshAfterPayment(): Observable<any | null> {
    return this.loadActiveSubscription(true);
  }
}