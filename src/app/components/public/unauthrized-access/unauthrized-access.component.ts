import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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

  pageTitle = 'Unauthorized Access';
  message = 'You do not have permission to view this page.';

  constructor() {
    sessionStorage.clear();
    this.authService.currentUserSubject.next(null);
  }

  goBack(): void {
    this.router.navigate(['/admin/login']);
  }
}
