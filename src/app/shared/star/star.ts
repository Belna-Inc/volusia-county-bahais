import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The nine-pointed star — the most common emblem of the Bahá'í Faith,
 * the number nine signifying completeness and unity.
 *
 * Renders an inline SVG that inherits `currentColor`, so size and colour are
 * controlled entirely with utility classes on the host, e.g.
 *   <app-star class="size-8 text-accent" />
 */
@Component({
  selector: 'app-star',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <svg
      viewBox="0 0 100 100"
      [attr.aria-hidden]="label() ? null : true"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      class="h-full w-full"
      fill="currentColor"
    >
      <polygon
        points="50,2 58.2,27.5 80.9,13.2 70.8,38 97.3,41.7 73.6,54.2 91.6,74 65.4,68.4 66.4,95.1 50,74 33.6,95.1 34.6,68.4 8.4,74 26.4,54.2 2.7,41.7 29.2,38 19.1,13.2 41.8,27.5"
      />
    </svg>
  `,
})
export class Star {
  /** Optional accessible label; when omitted the star is decorative. */
  readonly label = input<string>('');
}
