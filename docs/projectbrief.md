1. Mission and working agreement
   You are a principal full-stack engineer and product designer. Build Prepant, a production-grade one-to-one mentoring marketplace, as a MERN monorepo. Follow these rules for the whole project:
   • Build in the phases of the roadmap. Finish each phase completely (working end to end, seeded with data, typechecked, linted and tested) before starting the next.
   • Do not ask me questions. When something is ambiguous, choose the most sensible option, implement it and add a one-line entry to docs/DECISIONS.md.
   • No lorem ipsum, no placeholder data in the UI, no dead buttons, no TODO stubs. Every visible control must work. If something belongs to a later phase, hide it or show it disabled with a “Coming soon” label.
   • Use the latest stable version of every dependency and follow the installed version’s current documentation instead of older patterns from memory (especially Tailwind CSS v4, React 19, React Router, Express 5 and Mongoose).
   • Prefer boring, well-maintained libraries and keep dependencies lean. No abandoned packages.
   • After every phase run npm run typecheck, npm run lint, npm test and npm run build; fix everything; update README.md and docs/API.md; commit with a conventional message such as feat(booking): add slot generation.
   • Keep modules small and readable: descriptive names, no file over about 300 lines, comments only where the logic is not obvious.
   • Secrets live only in env files. Commit .env.example for both apps and never commit real keys.
   • Original design only. Take inspiration from the flows of Preply (search, profile, trial booking, classroom) but never copy its logo, colours, copy, images or code.
