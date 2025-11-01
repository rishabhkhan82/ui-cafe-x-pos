import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from './notification.service';

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userMessage?: string;
  actionRequired?: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

export interface GlobalError {
  id: string;
  type: 'network' | 'validation' | 'business' | 'system' | 'authentication';
  title: string;
  message: string;
  details?: ErrorDetails;
  timestamp: Date;
  dismissed: boolean;
  retryable?: boolean;
  retryCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorsSubject = new BehaviorSubject<GlobalError[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  private errorQueue: GlobalError[] = [];
  private maxErrors = 10;

  constructor(private notificationService: NotificationService) {}

  // ===============================
  // ERROR HANDLING METHODS
  // ===============================

  /**
   * Handle network errors
   */
  handleNetworkError(error: any, context?: string): void {
    const errorDetails = this.parseNetworkError(error);
    const globalError = this.createGlobalError('network', errorDetails, context);

    this.addError(globalError);
    this.showNotification(globalError);
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: any, context?: string): void {
    const errorDetails = this.parseValidationError(errors);
    const globalError = this.createGlobalError('validation', errorDetails, context);

    this.addError(globalError);
    this.showNotification(globalError);
  }

  /**
   * Handle business logic errors
   */
  handleBusinessError(message: string, details?: any, context?: string): void {
    const errorDetails: ErrorDetails = {
      code: 'BUSINESS_ERROR',
      message,
      details,
      timestamp: new Date(),
      userMessage: message
    };

    const globalError = this.createGlobalError('business', errorDetails, context);
    this.addError(globalError);
    this.showNotification(globalError);
  }

  /**
   * Handle system errors
   */
  handleSystemError(error: any, context?: string): void {
    const errorDetails = this.parseSystemError(error);
    const globalError = this.createGlobalError('system', errorDetails, context);

    this.addError(globalError);
    this.showNotification(globalError);
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any): void {
    const errorDetails = this.parseAuthError(error);
    const globalError = this.createGlobalError('authentication', errorDetails);

    this.addError(globalError);
    this.showNotification(globalError);
  }

  // ===============================
  // POS-SPECIFIC ERROR HANDLERS
  // ===============================

  /**
   * Handle order-related errors
   */
  handleOrderError(error: any, orderId?: string): void {
    const context = orderId ? `Order ${orderId}` : 'Order Processing';
    this.handleBusinessError(`Failed to process order: ${this.extractErrorMessage(error)}`, error, context);
  }

  /**
   * Handle payment errors
   */
  handlePaymentError(error: any, amount?: number): void {
    const context = amount ? `Payment of ₹${amount}` : 'Payment Processing';
    const message = `Payment failed: ${this.extractErrorMessage(error)}`;

    const errorDetails: ErrorDetails = {
      code: 'PAYMENT_ERROR',
      message,
      details: error,
      timestamp: new Date(),
      userMessage: 'Payment could not be processed. Please try again or contact support.',
      actionRequired: true,
      actionLabel: 'Retry Payment',
      actionCallback: () => this.retryPayment()
    };

    const globalError = this.createGlobalError('business', errorDetails, context);
    globalError.retryable = true;
    globalError.retryCallback = errorDetails.actionCallback;

    this.addError(globalError);
    this.showNotification(globalError);
  }

  /**
   * Handle inventory errors
   */
  handleInventoryError(error: any, itemName?: string): void {
    const context = itemName ? `Inventory: ${itemName}` : 'Inventory Management';
    this.handleBusinessError(`Inventory update failed: ${this.extractErrorMessage(error)}`, error, context);
  }

  /**
   * Handle menu management errors
   */
  handleMenuError(error: any, itemName?: string): void {
    const context = itemName ? `Menu Item: ${itemName}` : 'Menu Management';
    this.handleBusinessError(`Menu update failed: ${this.extractErrorMessage(error)}`, error, context);
  }

  // ===============================
  // ERROR MANAGEMENT
  // ===============================

  /**
   * Dismiss error by ID
   */
  dismissError(errorId: string): void {
    const errorIndex = this.errorQueue.findIndex(e => e.id === errorId);
    if (errorIndex !== -1) {
      this.errorQueue[errorIndex].dismissed = true;
      this.errorsSubject.next([...this.errorQueue]);
    }
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errorQueue = [];
    this.errorsSubject.next([]);
  }

  /**
   * Clear errors by type
   */
  clearErrorsByType(type: GlobalError['type']): void {
    this.errorQueue = this.errorQueue.filter(e => e.type !== type);
    this.errorsSubject.next([...this.errorQueue]);
  }

  /**
   * Get current errors
   */
  getErrors(): GlobalError[] {
    return [...this.errorQueue];
  }

  /**
   * Get active (non-dismissed) errors
   */
  getActiveErrors(): GlobalError[] {
    return this.errorQueue.filter(e => !e.dismissed);
  }

  /**
   * Retry failed operation
   */
  retryError(errorId: string): void {
    const error = this.errorQueue.find(e => e.id === errorId);
    if (error && error.retryable && error.retryCallback) {
      error.retryCallback();
      this.dismissError(errorId);
    }
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  private createGlobalError(type: GlobalError['type'], details: ErrorDetails, context?: string): GlobalError {
    return {
      id: this.generateErrorId(),
      type,
      title: this.getErrorTitle(type, context),
      message: details.userMessage || details.message,
      details,
      timestamp: new Date(),
      dismissed: false
    };
  }

  private addError(error: GlobalError): void {
    this.errorQueue.unshift(error); // Add to beginning

    // Maintain max errors limit
    if (this.errorQueue.length > this.maxErrors) {
      this.errorQueue = this.errorQueue.slice(0, this.maxErrors);
    }

    this.errorsSubject.next([...this.errorQueue]);
  }

  private showNotification(error: GlobalError): void {
    // Map error types to notification types
    const notificationType = this.mapErrorTypeToNotification(error.type);

    // Use notification service to show error
    this.notificationService[notificationType](
      error.title,
      error.message,
      {
        duration: this.getNotificationDuration(error.type),
        action: error.retryable ? {
          label: 'Retry',
          callback: () => this.retryError(error.id)
        } : undefined
      }
    );
  }

  private parseNetworkError(error: any): ErrorDetails {
    return {
      code: error.status ? `HTTP_${error.status}` : 'NETWORK_ERROR',
      message: error.message || 'Network request failed',
      details: error,
      timestamp: new Date(),
      userMessage: 'Connection failed. Please check your internet connection and try again.'
    };
  }

  private parseValidationError(errors: any): ErrorDetails {
    const errorMessages = this.flattenValidationErrors(errors);
    return {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors,
      timestamp: new Date(),
      userMessage: errorMessages.join(', ')
    };
  }

  private parseSystemError(error: any): ErrorDetails {
    return {
      code: 'SYSTEM_ERROR',
      message: error.message || 'System error occurred',
      details: error,
      timestamp: new Date(),
      userMessage: 'A system error occurred. Please contact support if this persists.'
    };
  }

  private parseAuthError(error: any): ErrorDetails {
    return {
      code: 'AUTH_ERROR',
      message: error.message || 'Authentication failed',
      details: error,
      timestamp: new Date(),
      userMessage: 'Your session has expired. Please log in again.',
      actionRequired: true,
      actionLabel: 'Login Again',
      actionCallback: () => this.redirectToLogin()
    };
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error && error.error.message) return error.error.message;
    return 'Unknown error occurred';
  }

  private flattenValidationErrors(errors: any): string[] {
    const messages: string[] = [];

    if (typeof errors === 'object') {
      Object.keys(errors).forEach(key => {
        if (Array.isArray(errors[key])) {
          messages.push(...errors[key]);
        } else if (typeof errors[key] === 'string') {
          messages.push(errors[key]);
        }
      });
    }

    return messages.length > 0 ? messages : ['Invalid data provided'];
  }

  private getErrorTitle(type: GlobalError['type'], context?: string): string {
    const titles = {
      network: 'Connection Error',
      validation: 'Validation Error',
      business: 'Business Rule Error',
      system: 'System Error',
      authentication: 'Authentication Error'
    };

    const baseTitle = titles[type] || 'Error';
    return context ? `${baseTitle} - ${context}` : baseTitle;
  }

  private mapErrorTypeToNotification(type: GlobalError['type']): 'error' | 'warning' | 'info' {
    switch (type) {
      case 'network':
      case 'system':
      case 'authentication':
        return 'error';
      case 'validation':
        return 'warning';
      case 'business':
        return 'info';
      default:
        return 'error';
    }
  }

  private getNotificationDuration(type: GlobalError['type']): number {
    switch (type) {
      case 'network':
      case 'system':
        return 10000; // 10 seconds
      case 'authentication':
        return 0; // Persistent
      case 'validation':
        return 7000; // 7 seconds
      case 'business':
        return 5000; // 5 seconds
      default:
        return 5000;
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===============================
  // ACTION CALLBACKS
  // ===============================

  private retryPayment(): void {
    // TODO: Implement payment retry logic
    console.log('Retrying payment...');
  }

  private redirectToLogin(): void {
    // TODO: Implement login redirect
    console.log('Redirecting to login...');
  }

  // ===============================
  // CONFIGURATION
  // ===============================

  /**
   * Configure error handling settings
   */
  configure(settings: {
    maxErrors?: number;
    enableNotifications?: boolean;
    enableLogging?: boolean;
  }): void {
    if (settings.maxErrors) {
      this.maxErrors = settings.maxErrors;
    }
    // Additional settings can be implemented here
  }
}