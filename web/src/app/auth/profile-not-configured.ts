import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-not-configured',
  template: `
    <section class="status-page">
      <p class="eyebrow">Access blocked</p>
      <h1>{{ content().title }}</h1>
      <p>{{ content().message }}</p>
    </section>
  `,
  styles: `
    .status-page {
      max-width: 720px;
      padding: 28px;
      border: 1px solid var(--tf-border);
      border-radius: var(--tf-radius);
      background: var(--tf-surface);
      box-shadow: var(--tf-shadow-sm);
    }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--tf-accent);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: var(--tf-text);
      font-size: 2rem;
      line-height: 1.2;
    }

    p {
      margin: 14px 0 0;
      color: var(--tf-muted);
      line-height: 1.6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileNotConfigured {
  private readonly route = inject(ActivatedRoute);
  private readonly reason = this.route.snapshot.queryParamMap.get('reason');

  protected readonly content = computed(() => {
    if (this.reason === 'inactive') {
      return {
        title: 'Account disabled',
        message: 'Your application access is disabled. Please contact the system admin.',
      };
    }

    return {
      title: 'Profile not configured',
      message:
        'Your login exists, but your application profile has not been configured yet. Please contact the system admin.',
    };
  });
}