2. Product context
   • Company: Prepant, a Universal Learning Platform. Founded 2022, Education / Ed-Tech, 11–50 employees, self-owned. Specialties: online education, mentoring, tutoring.
   • What it does: Teaches and connects learners with expert mentors for school subjects and competitive exams, professional skills, languages, hobbies, music, coding, fitness and beyond. Whatever you want to learn, whenever you’re ready, Prepant connects you with expert mentors who make it simple, personal and tailored.
   • Mission: Make quality one-to-one guidance accessible to everyone, whatever their age, goal or background: clear doubts, build confidence, and move forward with clarity and motivation.
   • Tagline: Prep Smart. Succeed Big.
   • Primary CTA: Book your 1-to-1 session today. Secondary CTA: Contact us to begin your exam preparation journey.
   • Company contact (keep it in one file, client/src/config/site.ts, import it everywhere and never hard-code it elsewhere): Mobile 9109447256 (also the WhatsApp click-to-chat number, https://wa.me/919109447256), Phone 9278078486, Email mishra8542@gmail.com.
   • Audience: school students (Class 6–12; CBSE, ICSE, state boards) and their parents; competitive-exam aspirants (JEE, NEET, UPSC, SSC, banking, CAT, GATE, CUET and similar); college students and professionals upskilling; language, music, fitness and hobby learners of any age; and teachers or experts who want to earn by teaching online.
   • Launch assumptions: India first. Currency INR (store money as integer paise). Default time zone Asia/Kolkata, but every user can pick any IANA zone. English UI at launch, Hindi in V1. Payments through Razorpay (UPI, cards, netbanking, wallets).
   • Brand voice: warm, encouraging, clear, confident. Short sentences. Speak to the learner as “you”. No hype and no fake urgency.
   • Metrics the product must make measurable: visitor-to-trial-booking conversion, trial-to-paid conversion, repeat bookings per learner, mentor utilisation, average rating, GMV and platform revenue, lead-form submissions.
3. Roles and feature scope
   Roles: student (learner; may be school-age with a parent or guardian contact), mentor, admin. V2 adds parent and support.
   Labels: MVP must ship at launch. V1 ships in the 4–6 weeks after launch. V2 comes later. Build the MVP unless a phase says otherwise, but shape the data models so V1 and V2 need no rewrites.
   Public visitor
   • MVP: Home; mentor search with filters; mentor profile with availability; category, subject and exam landing pages; ‘Find my mentor’ quiz; how it works; about; contact with lead form; FAQ; blog list and detail; legal pages; WhatsApp button; SEO (meta tags, sitemap, structured data).
   • V1: Hindi UI; side-by-side mentor comparison; counsellor chat widget.
   Student
   • MVP: sign up and log in (email and password, Google); email verification; password reset; profile; 4-step ‘Find my mentor’ quiz (goal, level, budget, preferred time) that pre-fills search and saves preferences; search, filter and sort mentors; save favourites; book a discounted trial session (one per mentor); book single sessions; pay with Razorpay; receipts; my sessions (upcoming, past, cancelled); join the classroom; cancel or reschedule within policy; review a mentor after a completed session; message mentors; notifications (in-app and email); time-zone aware everywhere.
   • V1: lesson packs (5, 10, 20 sessions at a discount); coupons and referral credits; Google Calendar sync; learning goals and progress notes; parent view.
   • V2: subscriptions; group batches; recorded courses; AI mentor matching and study planner.
   Mentor
   • MVP: apply through a multi-step onboarding (profile, subjects and rates, experience and education, certificates, intro video, availability, payout details); admin approval; dashboard; availability editor (weekly rules and time off); sessions list; join classroom; mark completed or no-show; earnings ledger; payout requests; reply to reviews; messaging; live profile preview.
   • V1: session notes and homework; student notes; response-rate badge; profile analytics; instant-book toggle.
   • V2: group classes; course builder; whiteboard templates.
   Admin
   • MVP: KPI dashboard; mentor approval queue (approve or reject with a reason); users; bookings; payments and refunds; payouts (mark paid with a reference); categories and subjects; review moderation; leads inbox with CSV export; blog CMS (markdown); site settings (commission, trial discount, cancellation window); audit log.
   • V1: staff roles; coupon management; content blocks editor.
4. Tech stack (fixed; to substitute anything, write the reason in docs/DECISIONS.md)
   Monorepo with npm workspaces (client, server). TypeScript in strict mode on both sides.
   • Frontend: React (latest, 19+) and Vite; Tailwind CSS v4 (CSS-first config, @tailwindcss/vite plugin); shadcn/ui (Radix) with lucide-react icons; React Router in Data Mode (createBrowserRouter); TanStack Query for server state; Zustand for small client state (auth user, UI); React Hook Form with Zod; Axios with a refresh-token interceptor; Luxon for time zones; TanStack Table for admin tables; Recharts for charts; Motion for animation; React 19 native document metadata (<title>, <meta>, <link rel='canonical'>) wrapped in a reusable <Seo> component; sonner for toasts; embla-carousel; react-i18next; socket.io-client; @react-oauth/google; Razorpay Checkout.
   • Backend: Node.js (active LTS) and Express 5; Mongoose on MongoDB Atlas; Zod for validation and env parsing; jsonwebtoken; bcryptjs; helmet, cors, compression, cookie-parser, express-rate-limit; pino and pino-http; multer with Cloudinary; nodemailer (SMTP, console fallback in dev); node-cron; Socket.IO; the razorpay SDK; google-auth-library; Luxon. Run with tsx, build with esbuild (--packages=external), typecheck with tsc --noEmit.
   • Quality: ESLint, Prettier, Husky with lint-staged; Vitest with React Testing Library (client); Vitest with Supertest and mongodb-memory-server (server); Playwright for end-to-end tests; GitHub Actions for CI.
   • Deployment targets: MongoDB Atlas (Mumbai region); API on Render, Railway or AWS; client on Vercel, Netlify or Cloudflare Pages; Cloudinary for media; Brevo, Resend or Amazon SES for email; Sentry for errors.
   • Cookies and domains: serve web and API from the same site (for example prepant.com and api.prepant.com, or proxy /api through the web host) so the refresh cookie is first-party and works in Safari and Chrome.
5. Architecture and repository structure
   React SPA (Vite build)
   │ REST /api/v1 (JSON) WebSocket (Socket.IO)
   ▼ │
   Express API (Node.js) ◄──────────────────┘
   route → validate (Zod) → authenticate → requireRole
   → controller (HTTP only) → service (business rules) → model
   - Socket.IO: chat, notifications, booking updates
   - node-cron: expire holds, reminders, auto-complete, release earnings
     │
     ├──► MongoDB Atlas
     ├──► Razorpay (orders, webhooks)
     ├──► Cloudinary (media)
     ├──► SMTP / email provider
     └──► Video provider (Jitsi link first, embedded later)
     Principles
     • Layering: route → controller (HTTP only) → service (business rules, no req or res) → model. Controllers never touch Mongoose directly and services never read the request.
     • Validation: every route validates body, query and params with Zod. Build Mongo filters only from validated, typed fields. Never spread req.body or req.query into a query.
     • Data rules: money is stored as integer paise; every instant is a UTC Date; availability is stored in the mentor’s IANA time zone and converted with Luxon.
     • Provider interfaces: PaymentProvider, EmailProvider, StorageProvider and VideoProvider hide third-party services so they can be swapped and mocked in tests.
     • API contract: versioned under /api/v1. Success: { success: true, data, meta? }. Failure: { success: false, error: { code, message, details? } } with the correct HTTP status. Pagination: ?page=1&limit=12 returns meta: { page, limit, total, totalPages }.
     • Scaling: the API is stateless (JWT), so it can run on several instances; add the Socket.IO Redis adapter and BullMQ when you do (V1).
     Repository structure
     prepant/
     ├─ package.json # npm workspaces + root scripts: dev, build, start, lint, typecheck, test, test:e2e, seed
     ├─ .github/workflows/ci.yml
     ├─ docker-compose.yml # API + MongoDB for local use
     ├─ docs/ # PROJECT_BRIEF.md, DECISIONS.md, API.md, LAUNCH_CHECKLIST.md
     ├─ client/
     │ ├─ index.html · vite.config.ts · components.json · .env.example
     │ └─ src/
     │ ├─ main.tsx · App.tsx
     │ ├─ app/ # router.tsx, providers.tsx, guards (RequireAuth, RequireRole)
     │ ├─ config/site.ts # brand, contact details, nav, social links, feature flags
     │ ├─ components/ui/ # shadcn primitives
     │ ├─ components/layout/ # Header, Footer, MobileNav, DashboardShell
     │ ├─ components/common/ # MentorCard, RatingStars, TimezoneSelect, EmptyState, Seo ...
     │ ├─ features/ # auth, mentors, booking, payments, student, teach, admin,
     │ │ # messaging, classroom, reviews, leads, content (each: api, hooks, components)
     │ ├─ pages/ # thin, lazy-loaded route components
     │ ├─ lib/ # api.ts (axios), queryClient.ts, time.ts, money.ts, track.ts
     │ ├─ store/ · hooks/ · locales/ (en.json, hi.json) · content/legal/*.md · styles/ · types/
     ├─ server/
     │ ├─ .env.example
     │ └─ src/
     │ ├─ server.ts · app.ts
     │ ├─ config/ # env.ts (zod), db.ts, logger.ts
     │ ├─ modules/ # one folder per domain: model, schema (zod), controller, service, routes, tests
     │ │ auth · users · taxonomy · mentors · availability · bookings · payments · payouts
     │ │ reviews · messaging · notifications · favorites · leads · content · settings · admin · uploads
     │ ├─ middleware/ # authenticate, requireRole, validate, errorHandler, rateLimit, upload
     │ ├─ providers/ # payment (razorpay, mock), email (smtp, console), storage (cloudinary, local), video (jitsi)
     │ ├─ jobs/ # expireHolds.ts, reminders.ts, autoComplete.ts, releaseEarnings.ts
     │ ├─ sockets/ # index.ts, chat.ts, notifications.ts
     │ ├─ utils/ # ApiError, asyncHandler, time, money, slug, crypto
     │ └─ seed/ # taxonomy.ts, index.ts (npm run seed)
6. Data model (Mongoose)
   Every schema has timestamps: true. Use ObjectId references, lean() for reads and the indexes noted. Collections:
   • User: name, email (unique, lowercase), phone, passwordHash, googleId, role (student|mentor|admin), avatar {url, publicId}, timezone (default Asia/Kolkata), country, locale (en|hi), emailVerifiedAt, status (active|blocked), guardian {name, phone, email} for under-18 learners, learnerPrefs {goal, level, budgetMaxPaise, preferredTimes[], subjects[]}, notificationPrefs, lastLoginAt, deletedAt.
   • RefreshToken: user, tokenHash, familyId, expiresAt (TTL index), revokedAt, replacedBy, userAgent, ip.
   • Category: name, slug (unique), icon, description, order, seo {title, description}, isActive. Seed: School, Competitive Exams, Languages, Coding and Tech, Music, Fitness and Wellness, Professional Skills, Hobbies and Arts.
   • Subject: category, name, slug (unique), aliases[], levels[], tags[] (for example JEE, NEET, CBSE), seo, isActive, mentorCount (denormalised). Text index on name, aliases and tags.
   • MentorProfile: user (unique), slug (unique), headline (max 90 chars), bio (markdown), introVideo {provider: youtube|vimeo|upload, url}, subjects[] {subject, levels[], boards[]}, hourlyRatePaise, durations[] (from 30, 45, 60, 90; default 30 and 60), trialEnabled, languages[] {code, level}, country, timezone, experienceYears, education[] {degree, institution, year}, certifications[] {name, issuer, year, fileUrl}, workHistory[] {role, org, from, to}, teachingStyle, idDocument {url, verifiedAt} (private asset), status (draft|pending|approved|rejected|suspended), rejectionReason, badges[] (verified|top_rated|rising), stats {ratingAvg, ratingCount, sessionsTaught, studentsTaught, responseRate}, payout {method: upi|bank, encryptedDetails, verifiedAt}, searchBoost. Indexes: slug; status plus subjects.subject; status plus hourlyRatePaise; status plus stats.ratingAvg; text index on headline and bio.
   • Availability: mentor (unique), timezone (IANA), weekly[] {dayOfWeek 0-6, start 'HH:mm', end 'HH:mm'}, exceptions[] {date 'YYYY-MM-DD', type: off|custom, ranges[]}, bufferMinutes (0, 15 or 30), minNoticeHours (default 12), maxAdvanceDays (default 60).
   • Booking: student, mentor, subject, startAt, endAt (UTC), durationMins, type (trial|single|pack), status (pending_payment|confirmed|completed|cancelled_by_student|cancelled_by_mentor|expired|no_show_student|no_show_mentor|needs_review), price {amountPaise, discountPaise, platformFeePaise, mentorEarningPaise, currency}, payment (ref), pack (ref, V1), holdExpiresAt, goals, level, meeting {provider, roomId, url}, attendance {studentJoinedAt, mentorJoinedAt}, cancel {by, reason, at, refundPaise}, rescheduledFrom, reminders {h24SentAt, h1SentAt}, completedAt, mentorNotes. Indexes: student plus startAt; mentor plus startAt; status plus startAt; status plus holdExpiresAt.
   • SlotLock (double-booking guard): mentor, slotStart (UTC, 15-minute grain), booking. Unique index on {mentor, slotStart}. Each booking inserts one lock per 15-minute grain it covers, including the mentor’s trailing buffer. A duplicate-key error means the slot is taken (409 SLOT_TAKEN). Locks are deleted on cancel, expiry and reschedule.
   • Payment: booking, student, provider (razorpay|mock), orderId (unique), paymentId, amountPaise, currency, status (created|captured|failed|refunded|partially_refunded), refunds[] {refundId, amountPaise, reason, at}, method, webhookEventIds[] (for idempotency).
   • LedgerEntry: mentor, booking, payout, type (earning|refund_reversal|adjustment|payout), amountPaise (signed), status (pending|available|paid|reversed), availableAt, note. Mentor balance = sum of available entries.
   • Payout: mentor, amountPaise, method, status (requested|processing|paid|rejected), reference (UTR), requestedAt, processedAt, processedBy, note.
   • Review: booking (unique), student, mentor, rating (1–5), comment, tags[], mentorReply {text, at}, status (visible|hidden). Index: mentor plus createdAt. Recompute mentor stats atomically on create or hide.
   • Favorite: student, mentor (unique pair).
   • Conversation: participants (student, mentor; unique pair), lastMessage {text, at, sender}, unread {student, mentor} counters. Message: conversation, sender, body (max 2000 chars), attachments[], readAt. Index: conversation plus createdAt.
   • Notification: user, type, title, body, link, readAt; TTL 90 days.
   • Lead: name, phone, email, interest, grade, city, message, source (home|contact|exam_page|whatsapp|no_results), utm, status (new|contacted|converted|closed), assignedTo, notes[].
   • Post (blog): title, slug, excerpt, contentMarkdown, coverImage, tags[], author, status (draft|published), publishedAt, seo.
   • Setting (singleton): commissionPct (20), trialDiscountPct (50), slotStepMinutes (30), holdMinutes (10), cancellationWindowHours (12), payoutHoldHours (24), minPayoutPaise (50000), maintenanceMode (false).
   • AuditLog: actor, action, entityType, entityId, diff, ip.
   • Pack (V1): student, mentor, subject, totalSessions, usedSessions, pricePaise, expiresAt, status.
7. Backend specification
   7.1 Auth, security and platform basics
   • Accounts: register as student or mentor, login, logout, refresh, me. Email verification and password reset use single-use, hashed, expiring tokens (24 hours and 1 hour). Google sign-in: the client sends the Google ID token and the server verifies it with google-auth-library.
   • Tokens: access JWT (15 minutes) returned in the JSON body and kept in memory on the client. Refresh token (30 days) in an httpOnly, Secure, SameSite=Lax cookie, stored hashed in the database and rotated on every refresh. Reusing a revoked refresh token revokes the whole token family.
   • CSRF and CORS: refresh and logout require the cookie plus the header X-Requested-With: prepant-web. CORS allows only the configured client origins, with credentials.
   • Passwords and abuse control: bcryptjs with cost 12; minimum 8 characters. Rate limits: 300 requests per 15 minutes per IP globally; 10 per 15 minutes per IP and email on login, register and forgot-password.
   • Platform: helmet, compression, trust proxy configured for the host, request id plus pino-http logs, a /health endpoint and graceful shutdown. A central error handler maps Zod errors to 422 with field details, duplicate keys to 409 and unknown errors to a generic 500 (never leak stack traces in production).
   • Authorisation: authenticate, then requireRole(...), then ownership checks inside services (a student reads only their own bookings, and so on). Every admin mutation writes an AuditLog entry.
   • Uploads: multer memory storage; allow jpeg, png, webp and pdf only; images up to 5 MB, PDFs up to 10 MB; upload to Cloudinary into a per-user folder; ID documents are private assets served by signed URL; store only the URL and public id.
   • Webhooks: verify the signature against the raw body before parsing; handlers must be idempotent.
   • Secrets at rest: encrypt payout details with AES-256-GCM (ENCRYPTION_KEY) and never return them unmasked.
   7.2 REST API (all paths under /api/v1)
   AUTH
   POST /auth/register POST /auth/login POST /auth/google
   POST /auth/refresh POST /auth/logout GET /auth/me
   POST /auth/verify-email POST /auth/resend-verification
   POST /auth/forgot-password POST /auth/reset-password POST /auth/change-password

USERS
PATCH /users/me POST /users/me/avatar DELETE /users/me (soft delete + anonymise)
PUT /users/me/learner-prefs

TAXONOMY (public)
GET /categories GET /categories/:slug
GET /subjects?category=&q= GET /subjects/:slug

MENTORS (public)
GET /mentors?q=&category=&subject=&level=&minPrice=&maxPrice=&rating=&language=&day=&timeOfDay=
&hasVideo=&country=&sort=recommended|price_asc|price_desc|rating|experience|reviews&page=&limit=
GET /mentors/:slug GET /mentors/:slug/similar GET /mentors/:slug/reviews?page=
GET /mentors/:slug/slots?from=YYYY-MM-DD&to=YYYY-MM-DD&duration=30&tz=Asia/Kolkata

MENTOR SELF (role mentor)
GET /mentor/profile PUT /mentor/profile POST /mentor/profile/submit
POST /mentor/profile/certificates DELETE /mentor/profile/certificates/:id
GET /mentor/availability PUT /mentor/availability POST /mentor/availability/exceptions
GET /mentor/dashboard GET /mentor/students GET /mentor/earnings
POST /mentor/payouts GET /mentor/payouts POST /mentor/reviews/:id/reply

BOOKINGS
POST /bookings (creates pending booking + slot locks + payment order)
GET /bookings?status=&role=&page= GET /bookings/:id
POST /bookings/:id/cancel POST /bookings/:id/reschedule
POST /bookings/:id/complete POST /bookings/:id/no-show
GET /bookings/:id/join GET /bookings/:id/ics POST /bookings/:id/review

PAYMENTS
POST /payments/verify POST /webhooks/razorpay (raw body, signature checked, idempotent)
GET /payments/me GET /payments/:id/receipt

SOCIAL
GET /favorites POST /favorites/:mentorId DELETE /favorites/:mentorId
GET /conversations POST /conversations
GET /conversations/:id/messages?before= POST /conversations/:id/messages
POST /conversations/:id/read
GET /notifications POST /notifications/read-all

PUBLIC CONTENT
POST /leads GET /posts GET /posts/:slug
GET /settings/public GET /sitemap.xml

ADMIN (role admin, every mutation audited)
GET /admin/stats GET /admin/users PATCH /admin/users/:id
GET /admin/mentors?status= POST /admin/mentors/:id/approve | reject | suspend
GET /admin/bookings GET /admin/payments POST /admin/payments/:id/refund
GET /admin/payouts POST /admin/payouts/:id/mark-paid | reject
CRUD /admin/categories CRUD /admin/subjects CRUD /admin/posts
GET /admin/leads GET /admin/leads.csv PATCH /admin/leads/:id
GET /admin/reviews PATCH /admin/reviews/:id (hide or show)
GET /admin/settings PUT /admin/settings GET /admin/audit-log
Ranking for sort=recommended: ratingAvg × log(ratingCount + 1) + searchBoost + profile completeness, with a boost for mentors who have open slots in the next 7 days. Only approved mentors are ever public.
7.3 Booking engine (the heart of the product; implement exactly)

1. Slot generation. For a date range, expand the mentor’s weekly rules and exceptions in the mentor’s IANA zone with Luxon. Offer start times every slotStepMinutes (30). Keep a start only if every 15-minute grain from start to end plus the buffer is inside availability and has no SlotLock. Drop starts earlier than now plus minNoticeHours or later than maxAdvanceDays. Return ISO UTC strings grouped by local date in the requested tz.
2. Create booking (POST /bookings). Validate that the subject and duration belong to the mentor. Enforce one trial per student and mentor. Price in paise: round(hourlyRatePaise × durationMins / 60); a trial uses the mentor’s shortest duration at trialDiscountPct off. The platform fee is commissionPct of the price, snapshotted on the booking. Insert the booking as pending_payment with holdExpiresAt = now + holdMinutes, then insert its SlotLocks. On a duplicate-key error delete this booking’s locks and the booking, and return 409 SLOT_TAKEN. Create the payment order (receipt = booking id) and return { booking, order }. Pack bookings that use a prepaid credit skip payment.
3. Confirm. The first of POST /payments/verify (HMAC-SHA256 of orderId|paymentId with the key secret) or the payment.captured webhook marks the payment captured and the booking confirmed, clears the hold, creates a pending earning in the ledger, creates the meeting room, and sends emails and in-app notifications to both sides. Both paths must be idempotent.
4. Expire. A cron job every minute sets pending_payment bookings past holdExpiresAt to expired and deletes their locks.
5. Cancel and reschedule. Student cancels at least cancellationWindowHours before start: full refund. Later: no refund, and the mentor still earns minus commission. Mentor cancels: always a full refund plus a penalty counter on the mentor. Reschedule is allowed once, at least the same window before start: insert the new locks first, then release the old ones. Refunds go through PaymentProvider.refund and write ledger reversals.
6. Complete. The mentor marks the session completed, or the autoComplete job does it after endAt + 15 minutes when both sides opened the join link. If only one side or neither joined, set needs_review for the admin queue instead of deciding automatically. On completion the earning becomes available after payoutHoldHours, a review request is emailed and mentor stats are updated.
7. Reminders. A job every 5 minutes notifies both sides 24 hours and 1 hour before start, made idempotent by reminders.*SentAt.
8. Joining. GET /bookings/:id/join returns meeting details only to the two participants, from 10 minutes before start until endAt + 30 minutes, and records attendance.
   7.4 Payments and payouts
   • PaymentProvider interface: createOrder, verifySignature, verifyWebhook, refund. Implementations: Razorpay, and a MockProvider used when PAYMENTS_MODE=mock or keys are missing, which succeeds instantly so the whole flow runs locally and in demos.
   • The server always computes the price; never trust an amount sent by the client. Use Razorpay test keys in staging and switch to live keys only after the launch checklist.
   • Payouts (MVP, manual): a mentor requests a payout when the available balance is at least minPayoutPaise; the admin pays by UPI or bank transfer outside the app and marks the payout paid with a UTR reference; the ledger entries become paid. V1 automates this with RazorpayX.
   • Receipts: a printable HTML receipt per payment (GST-ready fields in V1).
   7.5 Realtime
   Socket.IO on the same server, authenticated with the access token in the handshake. Rooms: user:<id> and conversation:<id>. Events: message:new, message:read, typing, notification:new, booking:updated. Always persist first, then emit. Rate-limit sends, cap messages at 2000 characters and escape on render.
   7.6 Video classroom
   VideoProvider interface with createRoom(booking) and getJoinInfo(booking, user). MVP: generate an unguessable Jitsi room URL (https://meet.jit.si/prepant-<random>) and open it from the classroom page. V1: embedded rooms through a managed provider with moderation (for example Jitsi as a Service, LiveKit, Daily or 100ms), shared notes, a tldraw whiteboard and recording consent. The classroom page has a pre-join checklist (camera, microphone, connection), a countdown, a chat side panel and a leave or end action.
   7.7 Background jobs (node-cron in-process for now; BullMQ and Redis in V1)
   expireHolds (every minute), reminders (every 5 minutes), autoComplete (every 10 minutes), releaseEarnings (hourly). Each job is idempotent and safe on several instances by claiming rows with findOneAndUpdate.
   7.8 Email templates (simple branded HTML)
   Verify email; welcome; password reset; booking confirmed (student and mentor); reminder 24 hours and 1 hour; cancelled or refunded; review request; mentor approved or rejected; payout paid; new lead (internal).
9. Frontend specification
   8.1 Conventions
   • Feature-based folders. Pages are thin and lazy-loaded. Server data is fetched only through TanStack Query hooks (useMentors, useBooking and so on) with central query keys and sensible staleTime; use optimistic updates for favourites and notification reads.
   • One Axios instance: base URL from env, access token from memory; on 401 do one silent refresh and retry, otherwise log out. Typed API functions per feature.
   • Forms use React Hook Form with Zod: inline field errors, a disabled button with spinner while submitting, a toast on success or failure.
   • The URL is the source of truth for search filters (/mentors?subject=physics&maxPrice=800) so results are shareable and indexable.
   • Route guards: RequireAuth and RequireRole('mentor'), redirecting back after login. Separate shells for the public site, student, mentor and admin.
   • Every data view has loading (skeleton), empty (helpful message with an action) and error (retry) states. A global ErrorBoundary and a friendly 404.
   • All user-facing text comes from i18n keys (locales/en.json now, hi.json in V1).
   8.2 Route map
   PUBLIC
   / Home
   /find-my-mentor 4-step quiz, then redirects to /mentors with filters applied
   /mentors Search (filters live in the query string)
   /mentors/:slug Mentor profile
   /learn/:categorySlug Category landing (SEO)
   /learn/:categorySlug/:subjectSlug Subject landing (SEO)
   /exams/:examSlug Exam landing: JEE, NEET, UPSC, SSC, CAT, GATE, CUET, Boards
   /book/:slug Booking flow (stepper)
   /become-a-mentor Mentor marketing page
   /how-it-works /about /contact /faq /blog /blog/:slug
   /privacy /terms /refund-policy /mentor-guidelines
   /login /signup /forgot-password /reset-password/:token /verify-email/:token

STUDENT (role student)
/app Dashboard
/app/sessions /app/messages /app/messages/:id /app/favorites /app/payments /app/settings

MENTOR WORKSPACE (role mentor)
/teach Dashboard
/teach/onboarding Multi-step wizard (workspace locked until approved)
/teach/calendar /teach/availability /teach/sessions /teach/students
/teach/earnings /teach/profile /teach/reviews /teach/messages /teach/messages/:id

SHARED
/classroom/:bookingId Pre-join checks and live session

ADMIN (role admin)
/admin /admin/mentors /admin/users /admin/bookings /admin/payments /admin/payouts
/admin/catalog /admin/reviews /admin/leads /admin/blog /admin/settings /admin/audit

-                                   404

8.3 Page specifications
Home. Sticky header (logo, ‘Find a mentor’, Categories mega-menu, ‘Become a mentor’, Log in, Sign up; drawer on mobile) → hero (headline ‘Prep Smart. Succeed Big.’, a subhead built from the mission, a search bar with subject autocomplete, level select and a ‘Find my mentor’ button, and a trust row: verified mentors, 1-to-1 sessions, flexible timings, trial session) → category grid (8 categories with icons) → ‘How it works’ in 3 steps (choose a mentor, book a trial, learn and grow) → featured mentors carousel → exam spotlight chips (JEE, NEET, UPSC, SSC, CAT, GATE, CUET, Boards) → stats band (mentors, sessions, average rating, subjects; from the API) → ‘Why Prepant’ (true 1-to-1, verified mentors, flexible schedule, trial session, doubt clearing) → testimonials → ‘Teach on Prepant’ banner → FAQ accordion → lead form ‘Talk to a free counsellor’ (name, phone, interest, message; validation and success state; stores a Lead) → footer (about blurb, categories, company links, contact numbers, email, WhatsApp, social links, legal links, tagline).
Mentor search. Top bar with search input and sort. Filters on the left (desktop) or in a bottom sheet (mobile): subject (autocomplete), level, board or exam, price range slider (₹ per hour), availability (days and time of day), language, rating (4+), experience, intro video, country. Active filters appear as removable chips with ‘Clear all’. Results are MentorCards with photo, verified badge, name, headline, subjects, rating and count, sessions taught, price per hour with ‘Trial ₹x’, a two-line bio, ‘Book trial’, ‘Message’ and a heart. Desktop adds a sticky preview panel for the hovered mentor with the intro video and next open slots. ‘Load more’ keeps the page in the URL. Provide skeletons and an empty state with ‘Request a mentor’, which creates a Lead with source no_results.
Mentor profile. Header with photo or intro video, name, badges, headline, rating, sessions taught, languages, country and time zone. A sticky booking card on desktop (bottom bar on mobile) with price, trial CTA, Message and Save. Sections: About, Subjects and levels, Experience and education, Certificates, Reviews (rating breakdown, list, pagination), Availability (week calendar in the learner’s zone), Similar mentors, FAQ. Unique title, description and canonical, plus JSON-LD.
Booking flow (/book/:slug; stepper with state in the URL and Zustand). 1) Subject, level, session type (trial or single; pack in V1) and duration. 2) Date and time: month calendar plus slot chips and a visible time-zone selector that defaults to the browser zone. 3) Goals and notes, plus guardian details when the learner is under 18. 4) Sign in or sign up inline when logged out. 5) Price breakdown and Razorpay payment, with a hold countdown. 6) Confirmation: summary, ‘Add to calendar’ (.ics), ‘Message mentor’ and what happens next. If a slot is taken (409), return to step 2 with a friendly toast.
Auth pages. Split layout with a brand panel; email and password; Google button; role choice on sign-up (learner or mentor); terms and privacy consent checkbox; password strength meter; a verification-pending screen with resend.
Student app. Dashboard: next-session hero card (countdown, Join button enabled 10 minutes before), upcoming list, quick actions, recommended mentors (from learner preferences) and review prompts. Sessions: tabs Upcoming, Past and Cancelled; row actions Join, Reschedule, Cancel (with policy and refund preview), Review, Book again. Also Favorites, Payments (receipts), Settings (profile, time zone, notifications, password, delete account) and Messages.
Mentor workspace. Dashboard (today’s sessions, earnings this month, pending actions, profile completeness meter, rating). Calendar (week and day view). Availability editor (weekly grid with add and remove ranges, time-off exceptions, buffer, notice and advance settings, and a learner-view preview). Sessions (complete, no-show, cancel with reason). Students. Earnings (balance cards, ledger table, payout request, history). Profile editor with live preview. Reviews with reply. Messages. Onboarding wizard in 8 steps with autosave and a final review; it shows ‘Pending approval’ or ‘Rejected: reason’.
Classroom. Pre-join checks, countdown, join button, chat panel, session info and time left, leave or end, then a review prompt.
Messages. Two-pane inbox (list and thread), unread badges, typing indicator, optimistic send, infinite scroll upwards; a single pane on mobile.
Admin. Sidebar layout. Dashboard with KPI cards and charts (bookings per day, GMV, revenue, signups, mentor funnel). Server-paginated tables with search, filters and CSV export. Mentor review drawer (full profile, video, certificates, ID status, approve or reject with a reason). Payout queue, leads inbox with status and notes, blog editor with markdown preview, settings forms and the audit log.
Static pages. About (story, mission, numbers), How it works, FAQ (grouped for learners, mentors and payments), Contact (form that creates a Lead, click-to-call, email, WhatsApp, office hours), and legal pages from markdown files in client/src/content/legal/, seeded with sensible drafts and a visible ‘Draft: pending legal review’ banner that is easy to remove.
Layout wireframes (follow the structure, not the pixels)
HOME (desktop)
├─ Header: logo · Find a mentor · Categories ▾ · Become a mentor · Log in · [Sign up]
├─ HERO (soft gradient)
│ Left: H1 ‘Prep Smart. Succeed Big.’ · subhead · [What do you want to learn? ▾] [Level ▾] [Find my mentor]
│ trust row: ✔ Verified mentors ✔ 1-to-1 sessions ✔ Flexible timings ✔ Trial session
│ Right: friendly photo collage of mentors and learners with a floating rating card
├─ CATEGORY GRID: 8 tiles with icons (School, Exams, Languages, Coding, Music, Fitness, Skills, Hobbies)
├─ HOW IT WORKS: ① Choose a mentor → ② Book a trial → ③ Learn and grow
├─ FEATURED MENTORS: ◄ [card] [card] [card] [card] ►
├─ EXAM SPOTLIGHT chips · STATS BAND · WHY PREPANT · TESTIMONIALS
├─ TEACH ON PREPANT banner · FAQ · LEAD FORM ‘Talk to a free counsellor’
└─ Footer

SEARCH (desktop)
├─ Header
├─ [ Search subject, exam or skill… ] Sort: Recommended ▾ 128 mentors
├─ chips: Physics ✕ JEE ✕ ₹300–800 ✕ Clear all
├─ FILTERS (left) │ RESULTS (centre) │ PREVIEW (right, sticky)
│ Subject │ [photo] Name ✔ ★ 4.9 (212) │ [intro video]
│ Level / exam │ Headline · subjects │ Next open slots:
│ Price slider │ Two-line bio ₹600/hr · Trial ₹300 │ Tue 6:00 PM · Wed 7:30 PM
│ Availability │ [Book trial] [Message] ♡ │ [Book trial]
│ Rating · more… │ next MentorCard … │

MENTOR PROFILE (desktop)
├─ Breadcrumb: Home › Mentors › Physics › Name
├─ LEFT (2/3) │ RIGHT (1/3, sticky booking card)
│ [photo / intro video player] │ ₹600 / hour
│ Name ✔ Top rated · headline │ Trial session ₹300 (30 min)
│ ★ 4.9 (212 reviews) · 1,340 sessions │ [ Book trial session ]
│ Speaks: English, Hindi · India (IST) │ [ Message ] ♡ Save
│ About · Subjects · Experience │ Response time · next open slot
│ Certificates · Reviews · Availability │
│ Similar mentors · FAQ │

BOOKING, STEP 2 (desktop)
├─ Stepper: ① Subject ② Time ③ Goals ④ Account ⑤ Pay ⑥ Done
├─ LEFT: month calendar (open days highlighted) │ RIGHT: summary card
│ Time zone: Asia/Kolkata (change) │ Mentor · subject · duration
│ Tue 18 Nov: [6:00 PM] [6:30 PM] [7:30 PM] │ Price breakdown
│ │ [ Continue ] 9. UI/UX design system
Feel: modern, friendly, trustworthy and energetic. Generous white space, large rounded cards, crisp type, subtle motion. Mobile-first: design at 360 px first, then 768, 1024 and 1280.
Tokens (CSS variables in styles/tokens.css, exposed to Tailwind v4 through @theme in globals.css; do not create a tailwind.config.js):
• Primary (indigo): 50 #EEF2FF, 100 #E0E7FF, 500 #6366F1, 600 #4F46E5, 700 #4338CA, 900 #312E81.
• Accent (amber, for stars, highlights and the secondary CTA): 400 #FBBF24, 500 #F59E0B, 600 #D97706.
• Status: success #10B981, warning #F59E0B, danger #EF4444, info #0EA5E9.
• Neutrals (slate): background #F8FAFC, surface #FFFFFF, border #E2E8F0, muted text #64748B, text #0F172A.
• Hero background: linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 55%, #FEF3C7 100%) with soft blurred shapes.
• Radius: controls 10 px, cards 16 px, dialogs 20 px, avatars full. Shadows: soft sm on cards, lg on hover and popovers. Spacing on a 4 px scale. Container max width 1200 px with 16, 24 and 32 px side padding.
• Type: headings Plus Jakarta Sans (600–800), body Inter (400–500), both self-hosted with @fontsource. Scale 12, 14, 16, 18, 20, 24, 30, 36, 48, 60. Line height 1.5 for body and 1.15 for headings; keep reading text under 70 characters per line.
• Motion: 150–250 ms ease-out; fade-and-rise on scroll for sections; skeleton shimmer; honour prefers-reduced-motion. Dark mode is V2 (tokens are variables, so it is a theme swap).
Components to build on top of shadcn: Button (primary, secondary, outline, ghost, destructive; sizes; loading state), Input, Textarea, Select, Combobox, Slider, Checkbox, Switch, RadioGroup, Tabs, Accordion, Dialog, Sheet, Popover, Tooltip, DropdownMenu, Calendar and TimeSlotPicker, Stepper, Badge, Avatar, RatingStars, Card, Skeleton, Toast, LoadMore, DataTable, StatCard, EmptyState, FileUploader, VideoEmbed, TimezoneSelect, PriceTag, MentorCard, ReviewCard, CategoryTile, SectionHeader.
UX rules:
• One primary action per screen. Button labels say what happens (‘Book trial session’, not ‘Submit’).
• Prices show ₹ and ‘per hour’. Times always show in the viewer’s zone with the zone abbreviation.
• Confirm destructive actions. Use optimistic UI for favourites. Never block a page with a full-screen spinner; use skeletons.
• Errors appear next to the field. Everything is keyboard accessible with visible focus rings and WCAG 2.2 AA contrast.
• Images have alt text, explicit dimensions and lazy loading; icons come from lucide only.
• Brand assets: create a simple ‘Prepant’ wordmark as SVG (indigo with an amber accent) plus a favicon and a social share image; use no external logos. 10. Non-functional requirements
• SEO: unique title, description and canonical per route; semantic HTML; /sitemap.xml and robots.txt; JSON-LD: Organization (site-wide), BreadcrumbList, FAQPage on the FAQ, Course on subject pages, Person on mentor profiles (add rating markup only if it meets Google’s current structured-data guidelines); clean slugs; Open Graph and Twitter images. Social crawlers do not run JavaScript, so in production serve index.html through an Express route that injects Open Graph tags for /mentors/:slug, /learn/* and /blog/:slug (serve the built client from Express, or use an edge function if the client is hosted separately).
• Performance targets: route-level code splitting; image CDN transforms (WebP or AVIF, responsive sizes); font-display: swap; gzip or brotli; DB indexes verified with explain(); paginated, lean list endpoints; Lighthouse mobile at least 90 on Home, Search and Mentor profile; initial JavaScript at most 200 KB gzipped.
• Accessibility: WCAG 2.2 AA; run axe checks in Playwright on key pages; reduced-motion support.
• Reliability: graceful shutdown, /health and readiness endpoints, DB reconnection, idempotent webhooks and jobs, Sentry in both apps.
• Privacy and compliance (confirm everything with legal counsel): consent checkbox at sign-up; privacy policy, terms and refund policy; data export and delete in settings; no personal data in logs; guardian details for under-18 learners (India’s DPDP Act expects verifiable parental consent for children’s data); mentor identity verification by ID upload, reviewed by an admin and stored as private assets (confirm which ID types are lawful to collect); no ad or tracking pixels on pages aimed at children.
• Trust and safety: keep conversations on-platform; warn (do not block) when a message contains a phone number or email before the first paid session; report-user and report-session buttons in V1.
• Observability: structured logs with a request id; audit log for admin actions; a thin track() wrapper for product events (search, profile_view, trial_click, booking_created, payment_success) that can feed PostHog or GA4 later. 11. DevOps, environment and testing
Server .env.example
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/prepant
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
COOKIE_DOMAIN=
ENCRYPTION_KEY=64-hex-characters
PAYMENTS_MODE=mock # mock | razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=Prepant <no-reply@prepant.com>
GOOGLE_CLIENT_ID=
SENTRY_DSN=
Client .env.example
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=
VITE_GOOGLE_CLIENT_ID=
VITE_SITE_URL=http://localhost:5173
VITE_SENTRY_DSN=
With these defaults the whole app must run locally with no third-party accounts: mock payments, emails printed to the console, uploads saved to local disk when Cloudinary keys are absent, and public Jitsi links for classes.
• Root scripts: dev (client and server together), build, start, lint, typecheck, test, test:e2e, seed, seed:reset.
• Seed (npm run seed): at least 8 categories and 80 subjects (including JEE Physics, NEET Biology, UPSC General Studies, SSC Quant, CAT Quant, DILR and VARC, GATE CS, CBSE Maths Class 10, Spoken English, Python, DSA, Guitar, Yoga and more); one admin (admin@prepant.test / Admin@12345); 40 approved mentors with realistic Indian names (faker en_IN), prices from ₹300 to ₹2,500 per hour, availability, DiceBear avatars, intro-video placeholders and 5–40 reviews each; 15 students (student1@prepant.test / Student@12345, and so on); one fully set-up demo mentor (mentor1@prepant.test / Mentor@12345); sample bookings in every status; conversations; 3 blog posts; sample leads. Never seed demo credentials when NODE_ENV=production.
• Tests that must exist and pass: unit tests for slot generation (IST, and America/New_York across a DST change), pricing and commission, the cancellation policy and signature verification; integration tests for auth, the booking race (two parallel requests, exactly one 409), payment-confirm idempotency and authorisation (a student cannot read another student’s booking); Playwright E2E: sign up → search → open profile → book a trial with mock payment → see it in sessions → open the classroom → leave a review.
• CI (GitHub Actions): install, typecheck, lint, unit and integration tests, build; E2E on the main branch.
• Docker: a server Dockerfile (multi-stage, non-root user) and a docker-compose.yml with the API and MongoDB.
• Docs: README (setup in five commands, env vars, scripts, architecture, deployment), docs/API.md (endpoints with examples) and docs/DECISIONS.md. 12. Definition of done (whole project)
• Learner journey: a visitor lands on Home, searches mentors, opens a profile, picks a slot, creates an account, pays (mock or Razorpay test), receives a confirmation email, joins the classroom and leaves a review.
• Mentor journey: a mentor applies, is approved by an admin, sets availability, receives a booking, completes the session, sees the earning and requests a payout.
• Admin journey: an admin approves mentors, manages the catalogue, reads the KPIs, refunds a payment, marks a payout paid and exports leads.
• Quality bar: typecheck, lint, tests and build are green; Lighthouse and accessibility targets are met; no console errors; every page works from 360 px to 1440 px; a new developer can run the app from the README in under 10 minutes.
End of the Master Prompt (sections 1–12). 13. Roadmap overview
A realistic plan for one engineer using an AI IDE is 8–10 weeks to a launch-ready MVP. The IDE can often finish a phase in a few hours; reviewing, testing and fixing is what takes the time, so budget for it.
Phase 0 Week 1 Foundation: monorepo, tooling, design system, layouts
Phase 1 Weeks 1–2 Auth, users, roles, email flows, Google login
Phase 2 Weeks 2–3 Taxonomy, mentor onboarding, uploads, admin approval
Phase 3 Weeks 3–4 Public site, SEO pages, mentor search and profile
Phase 4 Weeks 4–5 Availability, slots, booking engine (mock payments)
Phase 5 Weeks 5–6 Razorpay, webhooks, refunds, emails, background jobs
Phase 6 Weeks 6–7 Student and mentor dashboards, reschedule, reviews, favourites
Phase 7 Weeks 7–8 Messaging, realtime notifications, classroom
Phase 8 Weeks 8–9 Admin panel, payouts, CMS, leads, analytics
Phase 9 Weeks 9–10 Hardening: tests, security, performance, accessibility, Hindi, deployment, UAT
Later V1, V2 See section 15
Milestones: end of Phase 3 is a public demo site; end of Phase 5 is the first real paid test booking; end of Phase 8 is feature complete; end of Phase 9 is the launch candidate. 14. Phase prompts (paste one at a time)
Each prompt assumes docs/PROJECT_BRIEF.md exists. Start a fresh chat for every phase.
Phase 0 — Foundation
Read docs/PROJECT_BRIEF.md. Implement PHASE 0: Foundation.

1. Create the npm-workspaces monorepo exactly as in section 5 (client, server, docs, CI, docker-compose).
2. Server: Express 5 + TypeScript with zod-validated env, pino logging, helmet, cors, compression, rate limiting, central error handler, ApiError, asyncHandler, validate middleware, /health, graceful shutdown, Mongoose connection, tsx for dev, esbuild for build.
3. Client: Vite + React + TypeScript, Tailwind v4, shadcn/ui, React Router data router with lazy pages, TanStack Query, Axios instance, i18n scaffold, Seo component, Sonner, ErrorBoundary.
4. Implement the design tokens and every base component from section 9, and a hidden /_styleguide route that shows them all (including a MentorCard with sample props).
5. Build the real Header, Footer, MobileNav and DashboardShell. The footer shows the tagline, contact numbers, email and WhatsApp link from client/src/config/site.ts.
6. Set up ESLint, Prettier, Husky + lint-staged, Vitest on both sides, .env.example files, README and GitHub Actions CI.

Acceptance: npm i && npm run dev starts both apps; /health returns ok; /_styleguide renders every component; typecheck, lint, test and build pass; layouts are responsive at 360, 768 and 1280 px.
Commit as feat(foundation) and give me a 10-line summary.
Phase 1 — Authentication, users and roles
Read docs/PROJECT_BRIEF.md. Implement PHASE 1: Auth, users, roles.

Server: User and RefreshToken models; the /auth and /users endpoints from section 7.2; short-lived access JWT plus rotating hashed refresh cookie with reuse detection; email verification and password reset (SMTP provider with console fallback, templates from 7.8); Google ID-token login; authenticate and requireRole middleware; rate limits; Zod schemas.
Client: /login, /signup (role choice, consent checkbox, strength meter), /forgot-password, /reset-password/:token, /verify-email/:token, a verification-pending screen, auth store (Zustand), silent refresh on app load, Axios 401 interceptor, RequireAuth and RequireRole guards with redirect-back, header user menu, and /app/settings (profile, time zone, password, delete account).
Tests: register, login, refresh rotation, reuse detection, forgot and reset, authorisation; component tests for the forms.

Acceptance: I can sign up as a learner and as a mentor, verify email through the console link, log in and out, reload and stay logged in, reset my password, and non-owners get 403.
Phase 2 — Taxonomy, mentor onboarding, admin approval
Read docs/PROJECT_BRIEF.md. Implement PHASE 2: Taxonomy, mentor onboarding, admin approval.

Server: Category, Subject, MentorProfile, Setting and AuditLog models; public taxonomy endpoints; mentor self endpoints (profile get and put, submit, certificate upload); uploads module with StorageProvider (Cloudinary, local-disk fallback); admin endpoints for the mentor approval queue (approve, reject, suspend with reason, emails, audit entries) and catalogue CRUD; slug generation; profile completeness score.
Seed: the full taxonomy (8 categories, 80+ subjects) and a few sample mentors.
Client: /become-a-mentor marketing page; /teach/onboarding 8-step wizard (basics, subjects and levels, rate and durations, experience and education, certificates, intro video link, availability placeholder finished in Phase 4, payout details, review and submit) with autosave and validation; ‘pending approval’ and ‘rejected with reason’ states; admin shell with /admin/mentors queue plus review drawer, and /admin/catalog CRUD.

Acceptance: a mentor completes onboarding, an admin approves, the mentor becomes approved; a rejected mentor sees the reason and can resubmit.
Phase 3 — Public website, SEO, search and profiles
Read docs/PROJECT_BRIEF.md. Implement PHASE 3: Public site, SEO, search, profile.

Build Home, About, How it works, FAQ, Contact (lead form posting to /leads), Blog list and detail (read-only for now), legal pages, category, subject and exam landing pages, the /find-my-mentor quiz, a floating WhatsApp button and the 404 page, all per section 8.3 and the design system.
Server: GET /mentors with every filter, sorting and pagination, compound indexes and text search, plus the ranking rule from 7.2; GET /mentors/:slug, /similar and /reviews; public settings; POST /leads (rate-limited, honeypot field); sitemap.xml and robots.txt.
Client: /mentors search with URL-synced filters, MentorCard, sticky preview panel, mobile filter sheet, skeleton and empty states; /mentors/:slug profile with sticky booking card, tabs, reviews, JSON-LD and Seo; featured mentors and stats on Home from the API.
Seed: 40 mentors with reviews so every page looks real.

Acceptance: Lighthouse mobile at least 90 on Home, Search and Profile; filters change the URL and the results; every public page has a unique title, description and canonical; the lead form stores a Lead.
Phase 4 — Availability and booking engine (mock payments)
Read docs/PROJECT_BRIEF.md. Implement PHASE 4: Availability and booking engine with mock payments.

Server: Availability, Booking, SlotLock and Payment models; slot generation exactly as in 7.3 (time zones, buffer, notice, advance window); POST /bookings with SlotLock double-booking protection and 409 SLOT_TAKEN; pricing and commission from Setting; one-trial-per-pair rule; PaymentProvider interface plus MockProvider; confirm flow with idempotency; expireHolds job; ICS generation.
Tests: slot generation (IST, and America/New_York across a DST change); a concurrency test where parallel requests for one slot produce exactly one success.
Client: availability editor at /teach/availability (weekly grid, time off, buffer, notice, learner-view preview) and the 6-step booking flow at /book/:slug (URL state, time-zone selector, hold countdown, inline auth, mock pay button, confirmation with .ics).

Acceptance: two browsers racing for one slot, one wins and the other returns to slot picking with a friendly message; unpaid holds expire after 10 minutes; times display correctly across time zones.
Phase 5 — Real payments, refunds, emails and jobs
Read docs/PROJECT_BRIEF.md. Implement PHASE 5: Razorpay payments, refunds, emails, jobs.

Server: RazorpayProvider (orders, signature verification, webhook verification on the raw body, refunds); POST /payments/verify and POST /webhooks/razorpay, idempotent so whichever arrives first wins; the cancellation and refund policy from 7.3 with ledger reversals; LedgerEntry model and earning creation; transactional email templates (7.8) with retries; Notification model and endpoints; jobs: reminders (24 h and 1 h) and releaseEarnings; receipt HTML endpoint; PAYMENTS_MODE switch (mock | razorpay).
Client: Razorpay Checkout integration (load script, open with the order, handle success, failure and dismiss, retry), status polling fallback, receipts at /app/payments, cancel dialog with policy and refund preview, notification bell and dropdown (polling for now).

Acceptance: with Razorpay test keys, a UPI or card test payment confirms the booking even if I close the tab before the redirect (webhook path); refunds follow the policy; each email and notification fires exactly once.
Phase 6 — Dashboards, sessions, reviews and favourites
Read docs/PROJECT_BRIEF.md. Implement PHASE 6: Dashboards, sessions, reviews, favourites.

Student: /app dashboard, /app/sessions (tabs; join, reschedule, cancel, review, book again), /app/favorites and optimistic favourite toggles on cards and profiles.
Mentor: /teach dashboard, /teach/calendar (week and day view), /teach/sessions (complete, no-show, cancel with reason), /teach/students, /teach/earnings (balance cards, ledger, payout request), /teach/profile editor with live preview, /teach/reviews with reply.
Server: reschedule endpoint (new locks first, then release old ones), complete and no-show endpoints, review endpoints with atomic mentor stats recompute, favourites, mentor dashboard, earnings and students aggregates, payout request endpoint.

Acceptance: the full lifecycle works through the UI: book, reschedule, complete, review, and the rating on the profile updates; mentor earnings and payout request reflect it; every screen has loading, empty and error states.
Phase 7 — Messaging, realtime and classroom
Read docs/PROJECT_BRIEF.md. Implement PHASE 7: Messaging, realtime, classroom.

Server: Socket.IO with token auth; Conversation and Message models and endpoints (7.2); events from 7.5; unread counters; notifications pushed over sockets; VideoProvider (Jitsi link) and GET /bookings/:id/join with time-window and participant checks; attendance tracking; autoComplete job.
Client: /app/messages and /teach/messages two-pane UI (typing indicator, read receipts, optimistic send, infinite scroll), ‘Message mentor’ entry points, realtime notification bell and toasts, and /classroom/:bookingId with pre-join checklist, countdown, join, chat panel, leave or end, and a post-session review prompt.

Acceptance: two browsers chat in realtime and unread counts update; the classroom link is unavailable outside the allowed window and to non-participants; a session auto-completes when both sides joined and the end time has passed, otherwise it goes to needs_review.
Phase 8 — Admin panel, payouts, CMS, leads and analytics
Read docs/PROJECT_BRIEF.md. Implement PHASE 8: Admin panel, payouts, CMS, leads, analytics.

Server: the /admin endpoints from 7.2: stats (KPIs and time series with aggregation pipelines), users (block and unblock), bookings (including the needs_review queue), payments with refund, payouts (mark paid with UTR, reject), reviews moderation, leads (filters and CSV export), posts CRUD (markdown), settings (commission, trial discount, cancellation window, hold minutes, payout rules) and audit-log listing. Audit every mutation.
Client: /admin dashboard with KPI cards and Recharts charts (bookings per day, GMV, revenue, signups, mentor funnel); TanStack Table pages with server-side pagination, search, filters and CSV; payout workflow; leads inbox with status and notes; blog editor with markdown preview and cover upload; settings forms; audit-log viewer.

Acceptance: an admin can run the business from the panel exactly as listed in section 12, and every admin mutation appears in the audit log.
Phase 9 — Hardening and launch
Read docs/PROJECT_BRIEF.md. Implement PHASE 9: Hardening and launch.

1. Complete the test suites from section 11, add Playwright E2E for the three journeys in section 12, and add axe accessibility checks on key pages.
2. Security review against section 7.1 and the OWASP Top 10: fix findings; verify headers, strict CORS, rate limits, upload checks, dependency audit; confirm no secrets in git.
3. Performance: verify indexes with explain(), add missing ones, analyse the bundle, optimise images, set caching headers; meet the Lighthouse and bundle targets in section 10.
4. Add the Hindi locale (hi.json) for public pages and a language switcher.
5. SEO: Open Graph injection route for profile, landing and blog pages; validate JSON-LD; generate the sitemap from the database.
6. Add Sentry, readiness endpoint, production Dockerfile and a deployment guide (Atlas, Render or Railway, Vercel or Netlify, Cloudinary, Razorpay live-mode checklist, domain and cookie settings).
7. Final polish: copy review, empty states, 404 and 500 pages, favicon and manifest, cookie consent banner if analytics is enabled.

Acceptance: section 12 is fully met. Produce docs/LAUNCH_CHECKLIST.md. 15. After launch, and what to verify before launch
V1 (weeks 11–16): lesson packs and coupons; referral credits; Google Calendar sync; session notes and homework; embedded video with a shared whiteboard (tldraw) and screen share; parent accounts; RazorpayX automated payouts; complete Hindi UI; WhatsApp and SMS notifications through approved providers; BullMQ with Redis and the Socket.IO Redis adapter; Atlas Search for typo-tolerant search; GST-ready invoices; a mentor background-verification partner; response-rate and top-rated badges computed automatically.
V2: subscriptions; group batches and live classes; recorded courses; mock tests for competitive exams; AI mentor matching, study planner and doubt assistant; React Native mobile apps on the same API; school and corporate accounts; international payments and multi-currency with Stripe; community features.
Verify before launch (non-code):
• Razorpay account activated (KYC complete), live keys and webhook secret set; test one real small payment and one refund.
• Legal pages (terms, privacy, refund policy, mentor guidelines) reviewed by a lawyer, including handling of under-18 learners and any GST or invoicing requirements.
• Email domain authenticated (SPF, DKIM, DMARC) so booking and reset emails reach inboxes.
• Mentor onboarding checklist and approval standards written; the first 20–30 mentors recruited so search is not empty on day one.
• Company contact details confirmed (which number is on WhatsApp, support hours) in client/src/config/site.ts.
• Backups enabled on MongoDB Atlas, uptime monitoring and Sentry alerts configured, and an owner assigned for support emails and the leads inbox.
