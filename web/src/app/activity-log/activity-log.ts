import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserService } from '../auth/user.service';
import { formatDateTime } from '../permits/permit-display';
import { type Permit, type PermitEvent, type PermitEventAction } from '../permits/permit.model';
import { PermitService } from '../permits/permit.service';

interface ActivityLogItem {
  event: PermitEvent;
  permitNumber: string;
}

@Component({
  selector: 'app-activity-log',
  imports: [RouterLink],
  templateUrl: './activity-log.html',
  styleUrl: './activity-log.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityLog implements OnInit {
  private readonly permitService = inject(PermitService);
  private readonly userService = inject(UserService);

  protected readonly activityItems = signal<ActivityLogItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly formatDateTime = formatDateTime;

  async ngOnInit(): Promise<void> {
    await this.loadActivityLog();
  }

  protected eventLabel(action: PermitEventAction): string {
    switch (action) {
      case 'PERMIT_SUBMITTED':
        return 'Permit Submitted';
      case 'HSE_APPROVED':
        return 'HSE Approved';
      case 'HSE_REJECTED':
        return 'HSE Rejected';
      case 'CM_APPROVED':
        return 'Construction Manager Approved';
      case 'CM_REJECTED':
        return 'Construction Manager Rejected';
    }
  }

  private async loadActivityLog(): Promise<void> {
    const profile = this.userService.profile();

    if (!profile) {
      this.errorMessage.set('User profile is not loaded.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const permits = await this.permitService.getPermitsForCurrentUser(profile.uid, profile.role);
      const permitNumberById = new Map(permits.map((permit) => [permit.id, this.permitLabel(permit)]));
      const eventGroups = await Promise.all(
        permits.map((permit) => this.permitService.getEventsForPermit(permit.id)),
      );

      const items = eventGroups
        .flat()
        .map((event) => ({
          event,
          permitNumber: permitNumberById.get(event.permitId) ?? event.permitId,
        }))
        .sort((first, second) => this.dateValue(second.event.createdAt) - this.dateValue(first.event.createdAt));

      this.activityItems.set(items);
    } catch {
      this.errorMessage.set('Activity log could not be loaded. Check your access and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private permitLabel(permit: Permit): string {
    return permit.permitNumber || permit.id;
  }

  private dateValue(date: Date | null): number {
    return date?.getTime() ?? 0;
  }
}
