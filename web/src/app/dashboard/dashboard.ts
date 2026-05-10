import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserService } from '../auth/user.service';
import { type UserRole } from '../auth/user-profile.model';
import {
  expiryState,
  expiryStateClass,
  expiryStateKey,
  formatDateTime,
  riskClass,
  statusClass,
  statusLabel,
} from '../permits/permit-display';
import { type Permit } from '../permits/permit.model';
import { PermitService } from '../permits/permit.service';

interface DashboardCard {
  label: string;
  value: number;
  detail: string;
}

interface DashboardSummary {
  total: number;
  pendingHse: number;
  pendingConstructionManager: number;
  approved: number;
  active: number;
  expiringSoon: number;
  expired: number;
  rejected: number;
}

interface DashboardSegment {
  label: string;
  value: number;
  className: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly permitService = inject(PermitService);
  private readonly userService = inject(UserService);

  protected readonly permits = signal<Permit[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly summary = computed(() => this.calculateSummary(this.permits()));
  protected readonly cards = computed(() => this.cardsForRole(this.summary(), this.currentRole()));
  protected readonly recentPermits = computed(() => this.permits().slice(0, 5));
  protected readonly statusSegments = computed<DashboardSegment[]>(() => {
    const summary = this.summary();
    return [
      { label: 'Submitted', value: summary.pendingHse, className: 'segment-submitted' },
      { label: 'HSE approved', value: summary.pendingConstructionManager, className: 'segment-hse' },
      { label: 'Approved', value: summary.approved, className: 'segment-approved' },
      { label: 'Rejected', value: summary.rejected, className: 'segment-rejected' },
    ].filter((segment) => segment.value > 0);
  });
  protected readonly expiringSoonPermits = computed(() =>
    this.permits()
      .filter((permit) => expiryStateKey(permit) === 'EXPIRING_SOON')
      .slice(0, 4),
  );

  protected readonly statusLabel = statusLabel;
  protected readonly statusClass = statusClass;
  protected readonly expiryState = expiryState;
  protected readonly expiryStateClass = expiryStateClass;
  protected readonly riskClass = riskClass;
  protected readonly formatDateTime = formatDateTime;

  async ngOnInit(): Promise<void> {
    await this.loadPermits();
  }

  protected currentRole(): UserRole | null {
    return this.userService.profile()?.role ?? null;
  }

  protected dashboardSubtitle(): string {
    if (this.currentRole() === 'SITE_USER') {
      return 'Your permit summary';
    }

    return 'Permit summary for your role';
  }

  protected segmentWidth(value: number): number {
    const total = this.summary().total;
    return total > 0 ? Math.max(6, Math.round((value / total) * 100)) : 0;
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
      this.errorMessage.set('Dashboard permits could not be loaded. Check your access and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private calculateSummary(permits: Permit[]): DashboardSummary {
    const now = Date.now();

    return permits.reduce<DashboardSummary>(
      (summary, permit) => {
        summary.total += 1;

        if (permit.status === 'SUBMITTED') {
          summary.pendingHse += 1;
        }

        if (permit.status === 'HSE_APPROVED') {
          summary.pendingConstructionManager += 1;
        }

        if (permit.status === 'REJECTED') {
          summary.rejected += 1;
        }

        if (permit.status === 'APPROVED') {
          summary.approved += 1;
          const expiryTime = permit.expiryTime?.getTime();

          if (expiryTime && now >= expiryTime) {
            summary.expired += 1;
          } else if (expiryTime) {
            summary.active += 1;

            if (expiryTime - now <= 2 * 60 * 60 * 1000) {
              summary.expiringSoon += 1;
            }
          }
        }

        return summary;
      },
      {
        total: 0,
        pendingHse: 0,
        pendingConstructionManager: 0,
        approved: 0,
        active: 0,
        expiringSoon: 0,
        expired: 0,
        rejected: 0,
      },
    );
  }

  private cardsForRole(summary: DashboardSummary, role: UserRole | null): DashboardCard[] {
    if (role === 'SITE_USER') {
      return [
        { label: 'Own Submitted Permits', value: summary.pendingHse, detail: 'Waiting for HSE review' },
        { label: 'Own Approved Permits', value: summary.approved, detail: 'Fully approved permits' },
        { label: 'Own Expiring Soon', value: summary.expiringSoon, detail: 'Approved permits expiring within 2 hours' },
        { label: 'Own Expired Permits', value: summary.expired, detail: 'Approved permits past expiry time' },
        { label: 'Own Rejected Permits', value: summary.rejected, detail: 'Permits rejected during review' },
      ];
    }

    if (role === 'HSE_MANAGER') {
      return [
        { label: 'Pending HSE Approval', value: summary.pendingHse, detail: 'Submitted permits waiting for HSE' },
        { label: 'Active Permits', value: summary.active, detail: 'Approved permits before expiry' },
        { label: 'Expiring Soon', value: summary.expiringSoon, detail: 'Approved permits expiring within 2 hours' },
        { label: 'Expired', value: summary.expired, detail: 'Approved permits past expiry time' },
        { label: 'Rejected', value: summary.rejected, detail: 'Permits rejected during review' },
      ];
    }

    if (role === 'CONSTRUCTION_MANAGER') {
      return [
        {
          label: 'Pending Construction Manager Approval',
          value: summary.pendingConstructionManager,
          detail: 'HSE-approved permits waiting for final review',
        },
        { label: 'Active Permits', value: summary.active, detail: 'Approved permits before expiry' },
        { label: 'Expiring Soon', value: summary.expiringSoon, detail: 'Approved permits expiring within 2 hours' },
        { label: 'Expired', value: summary.expired, detail: 'Approved permits past expiry time' },
        { label: 'Rejected', value: summary.rejected, detail: 'Permits rejected during review' },
      ];
    }

    return [
      { label: 'Total Permits', value: summary.total, detail: 'All permits in Firestore' },
      { label: 'Pending HSE Approval', value: summary.pendingHse, detail: 'Submitted permits waiting for HSE' },
      {
        label: 'Pending Construction Manager Approval',
        value: summary.pendingConstructionManager,
        detail: 'HSE-approved permits waiting for final review',
      },
      { label: 'Active Permits', value: summary.active, detail: 'Approved permits before expiry' },
      { label: 'Expiring Soon', value: summary.expiringSoon, detail: 'Approved permits expiring within 2 hours' },
      { label: 'Expired', value: summary.expired, detail: 'Approved permits past expiry time' },
      { label: 'Rejected', value: summary.rejected, detail: 'Permits rejected during review' },
    ];
  }
}
