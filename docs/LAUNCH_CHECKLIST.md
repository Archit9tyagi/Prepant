# Prepant launch checklist

This checklist is the final release gate for the current MVP. Items marked
`[ ]` require deployment-specific verification and must not be inferred from
local tests.

## Application and security

- [x] Production dependency audit is clean with `npm audit --omit=dev`.
- [x] Helmet, exact-origin credentialed CORS, compression and rate limits are enabled.
- [x] Uploads use memory storage and enforce MIME and size limits.
- [x] Access tokens remain in memory; refresh tokens are hashed, rotated and cookie-bound.
- [x] Admin mutations write audit records.
- [ ] Run a security review against the deployed environment and confirm no secrets are present in Git.
- [ ] Set unique production JWT and encryption secrets in the platform secret store.
- [ ] Set `COOKIE_SECURE=true`, the exact `CLIENT_URL`, and the correct `TRUST_PROXY`.

## Runtime and data

- [x] `/api/v1/health` liveness endpoint exists.
- [x] `/api/v1/ready` readiness endpoint checks MongoDB connectivity.
- [x] Graceful shutdown closes HTTP and MongoDB connections.
- [ ] Configure MongoDB Atlas backups, alerting, IP/network access and a least-privilege database user.
- [ ] Verify production SMTP, Cloudinary, Razorpay and Google credentials.
- [ ] Confirm payment webhooks are signature-verified and idempotent before enabling live payments.
- [ ] Confirm a restore drill and data-retention process with the owner/legal counsel.

## Verification commands

```bash
npm install
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm audit --omit=dev --audit-level=moderate
```

## Smoke test after deployment

1. Check `/api/v1/health` and `/api/v1/ready` from the public API origin.
2. Load the public home, mentor search and mentor profile pages.
3. Register a test student and mentor, complete verification and log in again.
4. Create and confirm a mock booking, join the classroom during its join window,
   complete it and submit a review.
5. Verify an admin approval mutation appears in the audit log.
6. Confirm a denied origin does not receive credentialed CORS headers.
