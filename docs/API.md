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
