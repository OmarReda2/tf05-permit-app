import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserService } from '../auth/user.service';
import { expiryState, formatDateTime, statusLabel } from '../permits/permit-display';
import { type Permit } from '../permits/permit.model';
import { PermitService } from '../permits/permit.service';

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

  protected readonly statusLabel = statusLabel;
  protected readonly expiryState = expiryState;
  protected readonly formatDateTime = formatDateTime;

  async ngOnInit(): Promise<void> {
    if (!this.isHseManager()) {
      return;
    }

    await this.loadPermits();
  }

  protected isHseManager(): boolean {
    return this.userService.profile()?.role === 'HSE_MANAGER';
  }

  protected async approvePermit(permitId: string): Promise<void> {
    const profile = this.userService.profile();

    if (!profile) {
      this.actionErrorMessage.set('User profile is not loaded.');
      return;
    }

    this.processingPermitId.set(permitId);
    this.actionErrorMessage.set('');
    this.successMessage.set('');

    try {
      await this.permitService.approveByHse(permitId, profile);
      this.successMessage.set('Permit approved by HSE.');
      await this.loadPermits();
    } catch (error) {
      this.actionErrorMessage.set(error instanceof Error ? error.message : 'Permit could not be approved.');
    } finally {
      this.processingPermitId.set('');
    }
  }

  protected async rejectPermit(permitId: string, reason: string): Promise<void> {
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
      await this.permitService.rejectByHse(permitId, trimmedReason, profile);
      this.successMessage.set('Permit rejected by HSE.');
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
      this.permits.set(await this.permitService.getSubmittedPermits());
    } catch {
      this.loadErrorMessage.set('Submitted permits could not be loaded. Check your access and try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
