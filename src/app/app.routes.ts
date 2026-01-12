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
    path: 'admin',
    children: [
      // Platform Owner Routes (based on navigation menu)
      {
        path: 'platform-owner',
        children: [
          {
            path: 'dashboard',
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
            path: 'notifications',
            children: [
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
              }
            ]
          },
          {
            path: 'subscriptions',
            children: [
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
              }
            ]
          },
          {
            path: 'settings',
            children: [
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
              }
            ]
          }
        ]
      },
      // Restaurant Owner Routes (based on navigation menu)
      {
        path: 'restaurant-owner',
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./components/restaurant/owner-dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent)
          },
          {
            path: 'analytics-reporting',
            loadComponent: () => import('./components/restaurant/analytics-reporting/analytics-reporting.component').then(m => m.AnalyticsReportingComponent)
          },
          {
            path: 'inventory-management',
            loadComponent: () => import('./components/restaurant/inventory-management/inventory-management.component').then(m => m.InventoryManagementComponent)
          },
          {
            path: 'menu-management',
            loadComponent: () => import('./components/restaurant/menu-management/menu-management.component').then(m => m.MenuManagementComponent)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./components/restaurant/notifications/notifications.component').then(m => m.NotificationsComponent)
          },
          {
            path: 'offers-loyalty',
            loadComponent: () => import('./components/restaurant/offers-loyalty/offers-loyalty.component').then(m => m.OffersLoyaltyComponent)
          },
          {
            path: 'order-processing',
            loadComponent: () => import('./components/restaurant/order-processing/order-processing.component').then(m => m.OrderProcessingComponent)
          },
          {
            path: 'payment-processing',
            loadComponent: () => import('./components/restaurant/payment-processing/payment-processing.component').then(m => m.PaymentProcessingComponent)
          },
          {
            path: 'settings-configuration',
            loadComponent: () => import('./components/restaurant/settings-configuration/settings-configuration.component').then(m => m.SettingsConfigurationComponent)
          },
          {
            path: 'shift-reports',
            loadComponent: () => import('./components/restaurant/shift-reports/shift-reports.component').then(m => m.ShiftReportsComponent)
          },
          {
            path: 'staff-management',
            loadComponent: () => import('./components/restaurant/staff-management/staff-management.component').then(m => m.StaffManagementComponent)
          }
        ]
      },
      // Restaurant Manager Routes (based on navigation menu)
      {
        path: 'restaurant-manager',
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./components/restaurant/restaurant-manager-dashboard/restaurant-manager-dashboard.component').then(m => m.RestaurantManagerDashboardComponent)
          },
          {
            path: 'analytics-reporting',
            loadComponent: () => import('./components/restaurant/analytics-reporting/analytics-reporting.component').then(m => m.AnalyticsReportingComponent)
          },
          {
            path: 'inventory-management',
            loadComponent: () => import('./components/restaurant/inventory-management/inventory-management.component').then(m => m.InventoryManagementComponent)
          },
          {
            path: 'menu-management',
            loadComponent: () => import('./components/restaurant/menu-management/menu-management.component').then(m => m.MenuManagementComponent)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./components/restaurant/notifications/notifications.component').then(m => m.NotificationsComponent)
          },
          {
            path: 'offers-loyalty',
            loadComponent: () => import('./components/restaurant/offers-loyalty/offers-loyalty.component').then(m => m.OffersLoyaltyComponent)
          },
          {
            path: 'order-processing',
            loadComponent: () => import('./components/restaurant/order-processing/order-processing.component').then(m => m.OrderProcessingComponent)
          },
          {
            path: 'payment-processing',
            loadComponent: () => import('./components/restaurant/payment-processing/payment-processing.component').then(m => m.PaymentProcessingComponent)
          },
          {
            path: 'settings-configuration',
            loadComponent: () => import('./components/restaurant/settings-configuration/settings-configuration.component').then(m => m.SettingsConfigurationComponent)
          },
          {
            path: 'shift-reports',
            loadComponent: () => import('./components/restaurant/shift-reports/shift-reports.component').then(m => m.ShiftReportsComponent)
          },
          {
            path: 'staff-management',
            loadComponent: () => import('./components/restaurant/staff-management/staff-management.component').then(m => m.StaffManagementComponent)
          }
        ]
      },
      // Cashier Routes (based on navigation menu)
      {
        path: 'cashier',
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./components/cashier/cashier-dashboard/cashier-dashboard.component').then(m => m.CashierDashboardComponent)
          },
          {
            path: 'pos',
            loadComponent: () => import('./components/cashier/cashier-interface/cashier-interface.component').then(m => m.CashierInterfaceComponent)
          },
          {
            path: 'receipt-management',
            loadComponent: () => import('./components/cashier/receipt-management/receipt-management.component').then(m => m.ReceiptManagementComponent)
          },
          {
            path: 'cash-management',
            loadComponent: () => import('./components/cashier/cash-management/cash-management.component').then(m => m.CashManagementComponent)
          },
          {
            path: 'shift-reports',
            loadComponent: () => import('./components/cashier/cashier-shift-reports/cashier-shift-reports.component').then(m => m.CashierShiftReportsComponent)
          },
          {
            path: 'transaction-search',
            loadComponent: () => import('./components/cashier/transaction-search/transaction-search.component').then(m => m.TransactionSearchComponent)
          },
          {
            path: 'settings',
            loadComponent: () => import('./components/cashier/cashier-settings/cashier-settings.component').then(m => m.CashierSettingsComponent)
          }
        ]
      },
      // Kitchen Manager Routes (based on navigation menu)
      {
        path: 'kitchen-manager',
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./components/kitchen/kitchen-dashboard/kitchen-dashboard.component').then(m => m.KitchenDashboardComponent)
          },
          {
            path: 'display',
            loadComponent: () => import('./components/kitchen/kitchen-display/kitchen-display.component').then(m => m.KitchenDisplayComponent)
          },
          {
            path: 'recipe-management',
            loadComponent: () => import('./components/kitchen/recipe-management/recipe-management.component').then(m => m.RecipeManagementComponent)
          },
          {
            path: 'inventory-management',
            loadComponent: () => import('./components/kitchen/inventory-management/inventory-management.component').then(m => m.InventoryManagementComponent)
          },
          {
            path: 'analytics-reports',
            loadComponent: () => import('./components/kitchen/analytics-reports/analytics-reports.component').then(m => m.AnalyticsReportsComponent)
          }
        ]
      },
      // Waiter Routes (based on navigation menu)
      {
        path: 'waiter',
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./components/waiter/waiter-interface/waiter-interface.component').then(m => m.WaiterInterfaceComponent)
          }
        ]
      }
    ]
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
