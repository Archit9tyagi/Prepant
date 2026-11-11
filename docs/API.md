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
