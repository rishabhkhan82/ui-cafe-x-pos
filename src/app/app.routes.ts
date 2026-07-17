import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { CustomerGuestGuard } from './guards/customer-guest.guard';
import { subscriptionGuard } from './guards/subscription.guard';

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
    path: 'forgot-password',
    loadComponent: () => import('./components/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
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

  {
    path: 'feature-category-master',
    loadComponent: () => import('./components/masters/feature-category-master/feature-category-master.component').then(m => m.FeatureCategoryMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'navigation-menu-type-master',
    loadComponent: () => import('./components/masters/navigation-menu-type-master/navigation-menu-type-master.component').then(m => m.NavigationMenuTypeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'feature-type-master',
    loadComponent: () => import('./components/masters/feature-type-master/feature-type-master.component').then(m => m.FeatureTypeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'user-type-master',
    loadComponent: () => import('./components/masters/user-type-master/user-type-master.component').then(m => m.UserTypeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'billing-cycle-master',
    loadComponent: () => import('./components/masters/billing-cycle-master/billing-cycle-master.component').then(m => m.BillingCycleMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'setup-fee-master',
    loadComponent: () => import('./components/masters/setup-fee-master/setup-fee-master.component').then(m => m.SetupFeeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'trial-days-master',
    loadComponent: () => import('./components/masters/trial-day-master/trial-day-master.component').then(m => m.TrialDayMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'cafe-restaurant-status-master',
    loadComponent: () => import('./components/masters/restaurant-status-master/restaurant-status-master.component').then(m => m.RestaurantStatusMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'state-master',
    loadComponent: () => import('./components/masters/state-master/state-master.component').then(m => m.StateMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'billing-period-months-master',
    loadComponent: () => import('./components/masters/billing-period-months-master/billing-period-months-master.component').then(m => m.BillingPeriodMonthsMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'inventory-item-categories-master',
    loadComponent: () => import('./components/masters/inventory-item-categories-master/inventory-item-categories-master.component').then(m => m.InventoryItemCategoriesMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'inventory-item-types-master',
    loadComponent: () => import('./components/masters/inventory-item-types-master/inventory-item-types-master.component').then(m => m.InventoryItemTypesMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'inventory-item-units-master',
    loadComponent: () => import('./components/masters/inventory-item-units-master/inventory-item-units-master.component').then(m => m.InventoryItemUnitsMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'menu-categories-master',
    loadComponent: () => import('./components/masters/menu-categories-master/menu-categories-master.component').then(m => m.MenuCategoriesMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'menu-items-type-master',
    loadComponent: () => import('./components/masters/menu-items-type-master/menu-items-type-master.component').then(m => m.MenuItemsTypeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'order-type-master',
    loadComponent: () => import('./components/masters/order-type-master/order-type-master.component').then(m => m.OrderTypeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'report-type-master',
    loadComponent: () => import('./components/masters/report-type-master/report-type-master.component').then(m => m.ReportTypeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'waste-reason-type-master',
    loadComponent: () => import('./components/masters/waste-reason-type-master/waste-reason-type-master.component').then(m => m.WasteReasonTypeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  {
    path: 'waste-type-master',
    loadComponent: () => import('./components/masters/waste-type-master/waste-type-master.component').then(m => m.WasteTypeMasterComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner'] }
  },

  // Restaurant Owner & Manager Specific Routings

  {
    path: 'restaurant-dashboard',
    loadComponent: () => import('./components/restaurant/owner-dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'restaurant-navigation-mobile',
    loadComponent: () => import('./components/shared/admin-uses-navigation-mobile/admin-uses-navigation-mobile.component').then(m => m.AdminUsesNavigationMobileComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-menus-mobile',
    loadComponent: () => import('./components/restaurant/owner-menus-mobile/owner-menus-mobile.component').then(m => m.OwnerMenusMobileComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'recipe-management',
    loadComponent: () => import('./components/restaurant/recipe-management/recipe-management.component').then(m => m.RecipeManagementComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'production-batch',
    loadComponent: () => import('./components/restaurant/production-batch/production-batch.component').then(m => m.ProductionBatchComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'waste-management',
    loadComponent: () => import('./components/restaurant/waste-management/waste-management.component').then(m => m.WasteManagementComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'inventory-stock-log',
    loadComponent: () => import('./components/restaurant/inventory-stock-log/inventory-stock-log.component').then(m => m.InventoryStockLogComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-orders-mobile',
    loadComponent: () => import('./components/shared/orders-mobile/orders-mobile.component').then(m => m.OrdersMobileComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
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
    canActivate: [authGuard, roleGuard, subscriptionGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-reports-mobile',
    loadComponent: () => import('./components/restaurant/owner-reports-mobile/owner-reports-mobile.component').then(m => m.OwnerReportsMobileComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-offers-mobile',
    loadComponent: () => import('./components/restaurant/owner-offers-mobile/owner-offers-mobile.component').then(m => m.OwnerOffersMobileComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
    data: { allowedRoles: ['platform_owner', 'restaurant_owner', 'restaurant_manager'] }
  },

  {
    path: 'owner-inventory-mobile',
    loadComponent: () => import('./components/restaurant/owner-inventory-mobile/owner-inventory-mobile.component').then(m => m.OwnerInventoryMobileComponent),
    canActivate: [authGuard, roleGuard, subscriptionGuard],
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
    canActivate: [authGuard, roleGuard, subscriptionGuard],
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
    canActivate: [authGuard, roleGuard, subscriptionGuard],
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
    canActivate: [CustomerGuestGuard, subscriptionGuard],
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
