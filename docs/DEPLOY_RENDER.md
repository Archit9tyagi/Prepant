# Deploy Prepant API on Render

## 1. Create MongoDB Atlas

1. Create a free MongoDB Atlas cluster in a region close to the Render service.
2. Create a database user with a strong password.
3. In **Network Access**, allow `0.0.0.0/0` only as a quick start with a strong
   database password, or allow the outbound ranges shown in Render under
   **Connect > Outbound**.
4. Copy the Atlas connection string and add `/prepant` as the database name:

```text
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/prepant?retryWrites=true&w=majority
```

URL-encode special characters in the database password.

## 2. Create the Render service

Use the repository Blueprint in `render.yaml`, or create a native Node web
service with:

| Setting           | Value                                                  | Required |
| ----------------- | ------------------------------------------------------ | -------- |
| Region            | Singapore (or the region closest to Atlas)             | Yes      |
| Build command     | `npm install --include=dev && npm run build -w server` | Yes      |
| Start command     | `npm run start -w server`                              | Yes      |
| Health check path | `/health`                                              | Yes      |

Set these in Render's **Environment** tab. Never commit their values:

| Name                 | Example format                                                      | Required |
| -------------------- | ------------------------------------------------------------------- | -------- |
| `MONGODB_URI`        | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/prepant?...` | Yes      |
| `CLIENT_URL`         | `https://prepant.vercel.app` or comma-separated HTTPS origins       | Yes      |
| `SERVER_URL`         | `https://prepant-api.onrender.com`                                  | Yes      |
| `JWT_ACCESS_SECRET`  | Render-generated secret                                             | Yes      |
| `JWT_REFRESH_SECRET` | Render-generated secret                                             | Yes      |
| `ENCRYPTION_KEY`     | Render-generated 64-character secret                                | Yes      |
| `COOKIE_SECURE`      | `true`                                                              | Yes      |
| `TRUST_PROXY`        | `1`                                                                 | Yes      |
| `PAYMENTS_MODE`      | `mock` or `razorpay`                                                | Yes      |

Do not add `NODE_ENV` to `render.yaml`. Render sets it at runtime, and setting
it during the build can make npm omit the devDependencies required by TypeScript
and esbuild.

## 3. Connect the frontend

After the API is live, set `VITE_API_URL` on the frontend host to
`https://prepant-api.onrender.com/api/v1`. Set `CLIENT_URL` on Render to the
exact frontend origin, including `https://` and without a trailing slash.
Redeploy both services after changing these values.

## 4. Verify and read logs

1. Redeploy after saving the environment variables.
2. Open `https://prepant-api.onrender.com/health`; it should return HTTP 200.
3. Open `/ready`; it should return HTTP 200 only after MongoDB connects.
4. Review Render logs for `listening on 0.0.0.0:<port>`.

| Log message                               | Fix                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| `ECONNREFUSED 127.0.0.1:27017`            | Set a non-local `MONGODB_URI` in Render's Environment tab.                      |
| `bad auth` or `authentication failed`     | Check the Atlas user/password and URL-encode password special characters.       |
| `IP not allowed` or Atlas network timeout | Add Render outbound IP ranges or temporarily allow `0.0.0.0/0`.                 |
| `No open ports detected`                  | Fix the earlier startup error; this means the process crashed before listening. |
| CORS errors                               | Set `CLIENT_URL` to the exact Vercel/frontend origin and redeploy the API.      |
