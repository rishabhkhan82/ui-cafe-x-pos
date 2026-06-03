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

    console.log('CustomerGuestGuard activated for route:', route.routeConfig?.path);

    // Allow dashboard access always for guest creation (no login required)
    if (isDashboardRoute) {
      console.log('Allowing dashboard access');
      return true;
    }

    // Get the current restaurant context from guest auth service
    let restaurantId = this.guestAuthService.getCurrentRestaurantId();
    console.log('Current restaurant context:', restaurantId);

    let currentGuestUser = null;

    // If we have a restaurant context, use that specific guest user
    if (restaurantId) {
      currentGuestUser = this.guestAuthService.getCurrentGuestUser(restaurantId);
      console.log('Found guest user for current restaurant', restaurantId, ':', currentGuestUser);
    } else {
      // Fallback: Check all possible restaurant IDs (1-10) or look for any guest user
      console.log('No restaurant context found, searching for any guest user...');
      for (let i = 1; i <= 10; i++) {
        const guestUser = this.guestAuthService.getCurrentGuestUser(i);
        if (guestUser && guestUser.customer) {
          currentGuestUser = guestUser;
          restaurantId = i;
          console.log('Found guest user for restaurant', restaurantId);
          break;
        }
      }
    }

    if (!currentGuestUser || !currentGuestUser.customer) {
      console.log('No guest user found, redirecting to dashboard');
      // Redirect to dashboard to create guest for the restaurant
      // Use stored context if available, otherwise defaults
      const restaurantId = this.guestAuthService.getCurrentRestaurantId() || 1;
      const tableNo = this.guestAuthService.getCurrentTableNo() || '0';
      this.router.navigate(['/customer/dashboard', restaurantId.toString(), tableNo]);
      return false;
    }

    // Set the current user from current guest user if not already set
    if (!currentUser) {
      const customer = currentGuestUser.customer;
      const accessToken = currentGuestUser.accessToken;

      console.log('Setting current user from guest:', customer.customerId, 'restaurant:', restaurantId, 'with token:', !!accessToken);

      const userFromGuest = {
        id: customer.customerId,
        username: customer.customerId,
        password: '',
        name: customer.name || 'Guest',
        email: customer.email || '',
        phone: customer.phone || '',
        role: 'customer' as const,
        user_type: 'customer' as const,
        avatar: customer.avatar || '',
        restaurant_id: restaurantId?.toString() || '',
        member_since: customer.createdAt ? new Date(customer.createdAt) : new Date(),
        created_at: customer.createdAt ? new Date(customer.createdAt) : new Date(),
        updated_at: customer.updatedAt ? new Date(customer.updatedAt) : new Date(),
        is_active: 'true'
      };
      this.authService.setCurrentUser(userFromGuest);

      // Also set the access token for API calls
      if (accessToken) {
        console.log('Setting guest access token for restaurant', restaurantId);
        this.authService.setGuestAccessToken(accessToken);
      } else {
        console.log('No access token found in guest user data for restaurant', restaurantId);
      }
    } else {
      console.log('Current user already exists:', currentUser.id, 'for restaurant:', currentUser.restaurant_id);
      // Even if current user exists, make sure we have the token set for the current restaurant
      const accessToken = currentGuestUser.accessToken;
      if (accessToken && !sessionStorage.getItem('accessToken')) {
        console.log('Setting missing access token for existing user, restaurant:', restaurantId);
        this.authService.setGuestAccessToken(accessToken);
      }
    }

    return true;
  }

  // Helper method to get stored guest ID (if needed)
  private getStoredGuestId(): string | null {
    return localStorage.getItem('guest_id');
  }
}