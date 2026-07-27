import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

import { EVENTS_COLLECTION, firebaseConfig, isFirebaseConfigured } from '../../firebase.config';

/** The four core community activities, plus a catch-all. */
export const EVENT_KINDS = ['devotional', 'study', 'children', 'junior-youth', 'other'] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

/**
 * One gathering, as stored in the `events` Firestore collection.
 *
 * See the "Calendar entries" section of the README for the document shape and
 * how to add one from the Firebase console.
 */
export interface CommunityEvent {
  /** The Firestore document id — stable, so it is what the templates track by. */
  readonly id: string;
  /** ISO `yyyy-mm-dd`. Stored as a string so no timezone shifts the day. */
  readonly date: string;
  readonly title: string;
  readonly time: string;
  readonly location: string;
  readonly description: string;
  readonly kind: EventKind;
}

export type EventsStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unconfigured';

/**
 * Reads calendar entries from Firestore.
 *
 * The fetch is browser-only and deliberately lazy. The site is prerendered at
 * build time and served as static files from GitHub Pages, so there is no
 * server to query on our behalf, and baking a build-time snapshot into the HTML
 * would go stale the moment someone edits the schedule. Instead the Firebase
 * SDK is dynamically imported — keeping ~300 kB of Firestore out of the initial
 * bundle and out of the server build entirely — and the data arrives after
 * hydration.
 */
@Injectable({ providedIn: 'root' })
export class Events {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _events = signal<readonly CommunityEvent[]>([]);
  private readonly _status = signal<EventsStatus>('idle');

  /** Every gathering, oldest first. Empty until the fetch resolves. */
  readonly events = this._events.asReadonly();
  readonly status = this._status.asReadonly();

  /** Guards against a second fetch if more than one component asks. */
  private pending: Promise<void> | null = null;

  /** Fetch the schedule once. Safe to call repeatedly; a no-op on the server. */
  load(): Promise<void> {
    this.pending ??= this.fetch();
    return this.pending;
  }

  /** Discard the cached result so the next `load()` goes back to Firestore. */
  refresh(): Promise<void> {
    this.pending = null;
    return this.load();
  }

  private async fetch(): Promise<void> {
    if (!this.isBrowser) return;

    if (!isFirebaseConfigured) {
      this._status.set('unconfigured');
      console.warn(
        '[events] Firebase is not configured yet — fill in src/app/firebase.config.ts. ' +
          'The calendar will render empty until then.',
      );
      return;
    }

    this._status.set('loading');

    try {
      // Imported here rather than at module scope so the SDK is code-split into
      // its own chunk, fetched only when someone opens the calendar.
      const [{ initializeApp, getApps }, { getFirestore, collection, getDocs, query, orderBy }] =
        await Promise.all([import('firebase/app'), import('firebase/firestore')]);

      // `ng serve` hot-reloads this module; re-initialising a named app throws.
      const app = getApps()[0] ?? initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const snapshot = await getDocs(
        query(collection(db, EVENTS_COLLECTION), orderBy('date', 'asc')),
      );

      const events = snapshot.docs
        .map((doc) => toEvent(doc.id, doc.data()))
        .filter((event): event is CommunityEvent => event !== null);

      this._events.set(events);
      this._status.set('ready');
    } catch (error) {
      // A half-typed entry in the console shouldn't take the page down, and
      // neither should a flaky connection — the template shows a retry instead.
      this._status.set('error');
      this.pending = null;
      console.error('[events] Could not load the calendar from Firestore.', error);
    }
  }
}

/** Narrow one Firestore document to a `CommunityEvent`, or null if unusable. */
function toEvent(id: string, data: Record<string, unknown>): CommunityEvent | null {
  const date = asString(data['date']);
  const title = asString(data['title']);

  // Without a date there is no cell to put it in, and without a title there is
  // nothing to click — anything else can sensibly fall back to a blank.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title) {
    console.warn(`[events] Skipping document "${id}": it needs a title and a yyyy-mm-dd date.`);
    return null;
  }

  const kind = asString(data['kind']) as EventKind;

  return {
    id,
    date,
    title,
    time: asString(data['time']),
    location: asString(data['location']),
    description: asString(data['description']),
    kind: EVENT_KINDS.includes(kind) ? kind : 'other',
  };
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
