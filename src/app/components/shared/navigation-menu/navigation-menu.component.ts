import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  hierarchicalMenus: NavigationMenu[] = [];
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

  async ngOnInit(): Promise<void> {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(async user => {
      if (user) {
        this.currentUser = user; // Now user is already the complete User object from MockDataService
        // Get navigation menus for the current user role (already hierarchical)
        this.hierarchicalMenus = await this.mockDataService.getNavigationMenusByRole();
        // Ensure Dashboard is first and active
        this.ensureDashboardFirst();
        // Update menu paths to include admin prefix for admin users
        this.updateMenuPathsForAdmin(user.role);
        // Update active menu based on current route
        this.updateActiveMenu();
      } else {
        this.currentUser = undefined;
        this.hierarchicalMenus = [];
      }
    });

    // Subscribe to router events to update active menu on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveMenu();
    });
  }

  private updateMenuPathsForAdmin(role: string): void {
    // Admin roles need /admin prefix in their navigation paths
    const adminRoles = ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'kitchen_manager', 'cashier', 'waiter'];

    if (adminRoles.includes(role)) {
      // Convert role format from underscore to hyphen to match route structure
      const routeRole = role.replace(/_/g, '-');

      const updatePathsRecursively = (menus: NavigationMenu[]) => {
        menus.forEach(menu => {
          if (menu.path && !menu.path.startsWith('/admin')) {
            // Add admin prefix with correct role format to relative paths
            menu.path = `/${menu.path}`;
          }
          // Update children paths recursively
          if (menu.children && menu.children.length > 0) {
            updatePathsRecursively(menu.children);
          }
        });
      };

      updatePathsRecursively(this.hierarchicalMenus);
    }
  }

  private transformToHierarchical(menus: NavigationMenu[]): NavigationMenu[] {
    // Create a map of menu items by their menu_id for quick lookup
    const menuMap: Record<string, NavigationMenu> = {};
    const rootMenus: NavigationMenu[] = [];

    // First pass: create the map and identify root menus
    menus.forEach(menu => {
      menuMap[menu.menu_id] = { ...menu, children: [] };
      if (!menu.parent_id || menu.parent_id === '') {
        rootMenus.push(menuMap[menu.menu_id]);
      }
    });

    // Second pass: build the hierarchy
    menus.forEach(menu => {
      if (menu.parent_id && menu.parent_id !== '') {
        const parent = menuMap[menu.parent_id];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuMap[menu.menu_id]);
        }
      }
    });

    return rootMenus;
  }

  private ensureDashboardFirst(): void {
    // Find dashboard menu
    const dashboardMenu = this.hierarchicalMenus.find(menu => menu.name === 'Dashboard');
    if (dashboardMenu) {
      // Remove dashboard from current position
      this.hierarchicalMenus = this.hierarchicalMenus.filter(menu => menu.name !== 'Dashboard');
      // Add dashboard at the beginning
      this.hierarchicalMenus.unshift(dashboardMenu);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  toggleSubmenu(menu: NavigationMenu): void {
    // Close siblings at the same level
    const closeSiblings = (menus: NavigationMenu[], currentMenu: NavigationMenu) => {
      menus.forEach(m => {
        if (m !== currentMenu) {
          m.is_active = false;
          // Recursively close children
          if (m.children && m.children.length > 0) {
            closeSiblings(m.children, null as any);
          }
        }
      });
    };

    // Find the parent level menus
    let parentMenus = this.hierarchicalMenus;
    // If menu has parent_id, find its siblings
    if (menu.parent_id) {
      const findParentAndSiblings = (menus: NavigationMenu[]): NavigationMenu[] | null => {
        for (const m of menus) {
          if (m.menu_id === menu.parent_id) {
            return m.children || [];
          }
          if (m.children && m.children.length > 0) {
            const found = findParentAndSiblings(m.children);
            if (found) return found;
          }
        }
        return null;
      };
      const siblings = findParentAndSiblings(this.hierarchicalMenus);
      if (siblings) {
        parentMenus = siblings;
      }
    }

    // Close siblings
    closeSiblings(parentMenus, menu);

    // Toggle current submenu
    menu.is_active = !menu.is_active;
  }

  // getDashboardPath(): string {
  //   if (this.currentUser) {
  //     const role = this.currentUser.role;
  //     const adminRoles = ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'kitchen_manager', 'cashier', 'waiter'];

  //     if (adminRoles.includes(role)) {
  //       // Convert role format from underscore to hyphen to match route structure
  //       const routeRole = role.replace(/_/g, '-');
  //       return `/admin/${routeRole}/dashboard`;
  //     } else if (role === 'customer') {
  //       return '/customer/dashboard';
  //     }
  //   }
  //   return '/admin/login'; // fallback
  // }

  navigateToMenu(path: string): void {
    if (path) {
      this.closeDropdown();
      console.log('Navigating to:', path);

      // For admin routes, navigate directly to the full admin path
      if (path.startsWith('/platform-owner/') || path.startsWith('/restaurant-owner/') ||
          path.startsWith('/restaurant-manager/') || path.startsWith('/kitchen-manager/') ||
          path.startsWith('/cashier/') || path.startsWith('/waiter/')) {
        // Navigate to the full admin path
        const adminPath = `/${path}`;
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

  private updateActiveMenu(): void {
    const currentUrl = this.router.url;

    // Reset all active states recursively
    const resetActiveStates = (menus: NavigationMenu[]) => {
      menus.forEach(menu => {
        menu.is_active = false;
        if (menu.children && menu.children.length > 0) {
          resetActiveStates(menu.children);
        }
      });
    };
    resetActiveStates(this.hierarchicalMenus);

    // Find and set active menu based on current URL recursively
    const setActiveMenu = (menus: NavigationMenu[]): boolean => {
      for (const menu of menus) {
        let isActive = false;
        if (menu.path) {
          const menuPath = menu.path.startsWith('/') ? menu.path : `/${menu.path}`;
          if (currentUrl === menuPath || currentUrl.endsWith(menuPath)) {
            menu.is_active = true;
            isActive = true;
          }
        }
        if (menu.children && menu.children.length > 0) {
          if (setActiveMenu(menu.children)) {
            menu.is_active = true; // Activate parent if child is active
            isActive = true;
          }
        }
        if (isActive) return true;
      }
      return false;
    };

    setActiveMenu(this.hierarchicalMenus);
  }
}
