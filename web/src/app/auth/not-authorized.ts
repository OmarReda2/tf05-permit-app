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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotAuthorized {}
