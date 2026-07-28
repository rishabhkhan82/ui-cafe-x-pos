import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-uses-navigation-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-uses-navigation-mobile.component.html',
  styleUrl: './admin-uses-navigation-mobile.component.css'
})
export class AdminUsesNavigationMobileComponent implements OnInit {

  currentUser: User | null = null;

  private authService = inject(AuthService);

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

}
