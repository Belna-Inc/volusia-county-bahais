import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The nine-pointed star — the most common emblem of the Bahá'í Faith,
 * the number nine signifying completeness and unity.
 *
 * Renders an inline SVG that inherits `currentColor`, so size and colour are
 * controlled entirely with utility classes on the host, e.g.
 *   <app-star class="size-8 text-accent" />
 *   <app-star variant="outline" class="size-40 text-accent/20" />
 */
@Component({
  selector: 'app-star',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  templateUrl: './star.html',
  styleUrl: './star.css',
})
export class Star {
  /** Optional accessible label; when omitted the star is decorative. */
  readonly label = input<string>('');

  /** 'solid' (filled) or 'outline' (line-art) — outline matches bahai.us motifs. */
  readonly variant = input<'solid' | 'outline'>('solid');
}
