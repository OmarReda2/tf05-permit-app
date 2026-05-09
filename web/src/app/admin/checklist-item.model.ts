export interface ChecklistItem {
  id: string;
  permitTypeId: string;
  permitTypeNameSnapshot: string;
  text: string;
  required: boolean;
  active: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ChecklistItemInput {
  permitTypeId: string;
  permitTypeNameSnapshot: string;
  text: string;
  required: boolean;
  active: boolean;
  order: number;
}
