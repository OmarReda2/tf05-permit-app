import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { riskClass } from '../permits/permit-display';
import { PermitTypesService } from './permit-types.service';
import { riskLevels, type PermitType, type PermitTypeInput } from './permit-type.model';

@Component({
  selector: 'app-permit-types',
  imports: [ReactiveFormsModule],
  templateUrl: './permit-types.html',
  styleUrl: './permit-types.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermitTypes implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly permitTypesService = inject(PermitTypesService);
  protected readonly riskLevels = riskLevels;
  protected readonly riskClass = riskClass;
  protected readonly editingPermitType = signal<PermitType | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly isSaving = signal(false);
  protected readonly formTitle = computed(() => (this.editingPermitType() ? 'Edit permit type' : 'Create permit type'));

  protected readonly permitTypeForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    defaultRiskLevel: ['MEDIUM', Validators.required],
    defaultDurationHours: [8, [Validators.required, Validators.min(1)]],
    maxDurationHours: [12, [Validators.required, Validators.min(1)]],
    active: [true],
  });

  ngOnInit(): void {
    this.permitTypesService.watchPermitTypes();
  }

  protected editPermitType(permitType: PermitType): void {
    this.errorMessage.set('');
    this.editingPermitType.set(permitType);
    this.permitTypeForm.setValue({
      name: permitType.name,
      description: permitType.description,
      defaultRiskLevel: permitType.defaultRiskLevel,
      defaultDurationHours: permitType.defaultDurationHours,
      maxDurationHours: permitType.maxDurationHours,
      active: permitType.active,
    });
  }

  protected cancelEdit(): void {
    this.errorMessage.set('');
    this.editingPermitType.set(null);
    this.permitTypeForm.reset({
      name: '',
      description: '',
      defaultRiskLevel: 'MEDIUM',
      defaultDurationHours: 8,
      maxDurationHours: 12,
      active: true,
    });
  }

  protected async savePermitType(): Promise<void> {
    this.errorMessage.set('');

    if (this.permitTypeForm.invalid) {
      this.permitTypeForm.markAllAsTouched();
      return;
    }

    const input = this.getValidatedInput();

    if (!input) {
      return;
    }

    this.isSaving.set(true);

    try {
      const editingPermitType = this.editingPermitType();

      if (editingPermitType) {
        await this.permitTypesService.updatePermitType(editingPermitType.id, input);
      } else {
        await this.permitTypesService.createPermitType(input);
      }

      this.cancelEdit();
    } catch {
      this.errorMessage.set('Permit type could not be saved. Check your access and try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  protected async toggleActive(permitType: PermitType): Promise<void> {
    try {
      await this.permitTypesService.setPermitTypeActive(permitType.id, !permitType.active);
    } catch {
      this.errorMessage.set('Status could not be updated. Check your access and try again.');
    }
  }

  private getValidatedInput(): PermitTypeInput | null {
    const formValue = this.permitTypeForm.getRawValue();
    const defaultDurationHours = Number(formValue.defaultDurationHours);
    const maxDurationHours = Number(formValue.maxDurationHours);

    if (maxDurationHours < defaultDurationHours) {
      this.errorMessage.set('Max duration must be greater than or equal to default duration.');
      return null;
    }

    return {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      active: formValue.active,
      defaultRiskLevel: formValue.defaultRiskLevel as PermitTypeInput['defaultRiskLevel'],
      defaultDurationHours,
      maxDurationHours,
    };
  }
}
