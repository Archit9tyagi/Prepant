# Phase 10 — Launch operations handoff

Phase 10 is a repository governance milestone introduced because the brief
ends its numbered implementation phases at Phase 9.

## Completed

- Recorded the boundary between repository verification and infrastructure-owned
  launch checks.
- Centralized release commands, deployment requirements, security evidence and
  acceptance coverage in the existing launch documents.
- Preserved explicit ownership for deployment smoke, backups, provider
  credentials, monitoring and legal review.

## Required before production launch

1. Deploy API and client using [DEPLOYMENT.md](../DEPLOYMENT.md).
2. Run `/api/v1/health` and `/api/v1/ready` from the deployed environment.
3. Execute the smoke, accessibility, backup/restore and provider checks in
   [LAUNCH_CHECKLIST.md](../LAUNCH_CHECKLIST.md).
4. Record results in [RELEASE_SIGNOFF.md](../RELEASE_SIGNOFF.md).

Phase 10 repository handoff is complete; the numbered checks above remain
external operational gates.
