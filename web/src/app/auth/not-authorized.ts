import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-not-authorized',
  template: `
    <section class="status-page">
      <p class="eyebrow">Not authorized</p>
      <h1>You do not have access to this page</h1>
      <p>Your profile is active, but your role is not allowed to open this area.</p>
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
export class NotAuthorized {}
