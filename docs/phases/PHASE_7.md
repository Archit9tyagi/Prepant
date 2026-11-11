# Phase 7 — Hardening and production readiness

This phase follows the current progress tracker. The brief labels the broader
hardening-and-launch milestone as Phase 9; the repository tracker uses Phase 7
for the next post-Phase-6 workstream.

## Chunk 7.1 — Reliability foundation

- Add a database-backed readiness endpoint alongside the liveness health endpoint.
- Add response request IDs and make proxy trust deployment-configurable.
- Verify the foundation with focused tests and the workspace checks.

## Remaining scope

- Security and dependency review, including CORS, rate limits and upload checks.
- Sentry integration, production container/deployment documentation and launch checklist.
- E2E/accessibility coverage, performance/index review, Hindi locale and final SEO/polish work.

## Chunk 7.2 — Security evidence and deployment foundations

- Added the production deployment guide and documented liveness/readiness
  checks, environment requirements and hosted client/API configuration.
- Captured the current dependency audit findings and deferred breaking upgrades
  until they can be compatibility-tested.

## Chunk 7.3 — Compatible dependency remediation

- Upgraded Zod, Nodemailer, Node Cron and Google Auth/Gaxios dependencies.
- Adapted the validation middleware and error handler to Zod 4.
- Verified `npm audit --omit=dev --audit-level=moderate` reports zero
  production vulnerabilities.
- Re-ran typecheck, lint, tests and production build successfully.

## Chunk 7.4 — Launch gate

- Added `docs/LAUNCH_CHECKLIST.md` with environment, runtime, security,
  smoke-test and release verification gates.
- Added automated checks for Helmet security headers and exact-origin CORS.
