import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

import { firebaseApp } from '../auth/firebase';
import { type UserProfile } from '../auth/user-profile.model';
import {
  type CreatePermitInput,
  type Permit,
  type PermitChecklistResponse,
  type PermitEvent,
  type PermitEventAction,
  type PermitStatus,
} from './permit.model';

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

  async getPermitsForCurrentUser(userId: string, role: string): Promise<Permit[]> {
    const permitsQuery =
      role === 'SITE_USER'
        ? query(collection(this.firestore, 'permits'), where('requestedByUserId', '==', userId))
        : query(collection(this.firestore, 'permits'));
    const snapshot = await getDocs(permitsQuery);

    return snapshot.docs
      .map((permitDoc) => this.toPermit(permitDoc.id, permitDoc.data()))
      .sort((first, second) => this.dateValue(second.createdAt) - this.dateValue(first.createdAt));
  }

  async getSubmittedPermits(): Promise<Permit[]> {
    const snapshot = await getDocs(query(collection(this.firestore, 'permits'), where('status', '==', 'SUBMITTED')));

    return snapshot.docs
      .map((permitDoc) => this.toPermit(permitDoc.id, permitDoc.data()))
      .sort((first, second) => this.dateValue(second.createdAt) - this.dateValue(first.createdAt));
  }

  async getPermitById(id: string): Promise<Permit | null> {
    const snapshot = await getDoc(doc(this.firestore, 'permits', id));

    if (!snapshot.exists()) {
      return null;
    }

    return this.toPermit(snapshot.id, snapshot.data());
  }

  async getChecklistResponsesForPermit(permitId: string): Promise<PermitChecklistResponse[]> {
    const snapshot = await getDocs(
      query(collection(this.firestore, 'permitChecklistResponses'), where('permitId', '==', permitId)),
    );

    return snapshot.docs
      .map((responseDoc) => {
        const data = responseDoc.data();

        return {
          id: responseDoc.id,
          permitId: typeof data['permitId'] === 'string' ? data['permitId'] : '',
          checklistItemId: typeof data['checklistItemId'] === 'string' ? data['checklistItemId'] : '',
          itemTextSnapshot: typeof data['itemTextSnapshot'] === 'string' ? data['itemTextSnapshot'] : '',
          required: data['required'] === true,
          checked: data['checked'] === true,
          createdAt: this.toDate(data['createdAt']),
          updatedAt: this.toDate(data['updatedAt']),
        };
      })
      .sort((first, second) => this.dateValue(first.createdAt) - this.dateValue(second.createdAt));
  }

  async getEventsForPermit(permitId: string): Promise<PermitEvent[]> {
    const snapshot = await getDocs(query(collection(this.firestore, 'permitEvents'), where('permitId', '==', permitId)));

    return snapshot.docs
      .map((eventDoc) => {
        const data = eventDoc.data();

        return {
          id: eventDoc.id,
          permitId: typeof data['permitId'] === 'string' ? data['permitId'] : '',
          action: this.toPermitEventAction(data['action']),
          actorUserId: typeof data['actorUserId'] === 'string' ? data['actorUserId'] : '',
          actorName: typeof data['actorName'] === 'string' ? data['actorName'] : '',
          actorRole: typeof data['actorRole'] === 'string' ? (data['actorRole'] as PermitEvent['actorRole']) : 'SITE_USER',
          comment: typeof data['comment'] === 'string' ? data['comment'] : '',
          createdAt: this.toDate(data['createdAt']),
        };
      })
      .sort((first, second) => this.dateValue(first.createdAt) - this.dateValue(second.createdAt));
  }

  async approveByHse(permitId: string, actor: UserProfile): Promise<void> {
    if (actor.role !== 'HSE_MANAGER') {
      throw new Error('Only HSE managers can approve submitted permits.');
    }

    await this.saveHseDecision(permitId, actor, 'HSE_APPROVED');
  }

  async rejectByHse(permitId: string, reason: string, actor: UserProfile): Promise<void> {
    const trimmedReason = reason.trim();

    if (actor.role !== 'HSE_MANAGER') {
      throw new Error('Only HSE managers can reject submitted permits.');
    }

    if (!trimmedReason) {
      throw new Error('Rejection reason is required.');
    }

    await this.saveHseDecision(permitId, actor, 'HSE_REJECTED', trimmedReason);
  }

  private async saveHseDecision(
    permitId: string,
    actor: UserProfile,
    action: 'HSE_APPROVED' | 'HSE_REJECTED',
    rejectionReason = '',
  ): Promise<void> {
    const permitRef = doc(this.firestore, 'permits', permitId);
    const eventRef = doc(collection(this.firestore, 'permitEvents'));
    const nextStatus: PermitStatus = action === 'HSE_APPROVED' ? 'HSE_APPROVED' : 'REJECTED';

    await runTransaction(this.firestore, async (transaction) => {
      const permitSnapshot = await transaction.get(permitRef);

      if (!permitSnapshot.exists()) {
        throw new Error('Permit was not found.');
      }

      if (permitSnapshot.data()['status'] !== 'SUBMITTED') {
        throw new Error('Only submitted permits can be reviewed by HSE.');
      }

      transaction.update(permitRef, {
        status: nextStatus,
        hseApprovedBy: actor.displayName,
        hseApprovedAt: serverTimestamp(),
        ...(action === 'HSE_REJECTED' ? { rejectionReason } : {}),
        updatedAt: serverTimestamp(),
      });

      transaction.set(eventRef, {
        permitId,
        action,
        actorUserId: actor.uid,
        actorName: actor.displayName,
        actorRole: 'HSE_MANAGER',
        comment: action === 'HSE_REJECTED' ? rejectionReason : 'Permit approved by HSE.',
        createdAt: serverTimestamp(),
      });
    });
  }

  private toPermit(id: string, data: Record<string, unknown>): Permit {
    return {
      id,
      permitNumber: typeof data['permitNumber'] === 'string' ? data['permitNumber'] : '',
      permitTypeId: typeof data['permitTypeId'] === 'string' ? data['permitTypeId'] : '',
      permitTypeNameSnapshot:
        typeof data['permitTypeNameSnapshot'] === 'string' ? data['permitTypeNameSnapshot'] : '',
      requestedByUserId: typeof data['requestedByUserId'] === 'string' ? data['requestedByUserId'] : '',
      requestedByName: typeof data['requestedByName'] === 'string' ? data['requestedByName'] : '',
      requesterRole: 'SITE_USER',
      contractorOrTrade: typeof data['contractorOrTrade'] === 'string' ? data['contractorOrTrade'] : '',
      workLocation: typeof data['workLocation'] === 'string' ? data['workLocation'] : '',
      scopeOfWork: typeof data['scopeOfWork'] === 'string' ? data['scopeOfWork'] : '',
      hazards: typeof data['hazards'] === 'string' ? data['hazards'] : '',
      equipment: typeof data['equipment'] === 'string' ? data['equipment'] : '',
      numberOfWorkers: typeof data['numberOfWorkers'] === 'number' ? data['numberOfWorkers'] : 0,
      riskLevel:
        data['riskLevel'] === 'LOW' || data['riskLevel'] === 'MEDIUM' || data['riskLevel'] === 'HIGH'
          ? data['riskLevel']
          : 'LOW',
      startTime: this.toDate(data['startTime']),
      durationHours: typeof data['durationHours'] === 'number' ? data['durationHours'] : 0,
      expiryTime: this.toDate(data['expiryTime']),
      status: this.toPermitStatus(data['status']),
      hseApprovedBy: typeof data['hseApprovedBy'] === 'string' ? data['hseApprovedBy'] : null,
      hseApprovedAt: this.toDate(data['hseApprovedAt']),
      cmApprovedBy: typeof data['cmApprovedBy'] === 'string' ? data['cmApprovedBy'] : null,
      cmApprovedAt: this.toDate(data['cmApprovedAt']),
      rejectionReason: typeof data['rejectionReason'] === 'string' ? data['rejectionReason'] : null,
      createdAt: this.toDate(data['createdAt']),
      updatedAt: this.toDate(data['updatedAt']),
    };
  }

  private toPermitStatus(value: unknown): PermitStatus {
    if (
      value === 'SUBMITTED' ||
      value === 'HSE_APPROVED' ||
      value === 'APPROVED' ||
      value === 'REJECTED' ||
      value === 'EXPIRED' ||
      value === 'CLOSED'
    ) {
      return value;
    }

    return 'SUBMITTED';
  }

  private toPermitEventAction(value: unknown): PermitEventAction {
    if (value === 'PERMIT_SUBMITTED' || value === 'HSE_APPROVED' || value === 'HSE_REJECTED') {
      return value;
    }

    return 'PERMIT_SUBMITTED';
  }

  private toDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'object' && value && 'toDate' in value && typeof value.toDate === 'function') {
      const date = value.toDate();
      return date instanceof Date ? date : null;
    }

    if (typeof value === 'string') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  private dateValue(date: Date | null): number {
    return date?.getTime() ?? 0;
  }
}
