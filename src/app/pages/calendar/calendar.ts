import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Star } from '../../shared/star/star';

export interface CommunityEvent {
  /** ISO `yyyy-mm-dd`. Stored as a string so no timezone shifts the day. */
  readonly date: string;
  readonly title: string;
  readonly time: string;
  readonly location: string;
  readonly description: string;
  /** Which of the four community activities this belongs to. */
  readonly kind: 'devotional' | 'study' | 'children' | 'junior-youth' | 'other';
}

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
  /**
   * Community gatherings.
   *
   * TODO: these are PLACEHOLDER entries seeded to demonstrate the calendar.
   * Replace them with the real schedule before the page goes live.
   */
  protected readonly events: readonly CommunityEvent[] = [
    {
      date: '2026-07-29',
      title: 'Devotional Gathering (test event)',
      time: '7:00 – 8:30 PM',
      location: 'Daytona Beach',
      description:
        'A placeholder entry used to check the calendar rendering. Neighbors of every background gather to pray and share sacred writings from the world’s great religions.',
      kind: 'devotional',
    },
  ];

  /** Events indexed by ISO date, so a cell lookup is O(1). */
  private readonly byDate = computed(() => {
    const map = new Map<string, CommunityEvent[]>();
    for (const event of this.events) {
      const bucket = map.get(event.date);
      if (bucket) bucket.push(event);
      else map.set(event.date, [event]);
    }
    return map;
  });

  /**
   * The month on screen, as `[year, monthIndex]`.
   *
   * Seeded from the earliest event rather than from "today" on purpose: the
   * page is prerendered at build time, so anything derived from the clock would
   * differ between the server-rendered HTML and the browser, and the grid could
   * change shape underneath hydration. After hydration `jumpToCurrentMonth()`
   * moves the view forward if the real date has passed this month.
   */
  private readonly view = signal(this.earliestEventMonth());

  /** Today, resolved in the browser only — drives the "today" ring. */
  private readonly today = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      const now = new Date();
      this.today.set(isoKey(now.getFullYear(), now.getMonth(), now.getDate()));
      this.jumpToCurrentMonth(now);
    });
  }

  protected readonly weekdays = WEEKDAYS;

  protected readonly monthLabel = computed(() => {
    const [year, month] = this.view();
    return `${MONTH_NAMES[month]} ${year}`;
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
    // `filter` already returns a fresh array, so sorting it in place is safe.
    return this.events
      .filter((event) => event.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));
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
    this.view.update(([year, month]) => (month === 0 ? [year - 1, 11] : [year, month - 1]));
  }

  protected nextMonth(): void {
    this.view.update(([year, month]) => (month === 11 ? [year + 1, 0] : [year, month + 1]));
  }

  /** Human-readable day for the upcoming list, e.g. "Wed 29 Jul". */
  protected formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return `${WEEKDAYS[date.getDay()]} ${day} ${MONTH_NAMES[month - 1].slice(0, 3)}`;
  }

  /** The month of the earliest event, or a fixed fallback when there are none. */
  private earliestEventMonth(): [number, number] {
    if (!this.events.length) return [2026, 0];
    const earliest = this.events.reduce((a, b) => (a.date <= b.date ? a : b));
    const [year, month] = earliest.date.split('-').map(Number);
    return [year, month - 1];
  }

  /** Move the view to the real current month, if that is later than the seed. */
  private jumpToCurrentMonth(now: Date): void {
    const [year, month] = this.view();
    const current: [number, number] = [now.getFullYear(), now.getMonth()];
    const isLater = current[0] > year || (current[0] === year && current[1] > month);
    if (isLater) this.view.set(current);
  }
}
