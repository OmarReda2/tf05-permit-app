export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PermitType {
  id: string;
  name: string;
  description: string;
  active: boolean;
  defaultRiskLevel: RiskLevel;
  defaultDurationHours: number;
  maxDurationHours: number;
  createdBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PermitTypeInput {
  name: string;
  description: string;
  active: boolean;
  defaultRiskLevel: RiskLevel;
  defaultDurationHours: number;
  maxDurationHours: number;
}

export const riskLevels: readonly RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

export function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === 'string' && riskLevels.includes(value as RiskLevel);
}
