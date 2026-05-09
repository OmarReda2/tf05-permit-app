import { Injectable, NgZone, inject, signal } from '@angular/core';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { firebaseApp } from './firebase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly ngZone = inject(NgZone);
  private readonly auth = getAuth(firebaseApp);
  private readonly userSignal = signal<User | null>(null);
  private readonly readySignal = signal(false);
  private readonly persistenceReady = setPersistence(this.auth, browserLocalPersistence);
  private readonly authReady: Promise<void>;

  readonly user = this.userSignal.asReadonly();
  readonly ready = this.readySignal.asReadonly();

  constructor() {
    this.authReady = new Promise((resolve) => {
      onAuthStateChanged(
        this.auth,
        (user) => {
          this.ngZone.run(() => {
            this.userSignal.set(user);
            this.readySignal.set(true);
            resolve();
          });
        },
        () => {
          this.ngZone.run(() => {
            this.userSignal.set(null);
            this.readySignal.set(true);
            resolve();
          });
        },
      );
    });
  }

  async waitForInitialUser(): Promise<User | null> {
    await this.persistenceReady;
    await this.authReady;
    return this.auth.currentUser;
  }

  async login(email: string, password: string): Promise<void> {
    await this.persistenceReady;
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    this.userSignal.set(credential.user);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.userSignal.set(null);
  }
}
