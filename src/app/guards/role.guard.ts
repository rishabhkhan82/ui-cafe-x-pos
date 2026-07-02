import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = (route.data as any)?.allowedRoles || [];

  if (!allowedRoles.length) {
    return router.parseUrl('/unauthrized-access');
  }

  const userRole = authService.getUserRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  return router.parseUrl('/unauthrized-access');
};
