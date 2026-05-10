import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UserService } from '../auth/user.service';
import { expiryState, expiryStateClass, formatDateTime, riskClass, statusClass, statusLabel } from './permit-display';
import { type Permit, type PermitChecklistResponse, type PermitEvent } from './permit.model';
import { PermitService } from './permit.service';

type PendingPermitAction =
  | {
      type: 'HSE_APPROVE' | 'CM_APPROVE';
      permitId: string;
      title: string;
      message: string;
      confirmLabel: string;
      destructive: false;
    }
  | {
      type: 'HSE_REJECT' | 'CM_REJECT';
      permitId: string;
      reason: string;
      title: string;
      message: string;
      confirmLabel: string;
      destructive: true;
    };

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
  protected readonly actionContext = signal<'HSE' | 'CM' | ''>('');
  protected readonly generatedAt = signal(new Date());
  protected readonly pendingAction = signal<PendingPermitAction | null>(null);
  protected readonly snackMessage = signal('');

  protected readonly statusLabel = statusLabel;
  protected readonly statusClass = statusClass;
  protected readonly expiryState = expiryState;
  protected readonly expiryStateClass = expiryStateClass;
  protected readonly riskClass = riskClass;
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

  protected canConstructionManagerAct(permit: Permit): boolean {
    return this.userService.profile()?.role === 'CONSTRUCTION_MANAGER' && permit.status === 'HSE_APPROVED';
  }

  protected printPermit(permit: Permit): void {
    const previousTitle = document.title;
    document.title = permit.permitNumber || 'TF05-Permit';
    this.generatedAt.set(new Date());
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.title = previousTitle;
      }, 500);
    });
  }

  protected requestApproveByHse(permitId: string): void {
    this.pendingAction.set({
      type: 'HSE_APPROVE',
      permitId,
      title: 'Approve permit as HSE?',
      message: 'This moves the permit to Construction Manager review.',
      confirmLabel: 'Approve',
      destructive: false,
    });
  }

  protected requestRejectByHse(permitId: string, reason: string): void {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      this.actionContext.set('HSE');
      this.actionErrorMessage.set('Rejection reason is required.');
      return;
    }

    this.pendingAction.set({
      type: 'HSE_REJECT',
      permitId,
      reason: trimmedReason,
      title: 'Reject permit as HSE?',
      message: 'This will mark the permit as rejected and record your reason in the event log.',
      confirmLabel: 'Reject',
      destructive: true,
    });
  }

  protected requestApproveByConstructionManager(permitId: string): void {
    this.pendingAction.set({
      type: 'CM_APPROVE',
      permitId,
      title: 'Final approve permit?',
      message: 'This marks the permit as approved and active until its expiry time.',
      confirmLabel: 'Approve',
      destructive: false,
    });
  }

  protected requestRejectByConstructionManager(permitId: string, reason: string): void {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      this.actionContext.set('CM');
      this.actionErrorMessage.set('Rejection reason is required.');
      return;
    }

    this.pendingAction.set({
      type: 'CM_REJECT',
      permitId,
      reason: trimmedReason,
      title: 'Reject permit as Construction Manager?',
      message: 'This will mark the permit as rejected and record your reason in the event log.',
      confirmLabel: 'Reject',
      destructive: true,
    });
  }

  protected cancelPendingAction(): void {
    this.pendingAction.set(null);
  }

  @HostListener('document:keydown.escape')
  protected closePendingActionOnEscape(): void {
    this.cancelPendingAction();
  }

  protected async confirmPendingAction(): Promise<void> {
    const pendingAction = this.pendingAction();

    if (!pendingAction) {
      return;
    }

    this.pendingAction.set(null);

    switch (pendingAction.type) {
      case 'HSE_APPROVE':
        await this.approveByHse(pendingAction.permitId);
        break;
      case 'HSE_REJECT':
        await this.rejectByHse(pendingAction.permitId, pendingAction.reason);
        break;
      case 'CM_APPROVE':
        await this.approveByConstructionManager(pendingAction.permitId);
        break;
      case 'CM_REJECT':
        await this.rejectByConstructionManager(pendingAction.permitId, pendingAction.reason);
        break;
    }

    if (this.actionSuccessMessage()) {
      this.showSnack(this.actionSuccessMessage());
    }
  }

  protected async approveByHse(permitId: string): Promise<void> {
    const profile = this.userService.profile();

    if (!profile) {
      this.actionErrorMessage.set('User profile is not loaded.');
      return;
    }

    this.actionSaving.set(true);
    this.actionContext.set('HSE');
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
      this.actionContext.set('HSE');
      this.actionErrorMessage.set('Rejection reason is required.');
      return;
    }

    this.actionSaving.set(true);
    this.actionContext.set('HSE');
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

  protected async approveByConstructionManager(permitId: string): Promise<void> {
    const profile = this.userService.profile();

    if (!profile) {
      this.actionErrorMessage.set('User profile is not loaded.');
      return;
    }

    this.actionSaving.set(true);
    this.actionContext.set('CM');
    this.actionErrorMessage.set('');
    this.actionSuccessMessage.set('');

    try {
      await this.permitService.approveByConstructionManager(permitId, profile);
      this.actionSuccessMessage.set('Permit approved by Construction Manager.');
      await this.loadPermit(permitId);
    } catch (error) {
      this.actionErrorMessage.set(error instanceof Error ? error.message : 'Permit could not be approved.');
    } finally {
      this.actionSaving.set(false);
    }
  }

  protected async rejectByConstructionManager(permitId: string, reason: string): Promise<void> {
    const profile = this.userService.profile();
    const trimmedReason = reason.trim();

    if (!profile) {
      this.actionErrorMessage.set('User profile is not loaded.');
      return;
    }

    if (!trimmedReason) {
      this.actionContext.set('CM');
      this.actionErrorMessage.set('Rejection reason is required.');
      return;
    }

    this.actionSaving.set(true);
    this.actionContext.set('CM');
    this.actionErrorMessage.set('');
    this.actionSuccessMessage.set('');

    try {
      await this.permitService.rejectByConstructionManager(permitId, trimmedReason, profile);
      this.actionSuccessMessage.set('Permit rejected by Construction Manager.');
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

  private showSnack(message: string): void {
    this.snackMessage.set(message);
    window.setTimeout(() => {
      if (this.snackMessage() === message) {
        this.snackMessage.set('');
      }
    }, 2600);
  }
}
