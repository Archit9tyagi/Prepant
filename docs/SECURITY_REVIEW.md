# Dependency and security review

Date: 2026-11-11

## Checks completed

- Helmet, strict configured-origin CORS, compression and global/auth rate
  limits are enabled.
- Uploads use memory storage, allow only JPEG/PNG/WebP/PDF and enforce 5 MB
  image or 10 MB PDF limits at the certificate endpoint.
- Secrets are loaded from environment variables; `.env` files remain ignored.
- `npm audit --omit=dev --audit-level=moderate` completed and reported five
  production dependency advisories.

## Dependency findings

The audit reports high-severity advisories for the currently resolved
Nodemailer and Zod versions and moderate advisories in transitive `uuid`
dependencies. Automatic `--force` remediation would make breaking upgrades
(`nodemailer@10.5.0` and `zod@4.6.7`) and was not applied without compatibility
testing. These upgrades remain a release blocker for production deployment.

## Follow-up

Upgrade and test the affected packages in an isolated dependency chunk, then
rerun the audit and the complete verification suite before enabling production
traffic.
