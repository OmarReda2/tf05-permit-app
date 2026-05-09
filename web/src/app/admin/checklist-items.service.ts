import { Injectable, signal } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { firebaseApp } from '../auth/firebase';
import { type ChecklistItem, type ChecklistItemInput } from './checklist-item.model';

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemsService {
  private readonly firestore = getFirestore(firebaseApp);
  private readonly checklistItemsSignal = signal<ChecklistItem[]>([]);
  private readonly loadingSignal = signal(false);
  private unsubscribe: (() => void) | null = null;
  private watchedPermitTypeId = '';

  readonly checklistItems = this.checklistItemsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  watchChecklistItemsByPermitType(permitTypeId: string): void {
    if (this.watchedPermitTypeId === permitTypeId && this.unsubscribe) {
      return;
    }

    this.unsubscribe?.();
    this.unsubscribe = null;
    this.watchedPermitTypeId = permitTypeId;
    this.checklistItemsSignal.set([]);

    if (!permitTypeId) {
      this.loadingSignal.set(false);
      return;
    }

    this.loadingSignal.set(true);

    const checklistItemsQuery = query(
      collection(this.firestore, 'checklistItems'),
      where('permitTypeId', '==', permitTypeId),
    );

    this.unsubscribe = onSnapshot(
      checklistItemsQuery,
      (snapshot) => {
        const checklistItems = snapshot.docs
          .map((checklistItemDoc) => {
            const data = checklistItemDoc.data();

            return {
              id: checklistItemDoc.id,
              permitTypeId: typeof data['permitTypeId'] === 'string' ? data['permitTypeId'] : '',
              permitTypeNameSnapshot:
                typeof data['permitTypeNameSnapshot'] === 'string' ? data['permitTypeNameSnapshot'] : '',
              text: typeof data['text'] === 'string' ? data['text'] : '',
              required: data['required'] !== false,
              active: data['active'] === true,
              order: typeof data['order'] === 'number' ? data['order'] : 0,
              createdAt: data['createdAt'],
              updatedAt: data['updatedAt'],
            };
          })
          .sort((first, second) => first.order - second.order || first.text.localeCompare(second.text));

        this.checklistItemsSignal.set(checklistItems);
        this.loadingSignal.set(false);
      },
      () => {
        this.loadingSignal.set(false);
      },
    );
  }

  async createChecklistItem(input: ChecklistItemInput): Promise<void> {
    await addDoc(collection(this.firestore, 'checklistItems'), {
      ...input,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateChecklistItem(id: string, input: ChecklistItemInput): Promise<void> {
    await updateDoc(doc(this.firestore, 'checklistItems', id), {
      ...input,
      updatedAt: serverTimestamp(),
    });
  }

  async setChecklistItemActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc(this.firestore, 'checklistItems', id), {
      active,
      updatedAt: serverTimestamp(),
    });
  }
}
