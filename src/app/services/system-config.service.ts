import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, EMPTY } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface SystemSettings {
  id?: string;
  updatedBy?: string;
  updatedAt?: string;
  createdAt?: string;
  platform_name?: string;
  platform_url?: string;
  platform_logo?: string;
  default_language?: string;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  file_upload_max_size?: number;
  backup_enabled?: boolean;
  backup_frequency?: string;
  support_email?: string;
  support_phone?: string;
  terms_url?: string;
  privacy_url?: string;
  timezone?: string;
  currency?: string;
  max_concurrent_users?: number;
  cache_enabled?: boolean;
  cache_ttl?: number;
  session_timeout?: number;
  password_min_length?: number;
  two_factor_required?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  notification_batch_size?: number;
  api_rate_limit?: number;
  webhook_retries?: number;
  _cachedAt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {
  private readonly STORAGE_KEY = 'system_settings';
  private settingsSubject = new BehaviorSubject<SystemSettings | null>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  getSystemSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(`${environment.api.baseUrl}/system-settings/get-system-settings`).pipe(
      tap(data => {
        this.settingsSubject.next(data);
        this.saveToStorage(data);
      }),
      catchError(err => {
        console.error('Failed to load system settings', err);
        return EMPTY;
      })
    );
  }

  get currentSettings(): SystemSettings | null {
    return this.settingsSubject.value;
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SystemSettings;
        if (parsed && !this.isExpired(parsed)) {
          this.settingsSubject.next(parsed);
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('Failed to load cached system settings', e);
    }
  }

  private saveToStorage(data: SystemSettings): void {
    try {
      const payload: SystemSettings = {
        ...data,
        _cachedAt: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to cache system settings', e);
    }
  }

  private isExpired(data: SystemSettings): boolean {
    const ttl = 5 * 60 * 1000;
    const cachedAt = data._cachedAt;
    if (!cachedAt) return true;
    return Date.now() > cachedAt + ttl;
  }
}
