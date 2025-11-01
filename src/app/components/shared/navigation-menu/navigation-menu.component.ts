import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MockDataService, NavigationMenu, User } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.css']
})
export class NavigationMenuComponent implements OnInit {
  navigationMenus: NavigationMenu[] = [];
  currentUser: User | undefined;
  isDropdownOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.navigation-dropdown');

    // Close dropdown if clicked outside the navigation dropdown
    if (!dropdown && this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  constructor(private mockDataService: MockDataService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user; // Now user is already the complete User object from MockDataService
        // Get navigation menus for the current user role
        this.navigationMenus = this.mockDataService.getNavigationMenusByRole(user.role);
        // Ensure Dashboard is first and active
        this.ensureDashboardFirst();
        // Update menu paths to include admin prefix for admin users
        this.updateMenuPathsForAdmin(user.role);
      } else {
        this.currentUser = undefined;
        this.navigationMenus = [];
      }
    });
  }

  private updateMenuPathsForAdmin(role: string): void {
    // Admin roles need /admin prefix in their navigation paths
    const adminRoles = ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'kitchen_manager', 'cashier', 'waiter'];

    if (adminRoles.includes(role)) {
      // Convert role format from underscore to hyphen to match route structure
      const routeRole = role.replace(/_/g, '-');

      this.navigationMenus.forEach(menu => {
        if (menu.path && !menu.path.startsWith('/admin')) {
          // Add admin prefix with correct role format to relative paths
          menu.path = `/admin/${routeRole}${menu.path}`;
        }
        // Update children paths too
        if (menu.children) {
          menu.children.forEach(child => {
            if (child.path && !child.path.startsWith('/admin')) {
              child.path = `/admin/${routeRole}${child.path}`;
            }
          });
        }
      });
    }
  }

  private ensureDashboardFirst(): void {
    // Find dashboard menu
    const dashboardMenu = this.navigationMenus.find(menu => menu.name === 'Dashboard');
    if (dashboardMenu) {
      // Remove dashboard from current position
      this.navigationMenus = this.navigationMenus.filter(menu => menu.name !== 'Dashboard');
      // Add dashboard at the beginning
      this.navigationMenus.unshift(dashboardMenu);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  toggleSubmenu(menu: NavigationMenu): void {
    // Close other submenus
    this.navigationMenus.forEach(m => {
      if (m !== menu) {
        m.isActive = false;
      }
    });
    // Toggle current submenu
    menu.isActive = !menu.isActive;
  }

  getDashboardPath(): string {
    if (this.currentUser) {
      const role = this.currentUser.role;
      const adminRoles = ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'kitchen_manager', 'cashier', 'waiter'];

      if (adminRoles.includes(role)) {
        // Convert role format from underscore to hyphen to match route structure
        const routeRole = role.replace(/_/g, '-');
        return `/admin/${routeRole}/dashboard`;
      } else if (role === 'customer') {
        return '/customer/dashboard';
      }
    }
    return '/admin/login'; // fallback
  }

  navigateToMenu(path: string): void {
    if (path) {
      this.closeDropdown();
      console.log('Navigating to:', path);

      // For admin routes, navigate directly to the full admin path
      if (path.startsWith('/platform-owner/') || path.startsWith('/restaurant-owner/') ||
          path.startsWith('/restaurant-manager/') || path.startsWith('/kitchen-manager/') ||
          path.startsWith('/cashier/') || path.startsWith('/waiter/')) {
        // Navigate to the full admin path
        const adminPath = `/admin${path}`;
        console.log('Admin navigation path:', adminPath);

        this.router.navigateByUrl(adminPath).then(success => {
          if (success) {
            console.log('Admin navigation successful to:', adminPath);
          } else {
            console.error('Admin navigation failed to:', adminPath);
          }
        }).catch(error => {
          console.error('Admin navigation error:', error);
        });
      } else {
        // For customer routes, navigate to customer path
        if (path.startsWith('/customer/')) {
          this.router.navigateByUrl(path).then(success => {
            if (success) {
              console.log('Customer navigation successful to:', path);
            } else {
              console.error('Customer navigation failed to:', path);
            }
          }).catch(error => {
            console.error('Customer navigation error:', error);
          });
        } else {
          // For other paths, navigate normally
          this.router.navigateByUrl(path).then(success => {
            if (success) {
              console.log('Navigation successful to:', path);
            } else {
              console.error('Navigation failed to:', path);
            }
          }).catch(error => {
            console.error('Navigation error:', error);
          });
        }
      }
    }
  }
}