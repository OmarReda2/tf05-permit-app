import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { UserService } from './user.service';

export const profileStatusGuard: CanActivateFn = async () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const profile = await userService.loadCurrentProfile();

  if (profile) {
    return true;
  }

  if (userService.status() === 'inactive') {
    return router.createUrlTree(['/profile-not-configured'], { queryParams: { reason: 'inactive' } });
  }

  return router.createUrlTree(['/profile-not-configured']);
};
