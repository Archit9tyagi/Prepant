# Prepant — Universal 1-to-1 Learning Platform

> **Prep Smart. Succeed Big.**  
> A production-grade, one-to-one mentoring marketplace built as a modern MERN monorepo connecting learners with expert mentors across school subjects, competitive exams (JEE, NEET, UPSC, etc.), languages, coding, music, and more.

---

## Architecture & Monorepo Structure

```
prepant/
├── client/                     # Vite + React 19 + Tailwind CSS v4 + shadcn/ui
│   ├── src/
│   │   ├── app/                # router, providers, auth & role guards
│   │   ├── components/
│   │   │   ├── ui/             # 23 shadcn/ui primitives (Radix)
│   │   │   ├── common/         # MentorCard, RatingStars, PriceTag, etc.
│   │   │   └── layout/         # Header, Footer, MobileNav, DashboardShell
│   │   ├── config/site.ts      # Site metadata, contacts, categories
│   │   ├── lib/                # api, queryClient, time, money, track
│   │   ├── pages/              # Home, Styleguide, NotFound
│   │   └── styles/             # tokens.css, globals.css (Tailwind v4 theme)
├── server/                     # Express 5 + Node 22 + TypeScript + Mongoose
│   ├── src/
│   │   ├── config/             # env (Zod), db, logger (pino)
│   │   ├── middleware/         # authenticate, requireRole, validate, rateLimit, errorHandler
│   │   ├── providers/          # payment, email, storage, video (abstractions & local mocks)
│   │   ├── routes/             # versioned under /api/v1 (health, etc.)
│   │   └── utils/              # ApiError, asyncHandler, time, money, slug, crypto
├── docs/                       # projectbrief.md, decision.md, API.md
├── docker-compose.yml          # Local API + MongoDB
└── package.json                # npm workspaces root
```

---

## Quickstart (5 Commands)

```bash
# 1. Clone & install dependencies
git clone <repo-url> && cd prepant
npm install

# 2. Configure environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Start development servers (Express API on :5000, React client on :5173)
npm run dev

# 4. Run tests
npm test

# 5. Build for production
npm run build
```

---

## Available Scripts

| Script              | Command                   | Description                                           |
| ------------------- | ------------------------- | ----------------------------------------------------- |
| `npm run dev`       | `concurrently`            | Starts server (:5000) and client (:5173) concurrently |
| `npm run build`     | `npm run build -w ...`    | Builds server (esbuild) and client (vite)             |
| `npm run start`     | `npm run start -w server` | Runs the compiled server production bundle            |
| `npm run typecheck` | `tsc`                     | Runs strict type checking on both workspaces          |
| `npm run lint`      | `eslint`                  | Lints server and client with ESLint 9 flat config     |
| `npm run test`      | `vitest`                  | Executes unit & integration tests on both sides       |

---

## Phase 1 auth and seeded accounts

The development auth flow uses console email delivery when SMTP variables are empty. Seed verified development accounts (never in production) with:

```bash
npm run seed:users
```

| Role    | Email                 | Password      |
| ------- | --------------------- | ------------- |
| Admin   | admin@prepant.test    | Admin@12345   |
| Student | student1@prepant.test | Student@12345 |
| Mentor  | mentor1@prepant.test  | Mentor@12345  |

Auth routes include register, login, rotating refresh, logout, email verification, password reset, profile update and soft delete under `/api/v1/auth` and `/api/v1/users`.

Phase 2 provides public taxonomy endpoints, mentor onboarding at `/api/v1/mentor`, and admin review/catalogue endpoints at `/api/v1/admin`. Seed the catalogue after seeding users:

```bash
npm run seed:taxonomy
```

Certificate uploads use Cloudinary when all `CLOUDINARY_*` variables are configured. With the default environment they are saved under `uploads/` and served from the API at `/uploads/...`.

## Phase 3 and Phase 4 marketplace

The public site includes mentor search/profile pages, the four-step `/find-my-mentor` quiz, category and exam landing routes, blog list/detail routes, lead capture, sitemap and robots endpoints. Approved mentors can configure availability at `/teach/availability`. Learners can book a trial or single session at `/book/:slug`; local development uses the mock payment provider and creates a Jitsi classroom. Configure Razorpay with `PAYMENTS_MODE=razorpay` and the `RAZORPAY_*` variables in `server/.env` when deploying payments.

The booking API generates timezone-aware slots, uses unique 15-minute locks to prevent double booking, supports confirmation, cancellation/refunds, completion, classroom join windows and post-session reviews. See [docs/API.md](docs/API.md) for request contracts.

Phase 5 adds authenticated favorites, learner/mentor conversations, persistent messages, unread/read state, in-app notifications and Socket.IO real-time updates. See [docs/phases/PHASE_5.md](docs/phases/PHASE_5.md).

## Health Check & Styleguide

- **API Health Check**: `http://localhost:5000/api/v1/health`
- **Design System Styleguide**: `http://localhost:5173/_styleguide`
