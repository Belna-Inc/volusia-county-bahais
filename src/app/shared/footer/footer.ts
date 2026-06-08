import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Star } from '../star/star';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Star],
  host: { class: 'block bg-neutral text-neutral-content' },
  template: `
    <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-10 md:grid-cols-12">
        <!-- Brand -->
        <div class="md:col-span-5">
          <a href="#top" class="flex items-center gap-3">
            <app-star class="size-9 text-accent" label="Bahá'ís of Volusia County" />
            <span class="font-display text-xl font-semibold">Bahá'ís of Volusia County</span>
          </a>
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-neutral-content/70">
            Part of the worldwide Bahá'í community, working alongside our neighbors across
            Florida's Atlantic coast to build a more united and spiritually vibrant world.
          </p>
        </div>

        <!-- Explore -->
        <nav class="md:col-span-3" aria-label="Footer">
          <h2 class="eyebrow text-accent">Explore</h2>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li><a class="text-neutral-content/75 transition hover:text-accent" href="#welcome">Welcome</a></li>
            <li><a class="text-neutral-content/75 transition hover:text-accent" href="#faith">The Bahá'í Faith</a></li>
            <li><a class="text-neutral-content/75 transition hover:text-accent" href="#community">Community Life</a></li>
            <li><a class="text-neutral-content/75 transition hover:text-accent" href="#area">Our Area</a></li>
            <li><a class="text-neutral-content/75 transition hover:text-accent" href="#connect">Connect</a></li>
          </ul>
        </nav>

        <!-- Resources -->
        <div class="md:col-span-4">
          <h2 class="eyebrow text-accent">Reach out</h2>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li>
              <a class="text-neutral-content/75 transition hover:text-accent" href="tel:1-800-228-6483">
                1-800-22-UNITE (1-800-228-6483)
              </a>
            </li>
            <li>
              <a class="text-neutral-content/75 transition hover:text-accent" href="mailto:hello@volusiabahais.org">
                hello&#64;volusiabahais.org
              </a>
            </li>
            <li>
              <a
                class="text-neutral-content/75 transition hover:text-accent"
                href="https://www.bahai.us"
                target="_blank"
                rel="noopener noreferrer"
              >
                bahai.us — the Bahá'ís of the United States
              </a>
            </li>
            <li>
              <a
                class="text-neutral-content/75 transition hover:text-accent"
                href="https://find.bahai.us"
                target="_blank"
                rel="noopener noreferrer"
              >
                find.bahai.us — find a community near you
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-content/15 pt-6 text-xs text-neutral-content/60 sm:flex-row"
      >
        <p>© {{ year }} Bahá'í Community of Volusia County, Florida. All are welcome.</p>
        <p class="italic">“So powerful is the light of unity that it can illuminate the whole earth.”</p>
      </div>
    </div>
  `,
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
