import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { GuestAuthService } from '../services/guest-auth.service';
import { GuestUser } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CustomerGuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private guestAuthService: GuestAuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const currentUser = this.authService.getCurrentUser();
    const isDashboardRoute = route.routeConfig?.path?.startsWith('dashboard');

    // Allow dashboard access always for guest creation (no login required)
    if (isDashboardRoute) {
      return true;
    }

    // For other customer routes, check if guest user exists in localStorage
    const storedGuestUser = this.guestAuthService.getStoredGuestUser();
    if (!storedGuestUser || storedGuestUser.role !== 'customer') {
      // Redirect to dashboard to create guest
      this.router.navigate(['/customer/dashboard/1/0']);
      return false;
    }

    // Set the current user from stored guest user if not already set
    if (!currentUser) {
      const userFromGuest = {
        id: storedGuestUser.id,
        username: storedGuestUser.username,
        password: storedGuestUser.password,
        name: storedGuestUser.name,
        email: storedGuestUser.email,
        phone: storedGuestUser.phone,
        role: 'customer' as const,
        user_type: 'customer' as const,
        avatar: storedGuestUser.avatar,
        restaurant_id: storedGuestUser.restaurant_id,
        member_since: storedGuestUser.member_since,
        created_at: storedGuestUser.created_at,
        updated_at: storedGuestUser.updated_at,
        is_active: storedGuestUser.is_active
      };
      this.authService.setCurrentUser(userFromGuest);
    }

    return true;
  }

  // Helper method to get stored guest ID (if needed)
  private getStoredGuestId(): string | null {
    return localStorage.getItem('guest_id');
  }
}