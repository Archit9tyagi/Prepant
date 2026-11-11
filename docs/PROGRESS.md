# Prepant Progress

## Current status

- **Phase:** 1 — Authentication, users and roles
- **Chunk:** 1.4 — Verification, documentation and acceptance
- **Done:** Phase 0 audit, handoff setup, server auth core, server auth extras, client auth surfaces, final checks and `phase-1` tag
- **Next:** Phase 2 — taxonomy, mentor onboarding and admin approval; the Phase 2 brief scope follows Phase 1 in [projectbrief.md](./projectbrief.md).

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
