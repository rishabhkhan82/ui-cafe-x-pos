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
    const restaurantId = route.params['restaurantId'] ? +route.params['restaurantId'] : 1; // Default to 1 if not present

    // Allow dashboard access always for guest creation (no login required)
    if (isDashboardRoute) {
      return true;
    }

    // For other customer routes, check if guest user exists in localStorage for the restaurant
    const currentGuestUser = this.guestAuthService.getCurrentGuestUser(restaurantId);
    if (!currentGuestUser || !currentGuestUser.customer) {
      // Redirect to dashboard to create guest for the restaurant
      const tableNumber = route.params['tableNumber'] ? +route.params['tableNumber'] : 0;
      this.router.navigate([`/customer/dashboard/${restaurantId}/${tableNumber}`]);
      return false;
    }

    // Set the current user from current guest user if not already set
    if (!currentUser) {
      const customer = currentGuestUser.customer;
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
        restaurant_id: customer.restaurant?.id?.toString() || '',
        member_since: customer.createdAt ? new Date(customer.createdAt) : new Date(),
        created_at: customer.createdAt ? new Date(customer.createdAt) : new Date(),
        updated_at: customer.updatedAt ? new Date(customer.updatedAt) : new Date(),
        is_active: 'true'
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