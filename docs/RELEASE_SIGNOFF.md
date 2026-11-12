# Release sign-off evidence

Date: 2026-11-12

## Repository verification

The reproducible release gate is:

```bash
npm run verify:release
```

It runs, in order:

1. Workspace typecheck
2. Workspace lint
3. Server and client tests
4. Production build
5. Production dependency audit

The gate passed for this sign-off. Existing explicit-`any` lint warnings remain
non-blocking; no lint errors were reported. The production dependency audit
reported zero vulnerabilities.

## External gates

These items cannot be completed from the repository-only environment and
remain required before public traffic:

- Deploy the API and client with production secrets.
- Run the smoke flow in [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) against
  the deployed API and MongoDB Atlas.
- Configure and run Playwright plus axe against the deployed client.
- Verify Atlas backups/restore, SMTP delivery, Cloudinary private assets,
  Razorpay live webhooks and monitoring/Sentry.
- Confirm legal/privacy/compliance approval and operational ownership.

No production launch is claimed until these external checks are recorded by
the deployment owner.
