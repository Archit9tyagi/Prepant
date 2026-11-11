# Prepant Progress

## Current status

- **Phase:** 4 — Availability, booking and payments
- **Chunk:** 4.4 — Verification and handoff
- **Done:** Phase 3 public discovery, taxonomy/exam landing APIs, mentor search/profile, lead capture, blog endpoints, sitemap/robots, quiz and public pages
- **Done:** Availability editor/API, timezone-aware slot generation, unique slot locks, bookings, mock/Razorpay payment providers, confirmation, cancellation, classroom join, completion and reviews
- **In progress:** Final Phase 4 verification and documentation
- **Next:** Phase 5 — messaging, notifications and richer student/mentor workspaces.
- **Phase notes:** [PHASE_3.md](./phases/PHASE_3.md), [PHASE_4.md](./phases/PHASE_4.md)

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
- The mock provider confirms payments immediately for local development; production Razorpay requires the documented environment keys.
