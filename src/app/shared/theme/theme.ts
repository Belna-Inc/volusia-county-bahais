import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

/** daisyUI theme names, keyed by mode. */
const THEME_NAME: Record<ThemeMode, string> = {
  light: 'bahai',
  dark: 'bahai-dark',
};

const STORAGE_KEY = 'theme';

/**
 * Tracks the active colour scheme and mirrors it onto `<html data-theme>`.
 *
 * The initial resolution happens in an inline script in index.html so the right
 * theme is painted on the very first frame — this service only reads that result
 * back and owns subsequent changes. Every browser-only API is guarded, because
 * the site is prerendered and this code runs during the build too.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly state = signal<ThemeMode>('light');

  /** The active colour scheme. */
  readonly mode = this.state.asReadonly();

  constructor() {
    if (!this.isBrowser) return;
    const applied = this.document.documentElement.dataset['theme'];
    this.state.set(applied === THEME_NAME.dark ? 'dark' : 'light');
  }

  toggle(): void {
    this.set(this.state() === 'dark' ? 'light' : 'dark');
  }

  set(mode: ThemeMode): void {
    this.state.set(mode);
    if (!this.isBrowser) return;

    this.document.documentElement.dataset['theme'] = THEME_NAME[mode];
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Private browsing or blocked storage — the theme still applies for this
      // visit, it just won't be remembered.
    }
  }
}
