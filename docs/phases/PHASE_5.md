# Phase 5 — Favorites, Messaging and Notifications

## Delivered

- Student favorites with unique student/mentor pairs and approved-mentor validation.
- Persistent conversations between learners and mentors.
- Message persistence with a 2,000-character limit, attachments metadata, pagination and read timestamps.
- Unread conversation counters and read-all conversation handling.
- In-app notifications with 90-day TTL, notification listing and mark-all-read.
- Socket.IO authentication with the in-memory access token.
- Socket rooms for users and conversations with `message:new`, `message:read` and `notification:new` events.
- Student and mentor message inboxes, favorites, notifications and dashboard navigation.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The REST API remains authoritative: messages and notifications are persisted before Socket.IO events are emitted.
