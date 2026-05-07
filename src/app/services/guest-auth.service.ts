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

  private readonly GUEST_ID_KEY = 'guest_id';
  private readonly CURRENT_GUEST_USER_KEY = 'currentGuestUser';

  constructor(private crudService: CrudService, private authService: AuthService) {}

  /**
   * Ensures a guest exists for the given restaurant ID.
   * If guest ID exists in localStorage, fetches customer data.
   * If not, generates new guest ID and creates customer in DB.
   */
  ensureGuestExists(restaurantId: number): Observable<GuestCustomer | null> {
    // Check if we have stored guest data
    const currentGuestUser = this.getCurrentGuestUser();
    if (currentGuestUser && currentGuestUser.customer) {
      // Return existing guest data
      this.guestSubject.next(currentGuestUser.customer);
      return of(currentGuestUser.customer);
    } else {
      // No stored guest data - create new
      return this.createNewGuest(restaurantId);
    }
  }

  /**
   * Creates a new guest customer in the DB.
   */
  private createNewGuest(restaurantId: number): Observable<GuestCustomer> {
    const guestData: any = {
      name: 'Guest',
      email: '',
      phone: '',
      avatar: '/uploads/images/avatar.avif',
      restaurantId: restaurantId
    };

    return this.crudService.createCustomerAuth(guestData).pipe(
      map(response => {
        if (response) {
          // Store the full response (includes customer data and token)
          this.storeCurrentGuestUser(response);

          // Extract customer data for the subject
          const guest = response.customer;
          // Store the customerId from the API response
          this.storeGuestId(guest.customerId);
          this.guestSubject.next(guest as GuestCustomer);
          return guest as GuestCustomer;
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
   * Stores guest ID in localStorage.
   */
  private storeGuestId(guestId: string): void {
    localStorage.setItem(this.GUEST_ID_KEY, guestId);
  }

  /**
   * Retrieves guest ID from localStorage.
   */
  getStoredGuestId(): string | null {
    const guestId = localStorage.getItem(this.GUEST_ID_KEY);
    // Return null for invalid guest IDs
    if (guestId === 'undefined' || guestId === null || guestId.trim() === '') {
      return null;
    }
    return guestId;
  }

  /**
   * Checks if a guest ID is available in localStorage.
   */
  isGuestAvailable(): boolean {
    return !!this.getStoredGuestId();
  }



  /**
   * Stores complete guest response (customer + token) in localStorage.
   */
  storeCurrentGuestUser(guestResponse: any): void {
    localStorage.setItem(this.CURRENT_GUEST_USER_KEY, JSON.stringify(guestResponse));
  }

  /**
   * Retrieves complete guest response from localStorage.
   */
  getCurrentGuestUser(): any {
    const stored = localStorage.getItem(this.CURRENT_GUEST_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Clears guest session.
   */
  clearGuest(): void {
    localStorage.removeItem(this.GUEST_ID_KEY);
    localStorage.removeItem(this.CURRENT_GUEST_USER_KEY);
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
}