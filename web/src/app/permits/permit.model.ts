import { type RiskLevel } from '../admin/permit-type.model';
import { type UserRole } from '../auth/user-profile.model';

export type PermitStatus = 'SUBMITTED' | 'HSE_APPROVED' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CLOSED';
export type PermitEventAction = 'PERMIT_SUBMITTED' | 'HSE_APPROVED' | 'HSE_REJECTED';

export interface Permit {
  id: string;
  permitNumber: string;
  permitTypeId: string;
  permitTypeNameSnapshot: string;
  requestedByUserId: string;
  requestedByName: string;
  requesterRole: 'SITE_USER';
  contractorOrTrade: string;
  workLocation: string;
  scopeOfWork: string;
  hazards: string;
  equipment: string;
  numberOfWorkers: number;
  riskLevel: RiskLevel;
  startTime: Date | null;
  durationHours: number;
  expiryTime: Date | null;
  status: PermitStatus;
  hseApprovedBy: string | null;
  hseApprovedAt: Date | null;
  cmApprovedBy: string | null;
  cmApprovedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PermitChecklistResponse {
  id: string;
  permitId: string;
  checklistItemId: string;
  itemTextSnapshot: string;
  required: boolean;
  checked: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PermitEvent {
  id: string;
  permitId: string;
  action: PermitEventAction;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  comment: string;
  createdAt: Date | null;
}

export interface PermitChecklistResponseInput {
  checklistItemId: string;
  itemTextSnapshot: string;
  required: boolean;
  checked: boolean;
}

export interface CreatePermitInput {
  permitNumber: string;
  permitTypeId: string;
  permitTypeNameSnapshot: string;
  requestedByUserId: string;
  requestedByName: string;
  contractorOrTrade: string;
  workLocation: string;
  scopeOfWork: string;
  hazards: string;
  equipment: string;
  numberOfWorkers: number;
  riskLevel: RiskLevel;
  startTime: Date;
  durationHours: number;
  expiryTime: Date;
  checklistResponses: PermitChecklistResponseInput[];
}
