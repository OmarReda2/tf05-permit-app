import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserService } from '../auth/user.service';
import { expiryState, formatDateTime, statusLabel } from './permit-display';
import { type Permit } from './permit.model';
import { PermitService } from './permit.service';

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
  protected readonly statusFilter = signal('ALL');

  protected readonly statusLabel = statusLabel;
  protected readonly expiryState = expiryState;
  protected readonly formatDateTime = formatDateTime;

  async ngOnInit(): Promise<void> {
    await this.loadPermits();
  }

  protected filteredPermits(): Permit[] {
    const status = this.statusFilter();

    if (status === 'ALL') {
      return this.permits();
    }

    return this.permits().filter((permit) => permit.status === status);
  }

  protected setStatusFilter(status: string): void {
    this.statusFilter.set(status);
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
