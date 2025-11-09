import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { CacheEntry, CacheConfig } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class CachingService {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig = {
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
    enableCompression: false,
    storageType: 'memory'
  };

  private cacheStatsSubject = new BehaviorSubject({
    totalEntries: 0,
    totalHits: 0,
    totalMisses: 0,
    hitRate: 0
  });

  public cacheStats$ = this.cacheStatsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
    this.startCleanupInterval();
  }

  // ===============================
  // CACHE OPERATIONS
  // ===============================

  /**
   * Get data from cache or execute function if not cached
   */
  get<T>(key: string, fetchFn?: () => Observable<T>, ttl?: number): Observable<T> {
    const entry = this.cache.get(key);

    if (entry && !this.isExpired(entry)) {
      // Cache hit
      entry.hits++;
      entry.lastAccessed = Date.now();
      this.updateStats(true);
      return of(entry.data);
    }

    // Cache miss
    this.updateStats(false);

    if (fetchFn) {
      // Fetch and cache
      return fetchFn().pipe(
        tap(data => this.set(key, data, ttl)),
        catchError(error => {
          // Don't cache errors
          return throwError(() => error);
        })
      );
    }

    // No fetch function provided
    return throwError(() => new Error(`Cache miss for key: ${key} and no fetch function provided`));
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.defaultTtl);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry,
      key,
      hits: 0,
      lastAccessed: Date.now()
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxEntries) {
      this.evictEntries();
    }

    this.cache.set(key, entry);
    this.saveToStorage();
    this.updateCacheStats();
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Remove entry from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
      this.updateCacheStats();
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.clearStorage();
    this.updateCacheStats();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      this.saveToStorage();
      this.updateCacheStats();
    }
  }

  /**
   * Get cache entry information
   */
  getEntryInfo(key: string): CacheEntry | null {
    return this.cache.get(key) || null;
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cacheStatsSubject.value;
  }

  // ===============================
  // POS-SPECIFIC CACHE METHODS
  // ===============================

  /**
   * Cache menu items with smart invalidation
   */
  cacheMenuItems(restaurantId: string, menuItems: any[]): void {
    const key = `menu_${restaurantId}`;
    this.set(key, menuItems, 10 * 60 * 1000); // 10 minutes for menu
  }

  /**
   * Get cached menu items
   */
  getCachedMenuItems(restaurantId: string): any[] | null {
    const key = `menu_${restaurantId}`;
    const entry = this.cache.get(key);
    return entry && !this.isExpired(entry) ? entry.data : null;
  }

  /**
   * Cache inventory data
   */
  cacheInventory(restaurantId: string, inventory: any[]): void {
    const key = `inventory_${restaurantId}`;
    this.set(key, inventory, 2 * 60 * 1000); // 2 minutes for inventory (more dynamic)
  }

  /**
   * Get cached inventory
   */
  getCachedInventory(restaurantId: string): any[] | null {
    const key = `inventory_${restaurantId}`;
    const entry = this.cache.get(key);
    return entry && !this.isExpired(entry) ? entry.data : null;
  }

  /**
   * Cache orders for current session
   */
  cacheOrders(restaurantId: string, orders: any[]): void {
    const key = `orders_${restaurantId}`;
    this.set(key, orders, 30 * 1000); // 30 seconds for orders (very dynamic)
  }

  /**
   * Get cached orders
   */
  getCachedOrders(restaurantId: string): any[] | null {
    const key = `orders_${restaurantId}`;
    const entry = this.cache.get(key);
    return entry && !this.isExpired(entry) ? entry.data : null;
  }

  /**
   * Cache user profile data
   */
  cacheUserProfile(userId: string, profile: any): void {
    const key = `user_${userId}`;
    this.set(key, profile, 30 * 60 * 1000); // 30 minutes for user data
  }

  /**
   * Get cached user profile
   */
  getCachedUserProfile(userId: string): any | null {
    const key = `user_${userId}`;
    const entry = this.cache.get(key);
    return entry && !this.isExpired(entry) ? entry.data : null;
  }

  /**
   * Invalidate cache by pattern
   */
  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      this.saveToStorage();
      this.updateCacheStats();
    }
  }

  /**
   * Invalidate all menu-related cache
   */
  invalidateMenuCache(restaurantId?: string): void {
    if (restaurantId) {
      this.invalidateByPattern(`menu_${restaurantId}`);
    } else {
      this.invalidateByPattern('^menu_');
    }
  }

  /**
   * Invalidate all inventory-related cache
   */
  invalidateInventoryCache(restaurantId?: string): void {
    if (restaurantId) {
      this.invalidateByPattern(`inventory_${restaurantId}`);
    } else {
      this.invalidateByPattern('^inventory_');
    }
  }

  /**
   * Invalidate all order-related cache
   */
  invalidateOrderCache(restaurantId?: string): void {
    if (restaurantId) {
      this.invalidateByPattern(`orders_${restaurantId}`);
    } else {
      this.invalidateByPattern('^orders_');
    }
  }

  // ===============================
  // STORAGE METHODS
  // ===============================

  private saveToStorage(): void {
    if (this.config.storageType === 'memory') return;

    try {
      const cacheData = Array.from(this.cache.entries());
      const storage = this.getStorage();

      if (this.config.enableCompression) {
        // TODO: Implement compression
        storage.setItem('app_cache', JSON.stringify(cacheData));
      } else {
        storage.setItem('app_cache', JSON.stringify(cacheData));
      }
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private loadFromStorage(): void {
    if (this.config.storageType === 'memory') return;

    try {
      const storage = this.getStorage();
      const cacheData = storage.getItem('app_cache');

      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        parsed.forEach(([key, entry]: [string, CacheEntry]) => {
          // Only load non-expired entries
          if (!this.isExpired(entry)) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private clearStorage(): void {
    if (this.config.storageType === 'memory') return;

    try {
      const storage = this.getStorage();
      storage.removeItem('app_cache');
    } catch (error) {
      console.warn('Failed to clear cache from storage:', error);
    }
  }

  private getStorage(): Storage {
    return this.config.storageType === 'sessionStorage' ? sessionStorage : localStorage;
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiry;
  }

  private evictEntries(): void {
    // Simple LRU eviction - remove least recently accessed
    let oldestKey = '';
    let oldestTime = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateStats(hit: boolean): void {
    const currentStats = this.cacheStatsSubject.value;
    const newStats = {
      ...currentStats,
      totalHits: hit ? currentStats.totalHits + 1 : currentStats.totalHits,
      totalMisses: !hit ? currentStats.totalMisses + 1 : currentStats.totalMisses
    };

    newStats.hitRate = newStats.totalHits / (newStats.totalHits + newStats.totalMisses) * 100;
    this.cacheStatsSubject.next(newStats);
  }

  private updateCacheStats(): void {
    const currentStats = this.cacheStatsSubject.value;
    this.cacheStatsSubject.next({
      ...currentStats,
      totalEntries: this.cache.size
    });
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.clearExpired();
    }, 5 * 60 * 1000);
  }

  // ===============================
  // CONFIGURATION
  // ===============================

  /**
   * Configure cache settings
   */
  configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };

    // If storage type changed, migrate data
    if (config.storageType && config.storageType !== this.config.storageType) {
      this.migrateStorage(config.storageType);
    }
  }

  private migrateStorage(newType: 'memory' | 'localStorage' | 'sessionStorage'): void {
    const oldStorage = this.config.storageType;
    this.config.storageType = newType;

    if (oldStorage === 'memory') {
      // Save current memory cache to new storage
      this.saveToStorage();
    } else {
      // Load from old storage, then save to new
      this.loadFromStorage();
      this.saveToStorage();

      // Clear old storage
      try {
        const oldStorageObj = oldStorage === 'sessionStorage' ? sessionStorage : localStorage;
        oldStorageObj.removeItem('app_cache');
      } catch (error) {
        console.warn('Failed to clear old storage:', error);
      }
    }
  }
}