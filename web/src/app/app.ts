import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './auth/auth.service';
import { UserService } from './auth/user.service';
import { type UserRole } from './auth/user-profile.model';

interface NavItem {
  label: string;
  path: string;
  roles?: readonly UserRole[];
  showInMobile?: boolean;
}

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
  protected readonly userService = inject(UserService);
  protected readonly isLoginRoute = signal(this.router.url.startsWith('/login'));

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Permits', path: '/permits' },
    { label: 'New Permit', path: '/permits/new', roles: ['SITE_USER'] },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Activity Log', path: '/activity-log', showInMobile: false },
    { label: 'Admin', path: '/admin', roles: ['ADMIN'] },
    { label: 'Checklist Items', path: '/admin/checklist-items', roles: ['ADMIN', 'HSE_MANAGER'] },
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
    this.userService.clearProfile();
    await this.router.navigateByUrl('/login');
  }

  protected canShowNavItem(item: NavItem): boolean {
    if (!item.roles) {
      return true;
    }

    return this.userService.hasRole(item.roles);
  }
}
