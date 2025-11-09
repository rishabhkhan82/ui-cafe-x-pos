import { Injectable, isDevMode } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ErrorHandlingService } from '../services/error-handling.service';
import { RequestLog } from '../services/mock-data.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  private logs: RequestLog[] = [];
  private maxLogs = 1000;

  constructor(private errorHandlingService: ErrorHandlingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Create request log entry
    const logEntry: RequestLog = {
      id: requestId,
      timestamp: startTime,
      method: request.method,
      url: request.url,
      userAgent: navigator.userAgent
    };

    // Log request in development
    if (isDevMode()) {
      this.logRequest(request, requestId);
    }

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const duration = Date.now() - startTime;
            logEntry.duration = duration;
            logEntry.status = event.status;
            logEntry.size = this.calculateResponseSize(event);

            this.addLogEntry(logEntry);

            if (isDevMode()) {
              this.logResponse(event, requestId, duration);
            }

            // Log performance metrics
            this.logPerformanceMetrics(request, duration, event.status);
          }
        },
        error: (error: HttpErrorResponse) => {
          const duration = Date.now() - startTime;
          logEntry.duration = duration;
          logEntry.status = error.status;

          this.addLogEntry(logEntry);

          if (isDevMode()) {
            this.logError(error, requestId, duration);
          }

          // Enhanced error logging
          this.logErrorDetails(error, request, duration);
        }
      })
    );
  }

  private logRequest(request: HttpRequest<any>, requestId: string): void {
    console.group(`🚀 HTTP Request [${requestId}]`);
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    console.log('Headers:', this.formatHeaders(request.headers));
    if (request.body && !this.isFileUpload(request)) {
      console.log('Body:', this.sanitizeBody(request.body));
    } else if (this.isFileUpload(request)) {
      console.log('Body: [File Upload]');
    }
    console.groupEnd();
  }

  private logResponse(response: HttpResponse<any>, requestId: string, duration: number): void {
    const statusColor = this.getStatusColor(response.status);
    const size = this.calculateResponseSize(response);

    console.group(`✅ HTTP Response [${requestId}] - ${duration}ms`);
    console.log(`Status: %c${response.status} ${response.statusText}`, `color: ${statusColor}`);
    console.log('URL:', response.url);
    console.log(`Size: ${this.formatBytes(size)}`);
    console.log('Headers:', this.formatHeaders(response.headers));
    if (response.body && !this.isBinaryResponse(response)) {
      console.log('Body:', this.sanitizeBody(response.body));
    } else if (this.isBinaryResponse(response)) {
      console.log('Body: [Binary Data]');
    }
    console.groupEnd();
  }

  private logError(error: HttpErrorResponse, requestId: string, duration: number): void {
    console.group(`❌ HTTP Error [${requestId}] - ${duration}ms`);
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('URL:', error.url);
    console.error('Message:', error.message);
    if (error.error && typeof error.error === 'object') {
      console.error('Error Details:', error.error);
    } else {
      console.error('Error:', error.error);
    }
    console.groupEnd();
  }

  private logPerformanceMetrics(request: HttpRequest<any>, duration: number, status: number): void {
    // Log slow requests (> 2 seconds)
    if (duration > 2000) {
      console.warn(`🐌 Slow Request: ${request.method} ${request.url} took ${duration}ms`);
    }

    // Log large responses (> 1MB)
    // Note: Size calculation would need to be implemented

    // Could send metrics to monitoring service
    // this.monitoringService.recordApiCall(request.url, duration, status);
  }

  private logErrorDetails(error: HttpErrorResponse, request: HttpRequest<any>, duration: number): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      status: error.status,
      duration,
      userAgent: navigator.userAgent,
      error: error.error,
      message: error.message
    };

    // In production, send to error monitoring service
    console.error('API Error Details:', errorLog);

    // Send to error handling service for aggregation
    this.errorHandlingService.handleNetworkError(error, request.url);
  }

  private formatHeaders(headers: any): object {
    const formatted: any = {};
    headers.keys().forEach((key: string) => {
      if (!this.isSensitiveHeader(key)) {
        formatted[key] = headers.get(key);
      } else {
        formatted[key] = '[REDACTED]';
      }
    });
    return formatted;
  }

  private sanitizeBody(body: any): any {
    if (!body || this.isFileUpload({ body } as any)) return body;

    // Create a deep copy to avoid modifying original
    const sanitized = JSON.parse(JSON.stringify(body));

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard', 'cvv'];
    this.removeSensitiveFields(sanitized, sensitiveFields);

    return sanitized;
  }

  private removeSensitiveFields(obj: any, sensitiveFields: string[]): void {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach(key => {
      if (sensitiveFields.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        this.removeSensitiveFields(obj[key], sensitiveFields);
      }
    });
  }

  private isSensitiveHeader(headerName: string): boolean {
    const sensitiveHeaders = [
      'authorization',
      'x-api-key',
      'cookie',
      'x-auth-token',
      'proxy-authorization'
    ];
    return sensitiveHeaders.includes(headerName.toLowerCase());
  }

  private isFileUpload(request: HttpRequest<any>): boolean {
    return request.body instanceof FormData;
  }

  private isBinaryResponse(response: HttpResponse<any>): boolean {
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/octet-stream') ||
           contentType.includes('application/pdf') ||
           contentType.includes('image/');
  }

  private calculateResponseSize(response: HttpResponse<any>): number {
    if (response.body) {
      if (typeof response.body === 'string') {
        return response.body.length;
      } else if (response.body instanceof ArrayBuffer) {
        return response.body.byteLength;
      } else if (typeof response.body === 'object') {
        return JSON.stringify(response.body).length;
      }
    }
    return 0;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'orange';
    if (status >= 400 && status < 500) return 'red';
    if (status >= 500) return 'darkred';
    return 'black';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addLogEntry(entry: RequestLog): void {
    this.logs.push(entry);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  // Public methods for accessing logs
  getLogs(): RequestLog[] {
    return [...this.logs];
  }

  getLogsByStatus(status: number): RequestLog[] {
    return this.logs.filter(log => log.status === status);
  }

  getSlowRequests(thresholdMs: number = 2000): RequestLog[] {
    return this.logs.filter(log => log.duration && log.duration > thresholdMs);
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const loggingInterceptor = (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> => {
  const interceptor = new LoggingInterceptor(null as any); // Will be injected by Angular
  return interceptor.intercept(req, next);
};