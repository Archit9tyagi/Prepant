# Acceptance matrix

This is the repository-level acceptance record for the MVP. Infrastructure
items remain explicit manual gates in [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md).

## Automated journeys

| Journey            | Coverage                                                                                                | Verification                         |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Learner account    | Registration schema, consent validation, login form, rotating refresh/session tests                     | `npm test -- --run`                  |
| Mentor marketplace | Approved mentor search, lead capture, onboarding and admin approval integration tests                   | `npm test -- --run`                  |
| Paid session       | Availability, unique slot locking, payment confirmation, reschedule/no-show and booking lifecycle tests | `npm test -- --run`                  |
| Operations         | Mentor dashboard, admin statistics and role protection tests                                            | `npm test -- --run`                  |
| Public client      | App render, auth forms, English/Hindi locale switching and manifest/favicon build                       | `npm test -- --run && npm run build` |

## Manual deployment smoke test

After deploying with real services, follow the smoke-test sequence in
[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md): health/readiness, registration,
verification, booking, classroom join, review, admin audit and denied-origin
CORS checks.

Playwright and axe checks are intentionally not claimed as executed in this
repository-only environment because no browser test project or deployed
environment is configured. They remain a launch gate before public traffic.
