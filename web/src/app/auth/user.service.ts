import { Injectable, inject, signal } from '@angular/core';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

import { AuthService } from './auth.service';
import { firebaseApp } from './firebase';
import { isUserRole, type UserProfile, type UserProfileStatus, type UserRole } from './user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly authService = inject(AuthService);
  private readonly firestore = getFirestore(firebaseApp);
  private readonly profileSignal = signal<UserProfile | null>(null);
  private readonly statusSignal = signal<UserProfileStatus>('loading');
  private loadedUid = '';

  readonly profile = this.profileSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();

  async loadCurrentProfile(): Promise<UserProfile | null> {
    const authUser = await this.authService.waitForInitialUser();

    if (!authUser) {
      this.loadedUid = '';
      this.profileSignal.set(null);
      this.statusSignal.set('missing');
      return null;
    }

    if (this.loadedUid === authUser.uid && this.statusSignal() !== 'loading') {
      return this.profileSignal();
    }

    this.loadedUid = authUser.uid;
    this.statusSignal.set('loading');

    const profileSnapshot = await getDoc(doc(this.firestore, 'users', authUser.uid));

    if (!profileSnapshot.exists()) {
      this.profileSignal.set(null);
      this.statusSignal.set('missing');
      return null;
    }

    const data = profileSnapshot.data();
    const role = data['role'];

    if (!isUserRole(role)) {
      this.profileSignal.set(null);
      this.statusSignal.set('missing');
      return null;
    }

    const profile: UserProfile = {
      uid: authUser.uid,
      displayName: typeof data['displayName'] === 'string' ? data['displayName'] : authUser.email ?? '',
      email: typeof data['email'] === 'string' ? data['email'] : authUser.email ?? '',
      role,
      active: data['active'] === true,
    };

    this.profileSignal.set(profile);
    this.statusSignal.set(profile.active ? 'active' : 'inactive');

    return profile.active ? profile : null;
  }

  hasRole(allowedRoles: readonly UserRole[]): boolean {
    const profile = this.profileSignal();
    return !!profile?.active && allowedRoles.includes(profile.role);
  }

  clearProfile(): void {
    this.loadedUid = '';
    this.profileSignal.set(null);
    this.statusSignal.set('loading');
  }
}
