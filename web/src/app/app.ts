import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly isLoginRoute = signal(this.router.url.startsWith('/login'));

  protected readonly navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Permits', path: '/permits' },
    { label: 'New Permit', path: '/permits/new' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Admin', path: '/admin' },
    { label: 'Profile', path: '/profile' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.isLoginRoute.set(event.urlAfterRedirects.startsWith('/login'));
      });
  }

  protected async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
