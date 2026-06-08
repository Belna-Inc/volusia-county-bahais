import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Star } from '../star/star';

interface NavLink {
  readonly label: string;
  readonly fragment: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Star],
  host: {
    class:
      'sticky top-0 z-50 border-b border-base-300/60 bg-base-100/80 backdrop-blur-md',
  },
  template: `
    <nav
      class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      aria-label="Primary"
    >
      <!-- Brand -->
      <a
        href="#top"
        class="group flex items-center gap-2.5 rounded-field py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        (click)="close()"
      >
        <app-star
          class="size-8 text-primary transition-transform duration-500 group-hover:rotate-45"
          label="Bahá'ís of Volusia County"
        />
        <span class="flex flex-col leading-tight">
          <span class="font-display text-base font-semibold text-base-content sm:text-lg">
            Bahá'ís of Volusia County
          </span>
          <span class="hidden text-[0.7rem] font-medium tracking-wide text-base-content/60 sm:block">
            Daytona Beach · Deltona · DeLand
          </span>
        </span>
      </a>

      <!-- Desktop links -->
      <ul class="hidden items-center gap-1 lg:flex">
        @for (link of links; track link.fragment) {
          <li>
            <a
              [href]="'#' + link.fragment"
              class="rounded-field px-3.5 py-2 text-sm font-medium text-base-content/75 transition hover:bg-base-200 hover:text-base-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {{ link.label }}
            </a>
          </li>
        }
      </ul>

      <div class="flex items-center gap-2">
        <a href="#connect" class="btn btn-primary btn-sm hidden sm:inline-flex">
          Connect with us
        </a>

        <!-- Mobile toggle -->
        <button
          type="button"
          class="btn btn-ghost btn-square btn-sm lg:hidden"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          (click)="toggle()"
        >
          @if (menuOpen()) {
            <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          } @else {
            <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          }
        </button>
      </div>
    </nav>

    <!-- Mobile menu -->
    @if (menuOpen()) {
      <div id="mobile-menu" class="border-t border-base-300/60 bg-base-100/95 backdrop-blur-md lg:hidden">
        <ul class="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
          @for (link of links; track link.fragment) {
            <li>
              <a
                [href]="'#' + link.fragment"
                class="block rounded-field px-3 py-3 text-base font-medium text-base-content/80 transition hover:bg-base-200"
                (click)="close()"
              >
                {{ link.label }}
              </a>
            </li>
          }
          <li class="pt-1">
            <a href="#connect" class="btn btn-primary w-full" (click)="close()">
              Connect with us
            </a>
          </li>
        </ul>
      </div>
    }
  `,
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
