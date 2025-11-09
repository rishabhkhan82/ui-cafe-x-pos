import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { TokenResponse } from '../services/mock-data.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for auth endpoints
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request);
    }

    // Skip adding token for public endpoints
    if (this.isPublicEndpoint(request.url)) {
      return next.handle(request);
    }

    // Add authorization header
    const authRequest = this.addAuthHeader(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 errors (token expired)
        if (error.status === 401 && !request.url.includes('/auth/refresh')) {
          return this.handle401Error(request, next);
        }

        // Handle 403 errors (insufficient permissions)
        if (error.status === 403) {
          this.handle403Error();
        }

        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.getAccessToken();

    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
          'X-Client-Type': 'web',
          'X-API-Version': 'v1'
        }
      });
    }

    return request;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.getRefreshToken();

      if (refreshToken) {
        return this.refreshAccessToken(refreshToken).pipe(
          switchMap((tokenResponse: TokenResponse) => {
            this.isRefreshing = false;
            this.storeTokens(tokenResponse);
            this.refreshTokenSubject.next(tokenResponse.accessToken);

            // Retry the original request with new token
            return next.handle(this.addAuthHeader(request));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(null);
            this.handleTokenRefreshFailure();
            return throwError(() => error);
          })
        );
      } else {
        // No refresh token available
        this.handleTokenRefreshFailure();
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => next.handle(this.addAuthHeader(request)))
      );
    }
  }

  private handle403Error(): void {
    this.notificationService.error(
      'Access Denied',
      'You do not have permission to perform this action'
    );
  }

  private handleTokenRefreshFailure(): void {
    this.notificationService.error(
      'Session Expired',
      'Your session has expired. Please log in again.'
    );
    this.authService.logout();
  }

  private refreshAccessToken(refreshToken: string): Observable<TokenResponse> {
    const refreshRequest = new HttpRequest('POST', '/api/auth/refresh', {
      refreshToken
    });

    // Use a simple HTTP call to avoid interceptors
    return new Observable(observer => {
      fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          observer.next(data.data);
        } else {
          throw new Error(data.message);
        }
        observer.complete();
      })
      .catch(error => observer.error(error));
    });
  }

  private storeTokens(tokenResponse: TokenResponse): void {
    sessionStorage.setItem('accessToken', tokenResponse.accessToken);
    sessionStorage.setItem('refreshToken', tokenResponse.refreshToken);

    // Set token expiry
    const expiryTime = Date.now() + (tokenResponse.expiresIn * 1000);
    sessionStorage.setItem('tokenExpiry', expiryTime.toString());
  }

  private getAccessToken(): string | null {
    const token = sessionStorage.getItem('accessToken');
    const expiry = sessionStorage.getItem('tokenExpiry');

    if (token && expiry) {
      // Check if token is expired
      if (Date.now() > parseInt(expiry)) {
        this.clearTokens();
        return null;
      }
      return token;
    }

    return null;
  }

  private getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  private clearTokens(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('tokenExpiry');
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/refresh'
    ];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/api/public',
      '/api/health',
      '/api/docs',
      '/api/assets'
    ];
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }
}

export const authInterceptor = (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> => {
  const interceptor = new AuthInterceptor(null as any, null as any); // Will be injected by Angular
  return interceptor.intercept(req, next);
};