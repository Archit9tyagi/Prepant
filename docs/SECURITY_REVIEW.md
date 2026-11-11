# Dependency and security review

Date: 2026-11-11

## Checks completed

- Helmet, strict configured-origin CORS, compression and global/auth rate
  limits are enabled.
- Uploads use memory storage, allow only JPEG/PNG/WebP/PDF and enforce 5 MB
  image or 10 MB PDF limits at the certificate endpoint.
- Secrets are loaded from environment variables; `.env` files remain ignored.
- `npm audit --omit=dev --audit-level=moderate` is clean after the compatible
  dependency upgrades in Phase 7.3.

## Dependency findings

Nodemailer, Zod, Google Auth/Gaxios and Node Cron were upgraded to versions
without production advisories. Zod 4 compatibility was verified in the
validation middleware, error handler and settings schema.

The full audit still reports development-tool advisories in Vitest/Vite,
esbuild, tinypool and TypeScript ESLint. They do not ship in the production
image (`npm ci --omit=dev`), but should be reviewed before running development
tools on untrusted projects.

## Follow-up

Keep the production audit command in the launch checklist and upgrade the
development toolchain in a separately tested maintenance chunk.
