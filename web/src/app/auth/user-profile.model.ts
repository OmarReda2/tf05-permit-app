export type UserRole = 'ADMIN' | 'HSE_MANAGER' | 'CONSTRUCTION_MANAGER' | 'SITE_USER';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export type UserProfileStatus = 'loading' | 'active' | 'missing' | 'inactive';

export const userRoles: readonly UserRole[] = [
  'ADMIN',
  'HSE_MANAGER',
  'CONSTRUCTION_MANAGER',
  'SITE_USER',
];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && userRoles.includes(value as UserRole);
}
