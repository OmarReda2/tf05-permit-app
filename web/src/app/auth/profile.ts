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
      margin: 0 0 22px;
      color: #172033;
      font-size: 2rem;
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
      color: #5d6b7e;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    dd {
      margin: 0;
      color: #172033;
      font-size: 1rem;
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  protected readonly userService = inject(UserService);
}
