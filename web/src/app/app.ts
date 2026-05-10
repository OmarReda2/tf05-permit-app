import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';

import { AuthService } from './auth/auth.service';
import { ThemeService } from './theme.service';
import { UserService } from './auth/user.service';
import { type UserRole } from './auth/user-profile.model';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: readonly UserRole[];
  showInMobile?: boolean;
  secondary?: boolean;
}

interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly userService = inject(UserService);
  protected readonly currentUrl = signal(this.router.url);
  protected readonly sidebarCollapsed = signal(localStorage.getItem('tf05-sidebar') === 'collapsed');
  protected readonly accountMenuOpen = signal(false);
  protected readonly confirmLogoutOpen = signal(false);
  protected readonly snackMessage = signal('');

  protected readonly navGroups: readonly NavGroup[] = [
    {
      label: 'Monitor',
      items: [{ label: 'Dashboard', path: '/dashboard', icon: 'dashboard', showInMobile: true }],
    },
    {
      label: 'Permits',
      items: [
        { label: 'Permits', path: '/permits', icon: 'permits', showInMobile: true },
        { label: 'New Permit', path: '/permits/new', icon: 'new', roles: ['SITE_USER'], showInMobile: true },
        {
          label: 'Approvals',
          path: '/approvals',
          icon: 'approvals',
          roles: ['HSE_MANAGER', 'CONSTRUCTION_MANAGER'],
          showInMobile: true,
        },
        { label: 'Activity Log', path: '/activity-log', icon: 'activity', secondary: true },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { label: 'Admin', path: '/admin', icon: 'admin', roles: ['ADMIN'], secondary: true },
        { label: 'Permit Types', path: '/admin/permit-types', icon: 'types', roles: ['ADMIN'], secondary: true },
        {
          label: 'Checklist Items',
          path: '/admin/checklist-items',
          icon: 'checklist',
          roles: ['ADMIN', 'HSE_MANAGER'],
          secondary: true,
        },
      ],
    },
  ];

  protected readonly mobileNavItems = computed(() =>
    this.navGroups.flatMap((group) => group.items).filter((item) => item.showInMobile && this.canShowNavItem(item)),
  );
  protected readonly secondaryAccountItems = computed(() =>
    this.navGroups.flatMap((group) => group.items).filter((item) => item.secondary && this.canShowNavItem(item)),
  );
  protected readonly isBareRoute = computed(() =>
    this.currentUrl().startsWith('/login') || this.currentUrl().startsWith('/profile-not-configured'),
  );
  protected readonly shellReady = computed(
    () => this.authService.ready() && !!this.authService.user() && this.userService.status() === 'active',
  );

  constructor() {
    this.setPageTitle(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        const nextUrl = event.urlAfterRedirects;
        this.currentUrl.set(nextUrl);
        this.setPageTitle(nextUrl);
      });
  }

  protected async logout(): Promise<void> {
    this.confirmLogoutOpen.set(false);
    this.closeAccountMenu();
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

  protected canShowNavGroup(group: NavGroup): boolean {
    return group.items.some((item) => this.canShowNavItem(item));
  }

  protected isNavActive(item: NavItem): boolean {
    const url = this.currentUrl().split('?')[0];

    if (item.path === '/permits') {
      return url === '/permits' || (url.startsWith('/permits/') && !url.startsWith('/permits/new'));
    }

    return url === item.path;
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => {
      const nextValue = !collapsed;
      localStorage.setItem('tf05-sidebar', nextValue ? 'collapsed' : 'expanded');
      return nextValue;
    });
  }

  protected toggleAccountMenu(): void {
    this.accountMenuOpen.update((open) => !open);
  }

  protected closeAccountMenu(): void {
    this.accountMenuOpen.set(false);
  }

  protected requestLogout(): void {
    this.closeAccountMenu();
    this.confirmLogoutOpen.set(true);
  }

  protected cancelLogout(): void {
    this.confirmLogoutOpen.set(false);
  }

  protected toggleTheme(): void {
    const nextTheme = this.themeService.toggleTheme();
    this.showSnack(nextTheme === 'dark' ? 'Dark mode enabled.' : 'Light mode enabled.');
    this.closeAccountMenu();
  }

  protected themeLabel(): string {
    return this.themeService.themeLabel();
  }

  private showSnack(message: string): void {
    this.snackMessage.set(message);
    window.setTimeout(() => {
      if (this.snackMessage() === message) {
        this.snackMessage.set('');
      }
    }, 2600);
  }

  @HostListener('document:click', ['$event'])
  protected closeAccountMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.accountMenuOpen()) {
      return;
    }

    const accountMenu = this.elementRef.nativeElement.querySelector('.account-menu');

    if (accountMenu && !accountMenu.contains(event.target as Node)) {
      this.closeAccountMenu();
    }
  }

  @HostListener('document:keydown.escape')
  protected closeOverlaysOnEscape(): void {
    this.closeAccountMenu();
    this.confirmLogoutOpen.set(false);
  }

  private setPageTitle(url: string): void {
    const cleanUrl = url.split('?')[0];
    const pageTitle = this.pageTitleForUrl(cleanUrl);
    this.title.setTitle(pageTitle ? `${pageTitle} | TF-05 Permit App` : 'TF-05 Permit App');
  }

  private pageTitleForUrl(url: string): string {
    if (url.startsWith('/login')) {
      return 'Sign in';
    }

    if (url.startsWith('/permits/new')) {
      return 'New Permit';
    }

    if (url.startsWith('/permits/') && url !== '/permits') {
      return 'Permit Details';
    }

    if (url.startsWith('/admin/permit-types')) {
      return 'Permit Types';
    }

    if (url.startsWith('/admin/checklist-items')) {
      return 'Checklist Items';
    }

    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/permits': 'Permits',
      '/approvals': 'Approvals',
      '/activity-log': 'Activity Log',
      '/admin': 'Admin',
      '/profile': 'Profile',
      '/not-authorized': 'Not Authorized',
      '/profile-not-configured': 'Profile Not Configured',
    };

    return titles[url] ?? 'Dashboard';
  }
}
