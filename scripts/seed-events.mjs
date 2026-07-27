/**
 * Seed the Firestore `events` collection with the community calendar.
 *
 * Usage:  npm run seed
 *
 * Reads the project config out of src/app/firebase.config.ts, so fill that in
 * first. Each event is written with `setDoc` under a deterministic id, so
 * re-running the script updates entries in place rather than duplicating them.
 *
 * NOTE: firestore.rules blocks all client writes. This script therefore only
 * succeeds while the database still allows writes — i.e. run it right after
 * creating the database in *test mode*, and deploy the locked-down rules
 * afterwards (`npx firebase-tools deploy --only firestore:rules`). For
 * day-to-day edits later, use the Firebase console's Firestore data editor,
 * which bypasses security rules.
 */
import { readFileSync } from 'node:fs';

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc, terminate } from 'firebase/firestore';

// ------------------------------------------------------------------ config --

const configSource = readFileSync(new URL('../src/app/firebase.config.ts', import.meta.url), 'utf8');

const firebaseConfig = {};
for (const key of ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']) {
  const match = configSource.match(new RegExp(`${key}:\\s*['"]([^'"]*)['"]`));
  firebaseConfig[key] = match?.[1] ?? '';
}

if (Object.values(firebaseConfig).some((value) => !value || value.includes('REPLACE_ME'))) {
  console.error(
    'Firebase is not configured yet. Paste your web app config into ' +
      'src/app/firebase.config.ts (Firebase console → Project settings → General ' +
      '→ Your apps → SDK setup and configuration) and run this again.',
  );
  process.exit(1);
}

// ------------------------------------------------------------------ events --

const ZOOM_MAIN = 'https://us02web.zoom.us/j/2450696451?pwd=dGwxd1lsdmJwb3pZRUMrcUJ3RFpDZz09';
const ZOOM_MAIN_NOTE = 'Held on Zoom. Meeting password: 959595.';

const ZOOM_HEALING =
  'https://us04web.zoom.us/j/8043326932?pwd=NWtXZlBZZkRwa0xwcFFwSCtxWW40UT09&omn=78425063372';
const ZOOM_HEALING_NOTE =
  'Hosted by Zoe and Bill on Zoom. Meeting ID: 804 332 6932, passcode: 6AbcCy.';

const morningDevotional = (date) => ({
  id: `${date}-morning-devotional`,
  date,
  title: 'Morning Devotional',
  time: '9:00 AM',
  location: 'Zoom',
  description: `A short gathering of prayer and reflection to start the day. ${ZOOM_MAIN_NOTE}`,
  link: ZOOM_MAIN,
  kind: 'devotional',
});

const bookTwo = (date) => ({
  id: `${date}-book-2`,
  date,
  title: 'Book 2 Study Circle',
  time: '6:00 PM',
  location: 'Zoom',
  description: `Ruhi Book 2 study circle — all are welcome to join. ${ZOOM_MAIN_NOTE}`,
  link: ZOOM_MAIN,
  kind: 'study',
});

const healingDevotional = (date) => ({
  id: `${date}-healing-devotional`,
  date,
  title: 'Healing Devotional',
  time: '4:00 PM',
  location: 'Zoom',
  description: `Prayers for healing. ${ZOOM_HEALING_NOTE}`,
  link: ZOOM_HEALING,
  kind: 'devotional',
});

const events = [
  {
    id: '2026-08-01-feast',
    date: '2026-08-01',
    title: 'Feast of Sharaf (Honor)',
    time: '1:00 PM',
    location: "Joan Mazer's home — 1529 Queen Palm, Edgewater",
    description: 'Nineteen Day Feast.',
    link: '',
    kind: 'other',
  },
  bookTwo('2026-08-03'),
  morningDevotional('2026-08-06'),
  bookTwo('2026-08-10'),
  healingDevotional('2026-08-11'),
  morningDevotional('2026-08-13'),
  {
    id: '2026-08-16-womens-spiritual-journey',
    date: '2026-08-16',
    title: "Women's Spiritual Journey",
    time: '2:00 PM',
    location: "Gail Radley's home",
    description: 'This month’s theme: Reverence.',
    link: '',
    kind: 'other',
  },
  bookTwo('2026-08-17'),
  {
    id: '2026-08-21-feast',
    date: '2026-08-21',
    title: 'Feast',
    time: 'TBD',
    location: 'TBD',
    description: 'Details to be announced.',
    link: '',
    kind: 'other',
  },
  bookTwo('2026-08-24'),
  healingDevotional('2026-08-25'),
  morningDevotional('2026-08-27'),
];

// ------------------------------------------------------------------- write --

const db = getFirestore(initializeApp(firebaseConfig));

let failed = false;
for (const { id, ...data } of events) {
  try {
    await setDoc(doc(db, 'events', id), data);
    console.log(`  ok  ${id}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL  ${id}: ${error.message}`);
  }
}

await terminate(db);

if (failed) {
  console.error(
    '\nSome writes were rejected. If the error above says "permission denied", the ' +
      'locked-down security rules are already live — temporarily allow writes ' +
      '(Firebase console → Firestore → Rules: change `allow write: if false` to ' +
      '`if true` under /events, publish, run the seed, then restore the rules or ' +
      'run `npx firebase-tools deploy --only firestore:rules`).',
  );
  process.exit(1);
}

console.log(`\nSeeded ${events.length} events into "${firebaseConfig.projectId}".`);
