# Phase 4 — Availability, Booking and Payments

## Delivered

- Mentor availability rules, exceptions, timezone, notice, advance and buffer settings.
- Slot generation in the mentor's IANA timezone with 30-minute starts and 15-minute unique locks.
- Student booking creation with trial discount, commission and integer-paise pricing.
- Mock payment confirmation for local development and Razorpay provider selection when configured.
- Idempotent payment confirmation, Jitsi meeting-room creation, cancellation/refund policy, mentor completion and classroom join window.
- Review creation after completion with mentor rating aggregation.
- Student session list, mentor availability editor and classroom client surfaces.
- Public booking flow, find-my-mentor quiz, taxonomy/exam landing pages, blog routes, sitemap and robots endpoints.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The default mock provider requires no third-party account. Set `PAYMENTS_MODE=razorpay`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` for live order creation and signature verification.
