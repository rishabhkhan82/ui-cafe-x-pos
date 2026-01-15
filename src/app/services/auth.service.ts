import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { MockDataService, User, LoginRequest, LoginResponse } from './mock-data.service';
import { CrudService } from './crud.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentUser: User | null = null;
  private users: User[] = [];

  constructor(private router: Router, private mockDataService: MockDataService, private crudService: CrudService) {
    // Initialize users from MockDataService
    this.mockDataService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser = user;
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }
    return false;
  }

  // API-based login method
  loginApi(credentials: LoginRequest): Observable<LoginResponse> {
    return this.crudService.postData('auth/login', credentials);
  }

  logout(): void {
    const userType = this.currentUser?.user_type;
    this.currentUser = null;
    sessionStorage.clear();
    this.currentUserSubject.next(null);
    if (userType === 'admin') {
      this.router.navigate(['/admin/login']);
    } else if (userType === 'customer') {
      this.router.navigate(['/customer/login']);
    } else {
      this.router.navigate(['/admin/login']);
    }
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = sessionStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.currentUserSubject.next(this.currentUser);
      }
    }
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
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
