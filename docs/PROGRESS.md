# Prepant Progress

## Current status

- **Phase:** 1 — Authentication, users and roles
- **Chunk:** 1.3 — Client authentication surfaces
- **Done:** Phase 0 audit, handoff setup, server auth core, server auth extras and auth integration tests
- **In progress:** Client auth pages, silent refresh and protected settings
- **Next:** Phase 2 — taxonomy, mentor onboarding and admin approval; scope is in [PHASE_1.md](./phases/PHASE_1.md) for the completed Phase 1 contract and the brief roadmap.

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
- Console email links are logged by the development email provider.
