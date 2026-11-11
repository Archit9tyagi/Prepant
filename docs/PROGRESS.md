# Prepant Progress

## Current status

- **Phase:** 3 — Public website, SEO, search and mentor profiles
- **Chunk:** 3.4 — Verification and handoff
- **Done:** Phase 2 server and client workflows, public taxonomy, mentor search/profile APIs, lead capture, public pages and SEO metadata
- **In progress:** Final Phase 3 verification and documentation
- **Next:** Phase 4 — availability and booking engine with mock payments.
- **Phase notes:** [PHASE_2.md](./phases/PHASE_2.md)

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
- Phase 3 mentor search currently uses a responsive card grid; advanced filters, availability slots and booking flow belong to Phase 4.
