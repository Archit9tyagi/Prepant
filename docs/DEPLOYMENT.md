# Production deployment

## Required services

- Node.js 22 runtime or the repository `server/Dockerfile`
- MongoDB Atlas (or another managed MongoDB deployment)
- A public client origin and API origin
- Cloudinary credentials for mentor assets
- Razorpay credentials when live payments are enabled
- SMTP credentials for production email delivery

## Environment

Copy `server/.env.example` to the deployment secret store and set, at minimum:

- `NODE_ENV=production`
- `MONGODB_URI`
- `CLIENT_URL` and `SERVER_URL`
- strong, unique `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` and `ENCRYPTION_KEY`
- `COOKIE_SECURE=true`
- `TRUST_PROXY=1` when running behind one reverse proxy

Do not commit `.env` files or place credentials in the client environment.

The root `prepare` script uses a guarded Node runner for Husky. Local installs
with devDependencies configure Git hooks; production installs that omit
devDependencies skip Husky setup without failing the deployment.

## Container

The production image is built from `server/Dockerfile`:

```bash
docker build -f server/Dockerfile -t prepant-api .
docker run --env-file server/.env -p 5000:5000 prepant-api
```

The image starts only after the application process is ready to connect to
MongoDB. Configure the platform health checks as follows:

- Liveness: `GET /api/v1/health`
- Readiness: `GET /api/v1/ready`

Readiness returns `503` until Mongoose has an active connection.

## Render, Railway or similar

Use the repository root as the build context, build with `server/Dockerfile`,
expose port `5000`, and set the environment variables above in the platform
secret manager. Set the health check path to `/api/v1/ready`, allow the
platform's proxy through `TRUST_PROXY`, and keep MongoDB network access
restricted to the API service.

## Vercel or Netlify client

Build the client with `npm run build -w client` and deploy `client/dist`.
Set `VITE_API_URL` and `VITE_SOCKET_URL` to the public API origin. Add the
client origin to `CLIENT_URL`; refresh/logout cookies require HTTPS and
`COOKIE_SECURE=true`.

## Launch checks

1. Confirm `/api/v1/health` and `/api/v1/ready` from the public API origin.
2. Verify CORS with the exact client origin and credentials enabled.
3. Run `npm run typecheck`, `npm run lint`, `npm test -- --run` and `npm run build`.
4. Run `npm audit --omit=dev --audit-level=moderate`; review advisories before release.
5. Confirm backups, monitoring, email delivery, Cloudinary and Razorpay live-mode
   credentials before enabling production traffic.
