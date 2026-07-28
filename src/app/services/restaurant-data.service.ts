import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { RealtimeService } from './realtime.service';
import { AuthService } from './auth.service';
import type { Restaurant } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantDataService {
  private restaurantSubject = new BehaviorSubject<Restaurant | null>(null);
  public restaurant$ = this.restaurantSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private crudService: CrudService,
    private authService: AuthService,
    private realtimeService: RealtimeService
  ) {
    this.realtimeService.restaurant$.subscribe((data: any) => {
      if (data && data.id != null) {
        this.restaurantSubject.next(data);
      }
    });
  }

  getCurrentRestaurant(): Restaurant | null {
    return this.restaurantSubject.value;
  }

  loadRestaurant(forceRefresh = false): Observable<Restaurant | null> {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId || currentUser?.restaurant_id;

    const normalizedRestaurantId = String(restaurantId || '').trim();

    if (!normalizedRestaurantId || normalizedRestaurantId === 'null' || normalizedRestaurantId === 'undefined') {
      this.restaurantSubject.next(null);
      return of(null);
    }

    this.loadingSubject.next(true);

    return timer(forceRefresh ? 0 : 0).pipe(
      switchMap(() => this.crudService.getRestaurantById(normalizedRestaurantId)),
      switchMap((response: any) => {
        const restaurant = response.data || response;
        this.restaurantSubject.next(restaurant);
        this.loadingSubject.next(false);
        return of(restaurant);
      })
    );
  }
}
