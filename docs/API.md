# Prepant REST API Documentation

Base URL: `/api/v1`

## Contract Conventions

- **Success Response**: `{ "success": true, "data": { ... }, "meta": { ... } }`
- **Error Response**: `{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }`

---

## Health Check

### `GET /api/v1/health`

Returns system status, uptime, and current ISO timestamp.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 12.34,
    "timestamp": "2026-11-10T13:30:00.000Z"
  }
}
```

## Authentication

All auth paths are under `/api/v1/auth`. Registration accepts `name`, `email`, `password`, `role` (`student` or `mentor`) and `consent: true`. Login and refresh return an in-memory access token. Refresh and logout require `X-Requested-With: prepant-web`; the rotating refresh token is an httpOnly cookie.

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H 'Content-Type: application/json' -H 'X-Requested-With: prepant-web' \
  -d '{"email":"student1@prepant.test","password":"Student@12345"}'
```

Available routes: `POST /register`, `/login`, `/google`, `/refresh`, `/logout`, `/verify-email`, `/resend-verification`, `/forgot-password`, `/reset-password`, `/change-password`; `GET /me`.

User routes: `PATCH /api/v1/users/me` updates profile fields and `DELETE /api/v1/users/me` soft-deletes and anonymises the account.

## Taxonomy

Public catalogue routes:

- `GET /api/v1/categories`
- `GET /api/v1/categories/:slug`
- `GET /api/v1/subjects?category=<id>&q=<search>&page=1&limit=50`
- `GET /api/v1/subjects/:slug`

Run `npm run seed:taxonomy` to create the eight launch categories, 80 subjects and an approved development mentor profile when `mentor1@prepant.test` exists.

## Mentor onboarding

All mentor routes require `Authorization: Bearer <access-token>` for a user with role `mentor`:

- `GET /api/v1/mentor/profile`
- `PUT /api/v1/mentor/profile`
- `POST /api/v1/mentor/profile/submit`
- `POST /api/v1/mentor/profile/certificates` using multipart field `certificate` plus `name`, `issuer` and `year`
- `DELETE /api/v1/mentor/profile/certificates/:id`

Profiles are saved as drafts and must reach 70% completeness, include subjects and a rate, before submission changes status to `pending`.

## Admin review and catalogue

All admin routes require an admin access token:

- `GET /api/v1/admin/mentors?status=pending&page=1&limit=25`
- `POST /api/v1/admin/mentors/:id/approve`
- `POST /api/v1/admin/mentors/:id/reject` with `{ "reason": "..." }`
- `POST /api/v1/admin/mentors/:id/suspend` with `{ "reason": "..." }`
- `GET|POST /api/v1/admin/categories`
- `PATCH|DELETE /api/v1/admin/categories/:id`
- `GET|POST /api/v1/admin/subjects`
- `PATCH|DELETE /api/v1/admin/subjects/:id`

Approval, rejection, suspension and catalogue mutations create `AuditLog` records. Approval and rejection send the configured email provider notification.

## Public mentors and leads

- `GET /api/v1/mentors?q=&subject=&minPrice=&maxPrice=&rating=&sort=&page=&limit=`
- `GET /api/v1/mentors/:slug`
- `POST /api/v1/leads` with `name`, `phone`, `interest`, optional `email`, `message` and `source`

Only profiles with `status=approved` are returned publicly. Lead submissions are validated and stored with `new` status.

## Public content

- `GET /api/v1/content/categories/:categorySlug`
- `GET /api/v1/content/categories/:categorySlug/:subjectSlug`
- `GET /api/v1/content/exams/:examSlug`
- `GET /api/v1/posts` and `GET /api/v1/posts/:slug`
- `GET /api/v1/settings/public`
- `GET /sitemap.xml` and `GET /robots.txt`

## Availability and booking

- `GET /api/v1/bookings/slots?mentorSlug=&from=&to=&duration=&tz=`
- `GET|PUT /api/v1/mentor/availability`
- `POST /api/v1/mentor/availability/exceptions`
- `POST /api/v1/bookings` creates a pending payment booking and unique 15-minute slot locks.
- `GET /api/v1/bookings`, `GET /api/v1/bookings/:id`
- `POST /api/v1/bookings/:id/verify` confirms a mock or Razorpay payment idempotently.
- `POST /api/v1/bookings/:id/cancel` applies the configured notice window and records any eligible refund.
- `POST /api/v1/bookings/:id/reschedule` (student) moves a confirmed booking once, acquiring replacement locks before releasing the old locks.
- `POST /api/v1/bookings/:id/complete` (mentor) completes a confirmed booking.
- `POST /api/v1/bookings/:id/no-show` (mentor, body `{ "side": "student" | "mentor", "reason"?: string }`) records a no-show outcome.
- `GET /api/v1/bookings/:id/join` returns the Jitsi room during the join window.
- `POST /api/v1/bookings/:id/review` creates one review after completion and updates mentor ratings.

Money is stored in integer paise. Availability is expanded in the mentor's IANA timezone and returned as UTC-aware ISO times in the requested timezone. Mock payments are selected by default; Razorpay is selected only when `PAYMENTS_MODE=razorpay` and both keys are present.

## Favorites, messaging and notifications

All routes below require a bearer access token:

- `GET /api/v1/favorites`
- `POST /api/v1/favorites/:mentorId`
- `DELETE /api/v1/favorites/:mentorId`
- `GET /api/v1/conversations`
- `POST /api/v1/conversations` with `{ "participantId": "..." }`
- `GET /api/v1/conversations/:id/messages?before=&limit=`
- `POST /api/v1/conversations/:id/messages` with `{ "body": "...", "attachments": [] }`
- `POST /api/v1/conversations/:id/read`
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/read-all`

Messages are limited to 2,000 characters and are stored before the server emits Socket.IO events. Authenticated sockets join `user:<userId>`; clients can join `conversation:<conversationId>`. Events are `message:new`, `message:read` and `notification:new`.

## Dashboards and operations

Mentor routes:

- `GET /api/v1/mentor/dashboard`
- `GET /api/v1/mentor/students`
- `GET /api/v1/mentor/earnings`
- `GET /api/v1/mentor/payouts`
- `POST /api/v1/mentor/payouts` with `{ "amountPaise": 50000 }`
- `POST /api/v1/mentor/reviews/:id/reply`

Admin routes require an admin token:

- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/bookings`
- `GET /api/v1/admin/payments`
- `POST /api/v1/admin/payments/:id/refund`
- `GET /api/v1/admin/payouts`, `POST /api/v1/admin/payouts/:id/pay`
- `GET /api/v1/admin/reviews`, `PATCH /api/v1/admin/reviews/:id`
- `GET /api/v1/admin/leads`, `PATCH /api/v1/admin/leads/:id`
- `GET|POST /api/v1/admin/blog`
- `PATCH /api/v1/admin/settings/:key`
- `GET /api/v1/admin/audit`
