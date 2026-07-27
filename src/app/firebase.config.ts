/**
 * Firebase web app configuration.
 *
 * These values are NOT secrets. A Firebase web config identifies the project to
 * the client SDK and is visible in the shipped bundle by design — access is
 * controlled by the Firestore security rules in `firestore.rules`, not by hiding
 * this. Committing it is the documented, supported practice.
 *
 * Note: this file only holds the config. The app itself is initialized lazily
 * in `shared/events/events.ts`, browser-only, so the SDK stays out of the
 * server build and the initial bundle.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyAsdss-YZKMaY5KmdzwONmS7TIot8G5vEk',
  authDomain: 'volusia-county-bahais.firebaseapp.com',
  projectId: 'volusia-county-bahais',
  storageBucket: 'volusia-county-bahais.firebasestorage.app',
  messagingSenderId: '126569366708',
  appId: '1:126569366708:web:13cd307231c7cccc7103e1',
};

/** The Firestore collection holding calendar entries. */
export const EVENTS_COLLECTION = 'events';

/**
 * True once the placeholders above have been swapped for a real project. Lets
 * the app skip the network call — and say so plainly — rather than throwing an
 * opaque SDK error while the project is still being set up.
 */
export const isFirebaseConfigured = !Object.values(firebaseConfig).some((value) =>
  value.includes('REPLACE_ME'),
);
