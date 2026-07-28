import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  identifier = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  private loadingSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingSubscription = this.loadingService.loading$.subscribe(
      loading => this.isLoading = loading
    );
  }

  ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }

  onSubmit() {
    if (!this.identifier) {
      this.errorMessage = 'Please enter your email or username';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.identifier).subscribe({
      next: () => {
        this.successMessage = 'If an account exists, the password has been sent to your email.';
        this.identifier = '';
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Something went wrong. Please try again.';
        this.successMessage = '';
        this.isLoading = false;
      }
    });
  }

  goBackToLogin() {
    this.router.navigate(['/admin/login']);
  }
}
