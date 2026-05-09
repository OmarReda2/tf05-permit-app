import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await authService.waitForInitialUser();

  return user ? true : router.createUrlTree(['/login']);
};

export const loginGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await authService.waitForInitialUser();

  return user ? router.createUrlTree(['/dashboard']) : true;
};
