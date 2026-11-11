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
