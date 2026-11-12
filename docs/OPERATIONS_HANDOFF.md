# Production operations handoff

## Repository evidence

Run `npm run verify:release` from the repository root. This runs typecheck,
lint, tests, client build and the production dependency audit.

## Deployment owner checks

- Configure production secrets from the environment examples.
- Confirm MongoDB backups and a restore drill.
- Confirm SMTP, Cloudinary, Razorpay live mode and Sentry.
- Run deployed liveness/readiness and learner, mentor, booking and admin smoke
  journeys.
- Run browser accessibility checks and review legal pages.

Do not treat local test results as evidence for infrastructure-owned checks.
