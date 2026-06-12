import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PendingordersService {
  private readonly _pendingCount$ = new BehaviorSubject<number>(0);
  readonly pendingCount$ = this._pendingCount$.asObservable();

  constructor() { }

  updateCount(count: number): void {
    this._pendingCount$.next(count);
  }

  get currentCount(): number {
    return this._pendingCount$.value;
  }
}
