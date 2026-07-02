import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private activeSubscriptionSubject = new BehaviorSubject<any | null>(null);
  public activeSubscription$ = this.activeSubscriptionSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private crudService: CrudService,
    private authService: AuthService
  ) {}

  hasActiveSubscription(): boolean {
    const sub = this.activeSubscriptionSubject.value;
    if (!sub) return false;
    const status = (sub.status || '').toLowerCase();
    return status === 'active' || status === 'trial';
  }

  getActiveSubscription(): any | null {
    return this.activeSubscriptionSubject.value;
  }

  loadActiveSubscription(forceRefresh = false): Observable<any | null> {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId;

    if (!restaurantId) {
      this.activeSubscriptionSubject.next(null);
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

        const activeSub = allSubscriptions
          .filter((sub: any) => sub.status === 'active' || sub.status === 'trial')
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

        this.activeSubscriptionSubject.next(activeSub);
        this.loadingSubject.next(false);
        return of(activeSub);
      })
    );
  }

  refreshAfterPayment(): Observable<any | null> {
    return this.loadActiveSubscription(true);
  }
}
