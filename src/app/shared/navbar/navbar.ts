import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Star } from '../star/star';
import { ThemeService } from '../theme/theme';

interface NavLink {
  readonly label: string;
  readonly path: string;
  /** Only the home route needs exact matching, or it stays lit everywhere. */
  readonly exact: boolean;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Star],
  host: {
    class: 'nav-shell block sticky top-0 z-50 border-b border-base-300 bg-base-100/95',
  },
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly theme = inject(ThemeService);

  protected readonly menuOpen = signal(false);

  protected readonly links: readonly NavLink[] = [
    { label: 'Home', path: '/', exact: true },
    { label: 'Calendar', path: '/calendar', exact: false },
  ];

  protected toggle(): void {
    this.menuOpen.update((open) => !open);
  }

  protected close(): void {
    this.menuOpen.set(false);
  }
}
