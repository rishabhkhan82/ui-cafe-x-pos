import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LoyaltyPopupService } from '../../../services/loyalty-popup.service';

@Component({
  selector: 'app-loyalty-earned-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loyalty-earned-popup.component.html',
  styleUrls: ['./loyalty-earned-popup.component.css']
})
export class LoyaltyEarnedPopupComponent implements OnInit, OnDestroy {
  private loyaltyPopupService = inject(LoyaltyPopupService);
  private router = inject(Router);
  private subscription: Subscription = new Subscription();

  isVisible = false;
  pointsEarned = 0;
  totalPoints = 0;
  orderId?: string;
  invoiceId?: string;

  ngOnInit(): void {
    this.subscription = this.loyaltyPopupService.popup$.subscribe(data => {
      if (data) {
        this.pointsEarned = data.pointsEarned;
        this.totalPoints = data.totalPoints;
        this.orderId = data.orderId;
        this.invoiceId = data.invoiceId;
        this.isVisible = true;
      } else {
        this.isVisible = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  dismiss(): void {
    this.isVisible = false;
    this.loyaltyPopupService.hide();
  }

  viewLoyalty(): void {
    this.dismiss();
    this.router.navigate(['/customer/offers']);
  }
}
