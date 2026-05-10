import { Injectable, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<ThemePreference>(this.readTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  toggleTheme(): ThemePreference {
    const nextTheme: ThemePreference = this.themeSignal() === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tf05-theme', nextTheme);
    this.themeSignal.set(nextTheme);
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  themeLabel(): string {
    return this.themeSignal() === 'dark' ? 'Use light mode' : 'Use dark mode';
  }

  private readTheme(): ThemePreference {
    return localStorage.getItem('tf05-theme') === 'dark' ? 'dark' : 'light';
  }

  private applyTheme(theme: ThemePreference): void {
    document.documentElement.dataset['theme'] = theme;
  }
}
