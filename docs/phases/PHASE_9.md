# Phase 9 — Hardening and launch

Source: `docs/projectbrief.md`, Phase 9.

## Repository completion

- Test suites, health/readiness/request-ID coverage and acceptance matrix are
  present and passing.
- Production dependency audit is clean.
- Helmet, strict configured-origin CORS, rate limits and upload checks are
  verified.
- Hindi locale, language switcher, favicon, manifest, deployment guide,
  production Dockerfile and launch checklist are present.
- Release verification is reproducible with `npm run verify:release`.

## External gates

Deployment smoke tests, Playwright/axe browser checks, Atlas backup/restore,
SMTP, Cloudinary, Razorpay live mode, Sentry and legal/compliance review remain
deployment-owner tasks. They are intentionally not marked complete without the
target environment and credentials.

## Acceptance status

Phase 9 repository work is complete. External launch gates are explicitly
tracked in [LAUNCH_CHECKLIST.md](../LAUNCH_CHECKLIST.md) and
[RELEASE_SIGNOFF.md](../RELEASE_SIGNOFF.md).
