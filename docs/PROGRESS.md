# Prepant Progress

## Current status

- **Phase:** 2 — Taxonomy, mentor onboarding and admin approval
- **Chunk:** 2.4 — Verification and handoff
- **Done:** Phase 0 foundation, Phase 1 authentication, taxonomy models/routes, storage providers, mentor onboarding APIs, certificate uploads, admin approval/catalogue APIs and Phase 2 integration tests
- **Done:** Phase 2 server slice verified and committed in three chunks
- **Next:** Finish the Phase 2 client surfaces (mentor marketing, onboarding wizard and admin review/catalogue screens), then Phase 3 — public website, SEO, search and mentor profiles.
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
- Client onboarding and admin review screens remain the next client-facing Phase 2 slice; the server contract is ready.
