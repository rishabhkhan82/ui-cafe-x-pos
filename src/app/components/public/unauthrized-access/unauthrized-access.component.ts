import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-unauthrized-access',
  standalone: true,
  templateUrl: './unauthrized-access.component.html',
  styleUrl: './unauthrized-access.component.css'
})
export class UnauthrizedAccessComponent {

  private router = inject(Router);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  pageTitle = 'Unauthorized Access';
  message = 'You do not have permission to view this page.';
  isSubscriptionBlock = false;

  constructor() {
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'subscription_inactive') {
      this.isSubscriptionBlock = true;
      this.pageTitle = 'Restaurant Unavailable';
      this.message = 'This restaurant is currently unavailable. Please contact the staff for assistance.';
    } else {
      sessionStorage.clear();
      this.authService.currentUserSubject.next(null);
    }
  }

  goBack(): void {
    if (this.isSubscriptionBlock) {
      this.router.navigate(['/admin/login']);
    } else {
      this.router.navigate(['/admin/login']);
    }
  }
}
