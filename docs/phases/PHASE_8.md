# Phase 8 — Admin panel, payouts, CMS, leads and analytics

Source: `docs/projectbrief.md`, Phase 8.

## Scope

Server: the /admin endpoints from 7.2: stats (KPIs and time series with aggregation pipelines), users (block and unblock), bookings (including the needs_review queue), payments with refund, payouts (mark paid with UTR, reject), reviews moderation, leads (filters and CSV export), posts CRUD (markdown), settings (commission, trial discount, cancellation window, hold minutes, payout rules) and audit-log listing. Audit every mutation.

Client: /admin dashboard with KPI cards and Recharts charts (bookings per day, GMV, revenue, signups, mentor funnel). TanStack Table pages with server-side pagination, search, filters and CSV; payout workflow; leads inbox with status and notes; blog editor with markdown preview and cover upload; settings forms; audit-log viewer.

Acceptance: an admin can run the business from the panel exactly as listed in section 12, and every admin mutation appears in the audit log.

## Chunk 8.1 — Admin API completion

- Add KPI time-series and mentor-funnel data to admin stats.
- Add user block/unblock, booking status filters, payout rejection, lead filters
  and CSV export, and post update/delete endpoints.
- Audit every newly introduced admin mutation.
- Verify with server integration tests and workspace checks.

## Remaining chunks

- Complete the admin client with KPI charts, lead notes, CMS editing/preview and
  settings forms.
- Add focused acceptance coverage for admin mutations and audit visibility.

## Chunk 8.2 — Admin workflow surfaces

- Add admin users routing, server-side pagination, status filters and loading
  states to the existing operations shell.
- Add user block/unblock, CSV export, payout rejection and needs-review controls.
- Add lead notes persistence.
