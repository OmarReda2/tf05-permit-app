import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Routes } from '@angular/router';

import { Admin } from './admin/admin';
import { ChecklistItems } from './admin/checklist-items';
import { PermitTypes } from './admin/permit-types';
import { authGuard, loginGuard } from './auth/auth.guard';
import { Login } from './auth/login';
import { NotAuthorized } from './auth/not-authorized';
import { Profile } from './auth/profile';
import { ProfileNotConfigured } from './auth/profile-not-configured';
import { profileStatusGuard } from './auth/profile-status.guard';
import { roleGuard } from './auth/role.guard';
import { PermitDetails } from './permits/permit-details';
import { PermitList } from './permits/permit-list';
import { NewPermit } from './permits/new-permit';

@Component({
  selector: 'app-placeholder-page',
  template: `
    <section class="placeholder-page">
      <p class="eyebrow">Slice 1 placeholder</p>
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
    </section>
  `,
  styles: `
    .placeholder-page {
      max-width: 720px;
      padding: 28px;
      border: 1px solid #d8dee8;
      border-radius: 8px;
      background: #ffffff;
    }

    .eyebrow {
      margin: 0 0 10px;
      color: #5d6b7e;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: #172033;
      font-size: 2rem;
      line-height: 1.2;
    }

    p {
      margin: 14px 0 0;
      color: #475467;
      line-height: 1.6;
    }

    @media (max-width: 760px) {
      .placeholder-page {
        padding: 22px;
      }

      h1 {
        font-size: 1.6rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlaceholderPage {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    component: PlaceholderPage,
    canActivate: [authGuard, profileStatusGuard],
    data: {
      title: 'Dashboard',
      description: 'A simple landing page for future permit status summaries.',
    },
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
    component: PlaceholderPage,
    canActivate: [authGuard, profileStatusGuard, roleGuard],
    data: {
      title: 'Approvals',
      description: 'A future queue for HSE and Construction Manager reviews.',
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
