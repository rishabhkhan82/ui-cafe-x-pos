import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { AuthService } from './auth.service';
import { GuestUser } from '../interfaces';

export interface GuestCustomer {
  id?: number;
  customerId: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  restaurant?: any;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GuestAuthService {
  private guestSubject = new BehaviorSubject<GuestCustomer | null>(null);
  public guest$ = this.guestSubject.asObservable();

  private readonly GUEST_ID_KEY_PREFIX = 'guest_id_';
  private readonly CURRENT_GUEST_USER_KEY_PREFIX = 'currentGuestUser_';

  constructor(private crudService: CrudService, private authService: AuthService) {}

  /**
   * Ensures a guest exists for the given restaurant ID.
   * If guest ID exists in localStorage, fetches customer data.
   * If not, generates new guest ID and creates customer in DB.
   */
  ensureGuestExists(restaurantId: number): Observable<any> {
    // Check if we have stored guest data for this restaurant
    const currentGuestUser = this.getCurrentGuestUser(restaurantId);
    if (currentGuestUser && currentGuestUser.customer) {
      // Return existing guest data
      this.guestSubject.next(currentGuestUser.customer);
      return of(currentGuestUser);
    } else {
      // No stored guest data for this restaurant - create new
      return this.createNewGuest(restaurantId);
    }
  }

  /**
   * Creates a new guest customer in the DB.
   */
  private createNewGuest(restaurantId: number): Observable<any> {
    const guestData: any = {
      name: 'Guest',
      email: '',
      phone: '',
      avatar: '/uploads/images/guest/guest-default-avatar.jpg',
      restaurantId: restaurantId
    };

    return this.crudService.createCustomerAuth(guestData).pipe(
      map(response => {
        if (response) {
          // Store the full response (includes customer data and token) scoped to restaurant
          this.storeCurrentGuestUser(response, restaurantId);

          // Extract customer data for the subject
          const guest = response.customer;
          // Store the customerId from the API response scoped to restaurant
          this.storeGuestId(guest.customerId, restaurantId);
          this.guestSubject.next(guest as GuestCustomer);
          return response; // Return full response including accessToken
        } else {
          throw new Error('Failed to create guest customer');
        }
      }),
      catchError(error => {
        console.error('Error creating guest:', error);
        throw error;
      })
    );
  }



  /**
   * Stores guest ID in localStorage scoped to restaurant.
   */
  private storeGuestId(guestId: string, restaurantId: number): void {
    localStorage.setItem(`${this.GUEST_ID_KEY_PREFIX}${restaurantId}`, guestId);
  }

  /**
   * Retrieves guest ID from localStorage scoped to restaurant.
   */
  getStoredGuestId(restaurantId: number): string | null {
    const guestId = localStorage.getItem(`${this.GUEST_ID_KEY_PREFIX}${restaurantId}`);
    // Return null for invalid guest IDs
    if (guestId === 'undefined' || guestId === null || guestId.trim() === '') {
      return null;
    }
    return guestId;
  }

  /**
   * Checks if a guest ID is available in localStorage for the restaurant.
   */
  isGuestAvailable(restaurantId: number): boolean {
    return !!this.getStoredGuestId(restaurantId);
  }



  /**
   * Stores complete guest response (customer + token) in localStorage scoped to restaurant.
   */
  storeCurrentGuestUser(guestResponse: any, restaurantId: number): void {
    const key = `${this.CURRENT_GUEST_USER_KEY_PREFIX}${restaurantId}`;
    console.log('Storing guest response in localStorage:', key, guestResponse);

    // Remove old data first
    localStorage.removeItem(key);

    try {
      const jsonString = JSON.stringify(guestResponse);
      console.log('JSON string length:', jsonString.length);
      localStorage.setItem(key, jsonString);

      const stored = localStorage.getItem(key);
      console.log('Verification - stored item exists:', !!stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed stored data customer email:', parsed.customer?.email);
        console.log('Parsed stored data accessToken starts with:', parsed.accessToken?.substring(0, 20));
      }
    } catch (error) {
      console.error('Error storing guest data:', error);
    }
  }

  /**
   * Retrieves complete guest response from localStorage scoped to restaurant.
   */
  getCurrentGuestUser(restaurantId: number): any {
    const stored = localStorage.getItem(`${this.CURRENT_GUEST_USER_KEY_PREFIX}${restaurantId}`);
    const guestData = stored ? JSON.parse(stored) : null;

    // Update the subject with the retrieved guest data if it exists
    if (guestData && guestData.customer) {
      this.guestSubject.next(guestData.customer);
    }

    return guestData;
  }

  /**
   * Clears guest session for all restaurants.
   */
  clearGuest(): void {
    // Clear all guest-related localStorage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.GUEST_ID_KEY_PREFIX) || key.startsWith(this.CURRENT_GUEST_USER_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    // Clear current restaurant context
    sessionStorage.removeItem('current_customer_restaurant_id');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('current_customer_table_no');

    this.guestSubject.next(null);
  }


  getCurrentGuest(): GuestCustomer | null {
    return this.guestSubject.value;
  }

  /**
   * Checks if guest exists.
   */
  hasGuest(): boolean {
    return this.getCurrentGuest() !== null;
  }

  /**
   * Gets the current restaurant ID from session storage.
   */
  getCurrentRestaurantId(): number | null {
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');
    return restaurantId ? parseInt(restaurantId) : null;
  }

  /**
   * Sets the current restaurant context and updates the access token.
   */
  setCurrentRestaurantContext(restaurantId: number): void {
    sessionStorage.setItem('current_customer_restaurant_id', restaurantId.toString());

    // Get the guest user for this restaurant and set the token
    const guestUser = this.getCurrentGuestUser(restaurantId);
    if (guestUser && guestUser.accessToken) {
      sessionStorage.setItem('accessToken', guestUser.accessToken);
      console.log('Set access token for restaurant', restaurantId);
    } else {
      console.warn('No guest user or token found for restaurant', restaurantId);
    }

    // Also store the table number in sessionStorage for navigation
    const tableNo = localStorage.getItem(`guest_table_no_${restaurantId}`);
    if (tableNo) {
      sessionStorage.setItem('current_customer_table_no', tableNo);
      console.log('Set table number in session for restaurant', restaurantId, ':', tableNo);
    }
  }

  /**
   * Gets the current table number from session storage.
   */
  getCurrentTableNo(): string | null {
    return sessionStorage.getItem('current_customer_table_no');
  }
}