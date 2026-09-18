import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoyaltyPopupData {
  pointsEarned: number;
  totalPoints: number;
  orderId?: string;
  invoiceId?: string;
}

@Injectable({ providedIn: 'root' })
export class LoyaltyPopupService {
  private popupSubject = new BehaviorSubject<LoyaltyPopupData | null>(null);
  popup$: Observable<LoyaltyPopupData | null> = this.popupSubject.asObservable();

  show(data: LoyaltyPopupData): void {
    this.popupSubject.next(data);
  }

  hide(): void {
    this.popupSubject.next(null);
  }
}
