import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class PendingordersService {
  private readonly _pendingCount$ = new BehaviorSubject<number>(0);
  readonly pendingCount$ = this._pendingCount$.asObservable();

  private isRefreshing = false;
  private lastUpdated = 0;
  private readonly REFRESH_COOLDOWN_MS = 5000;

  constructor(
    private crudService: CrudService
  ) { }

  updateCount(count: number): void {
    this._pendingCount$.next(count);
  }

  get currentCount(): number {
    return this._pendingCount$.value;
  }

  refreshCount(): Observable<number> {
    const now = Date.now();
    if (this.isRefreshing || now - this.lastUpdated < this.REFRESH_COOLDOWN_MS) {
      return of(this._pendingCount$.value);
    }

    this.isRefreshing = true;
    this.lastUpdated = now;

    return this.crudService.getActiveOrders().pipe(
      map((orders: any[]) => {
        const count = Array.isArray(orders) ? orders.length : 0;
        this._pendingCount$.next(count);
        this.isRefreshing = false;
        return count;
      })
    );
  }
}
