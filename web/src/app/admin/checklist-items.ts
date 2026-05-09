import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { type ChecklistItem, type ChecklistItemInput } from './checklist-item.model';
import { ChecklistItemsService } from './checklist-items.service';
import { type PermitType } from './permit-type.model';
import { PermitTypesService } from './permit-types.service';

@Component({
  selector: 'app-checklist-items',
  imports: [ReactiveFormsModule],
  templateUrl: './checklist-items.html',
  styleUrl: './checklist-items.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistItems implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly checklistItemsService = inject(ChecklistItemsService);
  protected readonly permitTypesService = inject(PermitTypesService);
  protected readonly selectedPermitTypeId = signal('');
  protected readonly editingChecklistItem = signal<ChecklistItem | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly isSaving = signal(false);
  protected readonly formTitle = computed(() =>
    this.editingChecklistItem() ? 'Edit checklist item' : 'Create checklist item',
  );

  protected readonly checklistItemForm = this.formBuilder.nonNullable.group({
    permitTypeId: ['', Validators.required],
    text: ['', Validators.required],
    order: [1, [Validators.required, Validators.min(1)]],
    required: [true],
    active: [true],
  });

  ngOnInit(): void {
    this.permitTypesService.watchPermitTypes();
  }

  protected selectPermitType(permitTypeId: string): void {
    this.errorMessage.set('');
    this.selectedPermitTypeId.set(permitTypeId);
    this.checklistItemForm.patchValue({ permitTypeId });
    this.checklistItemsService.watchChecklistItemsByPermitType(permitTypeId);
    this.editingChecklistItem.set(null);
  }

  protected editChecklistItem(checklistItem: ChecklistItem): void {
    this.errorMessage.set('');
    this.editingChecklistItem.set(checklistItem);
    this.selectedPermitTypeId.set(checklistItem.permitTypeId);
    this.checklistItemsService.watchChecklistItemsByPermitType(checklistItem.permitTypeId);
    this.checklistItemForm.setValue({
      permitTypeId: checklistItem.permitTypeId,
      text: checklistItem.text,
      order: checklistItem.order,
      required: checklistItem.required,
      active: checklistItem.active,
    });
  }

  protected cancelEdit(): void {
    const permitTypeId = this.selectedPermitTypeId();

    this.errorMessage.set('');
    this.editingChecklistItem.set(null);
    this.checklistItemForm.reset({
      permitTypeId,
      text: '',
      order: this.nextOrder(),
      required: true,
      active: true,
    });
  }

  protected async saveChecklistItem(): Promise<void> {
    this.errorMessage.set('');

    if (this.checklistItemForm.invalid) {
      this.checklistItemForm.markAllAsTouched();
      return;
    }

    const input = this.getValidatedInput();

    if (!input) {
      return;
    }

    this.isSaving.set(true);

    try {
      const editingChecklistItem = this.editingChecklistItem();

      if (editingChecklistItem) {
        await this.checklistItemsService.updateChecklistItem(editingChecklistItem.id, input);
      } else {
        await this.checklistItemsService.createChecklistItem(input);
      }

      this.selectPermitType(input.permitTypeId);
      this.cancelEdit();
    } catch {
      this.errorMessage.set('Checklist item could not be saved. Check your access and try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  protected async toggleActive(checklistItem: ChecklistItem): Promise<void> {
    try {
      await this.checklistItemsService.setChecklistItemActive(checklistItem.id, !checklistItem.active);
    } catch {
      this.errorMessage.set('Status could not be updated. Check your access and try again.');
    }
  }

  protected permitTypeLabel(permitType: PermitType): string {
    return permitType.active ? permitType.name : `${permitType.name} (inactive)`;
  }

  private getValidatedInput(): ChecklistItemInput | null {
    const formValue = this.checklistItemForm.getRawValue();
    const permitType = this.permitTypesService
      .permitTypes()
      .find((currentPermitType) => currentPermitType.id === formValue.permitTypeId);
    const order = Number(formValue.order);

    if (!permitType) {
      this.errorMessage.set('Permit type is required.');
      return null;
    }

    if (order < 1) {
      this.errorMessage.set('Order must be 1 or greater.');
      return null;
    }

    return {
      permitTypeId: permitType.id,
      permitTypeNameSnapshot: permitType.name,
      text: formValue.text.trim(),
      order,
      required: formValue.required,
      active: formValue.active,
    };
  }

  private nextOrder(): number {
    const currentOrders = this.checklistItemsService.checklistItems().map((item) => item.order);
    return currentOrders.length ? Math.max(...currentOrders) + 1 : 1;
  }
}
