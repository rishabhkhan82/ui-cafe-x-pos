import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-unauthrized-access',
  standalone: true,
  templateUrl: './unauthrized-access.component.html',
  styleUrl: './unauthrized-access.component.css'
})
export class UnauthrizedAccessComponent {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  pageTitle = 'Unauthorized Access';
  message = 'You do not have permission to view this page.';
  isSubscriptionBlock = false;

  constructor() {
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'subscription_inactive') {
      this.isSubscriptionBlock = true;
      this.pageTitle = 'Restaurant Unavailable';
      this.message = 'This restaurant is currently unavailable. Please contact the staff for assistance.';
    }
  }

  goBack(): void {
    this.location.back();
  }
}
