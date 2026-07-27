# VolusiaCountyBahais

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.0.

The site is prerendered and served as static files from GitHub Pages (see
`.github/workflows/deploy.yml` — every push to `master` deploys). The calendar
data lives in Cloud Firestore and is fetched by the browser at runtime, so the
schedule can change without a redeploy.

## Firebase setup (one time)

1. Go to <https://console.firebase.google.com>, **Add project** (e.g.
   `volusia-county-bahais`). Google Analytics is not needed.
2. In the project: **Build → Firestore Database → Create database**. Choose a
   nearby location (e.g. `nam5` / `us-east1`) and start in **test mode** —
   we lock it down with our own rules in step 5.
3. **Project settings (gear icon) → General → Your apps → Add app → Web** (`</>`).
   Register it (no hosting needed), then copy the `firebaseConfig` values into
   [`src/app/firebase.config.ts`](src/app/firebase.config.ts). These values are
   not secrets — committing them is expected.
4. Seed the calendar: `npm run seed` (writes the events in
   `scripts/seed-events.mjs` to the `events` collection; must be done while the
   database still allows writes, i.e. before step 5).
5. Lock down the rules so the public can read but never write:

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project <your-project-id>
   ```

6. Commit and push — the GitHub Pages workflow builds with the new config and
   the live site starts showing the calendar.

## Calendar entries

Events are documents in the `events` Firestore collection. Day-to-day edits are
easiest in the Firebase console (**Firestore Database → Data → events**), which
bypasses the security rules. Each document has these string fields:

| Field         | Example                                    | Notes                                        |
| ------------- | ------------------------------------------ | -------------------------------------------- |
| `date`        | `2026-08-01`                               | Required, `yyyy-mm-dd`                       |
| `title`       | `Morning Devotional`                       | Required                                     |
| `time`        | `9:00 AM`                                  | Free text                                    |
| `location`    | `Zoom`                                     | Free text                                    |
| `description` | `Prayers to start the day. Password: 959595` | Free text                                  |
| `link`        | `https://us02web.zoom.us/j/…`              | Optional; shown as a "Join online" button    |
| `kind`        | `devotional`                               | One of `devotional`, `study`, `children`, `junior-youth`, `other` |

To bulk-update a month, edit `scripts/seed-events.mjs` and re-run
`npm run seed` (the rules block client writes, so temporarily set
`allow write: if true` for `/events` in the console's Rules tab, seed, then
restore the rules).

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
