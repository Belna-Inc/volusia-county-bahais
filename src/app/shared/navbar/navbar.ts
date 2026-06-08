import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface NavLink {
  readonly label: string;
  readonly fragment: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block sticky top-0 z-50 border-b border-base-300 bg-base-100',
  },
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly menuOpen = signal(false);

  protected readonly links: readonly NavLink[] = [
    { label: 'Welcome', fragment: 'welcome' },
    { label: 'The Faith', fragment: 'faith' },
    { label: 'Community Life', fragment: 'community' },
    { label: 'Our Area', fragment: 'area' },
    { label: 'Connect', fragment: 'connect' },
  ];

  protected toggle(): void {
    this.menuOpen.update((open) => !open);
  }

  protected close(): void {
    this.menuOpen.set(false);
  }
}
