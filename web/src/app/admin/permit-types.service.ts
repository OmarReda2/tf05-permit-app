import { Injectable, inject, signal } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { UserService } from '../auth/user.service';
import { firebaseApp } from '../auth/firebase';
import { isRiskLevel, type PermitType, type PermitTypeInput } from './permit-type.model';

@Injectable({
  providedIn: 'root',
})
export class PermitTypesService {
  private readonly firestore = getFirestore(firebaseApp);
  private readonly userService = inject(UserService);
  private readonly permitTypesSignal = signal<PermitType[]>([]);
  private readonly loadingSignal = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly permitTypes = this.permitTypesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  watchPermitTypes(): void {
    if (this.unsubscribe) {
      return;
    }

    this.loadingSignal.set(true);

    const permitTypesQuery = query(collection(this.firestore, 'permitTypes'), orderBy('name'));

    this.unsubscribe = onSnapshot(
      permitTypesQuery,
      (snapshot) => {
        const permitTypes = snapshot.docs.map((permitTypeDoc) => {
          const data = permitTypeDoc.data();
          const riskLevel = data['defaultRiskLevel'];

          return {
            id: permitTypeDoc.id,
            name: typeof data['name'] === 'string' ? data['name'] : '',
            description: typeof data['description'] === 'string' ? data['description'] : '',
            active: data['active'] === true,
            defaultRiskLevel: isRiskLevel(riskLevel) ? riskLevel : 'LOW',
            defaultDurationHours:
              typeof data['defaultDurationHours'] === 'number' ? data['defaultDurationHours'] : 0,
            maxDurationHours: typeof data['maxDurationHours'] === 'number' ? data['maxDurationHours'] : 0,
            createdBy: typeof data['createdBy'] === 'string' ? data['createdBy'] : undefined,
            createdAt: data['createdAt'],
            updatedAt: data['updatedAt'],
          };
        });

        this.permitTypesSignal.set(permitTypes);
        this.loadingSignal.set(false);
      },
      () => {
        this.loadingSignal.set(false);
      },
    );
  }

  async createPermitType(input: PermitTypeInput): Promise<void> {
    await addDoc(collection(this.firestore, 'permitTypes'), {
      ...input,
      createdBy: this.userService.profile()?.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updatePermitType(id: string, input: PermitTypeInput): Promise<void> {
    await updateDoc(doc(this.firestore, 'permitTypes', id), {
      ...input,
      updatedAt: serverTimestamp(),
    });
  }

  async setPermitTypeActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc(this.firestore, 'permitTypes', id), {
      active,
      updatedAt: serverTimestamp(),
    });
  }
}
