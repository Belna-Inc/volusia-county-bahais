import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommunityEvent, Events } from '../../shared/events/events';
import { Star } from '../../shared/star/star';

/** A single cell in the month grid. */
interface DayCell {
  readonly key: string;
  readonly day: number;
  /** False for the leading/trailing days borrowed from adjacent months. */
  readonly inMonth: boolean;
  readonly events: readonly CommunityEvent[];
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FULL_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** `yyyy-mm-dd` for a local calendar date, without going through UTC. */
function isoKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Star, RouterLink],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  private readonly store = inject(Events);

  /** Community gatherings, loaded from Firestore after hydration. */
  private readonly events = this.store.events;

  protected readonly status = this.store.status;

  /**
   * False until the browser has taken over.
   *
   * The page is prerendered at build time, so anything derived from the clock
   * would differ between the server-rendered HTML and the browser, and the grid
   * could change shape underneath hydration. The template therefore renders a
   * skeleton until this flips, and only then is a real month drawn — which is
   * also when the events themselves arrive.
   */
  protected readonly ready = signal(false);

  /**
   * The month on screen, as `[year, monthIndex]`. The placeholder is never
   * displayed; `ready` gates the grid until the real month is set below.
   */
  private readonly view = signal<[number, number]>([2026, 0]);

  /** Today, resolved in the browser only — drives the "today" ring. */
  private readonly today = signal<string | null>(null);

  /** Set once the visitor uses the arrows, so we stop moving the view for them. */
  private steered = false;

  constructor() {
    afterNextRender(() => {
      const now = new Date();
      this.today.set(isoKey(now.getFullYear(), now.getMonth(), now.getDate()));
      this.view.set([now.getFullYear(), now.getMonth()]);
      this.ready.set(true);
      void this.store.load().then(() => this.jumpToFirstUpcoming());
    });
  }

  protected readonly weekdays = WEEKDAYS;

  /** Six weeks of blank cells, so the skeleton grid is the tallest a month gets. */
  protected readonly skeletonCells = Array.from({ length: 42 });

  /** True while the schedule is still on its way — including before hydration. */
  protected readonly loading = computed(
    () => !this.ready() || this.status() === 'idle' || this.status() === 'loading',
  );

  protected readonly headline = computed(() => {
    if (this.status() === 'error') return 'The calendar didn\'t load';
    if (this.loading()) return 'Loading gatherings';
    return this.monthEvents().length ? 'What\'s coming up' : 'Nothing scheduled yet';
  });

  protected readonly monthLabel = computed(() => {
    const [year, month] = this.view();
    return `${MONTH_NAMES[month]} ${year}`;
  });

  /** Events indexed by ISO date, so a cell lookup is O(1). */
  private readonly byDate = computed(() => {
    const map = new Map<string, CommunityEvent[]>();
    for (const event of this.events()) {
      const bucket = map.get(event.date);
      if (bucket) bucket.push(event);
      else map.set(event.date, [event]);
    }
    return map;
  });

  /** The month grid, as whole weeks of seven days. */
  protected readonly weeks = computed<readonly (readonly DayCell[])[]>(() => {
    const [year, month] = this.view();
    const events = this.byDate();

    const leading = new Date(year, month, 1).getDay();
    const daysThisMonth = new Date(year, month + 1, 0).getDate();
    const daysPrevMonth = new Date(year, month, 0).getDate();

    const cells: DayCell[] = [];

    for (let i = leading; i > 0; i--) {
      const day = daysPrevMonth - i + 1;
      cells.push({ key: `lead-${day}`, day, inMonth: false, events: [] });
    }

    for (let day = 1; day <= daysThisMonth; day++) {
      const key = isoKey(year, month, day);
      cells.push({ key, day, inMonth: true, events: events.get(key) ?? [] });
    }

    // Pad out to complete the final week so every row has seven cells.
    for (let day = 1; cells.length % 7 !== 0; day++) {
      cells.push({ key: `trail-${day}`, day, inMonth: false, events: [] });
    }

    const weeks: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  });

  /** Every event in the month on screen, in date order. */
  protected readonly monthEvents = computed(() => {
    const [year, month] = this.view();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    // Firestore already returns them sorted by date, so filtering preserves it.
    return this.events().filter((event) => event.date.startsWith(prefix));
  });

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('eventDialog');

  /** The event shown in the detail dialog, or null when it is closed. */
  protected readonly selected = signal<CommunityEvent | null>(null);

  /** Long-form date for the dialog heading, e.g. "Wednesday, 29 July 2026". */
  protected readonly selectedDate = computed(() => {
    const event = this.selected();
    if (!event) return '';
    const [year, month, day] = event.date.split('-').map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    return `${FULL_WEEKDAYS[weekday]}, ${day} ${MONTH_NAMES[month - 1]} ${year}`;
  });

  protected openEvent(event: CommunityEvent): void {
    this.selected.set(event);
    // showModal() gives us the focus trap, Esc-to-close and ::backdrop for free.
    this.dialog()?.nativeElement.showModal();
  }

  protected closeEvent(): void {
    this.dialog()?.nativeElement.close();
  }

  /** Fires for Esc and backdrop dismissal as well as the close button. */
  protected onDialogClose(): void {
    this.selected.set(null);
  }

  /**
   * Dismiss when the backdrop is tapped — a native <dialog> does not do this on
   * its own. Clicks on the ::backdrop are attributed to the dialog element
   * itself, while anything inside the panel targets a descendant, so comparing
   * the target is enough to tell them apart.
   */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) this.closeEvent();
  }

  protected isToday(cell: DayCell): boolean {
    return cell.inMonth && cell.key === this.today();
  }

  protected previousMonth(): void {
    this.steered = true;
    this.view.update(([year, month]) => (month === 0 ? [year - 1, 11] : [year, month - 1]));
  }

  protected nextMonth(): void {
    this.steered = true;
    this.view.update(([year, month]) => (month === 11 ? [year + 1, 0] : [year, month + 1]));
  }

  /** Human-readable day for the upcoming list, e.g. "Wed 29 Jul". */
  protected formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return `${WEEKDAYS[date.getDay()]} ${day} ${MONTH_NAMES[month - 1].slice(0, 3)}`;
  }

  protected retry(): void {
    void this.store.refresh().then(() => this.jumpToFirstUpcoming());
  }

  /**
   * If nothing is on this month, open on the next month that has something.
   *
   * Landing on an empty grid reads as "there is nothing going on" when the real
   * answer is "not until next month". Skipped once the visitor has used the
   * arrows, so the view never moves out from under them.
   */
  private jumpToFirstUpcoming(): void {
    if (this.steered || this.monthEvents().length) return;

    const today = this.today();
    const next = this.events().find((event) => !today || event.date >= today);
    if (!next) return;

    const [year, month] = next.date.split('-').map(Number);
    this.view.set([year, month - 1]);
  }
}
