import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.css']
})
export class CustomerLoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate login delay
    setTimeout(() => {
      // For customer login, we'll use a different approach
      // Since AuthService currently uses username, we'll adapt
      const success = this.authService.login(this.email, this.password);

      if (success) {
        const user = this.authService.getCurrentUser();
        if (user && user.role === 'customer') {
          this.router.navigate(['/customer/menu']);
        } else {
          this.errorMessage = 'This login is for customers only';
        }
      } else {
        this.errorMessage = 'Invalid email or password';
      }

      this.isLoading = false;
    }, 1000);
  }

  navigateToAdminLogin() {
    this.router.navigate(['/admin/login']);
  }
}