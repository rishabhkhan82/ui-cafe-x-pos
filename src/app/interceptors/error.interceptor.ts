import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, retryWhen, mergeMap, delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorHandlingService } from '../services/error-handling.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error, request);
      })
    );
  }

  private applyRetryLogic(request: HttpRequest<any>) {
    // Only retry for GET requests and specific endpoints
    if (request.method !== 'GET' || this.shouldNotRetry(request)) {
      return (source: Observable<any>) => source;
    }

    return retry({
      count: 2,
      delay: (error, retryIndex) => {
        if (this.isRetryableError(error)) {
          console.warn(`Retrying request (attempt ${retryIndex + 1}):`, request.url);
          return timer(1000 * retryIndex); // Exponential backoff
        }
        return throwError(() => error);
      }
    });
  }

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>): Observable<never> {
    const errorContext = this.getErrorContext(error, request);
    const errorDetails = this.parseErrorDetails(error);

    // Categorize error type
    const errorType = this.categorizeError(error);

    // Handle different error types
    switch (errorType) {
      case 'network':
        this.errorHandlingService.handleNetworkError(error, request.url);
        break;
      case 'authentication':
        this.errorHandlingService.handleAuthError(error);
        break;
      case 'business':
        this.errorHandlingService.handleBusinessError(
          errorDetails.message,
          errorDetails.details,
          request.url
        );
        break;
      case 'validation':
        this.errorHandlingService.handleValidationError(errorDetails.details, request.url);
        break;
      default:
        this.handleGenericError(error, errorContext);
    }

    // Log error for monitoring
    this.logError(error, request, errorContext);

    return throwError(() => error);
  }

  private categorizeError(error: HttpErrorResponse): 'network' | 'authentication' | 'authorization' | 'business' | 'validation' | 'system' {
    if (!navigator.onLine || error.status === 0) {
      return 'network';
    }

    switch (error.status) {
      case 401:
        return 'authentication';
      case 403:
        return 'authorization';
      case 400:
        return this.isValidationError(error) ? 'validation' : 'business';
      case 404:
      case 409:
      case 422:
        return 'business';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'system';
      default:
        return 'system';
    }
  }

  private parseErrorDetails(error: HttpErrorResponse): { message: string; details: any; code?: string } {
    let message = 'An unexpected error occurred';
    let details = error;
    let code: string | undefined;

    if (error.error) {
      if (typeof error.error === 'string') {
        message = error.error;
      } else if (error.error.message) {
        message = error.error.message;
        code = error.error.code;
        details = error.error.details || error.error;
      } else if (error.error.error) {
        message = error.error.error;
        details = error.error;
      }
    } else if (error.message) {
      message = error.message;
    } else {
      message = `HTTP ${error.status}: ${error.statusText}`;
    }

    return { message, details, code };
  }

  private getErrorContext(error: HttpErrorResponse, request: HttpRequest<any>): string {
    const endpoint = request.url.split('/').pop() || 'unknown';
    const method = request.method;
    return `${method} ${endpoint}`;
  }

  private handleGenericError(error: HttpErrorResponse, context: string): void {
    const message = this.getUserFriendlyMessage(error);
    this.notificationService.error('Error', message);
  }

  private getUserFriendlyMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timed out. Please try again.';
      case 429:
        return 'Too many requests. Please wait and try again.';
      case 500:
        return 'Server error occurred. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  private isValidationError(error: HttpErrorResponse): boolean {
    return error.status === 400 && error.error && (
      error.error.validationErrors ||
      error.error.fieldErrors ||
      (typeof error.error === 'object' && Object.keys(error.error).some(key =>
        Array.isArray(error.error[key]) || typeof error.error[key] === 'string'
      ))
    );
  }

  private isRetryableError(error: any): boolean {
    // Retry for network errors, 5xx server errors, and specific 4xx errors
    return !navigator.onLine ||
           error.status === 0 ||
           error.status === 408 ||
           error.status === 429 ||
           (error.status >= 500 && error.status < 600);
  }

  private shouldNotRetry(request: HttpRequest<any>): boolean {
    // Don't retry for auth endpoints, POST/PUT/DELETE requests, or file uploads
    const noRetryEndpoints = ['/auth/', '/login', '/register'];
    const isAuthEndpoint = noRetryEndpoints.some(endpoint => request.url.includes(endpoint));
    const isMutationRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
    const isFileUpload = request.body instanceof FormData;

    return isAuthEndpoint || isMutationRequest || isFileUpload;
  }

  private logError(error: HttpErrorResponse, request: HttpRequest<any>, context: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      url: request.url,
      method: request.method,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      userAgent: navigator.userAgent,
      pageUrl: window.location.href
    };

    // In production, send to logging service
    console.error('API Error:', logData);

    // Could send to monitoring service
    // this.monitoringService.logError(logData);
  }
}

export const errorInterceptor = (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> => {
  const interceptor = new ErrorInterceptor(null as any, null as any, null as any, null as any); // Will be injected by Angular
  return interceptor.intercept(req, next);
};