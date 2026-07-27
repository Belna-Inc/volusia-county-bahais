/**
 * Firebase web app configuration.
 *
 * These values are NOT secrets. A Firebase web config identifies the project to
 * the client SDK and is visible in the shipped bundle by design — access is
 * controlled by the Firestore security rules in `firestore.rules`, not by hiding
 * this. Committing it is the documented, supported practice.
 *
 * To fill it in: Firebase console → Project settings → General → "Your apps" →
 * the web app → "SDK setup and configuration" → Config.
 */
export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.firebasestorage.app',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
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
