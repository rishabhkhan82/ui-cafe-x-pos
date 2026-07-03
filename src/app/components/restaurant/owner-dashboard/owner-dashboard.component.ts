import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { RealtimeService } from '../../../services/realtime.service';
import { CrudService } from '../../../services/crud.service';
import { environment } from '../../../environments/environment';
import type { User } from '../../../services/mock-data.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css'
})
export class OwnerDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private authService = inject(AuthService);
  private realtimeService = inject(RealtimeService);
  private crudService = inject(CrudService);
  private router = inject(Router);

  currentUser: User | null = null;
  currentDate = new Date();
  currentYear = new Date().getFullYear();
  subscriptionDaysLeft = 28;
  notificationCount = 3;

  ownerDashboardConfig: any | null = null;

  dashboardData: any | null = null;
  isLoading = true;
  lastUpdated: Date | null = null;

  private currentRestaurantId: string | null = null;

  ngOnInit(): void {
    this.loadConfigurationData();
    this.initializeData();
    this.loadDashboardData();
    this.setupRealtimeSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadConfigurationData(): void {
    this.subscriptions.add(
      this.crudService.getData(`restaurant/config/owner-dashboard`).subscribe({
        next: (response: any) => {
          this.ownerDashboardConfig = response;
        },
        error: (err) => {
          console.error('Failed to load owner dashboard config', err);
        }
      })
    );
  }

  private initializeData(): void {
    this.currentUser = this.authService.getCurrentUser();

    const user = this.authService.getCurrentUser();
    const restaurantId = user?.restaurantId || user?.restaurant_id;
    this.currentRestaurantId = restaurantId || null;
  }

  loadDashboardData(): void {
    if (!this.currentRestaurantId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    const restaurantId = this.currentRestaurantId;

    this.subscriptions.add(
      this.crudService.getData(`restaurant/${restaurantId}/owner-dashboard`).subscribe({
        next: (response: any) => {
          this.dashboardData = response;
          this.isLoading = false;
          this.lastUpdated = new Date();
        },
        error: (err) => {
          console.error('Failed to load owner dashboard', err);
          this.isLoading = false;
        }
      })
    );
  }

  private setupRealtimeSubscriptions(): void {
    const sub = this.realtimeService.ownerDashboard$.subscribe(data => {
      if (data) {
        this.dashboardData = data;
        this.lastUpdated = new Date();
      }
    });
    this.subscriptions.add(sub);
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  navigateTo(section: string): void {
    const route = this.ownerDashboardConfig?.navigationRoutes?.find((r: any) => r.key === section)?.route;
    if (route) {
      this.router.navigate([route]);
    }
  }

  viewAllOrders(): void {
    this.router.navigate(['/restaurant/orders']);
  }

  viewOrderDetails(orderId: string): void {
    alert(`Opening order details for ${orderId}...`);
  }

  viewStaffDetails(): void {
    alert('Opening staff management details...');
  }

  viewInventoryDetails(): void {
    alert('Opening inventory management details...');
  }

  manageMenu(): void {
    this.router.navigate(['/restaurant/menu']);
  }

  manageStaff(): void {
    this.router.navigate(['/restaurant/staff']);
  }

  viewAnalytics(): void {
    this.router.navigate(['/restaurant/analytics']);
  }

  manageSettings(): void {
    this.router.navigate(['/restaurant/settings']);
  }

  getOrderStatusClass(status: string): string {
    if (!this.ownerDashboardConfig?.badgeClasses?.orderStatus) return '';
    const found = this.ownerDashboardConfig.badgeClasses.orderStatus.find((c: any) => c.value === status.toLowerCase());
    return found ? found.className : '';
  }

  getStaffStatusClass(status: string): string {
    if (!this.ownerDashboardConfig?.badgeClasses?.staffStatus) return '';
    const found = this.ownerDashboardConfig.badgeClasses.staffStatus.find((c: any) => c.value === status.toLowerCase());
    return found ? found.className : '';
  }

  getTrendIcon(trend: string): string {
    if (!this.ownerDashboardConfig?.trendIcons) return 'fas fa-minus text-gray-500';
    const found = this.ownerDashboardConfig.trendIcons.find((t: any) => t.trend === trend);
    return found ? found.iconClass : 'fas fa-minus text-gray-500';
  }
}
