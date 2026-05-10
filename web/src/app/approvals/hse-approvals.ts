import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserService } from '../auth/user.service';
import {
  expiryState,
  expiryStateClass,
  formatDateTime,
  riskClass,
  statusClass,
  statusLabel,
} from '../permits/permit-display';
import { type Permit } from '../permits/permit.model';
import { PermitService } from '../permits/permit.service';

type PendingQueueAction =
  | { type: 'APPROVE'; permitId: string; title: string; message: string; confirmLabel: string; destructive: false }
  | {
      type: 'REJECT';
      permitId: string;
      reason: string;
      title: string;
      message: string;
      confirmLabel: string;
      destructive: true;
    };

@Component({
  selector: 'app-hse-approvals',
  imports: [RouterLink],
  templateUrl: './hse-approvals.html',
  styleUrl: './hse-approvals.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HseApprovals implements OnInit {
  private readonly permitService = inject(PermitService);
  private readonly userService = inject(UserService);

  protected readonly permits = signal<Permit[]>([]);
  protected readonly loading = signal(false);
  protected readonly processingPermitId = signal('');
  protected readonly loadErrorMessage = signal('');
  protected readonly actionErrorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly pendingAction = signal<PendingQueueAction | null>(null);
  protected readonly snackMessage = signal('');

  protected readonly statusLabel = statusLabel;
  protected readonly statusClass = statusClass;
  protected readonly expiryState = expiryState;
  protected readonly expiryStateClass = expiryStateClass;
  protected readonly riskClass = riskClass;
  protected readonly formatDateTime = formatDateTime;

  async ngOnInit(): Promise<void> {
    if (!this.canReviewApprovals()) {
      return;
    }

    await this.loadPermits();
  }

  protected isHseManager(): boolean {
    return this.userService.profile()?.role === 'HSE_MANAGER';
  }

  protected isConstructionManager(): boolean {
    return this.userService.profile()?.role === 'CONSTRUCTION_MANAGER';
  }

  protected canReviewApprovals(): boolean {
    return this.isHseManager() || this.isConstructionManager();
  }

  protected queueTitle(): string {
    return this.isConstructionManager() ? 'Pending Construction Manager Approvals' : 'Pending HSE Approvals';
  }

  protected queueDescription(): string {
    return this.isConstructionManager()
      ? 'HSE-approved permits waiting for final review.'
      : 'Submitted permits waiting for HSE review.';
  }

  protected emptyMessage(): string {
    return this.isConstructionManager()
      ? 'No HSE-approved permits are waiting for Construction Manager approval.'
      : 'No submitted permits are waiting for HSE approval.';
  }

  protected requestApprovePermit(permitId: string): void {
    this.pendingAction.set({
      type: 'APPROVE',
      permitId,
      title: this.isConstructionManager() ? 'Final approve permit?' : 'Approve permit as HSE?',
      message: this.isConstructionManager()
        ? 'This marks the permit as approved and active until expiry.'
        : 'This sends the permit to Construction Manager review.',
      confirmLabel: 'Approve',
      destructive: false,
    });
  }

  protected requestRejectPermit(permitId: string, reason: string): void {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      this.actionErrorMessage.set('Rejection reason is required.');
      return;
    }

    this.pendingAction.set({
      type: 'REJECT',
      permitId,
      reason: trimmedReason,
      title: this.isConstructionManager()
        ? 'Reject permit as Construction Manager?'
        : 'Reject permit as HSE?',
      message: 'This will mark the permit as rejected and record the reason in the event log.',
      confirmLabel: 'Reject',
      destructive: true,
    });
  }

  protected cancelPendingAction(): void {
    this.pendingAction.set(null);
  }

  protected async confirmPendingAction(): Promise<void> {
    const pendingAction = this.pendingAction();

    if (!pendingAction) {
      return;
    }

    this.pendingAction.set(null);

    if (pendingAction.type === 'APPROVE') {
      await this.approvePermit(pendingAction.permitId);
    } else {
      await this.rejectPermit(pendingAction.permitId, pendingAction.reason);
    }

    if (this.successMessage()) {
      this.showSnack(this.successMessage());
    }
  }

  private async approvePermit(permitId: string): Promise<void> {
    const profile = this.userService.profile();

    if (!profile) {
      this.actionErrorMessage.set('User profile is not loaded.');
      return;
    }

    this.processingPermitId.set(permitId);
    this.actionErrorMessage.set('');
    this.successMessage.set('');

    try {
      if (this.isConstructionManager()) {
        await this.permitService.approveByConstructionManager(permitId, profile);
        this.successMessage.set('Permit approved by Construction Manager.');
      } else {
        await this.permitService.approveByHse(permitId, profile);
        this.successMessage.set('Permit approved by HSE.');
      }

      await this.loadPermits();
    } catch (error) {
      this.actionErrorMessage.set(error instanceof Error ? error.message : 'Permit could not be approved.');
    } finally {
      this.processingPermitId.set('');
    }
  }

  private async rejectPermit(permitId: string, reason: string): Promise<void> {
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

    this.processingPermitId.set(permitId);
    this.actionErrorMessage.set('');
    this.successMessage.set('');

    try {
      if (this.isConstructionManager()) {
        await this.permitService.rejectByConstructionManager(permitId, trimmedReason, profile);
        this.successMessage.set('Permit rejected by Construction Manager.');
      } else {
        await this.permitService.rejectByHse(permitId, trimmedReason, profile);
        this.successMessage.set('Permit rejected by HSE.');
      }

      await this.loadPermits();
    } catch (error) {
      this.actionErrorMessage.set(error instanceof Error ? error.message : 'Permit could not be rejected.');
    } finally {
      this.processingPermitId.set('');
    }
  }

  private async loadPermits(): Promise<void> {
    this.loading.set(true);
    this.loadErrorMessage.set('');

    try {
      const permits = this.isConstructionManager()
        ? await this.permitService.getHseApprovedPermits()
        : await this.permitService.getSubmittedPermits();

      this.permits.set(permits);
    } catch {
      this.loadErrorMessage.set('Approval queue could not be loaded. Check your access and try again.');
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
