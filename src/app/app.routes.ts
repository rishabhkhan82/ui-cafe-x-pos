import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { CustomerGuestGuard } from './guards/customer-guest.guard';

export const routes: Routes = [
  // Default redirect to admin login (main entry point)
  { path: '', loadComponent: () => import('./components/public/home/home.component').then(m => m.HomeComponent), pathMatch: 'full' },

  {
    path: 'customer/scan-qr',
    loadComponent: () => import('./components/auth/customer-scar-qr/customer-scar-qr.component').then(m => m.CustomerScarQrComponent)
  },

  {
    path: 'notifications',
    loadComponent: () => import('./components/common/common-user-notifications/common-user-notifications.component').then(m => m.CommonUserNotificationsComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin/login',
    loadComponent: () => import('./components/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },

  {
    path: 'terms-and-conditions',
    loadComponent: () => import('./components/public/terms-and-conditions/terms-and-conditions.component').then(m => m.TermsAndConditionsComponent)
  },

  {
    path: 'privacy-policy',
    loadComponent: () => import('./components/public/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },

  {
    path: 'restaurant-profile/:restaurantId',
    loadComponent: () => import('./components/public/restaurant-profile/restaurant-profile.component').then(m => m.RestaurantProfileComponent)
  },

  {
    path: 'support',
    loadComponent: () => import('./components/common/common-support/common-support.component').then(m => m.CommonSupportComponent),
    canActivate: [authGuard]
  },

  {
    path: 'unauthrized-access',
    loadComponent: () => import('./components/public/unauthrized-access/unauthrized-access.component').then(m => m.UnauthrizedAccessComponent)
  },

  {
    path: 'platform-dashboard',
    loadComponent: () => import('./components/platform/platform-dashboard/platform-dashboard.component').then(m => m.PlatformDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'navigation-management',
    loadComponent: () => import('./components/platform/navigation-management/navigation-management.component').then(m => m.NavigationManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'restaurant-management',
    loadComponent: () => import('./components/platform/restaurant-management/restaurant-management.component').then(m => m.RestaurantManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'user-management',
    loadComponent: () => import('./components/platform/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'role-management',
    loadComponent: () => import('./components/platform/role-management/role-management.component').then(m => m.RoleManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'role-access-management',
    loadComponent: () => import('./components/platform/role-access-management/role-access-management.component').then(m => m.RoleAccessManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'system-alerts',
    loadComponent: () => import('./components/platform/system-alerts/system-alerts.component').then(m => m.SystemAlertsComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'user-notifications',
    loadComponent: () => import('./components/platform/user-notifications/user-notifications.component').then(m => m.UserNotificationsComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'broadcast-message',
    loadComponent: () => import('./components/platform/broadcast-messages/broadcast-messages.component').then(m => m.BroadcastMessagesComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'plans',
    loadComponent: () => import('./components/platform/plan-management/plan-management.component').then(m => m.PlanManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'analytics',
    loadComponent: () => import('./components/platform/subscription-analytics/subscription-analytics.component').then(m => m.SubscriptionAnalyticsComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'features-access-control',
    loadComponent: () => import('./components/platform/feature-access-control/feature-access-control.component').then(m => m.FeatureAccessControlComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'system',
    loadComponent: () => import('./components/platform/system-configuration/system-configuration.component').then(m => m.SystemConfigurationComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'security',
    loadComponent: () => import('./components/platform/security-settings/security-settings.component').then(m => m.SecuritySettingsComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'api',
    loadComponent: () => import('./components/platform/api-management/api-management.component').then(m => m.ApiManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'integrations',
    loadComponent: () => import('./components/platform/integrations/integrations.component').then(m => m.IntegrationsComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'feature-management',
    loadComponent: () => import('./components/platform/feature-management/feature-management.component').then(m => m.FeatureManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  // Restaurant Owner & Manager Specific Routings
  {
    path: 'restaurant-navigation-mobile',
    loadComponent: () => import('./components/shared/admin-uses-navigation-mobile/admin-uses-navigation-mobile.component').then(m => m.AdminUsesNavigationMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-menus-mobile',
    loadComponent: () => import('./components/restaurant/owner-menus-mobile/owner-menus-mobile.component').then(m => m.OwnerMenusMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-orders-mobile',
    loadComponent: () => import('./components/shared/orders-mobile/orders-mobile.component').then(m => m.OrdersMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-plans-mobile',
    loadComponent: () => import('./components/restaurant/owner-plans-mobile/owner-plans-mobile.component').then(m => m.OwnerPlansMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'restaurant-owner-profile-mobile',
    loadComponent: () => import('./components/shared/admin-user-profile-mobile/admin-user-profile-mobile.component').then(m => m.AdminUserProfileMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-staff-mobile',
    loadComponent: () => import('./components/restaurant/owner-staff-mobile/owner-staff-mobile.component').then(m => m.OwnerStaffMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-reports-mobile',
    loadComponent: () => import('./components/restaurant/owner-reports-mobile/owner-reports-mobile.component').then(m => m.OwnerReportsMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-offers-mobile',
    loadComponent: () => import('./components/restaurant/owner-offers-mobile/owner-offers-mobile.component').then(m => m.OwnerOffersMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-inventory-mobile',
    loadComponent: () => import('./components/restaurant/owner-inventory-mobile/owner-inventory-mobile.component').then(m => m.OwnerInventoryMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'addons-mobile',
    loadComponent: () => import('./components/restaurant/add-ons-mobile/add-ons-mobile.component').then(m => m.AddOnsMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  // Kitchen Manager Specific Routings

  // {
  //   path: 'kitchen-dashboard',
  //   loadComponent: () => import('./components/kitchen/kitchen-dashboard/kitchen-dashboard.component').then(m => m.KitchenDashboardComponent),
  //   canActivate: [authGuard]
  // },

  {
    path: 'kitchen-navigation-mobile',
    loadComponent: () => import('./components/shared/admin-uses-navigation-mobile/admin-uses-navigation-mobile.component').then(m => m.AdminUsesNavigationMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'kitchen_manager'] }
  },

  {
    path: 'kitchen-orders',
    loadComponent: () => import('./components/shared/orders-mobile/orders-mobile.component').then(m => m.OrdersMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'kitchen_manager'] }
  },

  {
    path: 'kitchen-profile-mobile',
    loadComponent: () => import('./components/shared/admin-user-profile-mobile/admin-user-profile-mobile.component').then(m => m.AdminUserProfileMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'kitchen_manager'] }
  },
  // Waiter Specific Routings
  {
    path: 'waiter-navigation-mobile',
    loadComponent: () => import('./components/shared/admin-uses-navigation-mobile/admin-uses-navigation-mobile.component').then(m => m.AdminUsesNavigationMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'waiter'] }
  },

  {
    path: 'waiter-orders',
    loadComponent: () => import('./components/shared/orders-mobile/orders-mobile.component').then(m => m.OrdersMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'waiter'] }
  },

  {
    path: 'waiter-profile-mobile',
    loadComponent: () => import('./components/shared/admin-user-profile-mobile/admin-user-profile-mobile.component').then(m => m.AdminUserProfileMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'waiter'] }
  },

  // {
  //   path: 'waiter-interface',
  //   loadComponent: () => import('./components/waiter/waiter-interface/waiter-interface.component').then(m => m.WaiterInterfaceComponent),
  //   canActivate: [authGuard]
  // },

  // Customer login (outside layout - no header/footer)  
  {
    path: 'customer/login',
    loadComponent: () => import('./components/auth/customer-login/customer-login.component').then(m => m.CustomerLoginComponent)
  },

  {
    path: 'customer/dashboard/:restaurantId/:tableNumber',
    loadComponent: () => import('./components/customer/customer-dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent)
  },

  {
    path: 'customer',
    canActivate: [CustomerGuestGuard],
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
        path: 'cart',
        loadComponent: () => import('./components/customer/customer-cart/customer-cart.component').then(m => m.CustomerCartComponent)
      }
    ]
  },

  // Wildcard route
  { path: '**', redirectTo: '/admin/login' }
];
