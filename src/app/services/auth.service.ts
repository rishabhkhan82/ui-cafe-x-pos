import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { MockDataService, User } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentUser: User | null = null;
  private users: User[] = [];

  constructor(private router: Router, private mockDataService: MockDataService) {
    // Initialize users from MockDataService
    this.mockDataService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    // Navigate to appropriate login based on current route
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/admin')) {
      this.router.navigate(['/admin/login']);
    } else {
      this.router.navigate(['/customer/login']);
    }
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.currentUserSubject.next(this.currentUser);
      }
    }
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getDummyCredentials(): { role: string; username: string; password: string }[] {
    return this.users.map(user => ({
      role: user.role,
      username: user.username,
      password: user.password
    }));
  }
}
