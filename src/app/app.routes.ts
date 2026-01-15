import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default redirect to admin login (main entry point)
  { path: '', redirectTo: '/admin/login', pathMatch: 'full' },

  // Admin login (outside layout - no header/footer)
  {
    path: 'admin/login',
    loadComponent: () => import('./components/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },

  {
    path: 'platform-dashboard',
    loadComponent: () => import('./components/platform/platform-dashboard/platform-dashboard.component').then(m => m.PlatformDashboardComponent)
  },

  {
    path: 'navigation-management',
    loadComponent: () => import('./components/platform/navigation-management/navigation-management.component').then(m => m.NavigationManagementComponent)
  },

  {
    path: 'restaurant-management',
    loadComponent: () => import('./components/platform/restaurant-management/restaurant-management.component').then(m => m.RestaurantManagementComponent)
  },

  {
    path: 'user-management',
    loadComponent: () => import('./components/platform/user-management/user-management.component').then(m => m.UserManagementComponent)
  },

  {
    path: 'role-management',
    loadComponent: () => import('./components/platform/role-management/role-management.component').then(m => m.RoleManagementComponent)
  },

  {
    path: 'role-access-management',
    loadComponent: () => import('./components/platform/role-access-management/role-access-management.component').then(m => m.RoleAccessManagementComponent)
  },

  {
    path: 'system-alerts',
    loadComponent: () => import('./components/platform/system-alerts/system-alerts.component').then(m => m.SystemAlertsComponent)
  },

  {
    path: 'user-notifications',
    loadComponent: () => import('./components/platform/user-notifications/user-notifications.component').then(m => m.UserNotificationsComponent)
  },

  {
    path: 'broadcast-message',
    loadComponent: () => import('./components/platform/broadcast-messages/broadcast-messages.component').then(m => m.BroadcastMessagesComponent)
  },

  {
    path: 'plans',
    loadComponent: () => import('./components/platform/plan-management/plan-management.component').then(m => m.PlanManagementComponent)
  },

  {
    path: 'analytics',
    loadComponent: () => import('./components/platform/subscription-analytics/subscription-analytics.component').then(m => m.SubscriptionAnalyticsComponent)
  },

  {
    path: 'features', 
    loadComponent: () => import('./components/platform/feature-access-control/feature-access-control.component').then(m => m.FeatureAccessControlComponent )
  },

  {
    path: 'system',
    loadComponent: () => import('./components/platform/system-configuration/system-configuration.component').then(m => m.SystemConfigurationComponent)
  },

  {
    path: 'security',
    loadComponent: () => import('./components/platform/security-settings/security-settings.component').then(m => m.SecuritySettingsComponent)
  },

  {
    path: 'api',
    loadComponent: () => import('./components/platform/api-management/api-management.component').then(m => m.ApiManagementComponent)
  },
  
  {
    path: 'integrations',
    loadComponent: () => import('./components/platform/integrations/integrations.component').then(m => m.IntegrationsComponent)
  },

  // Customer login (outside layout - no header/footer)
  {
    path: 'customer/login',
    loadComponent: () => import('./components/auth/customer-login/customer-login.component').then(m => m.CustomerLoginComponent)
  },

  // Customer section with nested routing (authenticated pages only)
  {
    path: 'customer',
    children: [
      {
        path: 'menu',
        loadComponent: () => import('./components/customer/customer-menu/customer-menu.component').then(m => m.CustomerMenuComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/customer/customer-orders/customer-orders.component').then(m => m.CustomerOrdersComponent)
      },
      {
        path: 'offers',
        loadComponent: () => import('./components/customer/customer-offers/customer-offers.component').then(m => m.CustomerOffersComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/customer/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/customer/customer-dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent)
      },
      // Default redirect for customer
      {
        path: '',
        redirectTo: 'menu',
        pathMatch: 'full'
      }
    ]
  },

  // Wildcard route
  { path: '**', redirectTo: '/admin/login' }
];
