import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { LoginRequest } from '../../../services/mock-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  private loadingSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    // Check for existing user in sessionStorage and clear it on component initialization
    if (sessionStorage.getItem('currentUser')) {
      this.authService.logout();
    }
  }

  ngOnInit(): void {
    // Subscribe to global loading state
    this.loadingSubscription = this.loadingService.loading$.subscribe(
      loading => this.isLoading = loading
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.loadingSubscription.unsubscribe();
  }

  navigateToCustomerLogin() {
    this.router.navigate(['/customer/login']);
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    const credentials: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.authService.loginApi(credentials).subscribe({
      next: (response) => {
        // Store user data and token
        this.authService.setCurrentUser(response.user);
        sessionStorage.setItem('currentUser', JSON.stringify(response.user));
        if (response.accessToken) {
          sessionStorage.setItem('accessToken', response.accessToken);
        }
        if (response.refreshToken) {
          sessionStorage.setItem('refreshToken', response.refreshToken);
        }

        // Redirect based on user role
        const user = response.user;
        switch (user.role) {
          case 'platform_owner':
            this.router.navigate(['/platform-dashboard']);
            break;
          case 'restaurant_owner':
            this.router.navigate(['/restaurant-owner-dashboard']);
            break;
          case 'restaurant_manager':
            this.router.navigate(['/restaurant-manager-dashboard']);
            break;
          case 'kitchen_manager':
            this.router.navigate(['/kitchen-manager-display']);
            break;
          case 'cashier':
            this.router.navigate(['/cashier-dashboard']);
            break;
          case 'waiter':
            this.router.navigate(['/waiter-dashboard']);
            break;
          default:
            this.errorMessage = 'Invalid user role for admin access';
            return;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}