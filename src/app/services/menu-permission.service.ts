import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationMenu, MenuAccessPermission } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class MenuPermissionService {

  constructor(private router: Router) { }

  setMenuPermissionsFromRoute(menus: NavigationMenu[]): MenuAccessPermission | null {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);

    // Normalize the current route - remove leading slash for comparison
    const normalizedRoute = currentUrl.startsWith('/') ? currentUrl.substring(1) : currentUrl;

    // Recursively find menu by path
    const findMenu = (menuList: NavigationMenu[]): NavigationMenu | null => {
      for (const menu of menuList) {
        // Handle path comparison - menu path may or may not start with /
        const menuPath = menu.path || '';
        const normalizedMenuPath = menuPath.startsWith('/') ? menuPath.substring(1) : menuPath;
        
        // Exact match or path starts with menu path (for child routes)
        if (normalizedMenuPath && (normalizedRoute === normalizedMenuPath || normalizedRoute.startsWith(normalizedMenuPath + '/'))) {
          return menu;
        }
        
        // Check children recursively
        if (menu.children && menu.children.length > 0) {
          const found = findMenu(menu.children);
          if (found) return found;
        }
      }
      return null;
    };

    const matchedMenu = findMenu(menus);
    
    if (matchedMenu) {
      console.log('Matched menu:', matchedMenu);
      return matchedMenu.permissions || null;
    }

    console.log('No matching menu found for route:', currentUrl);
    return null;
  }
}