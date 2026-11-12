# Prepant Progress

## Current status

- **Phase:** 11 — V1 lesson-pack and coupon foundations
- **Chunk:** 11.0 — Scope and handoff
- **Done:** Phase 3 public discovery, taxonomy/exam landing APIs, mentor search/profile, lead capture, blog endpoints, sitemap/robots, quiz and public pages
- **Done:** Availability editor/API, timezone-aware slot generation, unique slot locks, bookings, mock/Razorpay payment providers, confirmation, cancellation, classroom join, completion and reviews
- **Done:** Favorites, conversations, messages, unread/read state, in-app notifications, Socket.IO authentication/events and student/mentor community screens
- **Done:** Mentor dashboards, earnings/payout requests, admin stats/users/bookings/payments/refunds/payouts/reviews/leads/blog/settings/audit operations and protected client surfaces
- **Done:** Phase 6.2 session controls, one-time rescheduling, no-show workflows and dashboard session filters
- **Done:** Phase 7.1 readiness endpoint, request IDs and configurable proxy trust
- **Done:** Phase 7.2 dependency audit evidence and production deployment guide
- **Done:** Phase 7.3 compatible production dependency upgrades and clean production audit
- **Done:** Phase 7.4 launch checklist and automated security-boundary checks
- **Done:** Phase 7.5 Hindi locale, language switcher and client brand manifest
- **Done:** Phase 7.6 acceptance matrix and locale regression coverage
- **Done:** Repository release verification command and sign-off evidence
- **Done:** Phase 7 repository hardening, release verification and launch evidence
- **Done:** Phase 8.1 admin KPI series, user controls, booking filters, payout
  rejection, lead filters/CSV, post CRUD and mutation audit coverage
- **Done:** Phase 8.2 admin users route, pagination/status filters, CSV export,
  payout rejection controls, needs-review filter and lead notes
- **Done:** Phase 8.3 KPI cards/chart, markdown draft preview, settings editor
  and post-created audit coverage
- **Done:** Phase 8.4 CMS cover upload and expanded admin mutation/audit tests
- **Done:** Phase 9 repository hardening and launch evidence
- **Done:** Phase 10 launch-operations handoff documentation
- **Done:** Regional language selector and shared public copy for English, Hindi,
  Tamil, Telugu, Marathi, Kannada and Punjabi
- **Done:** Homepage mentors and KPI figures now load from database-backed
  endpoints, with honest empty/loading states instead of sample data
- **Done:** Added opt-in development scale seeding for 100 mentors and 1,000
  learners, with demo-only domains and production protection
- **Done:** Category tiles now navigate to real category-filtered mentor results;
  mentor onboarding supports subject selection and profile-photo upload
- **Done:** Render installs now skip unavailable production Husky hooks while
  preserving local hook setup; Docker build stages copy the guarded installer
- **Done:** Added native Render configuration to retain build-time
  devDependencies and pin the Node runtime to 22.x
- **In progress:** Phase 11 scope and implementation planning
- **Next:** Implement lesson-pack and coupon models, validation, protected APIs
  and integer-paise pricing tests
- **Phase notes:** [PHASE_3.md](./phases/PHASE_3.md), [PHASE_4.md](./phases/PHASE_4.md), [PHASE_5.md](./phases/PHASE_5.md), [PHASE_6.md](./phases/PHASE_6.md), [PHASE_7.md](./phases/PHASE_7.md), [PHASE_8.md](./phases/PHASE_8.md)
- **Current phase notes:** [PHASE_9.md](./phases/PHASE_9.md), [PHASE_10.md](./phases/PHASE_10.md), [PHASE_11.md](./phases/PHASE_11.md)

## How to run

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

MongoDB must be reachable at `MONGODB_URI`. Tests use MongoDB Memory Server.

## Known issues

- Docker is not available in the current environment, so Compose startup was not exercised.
- The API requires MongoDB before it can bind and answer health checks.
- Console email links are logged by the development email provider.
- Demo scale data can be loaded with `DEMO_MENTORS=100 DEMO_STUDENTS=1000 npm run seed:demo`;
  all generated accounts use the `demo.prepant.test` domain and password
  `Demo@12345`.
- The mock provider confirms payments immediately for local development; production Razorpay requires the documented environment keys.
- Socket.IO requires the same access token used by REST and uses `VITE_SOCKET_URL` when configured.
- Phase 7 deployment-owner gates remain external: no deployed environment,
  browser accessibility project, Docker daemon or live provider credentials
  are available in this repository-only environment.
