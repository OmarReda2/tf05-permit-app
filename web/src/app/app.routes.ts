import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Routes } from '@angular/router';

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
    path: 'dashboard',
    component: PlaceholderPage,
    data: {
      title: 'Dashboard',
      description: 'A simple landing page for future permit status summaries.',
    },
  },
  {
    path: 'permits',
    component: PlaceholderPage,
    data: {
      title: 'Permits',
      description: 'A future home for permit lists and permit detail navigation.',
    },
  },
  {
    path: 'permits/new',
    component: PlaceholderPage,
    data: {
      title: 'New Permit',
      description: 'A future starting point for creating a TF-05 safety permit.',
    },
  },
  {
    path: 'approvals',
    component: PlaceholderPage,
    data: {
      title: 'Approvals',
      description: 'A future queue for HSE and Construction Manager reviews.',
    },
  },
  {
    path: 'admin',
    component: PlaceholderPage,
    data: {
      title: 'Admin',
      description: 'A future area for user, permit type, and checklist setup.',
    },
  },
  {
    path: 'profile',
    component: PlaceholderPage,
    data: {
      title: 'Profile',
      description: 'A future page for the signed-in user profile and role.',
    },
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
