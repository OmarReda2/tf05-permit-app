import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UserService } from '../auth/user.service';
import { expiryState, formatDateTime, statusLabel } from './permit-display';
import { type Permit, type PermitChecklistResponse, type PermitEvent } from './permit.model';
import { PermitService } from './permit.service';

@Component({
  selector: 'app-permit-details',
  imports: [RouterLink],
  templateUrl: './permit-details.html',
  styleUrl: './permit-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermitDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly permitService = inject(PermitService);
  private readonly userService = inject(UserService);

  protected readonly permit = signal<Permit | null>(null);
  protected readonly checklistResponses = signal<PermitChecklistResponse[]>([]);
  protected readonly events = signal<PermitEvent[]>([]);
  protected readonly loading = signal(false);
  protected readonly actionSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly actionErrorMessage = signal('');
  protected readonly actionSuccessMessage = signal('');

  protected readonly statusLabel = statusLabel;
  protected readonly expiryState = expiryState;
  protected readonly formatDateTime = formatDateTime;

  async ngOnInit(): Promise<void> {
    const permitId = this.route.snapshot.paramMap.get('id');

    if (!permitId) {
      this.errorMessage.set('Permit ID is missing.');
      return;
    }

    await this.loadPermit(permitId);
  }

  protected canHseAct(permit: Permit): boolean {
    return this.userService.profile()?.role === 'HSE_MANAGER' && permit.status === 'SUBMITTED';
  }

  protected async approveByHse(permitId: string): Promise<void> {
    const profile = this.userService.profile();

    if (!profile) {
      this.actionErrorMessage.set('User profile is not loaded.');
      return;
    }

    this.actionSaving.set(true);
    this.actionErrorMessage.set('');
    this.actionSuccessMessage.set('');

    try {
      await this.permitService.approveByHse(permitId, profile);
      this.actionSuccessMessage.set('Permit approved by HSE.');
      await this.loadPermit(permitId);
    } catch (error) {
      this.actionErrorMessage.set(error instanceof Error ? error.message : 'Permit could not be approved.');
    } finally {
      this.actionSaving.set(false);
    }
  }

  protected async rejectByHse(permitId: string, reason: string): Promise<void> {
    const profile = this.userService.profile();
    const trimmedReason = reason.trim();

    if (!profile) {
      this.actionErrorMessage.set('User profile is not loaded.');
      return;
    }

    if (!trimmedReason) {
      this.actionErrorMessage.set('Rejection reason is required.');
      return;
    }

    this.actionSaving.set(true);
    this.actionErrorMessage.set('');
    this.actionSuccessMessage.set('');

    try {
      await this.permitService.rejectByHse(permitId, trimmedReason, profile);
      this.actionSuccessMessage.set('Permit rejected by HSE.');
      await this.loadPermit(permitId);
    } catch (error) {
      this.actionErrorMessage.set(error instanceof Error ? error.message : 'Permit could not be rejected.');
    } finally {
      this.actionSaving.set(false);
    }
  }

  private async loadPermit(permitId: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const permit = await this.permitService.getPermitById(permitId);
      const profile = this.userService.profile();

      if (!permit) {
        this.errorMessage.set('Permit was not found.');
        return;
      }

      if (profile?.role === 'SITE_USER' && permit.requestedByUserId !== profile.uid) {
        this.errorMessage.set('You are not authorized to view this permit.');
        return;
      }

      const [checklistResponses, events] = await Promise.all([
        this.permitService.getChecklistResponsesForPermit(permit.id),
        this.permitService.getEventsForPermit(permit.id),
      ]);

      this.permit.set(permit);
      this.checklistResponses.set(checklistResponses);
      this.events.set(events);
    } catch {
      this.errorMessage.set('Permit details could not be loaded. Check your access and try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
