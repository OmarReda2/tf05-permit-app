import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserService } from '../auth/user.service';
import { expiryState, expiryStateKey, formatDateTime, type PermitExpiryState, statusLabel } from './permit-display';
import { type Permit, type PermitStatus } from './permit.model';
import { PermitService } from './permit.service';

type StatusFilter = 'ALL' | Exclude<PermitStatus, 'EXPIRED'>;
type ExpiryStateFilter = 'ALL' | PermitExpiryState;

@Component({
  selector: 'app-permit-list',
  imports: [RouterLink],
  templateUrl: './permit-list.html',
  styleUrl: './permit-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermitList implements OnInit {
  private readonly permitService = inject(PermitService);
  private readonly userService = inject(UserService);
  protected readonly permits = signal<Permit[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly statusFilter = signal<StatusFilter>('ALL');
  protected readonly expiryStateFilter = signal<ExpiryStateFilter>('ALL');

  protected readonly statusLabel = statusLabel;
  protected readonly expiryState = expiryState;
  protected readonly formatDateTime = formatDateTime;

  async ngOnInit(): Promise<void> {
    await this.loadPermits();
  }

  protected filteredPermits(): Permit[] {
    const statusFilter = this.statusFilter();
    const expiryFilter = this.expiryStateFilter();

    return this.permits().filter((permit) => {
      const matchesStatus = statusFilter === 'ALL' || permit.status === statusFilter;
      const matchesExpiry = expiryFilter === 'ALL' || expiryStateKey(permit) === expiryFilter;

      return matchesStatus && matchesExpiry;
    });
  }

  protected canCreatePermit(): boolean {
    return this.userService.profile()?.role === 'SITE_USER';
  }

  protected emptyMessage(): string {
    if (this.canCreatePermit() && this.permits().length === 0) {
      return 'No permits found.';
    }

    return 'No permits found for the selected filters.';
  }

  protected setStatusFilter(status: string): void {
    this.statusFilter.set(status as StatusFilter);
  }

  protected setExpiryStateFilter(expiryState: string): void {
    this.expiryStateFilter.set(expiryState as ExpiryStateFilter);
  }

  private async loadPermits(): Promise<void> {
    const profile = this.userService.profile();

    if (!profile) {
      this.errorMessage.set('User profile is not loaded.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      this.permits.set(await this.permitService.getPermitsForCurrentUser(profile.uid, profile.role));
    } catch {
      this.errorMessage.set('Permits could not be loaded. Check your access and try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
