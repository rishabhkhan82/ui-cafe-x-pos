import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = (route.data as any)?.allowedRoles || [];

  if (!allowedRoles.length) {
    router.navigate(['/unauthrized-access']);
    return false;
  }

  const userRole = authService.getUserRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/unauthrized-access']);
  return false;
};
