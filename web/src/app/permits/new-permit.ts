import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ChecklistItemsService } from '../admin/checklist-items.service';
import { type ChecklistItem } from '../admin/checklist-item.model';
import { type PermitType, riskLevels, type RiskLevel } from '../admin/permit-type.model';
import { PermitTypesService } from '../admin/permit-types.service';
import { UserService } from '../auth/user.service';
import { riskClass } from './permit-display';
import { PermitService } from './permit.service';
import { type CreatePermitInput } from './permit.model';

@Component({
  selector: 'app-new-permit',
  imports: [ReactiveFormsModule],
  templateUrl: './new-permit.html',
  styleUrl: './new-permit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPermit implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly permitService = inject(PermitService);
  protected readonly checklistItemsService = inject(ChecklistItemsService);
  protected readonly permitTypesService = inject(PermitTypesService);
  protected readonly userService = inject(UserService);
  protected readonly riskLevels = riskLevels;
  protected readonly riskClass = riskClass;
  protected readonly selectedPermitTypeId = signal('');
  protected readonly checkedItems = signal<Record<string, boolean>>({});
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly confirmSubmitOpen = signal(false);

  protected readonly activePermitTypes = computed(() =>
    this.permitTypesService.permitTypes().filter((permitType) => permitType.active),
  );
  protected readonly selectedPermitType = computed(() => {
    const permitTypeId = this.selectedPermitTypeId();
    return this.activePermitTypes().find((permitType) => permitType.id === permitTypeId) ?? null;
  });
  protected readonly activeChecklistItems = computed(() =>
    this.checklistItemsService.checklistItems().filter((checklistItem) => checklistItem.active),
  );
  protected readonly expiryTime = computed(() => {
    const startTime = this.permitForm.controls.startTime.value;
    const durationHours = Number(this.permitForm.controls.durationHours.value);

    if (!startTime || durationHours <= 0) {
      return null;
    }

    return this.calculateExpiryTime(startTime, durationHours);
  });
  protected readonly checklistCompletion = computed(() => {
    const checklistItems = this.activeChecklistItems();

    if (checklistItems.length === 0) {
      return 'No active checklist items';
    }

    const checkedCount = checklistItems.filter((item) => this.checkedItems()[item.id]).length;
    return `${checkedCount} of ${checklistItems.length} checked`;
  });

  protected readonly permitForm = this.formBuilder.nonNullable.group({
    permitTypeId: ['', Validators.required],
    workLocation: ['', Validators.required],
    startTime: ['', Validators.required],
    durationHours: [1, [Validators.required, Validators.min(1)]],
    riskLevel: ['MEDIUM', Validators.required],
    contractorOrTrade: ['', Validators.required],
    scopeOfWork: ['', Validators.required],
    hazards: [''],
    equipment: [''],
    numberOfWorkers: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.permitTypesService.watchPermitTypes();
  }

  protected selectPermitType(permitTypeId: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedPermitTypeId.set(permitTypeId);
    this.permitForm.patchValue({ permitTypeId });
    this.checkedItems.set({});

    const permitType = this.activePermitTypes().find((currentPermitType) => currentPermitType.id === permitTypeId);

    if (permitType) {
      this.permitForm.patchValue({
        riskLevel: permitType.defaultRiskLevel,
        durationHours: permitType.defaultDurationHours,
      });
      this.checklistItemsService.watchChecklistItemsByPermitType(permitType.id);
      return;
    }

    this.checklistItemsService.watchChecklistItemsByPermitType('');
  }

  protected setChecklistChecked(checklistItemId: string, checked: boolean): void {
    this.checkedItems.update((current) => ({
      ...current,
      [checklistItemId]: checked,
    }));
  }

  protected requestSubmitPermit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.permitForm.invalid) {
      this.permitForm.markAllAsTouched();
      this.errorMessage.set('Please complete the required permit fields before submitting.');
      this.focusFirstInvalidField();
      return;
    }

    if (!this.getValidatedInput()) {
      this.scrollToFeedback();
      return;
    }

    this.confirmSubmitOpen.set(true);
  }

  protected cancelSubmitConfirmation(): void {
    this.confirmSubmitOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected closeSubmitConfirmationOnEscape(): void {
    this.cancelSubmitConfirmation();
  }

  protected async submitPermit(): Promise<void> {
    this.confirmSubmitOpen.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');

    const input = this.getValidatedInput();

    if (!input) {
      this.scrollToFeedback();
      return;
    }

    this.isSubmitting.set(true);

    try {
      await this.permitService.createPermit(input);
      this.successMessage.set('Permit submitted for HSE approval.');
      await this.router.navigateByUrl('/permits');
    } catch {
      this.errorMessage.set('Permit could not be submitted. Check your access and try again.');
      this.scrollToFeedback();
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async cancel(): Promise<void> {
    await this.router.navigateByUrl('/permits');
  }

  protected formatDateTime(date: Date | null): string {
    if (!date) {
      return 'Not set';
    }

    return date.toLocaleString();
  }

  private getValidatedInput(): CreatePermitInput | null {
    const formValue = this.permitForm.getRawValue();
    const permitType = this.selectedPermitType();
    const profile = this.userService.profile();
    const durationHours = Number(formValue.durationHours);
    const numberOfWorkers = Number(formValue.numberOfWorkers);
    const startTime = formValue.startTime ? new Date(formValue.startTime) : null;

    if (!permitType) {
      this.errorMessage.set('Permit type is required.');
      return null;
    }

    if (!profile || profile.role !== 'SITE_USER') {
      this.errorMessage.set('Only site users can submit permits.');
      return null;
    }

    if (durationHours > permitType.maxDurationHours) {
      this.errorMessage.set('Duration cannot exceed the selected permit type maximum duration.');
      return null;
    }

    if (!startTime || Number.isNaN(startTime.getTime())) {
      this.errorMessage.set('Start date/time is required.');
      return null;
    }

    if ((formValue.riskLevel === 'MEDIUM' || formValue.riskLevel === 'HIGH') && !formValue.hazards.trim()) {
      this.errorMessage.set('Hazards are required for medium or high risk work.');
      return null;
    }

    const requiredChecklistComplete = this.activeChecklistItems()
      .filter((checklistItem) => checklistItem.required)
      .every((checklistItem) => this.checkedItems()[checklistItem.id]);

    if (!requiredChecklistComplete) {
      this.errorMessage.set('Required checklist items must be completed before submission.');
      return null;
    }

    const expiryTime = this.calculateExpiryTime(formValue.startTime, durationHours);

    return {
      permitNumber: this.generatePermitNumber(),
      permitTypeId: permitType.id,
      permitTypeNameSnapshot: permitType.name,
      requestedByUserId: profile.uid,
      requestedByName: profile.displayName,
      contractorOrTrade: formValue.contractorOrTrade.trim(),
      workLocation: formValue.workLocation.trim(),
      scopeOfWork: formValue.scopeOfWork.trim(),
      hazards: formValue.hazards.trim(),
      equipment: formValue.equipment.trim(),
      numberOfWorkers,
      riskLevel: formValue.riskLevel as RiskLevel,
      startTime,
      durationHours,
      expiryTime,
      checklistResponses: this.activeChecklistItems().map((checklistItem) =>
        this.toChecklistResponse(checklistItem),
      ),
    };
  }

  private toChecklistResponse(checklistItem: ChecklistItem): CreatePermitInput['checklistResponses'][number] {
    return {
      checklistItemId: checklistItem.id,
      itemTextSnapshot: checklistItem.text,
      required: checklistItem.required,
      checked: this.checkedItems()[checklistItem.id] === true,
    };
  }

  private calculateExpiryTime(startTime: string, durationHours: number): Date {
    const expiryTime = new Date(startTime);
    expiryTime.setHours(expiryTime.getHours() + durationHours);
    return expiryTime;
  }

  private generatePermitNumber(): string {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const time = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');

    return `PTW-${date}-${time}`;
  }

  private focusFirstInvalidField(): void {
    window.setTimeout(() => {
      const invalidControl = this.elementRef.nativeElement.querySelector(
        'select.ng-invalid, input.ng-invalid, textarea.ng-invalid',
      ) as HTMLElement | null;

      invalidControl?.focus();
      invalidControl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  private scrollToFeedback(): void {
    window.setTimeout(() => {
      const feedback = this.elementRef.nativeElement.querySelector('.form-error') as HTMLElement | null;

      feedback?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}
