import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class PendingBillsService {
  private readonly _hasPendingBilling$ = new BehaviorSubject<boolean>(false);
  readonly hasPendingBilling$ = this._hasPendingBilling$.asObservable();

  private isRefreshing = false;
  private lastUpdated = 0;
  private readonly REFRESH_COOLDOWN_MS = 5000;

  constructor(private crudService: CrudService) {}

  get hasPendingBilling(): boolean {
    return this._hasPendingBilling$.value;
  }

  refreshPendingBills(): Observable<boolean> {
    const now = Date.now();
    if (this.isRefreshing || now - this.lastUpdated < this.REFRESH_COOLDOWN_MS) {
      return of(this._hasPendingBilling$.value);
    }

    this.isRefreshing = true;
    this.lastUpdated = now;

    return this.crudService.getActiveOrders().pipe(
      map((orders: any[]) => {
        const hasPending = Array.isArray(orders) && orders.some((o: any) => o.status === 'BILLING_REQUESTED');
        this._hasPendingBilling$.next(hasPending);
        this.isRefreshing = false;
        if (hasPending) {
          sessionStorage.setItem('customer_billing_pending', 'true');
        } else {
          sessionStorage.removeItem('customer_billing_pending');
        }
        return hasPending;
      })
    );
  }

  setPendingBilling(value: boolean): void {
    this._hasPendingBilling$.next(value);
    if (value) {
      sessionStorage.setItem('customer_billing_pending', 'true');
    } else {
      sessionStorage.removeItem('customer_billing_pending');
    }
  }
}
