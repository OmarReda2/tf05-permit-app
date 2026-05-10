import { Injectable } from '@angular/core';
import { collection, doc, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore';

import { firebaseApp } from '../auth/firebase';
import { type CreatePermitInput } from './permit.model';

@Injectable({
  providedIn: 'root',
})
export class PermitService {
  private readonly firestore = getFirestore(firebaseApp);

  async createPermit(input: CreatePermitInput): Promise<string> {
    const batch = writeBatch(this.firestore);
    const permitRef = doc(collection(this.firestore, 'permits'));

    batch.set(permitRef, {
      permitNumber: input.permitNumber,
      permitTypeId: input.permitTypeId,
      permitTypeNameSnapshot: input.permitTypeNameSnapshot,
      requestedByUserId: input.requestedByUserId,
      requestedByName: input.requestedByName,
      requesterRole: 'SITE_USER',
      contractorOrTrade: input.contractorOrTrade,
      workLocation: input.workLocation,
      scopeOfWork: input.scopeOfWork,
      hazards: input.hazards,
      equipment: input.equipment,
      numberOfWorkers: input.numberOfWorkers,
      riskLevel: input.riskLevel,
      startTime: input.startTime,
      durationHours: input.durationHours,
      expiryTime: input.expiryTime,
      status: 'SUBMITTED',
      hseApprovedBy: null,
      hseApprovedAt: null,
      cmApprovedBy: null,
      cmApprovedAt: null,
      rejectionReason: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    for (const response of input.checklistResponses) {
      const responseRef = doc(collection(this.firestore, 'permitChecklistResponses'));

      batch.set(responseRef, {
        permitId: permitRef.id,
        checklistItemId: response.checklistItemId,
        itemTextSnapshot: response.itemTextSnapshot,
        required: response.required,
        checked: response.checked,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const eventRef = doc(collection(this.firestore, 'permitEvents'));

    batch.set(eventRef, {
      permitId: permitRef.id,
      action: 'PERMIT_SUBMITTED',
      actorUserId: input.requestedByUserId,
      actorName: input.requestedByName,
      actorRole: 'SITE_USER',
      comment: 'Permit submitted for HSE approval.',
      createdAt: serverTimestamp(),
    });

    await batch.commit();

    return permitRef.id;
  }
}
