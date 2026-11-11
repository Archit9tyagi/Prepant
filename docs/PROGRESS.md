# Prepant Progress

## Current status

- **Phase:** 5 — Favorites, messaging and notifications
- **Chunk:** 5.4 — Verification and handoff
- **Done:** Phase 3 public discovery, taxonomy/exam landing APIs, mentor search/profile, lead capture, blog endpoints, sitemap/robots, quiz and public pages
- **Done:** Availability editor/API, timezone-aware slot generation, unique slot locks, bookings, mock/Razorpay payment providers, confirmation, cancellation, classroom join, completion and reviews
- **Done:** Favorites, conversations, messages, unread/read state, in-app notifications, Socket.IO authentication/events and student/mentor community screens
- **In progress:** Final Phase 5 verification and documentation
- **Next:** Phase 6 — richer dashboards, messaging enhancements and operational admin surfaces.
- **Phase notes:** [PHASE_3.md](./phases/PHASE_3.md), [PHASE_4.md](./phases/PHASE_4.md), [PHASE_5.md](./phases/PHASE_5.md)

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
- Socket.IO requires the same access token used by REST and uses `VITE_SOCKET_URL` when configured.
