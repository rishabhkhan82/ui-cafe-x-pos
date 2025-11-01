import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {
    // Check for existing user in localStorage and clear it on component initialization
    if (localStorage.getItem('currentUser')) {
      this.authService.logout();
    }
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

    // Simulate login delay
    setTimeout(() => {
      const success = this.authService.login(this.username, this.password);

      if (success) {
        const user = this.authService.getCurrentUser();
        if (user) {
          // Redirect based on user role
          debugger;
          switch (user.role) {
            case 'platform_owner':
              this.router.navigate(['/admin/platform-owner/dashboard']);
              break;
            case 'restaurant_owner':
              this.router.navigate(['/admin/restaurant-owner/dashboard']);
              break;
            case 'restaurant_manager':
              this.router.navigate(['/admin/restaurant-manager/dashboard']);
              break;
            case 'kitchen_manager':
              this.router.navigate(['/admin/kitchen-manager/display']);
              break;
            case 'cashier':
              this.router.navigate(['/admin/cashier/dashboard']);
              break;
            case 'waiter':
              this.router.navigate(['/admin/waiter/dashboard']);
              break;
            default:
              this.errorMessage = 'Invalid user role for admin access';
          }
        }
      } else {
        this.errorMessage = 'Invalid username or password';
      }

      this.isLoading = false;
    }, 1000);
  }
}