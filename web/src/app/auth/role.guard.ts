import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { UserService } from './user.service';
import { type UserRole } from './user-profile.model';

export const roleGuard: CanActivateFn = async (route) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const profile = await userService.loadCurrentProfile();
  const allowedRoles = route.data['roles'] as readonly UserRole[] | undefined;

  if (!profile) {
    if (userService.status() === 'inactive') {
      return router.createUrlTree(['/profile-not-configured'], { queryParams: { reason: 'inactive' } });
    }

    return router.createUrlTree(['/profile-not-configured']);
  }

  if (!allowedRoles?.length || userService.hasRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/not-authorized']);
};
