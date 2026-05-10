import { type Permit, type PermitStatus } from './permit.model';

export function statusLabel(status: PermitStatus): string {
  switch (status) {
    case 'SUBMITTED':
      return 'Pending HSE Approval';
    case 'HSE_APPROVED':
      return 'Pending Construction Manager Approval';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'EXPIRED':
      return 'Expired';
    case 'CLOSED':
      return 'Closed';
  }
}

export function expiryState(permit: Permit): string {
  if (permit.status !== 'APPROVED' || !permit.expiryTime) {
    return 'Not Active';
  }

  const remainingMs = permit.expiryTime.getTime() - Date.now();

  if (remainingMs <= 0) {
    return 'Expired';
  }

  if (remainingMs <= 2 * 60 * 60 * 1000) {
    return 'Expiring Soon';
  }

  return 'Active';
}

export function formatDateTime(date: Date | null): string {
  return date ? date.toLocaleString() : 'Not set';
}
