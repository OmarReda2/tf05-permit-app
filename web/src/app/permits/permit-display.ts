import { type Permit, type PermitStatus } from './permit.model';

export type PermitExpiryState =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'AWAITING_HSE_APPROVAL'
  | 'AWAITING_FINAL_APPROVAL'
  | 'NOT_APPLICABLE'
  | 'CLOSED';

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

export function statusClass(status: PermitStatus): string {
  switch (status) {
    case 'SUBMITTED':
      return 'status-pending';
    case 'HSE_APPROVED':
      return 'status-info';
    case 'APPROVED':
      return 'status-approved';
    case 'REJECTED':
      return 'status-rejected';
    case 'EXPIRED':
      return 'status-expired';
    case 'CLOSED':
      return 'status-closed';
  }
}

export function expiryStateKey(permit: Permit): PermitExpiryState {
  if (permit.status === 'SUBMITTED') {
    return 'AWAITING_HSE_APPROVAL';
  }

  if (permit.status === 'HSE_APPROVED') {
    return 'AWAITING_FINAL_APPROVAL';
  }

  if (permit.status === 'REJECTED') {
    return 'NOT_APPLICABLE';
  }

  if (permit.status === 'CLOSED') {
    return 'CLOSED';
  }

  if (permit.status !== 'APPROVED' || !permit.expiryTime) {
    return 'NOT_APPLICABLE';
  }

  const remainingMs = permit.expiryTime.getTime() - Date.now();

  if (remainingMs <= 0) {
    return 'EXPIRED';
  }

  if (remainingMs <= 2 * 60 * 60 * 1000) {
    return 'EXPIRING_SOON';
  }

  return 'ACTIVE';
}

export function expiryState(permit: Permit): string {
  switch (expiryStateKey(permit)) {
    case 'ACTIVE':
      return 'Active';
    case 'EXPIRING_SOON':
      return 'Expiring Soon';
    case 'EXPIRED':
      return 'Expired';
    case 'AWAITING_HSE_APPROVAL':
      return 'Awaiting HSE Approval';
    case 'AWAITING_FINAL_APPROVAL':
      return 'Awaiting Final Approval';
    case 'NOT_APPLICABLE':
      return 'Not Applicable';
    case 'CLOSED':
      return 'Closed';
  }
}

export function expiryStateClass(permit: Permit): string {
  switch (expiryStateKey(permit)) {
    case 'ACTIVE':
      return 'expiry-active';
    case 'EXPIRING_SOON':
      return 'expiry-warning';
    case 'EXPIRED':
      return 'expiry-expired';
    case 'AWAITING_HSE_APPROVAL':
    case 'AWAITING_FINAL_APPROVAL':
      return 'expiry-pending';
    case 'NOT_APPLICABLE':
      return 'expiry-muted';
    case 'CLOSED':
      return 'expiry-closed';
  }
}

export function formatDateTime(date: Date | null): string {
  return date ? date.toLocaleString() : 'Not set';
}
