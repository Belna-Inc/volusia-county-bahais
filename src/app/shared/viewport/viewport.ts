import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

/**
 * The three layout modes the site designs for.
 *
 * Most responsive behaviour belongs in CSS — Tailwind's `sm:`/`lg:` variants
 * cost nothing, work before JavaScript loads and never shift the layout after
 * hydration. This enum is for the cases CSS genuinely cannot express: where a
 * component needs a *different template*, not a restyled one. The calendar is
 * the motivating case, swapping a seven-column month table for a linear agenda.
 */
export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

/**
 * Lower bounds in px, deliberately equal to Tailwind's `md` and `lg` so a
 * component can mix `viewport.isMobile()` with `md:`/`lg:` classes and have the
 * two agree on where the boundaries are.
 */
export const VIEWPORT_BREAKPOINTS = {
  /** `mobile` is anything below this. */
  tablet: 768,
  /** `desktop` is this and above. */
  desktop: 1024,
} as const;

/**
 * Tracks which layout mode the viewport is in.
 *
 * Built on `matchMedia` rather than a resize listener, so the browser only
 * notifies us when a boundary is actually crossed instead of on every frame of
 * a drag.
 *
 * On the server the mode is `desktop`. That is also what the very first browser
 * render uses, because the prerendered HTML has to match it — components that
 * branch on the mode should therefore hold off until after hydration (the
 * calendar does this with its `ready` gate) rather than swapping DOM underneath
 * Angular mid-hydration.
 */
@Injectable({ providedIn: 'root' })
export class Viewport {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly state = signal<ViewportMode>('desktop');

  /** Set by `pin()` to freeze the mode; null means follow the viewport. */
  private readonly pinned = signal<ViewportMode | null>(null);

  /** The active layout mode. */
  readonly mode = computed(() => this.pinned() ?? this.state());

  readonly isMobile = computed(() => this.mode() === 'mobile');
  readonly isTablet = computed(() => this.mode() === 'tablet');
  readonly isDesktop = computed(() => this.mode() === 'desktop');

  /** Phone-sized: the cue to swap a wide layout for a stacked or linear one. */
  readonly isCompact = this.isMobile;

  constructor() {
    if (!this.isBrowser) return;

    const tablet = matchMedia(`(min-width: ${VIEWPORT_BREAKPOINTS.tablet}px)`);
    const desktop = matchMedia(`(min-width: ${VIEWPORT_BREAKPOINTS.desktop}px)`);

    const resolve = () => {
      this.state.set(desktop.matches ? 'desktop' : tablet.matches ? 'tablet' : 'mobile');
    };

    tablet.addEventListener('change', resolve);
    desktop.addEventListener('change', resolve);

    // Deferred to after the first render on purpose. Reading the real width
    // during construction would make a phone's first client render disagree
    // with the prerendered `desktop` HTML, and hydration would be reconciling a
    // different template than the one it was handed.
    afterNextRender(resolve);

    inject(DestroyRef).onDestroy(() => {
      tablet.removeEventListener('change', resolve);
      desktop.removeEventListener('change', resolve);
    });
  }

  /**
   * Force a mode regardless of the real viewport, or pass null to go back to
   * following it. Intended for previewing a layout without resizing the window.
   */
  pin(mode: ViewportMode | null): void {
    this.pinned.set(mode);
  }
}
