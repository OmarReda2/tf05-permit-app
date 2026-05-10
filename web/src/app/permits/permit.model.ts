import { type RiskLevel } from '../admin/permit-type.model';

export type PermitStatus = 'SUBMITTED';
export type PermitEventAction = 'PERMIT_SUBMITTED';

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
