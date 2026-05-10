import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { UserService } from './user.service';

@Component({
  selector: 'app-profile',
  template: `
    <section class="profile-page">
      <p class="eyebrow">User profile</p>
      <h1>Profile</h1>

      @if (userService.profile(); as profile) {
        <dl>
          <div>
            <dt>Display name</dt>
            <dd>{{ profile.displayName }}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{{ profile.email }}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{{ profile.role }}</dd>
          </div>
          <div>
            <dt>Active</dt>
            <dd>{{ profile.active ? 'Yes' : 'No' }}</dd>
          </div>
        </dl>
      }
    </section>
  `,
  styles: `
    .profile-page {
      max-width: 720px;
      padding: 24px;
      border: 1px solid var(--tf-border);
      border-radius: var(--tf-radius);
      background: var(--tf-surface);
      box-shadow: var(--tf-shadow-sm);
    }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--tf-primary);
      font-size: 0.76rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    h1 {
      margin: 0 0 22px;
      color: var(--tf-heading);
      font-size: 1.9rem;
      font-weight: 600;
      line-height: 1.2;
    }

    dl {
      display: grid;
      gap: 16px;
      margin: 0;
    }

    div {
      display: grid;
      gap: 4px;
    }

    dt {
      color: var(--tf-muted);
      font-size: 0.76rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    dd {
      margin: 0;
      color: var(--tf-text);
      font-size: 1rem;
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  protected readonly userService = inject(UserService);
}
