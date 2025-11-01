import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { CachingService } from '../services/caching.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private requestStartTimes = new Map<string, number>();

  constructor(
    private loadingService: LoadingService,
    private cachingService: CachingService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for certain endpoints
    if (this.shouldSkipLoading(request)) {
      return next.handle(request);
    }

    // Skip loading for cached requests
    if (this.isCachedRequest(request)) {
      return next.handle(request);
    }

    // Skip loading for quick requests
    if (this.isQuickRequest(request)) {
      return next.handle(request);
    }

    const requestId = this.generateRequestId();
    this.requestStartTimes.set(requestId, Date.now());

    this.activeRequests++;
    this.loadingService.show();

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Cache successful responses if appropriate
          this.cacheResponseIfNeeded(request, event);
        }
      }),
      finalize(() => {
        this.activeRequests--;
        this.requestStartTimes.delete(requestId);

        if (this.activeRequests === 0) {
          this.loadingService.hide();
        }
      })
    );
  }

  private shouldSkipLoading(request: HttpRequest<any>): boolean {
    // Define endpoints that should not show loading indicator
    const skipEndpoints = [
      '/api/notifications', // Real-time notifications
      '/api/realtime', // WebSocket related
      '/api/health', // Health checks
      '/api/metrics', // Monitoring endpoints
      '/api/ping', // Ping/health checks
      '/api/ws', // WebSocket connections
      '/api/sse' // Server-sent events
    ];

    return skipEndpoints.some(endpoint => request.url.includes(endpoint));
  }

  private isQuickRequest(request: HttpRequest<any>): boolean {
    // Define quick requests that don't need loading indicator
    const quickEndpoints = [
      '/api/user/profile', // User profile data
      '/api/settings', // Settings data
      '/api/lookup', // Lookup/reference data
      '/api/enums', // Enum values
      '/api/constants' // Constant values
    ];

    const isQuickEndpoint = quickEndpoints.some(endpoint => request.url.includes(endpoint));
    const isSmallPayload = !request.body || JSON.stringify(request.body).length < 1000;

    return isQuickEndpoint || (request.method === 'GET' && isSmallPayload);
  }

  private isCachedRequest(request: HttpRequest<any>): boolean {
    // Check if this request can be served from cache
    if (request.method !== 'GET') return false;

    // Define cacheable endpoints
    const cacheableEndpoints = [
      '/api/menu',
      '/api/inventory',
      '/api/settings',
      '/api/user/profile'
    ];

    const isCacheable = cacheableEndpoints.some(endpoint => request.url.includes(endpoint));
    if (!isCacheable) return false;

    // Check if we have a cached version
    const cacheKey = this.generateCacheKey(request);
    return this.cachingService.has(cacheKey);
  }

  private cacheResponseIfNeeded(request: HttpRequest<any>, response: HttpResponse<any>): void {
    if (request.method !== 'GET' || response.status !== 200) return;

    // Define endpoints that should be cached
    const cacheableEndpoints = [
      '/api/menu',
      '/api/inventory',
      '/api/settings'
    ];

    const shouldCache = cacheableEndpoints.some(endpoint => request.url.includes(endpoint));
    if (!shouldCache) return;

    const cacheKey = this.generateCacheKey(request);
    const ttl = this.getCacheTTL(request.url);

    this.cachingService.set(cacheKey, response.body, ttl);
  }

  private generateCacheKey(request: HttpRequest<any>): string {
    // Create a unique cache key from URL and params
    const url = request.url.split('?')[0]; // Remove query params
    const params = request.params.toString();
    const bodyHash = request.body ? this.hashString(JSON.stringify(request.body)) : '';

    return `${request.method}_${url}_${params}_${bodyHash}`;
  }

  private getCacheTTL(url: string): number {
    // Define TTL based on endpoint type
    if (url.includes('/menu')) return 10 * 60 * 1000; // 10 minutes
    if (url.includes('/inventory')) return 2 * 60 * 1000; // 2 minutes
    if (url.includes('/settings')) return 30 * 60 * 1000; // 30 minutes
    return 5 * 60 * 1000; // 5 minutes default
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

export const loadingInterceptor = (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> => {
  const interceptor = new LoadingInterceptor(null as any, null as any); // Will be injected by Angular
  return interceptor.intercept(req, next);
};