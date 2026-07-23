import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { ThemeService } from '../theme/theme';

interface NavLink {
  readonly label: string;
  readonly fragment: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nav-shell block sticky top-0 z-50 border-b border-base-300 bg-base-100/95',
  },
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly document = inject(DOCUMENT);
  protected readonly theme = inject(ThemeService);

  protected readonly menuOpen = signal(false);

  /** Fragment of the section currently in view — drives the gold underline. */
  protected readonly activeFragment = signal('');

  protected readonly links: readonly NavLink[] = [
    { label: 'Welcome', fragment: 'welcome' },
    { label: 'The Faith', fragment: 'faith' },
    { label: 'Community Life', fragment: 'community' },
    { label: 'Connect', fragment: 'connect' },
  ];

  constructor() {
    // Browser-only: afterNextRender never runs during prerendering.
    afterNextRender(() => this.watchSections());
  }

  protected toggle(): void {
    this.menuOpen.update((open) => !open);
  }

  protected close(): void {
    this.menuOpen.set(false);
  }

  /**
   * Highlights the nav link for whichever section currently occupies the band
   * just below the navbar. The rootMargin collapses the viewport to a thin
   * strip so exactly one section qualifies at a time.
   */
  private watchSections(): void {
    const sections = this.links
      .map((link) => this.document.getElementById(link.fragment))
      .filter((el): el is HTMLElement => el !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.activeFragment.set(entry.target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );

    for (const section of sections) observer.observe(section);
  }
}
