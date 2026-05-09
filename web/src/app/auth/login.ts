import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected async submit(): Promise<void> {
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isSubmitting.set(true);

    try {
      await this.authService.login(email, password);
      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.errorMessage.set(this.getLoginErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getLoginErrorMessage(error: unknown): string {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

    if (code === 'auth/invalid-email') {
      return 'Enter a valid email address.';
    }

    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password'
    ) {
      return 'Email or password is incorrect.';
    }

    return 'Login failed. Check your connection and try again.';
  }
}
