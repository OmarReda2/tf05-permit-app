import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [RouterLink],
  template: `
    <section class="admin-page">
      <p class="eyebrow">Admin</p>
      <h1>Admin</h1>
      <p>Manage MVP configuration for the TF-05 permit app.</p>

      <div class="admin-links">
        <a routerLink="/admin/permit-types">Permit Types</a>
        <a routerLink="/admin/checklist-items">Checklist Items</a>
      </div>
    </section>
  `,
  styles: `
    .admin-page {
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
      margin: 14px 0 24px;
      color: var(--tf-muted);
      line-height: 1.6;
    }

    .admin-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    a {
      display: inline-flex;
      min-height: 42px;
      align-items: center;
      padding: 10px 14px;
      border-radius: var(--tf-radius);
      background: var(--tf-primary);
      color: #ffffff;
      font-weight: 700;
      text-decoration: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Admin {}
