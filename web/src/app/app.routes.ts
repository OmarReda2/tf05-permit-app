import { Routes } from '@angular/router';

import { Admin } from './admin/admin';
import { ChecklistItems } from './admin/checklist-items';
import { PermitTypes } from './admin/permit-types';
import { HseApprovals } from './approvals/hse-approvals';
import { authGuard, loginGuard } from './auth/auth.guard';
import { Login } from './auth/login';
import { NotAuthorized } from './auth/not-authorized';
import { Profile } from './auth/profile';
import { ProfileNotConfigured } from './auth/profile-not-configured';
import { profileStatusGuard } from './auth/profile-status.guard';
import { roleGuard } from './auth/role.guard';
import { Dashboard } from './dashboard/dashboard';
import { PermitDetails } from './permits/permit-details';
import { PermitList } from './permits/permit-list';
import { NewPermit } from './permits/new-permit';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, profileStatusGuard],
  },
  {
    path: 'permits/new',
    component: NewPermit,
    canActivate: [authGuard, profileStatusGuard, roleGuard],
    data: {
      roles: ['SITE_USER'],
    },
  },
  {
    path: 'permits',
    component: PermitList,
    canActivate: [authGuard, profileStatusGuard],
  },
  {
    path: 'permits/:id',
    component: PermitDetails,
    canActivate: [authGuard, profileStatusGuard],
  },
  {
    path: 'approvals',
    component: HseApprovals,
    canActivate: [authGuard, profileStatusGuard, roleGuard],
    data: {
      roles: ['HSE_MANAGER', 'CONSTRUCTION_MANAGER'],
    },
  },
  {
    path: 'admin/permit-types',
    component: PermitTypes,
    canActivate: [authGuard, profileStatusGuard, roleGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
  {
    path: 'admin/checklist-items',
    component: ChecklistItems,
    canActivate: [authGuard, profileStatusGuard, roleGuard],
    data: {
      roles: ['ADMIN', 'HSE_MANAGER'],
    },
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, profileStatusGuard, roleGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard, profileStatusGuard],
  },
  {
    path: 'profile-not-configured',
    component: ProfileNotConfigured,
    canActivate: [authGuard],
  },
  {
    path: 'not-authorized',
    component: NotAuthorized,
    canActivate: [authGuard, profileStatusGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
