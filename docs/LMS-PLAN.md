# LMS Implementation Plan — Natalie Flemons Ministries

**Status**: Planned — not started  
**Requested**: 2026-11-27  
**Scope**: Full-featured course platform hosted on this site for 3 courses (Equip · Restore · Activate)

---

## Decision record

| Question | Decision |
|---|---|
| Hosting | On-site (this Next.js app) |
| Paid / free | Both |
| Payment model | Stripe subscription |
| Student access | Login required (student accounts) |
| Content types | Video + text + PDF, mixed per lesson |
| Quizzes / assignments | Yes |
| Student dashboard | Yes — enrolled courses + progress |
| MailerLite sync | Yes — enrollment triggers group add |
| Database required | **Yes — PostgreSQL** (flat JSON cannot support per-user state) |

---

## Why a database is required

The current site uses flat JSON files in `storage/` for admin-managed catalogs
(books, videos, courses). That pattern cannot support:

- Per-student progress (which lessons completed, quiz scores)
- Student accounts (password hashes, sessions, email verification tokens)
- Subscription state (Stripe customer ID, plan, expiry, cancellation)
- Enrollment records (student → course, granted at, expires at)
- Quiz responses (student, question, answer, score, timestamp)

**Stack addition required:**

| Addition | Purpose |
|---|---|
| PostgreSQL | Relational data store (one container on Coolify) |
| Prisma | Type-safe ORM, Next.js App Router compatible |
| NextAuth.js v5 | Student authentication (Prisma adapter) |
| Stripe Billing | Subscription management (already have keys) |

Everything runs on the existing Coolify server. No third-party LMS fees.

---

## Courses

Three courses map to the ministry's three pillars:

| Slug | Title | Pillar |
|---|---|---|
| `equip` | Equip | Equip |
| `restore` | Restore | Restore |
| `activate` | Activate | Activate |

Each course is already creatable via `/admin/courses`. The LMS build adds
lessons, enrollment, and student access on top of the existing course catalog.

---

## Data model (Prisma schema)

```prisma
model Student {
  id                String         @id @default(cuid())
  email             String         @unique
  name              String?
  passwordHash      String?
  emailVerified     DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  enrollments       Enrollment[]
  progress          LessonProgress[]
  quizAttempts      QuizAttempt[]
  assignments       Assignment[]
  stripeCustomerId  String?        @unique
  sessions          StudentSession[]
}

model StudentSession {
  id        String   @id @default(cuid())
  studentId String
  token     String   @unique
  expiresAt DateTime
  student   Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

model Enrollment {
  id               String    @id @default(cuid())
  studentId        String
  courseSlug       String
  stripeSubId      String?   @unique
  status           EnrollmentStatus @default(ACTIVE)
  grantedAt        DateTime  @default(now())
  expiresAt        DateTime?
  student          Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

enum EnrollmentStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  FREE
}

model Lesson {
  id           String   @id @default(cuid())
  courseSlug   String
  title        String
  slug         String
  displayOrder Int
  published    Boolean  @default(false)
  // Content blocks stored as JSON array: { type: "video"|"text"|"pdf", ... }
  content      Json
  progress     LessonProgress[]
  quizzes      Quiz[]

  @@unique([courseSlug, slug])
}

model LessonProgress {
  id          String   @id @default(cuid())
  studentId   String
  lessonId    String
  completedAt DateTime @default(now())
  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([studentId, lessonId])
}

model Quiz {
  id        String         @id @default(cuid())
  lessonId  String
  title     String
  questions Json           // QuizQuestion[]
  lesson    Lesson         @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  attempts  QuizAttempt[]
}

model QuizAttempt {
  id          String   @id @default(cuid())
  studentId   String
  quizId      String
  answers     Json     // { questionId, selectedOption }[]
  score       Int
  maxScore    Int
  completedAt DateTime @default(now())
  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
}

model Assignment {
  id          String           @id @default(cuid())
  studentId   String
  lessonId    String
  response    String?          // text response
  fileUrl     String?          // uploaded file
  submittedAt DateTime         @default(now())
  status      AssignmentStatus @default(SUBMITTED)
  feedback    String?
  student     Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

enum AssignmentStatus {
  SUBMITTED
  REVIEWED
  APPROVED
}
```

---

## Phase 1 — Foundation (3–4 days)

**Goal**: Students can register, log in, subscribe, and access a course.

### 1a — Database setup
- Add PostgreSQL service to Coolify
- Add `DATABASE_URL` to Coolify environment variables
- Install Prisma: `npm install prisma @prisma/client`
- Create `prisma/schema.prisma` with models above
- Run `prisma migrate deploy` in Dockerfile

### 1b — Student authentication
- Install NextAuth.js v5: `npm install next-auth@beta @auth/prisma-adapter`
- Configure `src/auth.ts` with Credentials provider (email + password)
- Pages needed:
  - `/courses/login` — sign in
  - `/courses/register` — create account (name, email, password)
  - `/courses/verify-email` — email verification link
  - `/courses/forgot-password` — request reset
  - `/courses/reset-password` — set new password
- Resend (already integrated) sends verification and reset emails
- Middleware: protect `/courses/[slug]/learn/*` routes

### 1c — Stripe subscriptions
- Create subscription products in Stripe Dashboard:
  - One product per course OR one "All Access" product
  - Monthly and/or annual price
- New env vars: `STRIPE_EQUIP_PRICE_ID`, `STRIPE_RESTORE_PRICE_ID`, `STRIPE_ACTIVATE_PRICE_ID`
- New API route: `POST /api/courses/subscribe` — creates Stripe Checkout Session in `subscription` mode
- New API route: `POST /api/webhooks/stripe` — handles:
  - `checkout.session.completed` → create `Enrollment`
  - `customer.subscription.deleted` → set `Enrollment.status = CANCELLED`
  - `invoice.payment_failed` → email student
- New env var: `STRIPE_WEBHOOK_SECRET` (already in `.env.example`, wire it up)
- Enrollment check middleware: `/courses/[slug]/learn/*` requires active enrollment

### 1d — MailerLite sync
- On enrollment created: add student to MailerLite group `MAILERLITE_COURSES_GROUP_ID`
- On enrollment cancelled: remove from group (or move to alumni group)
- New env var: `MAILERLITE_COURSES_GROUP_ID`

---

## Phase 2 — Course player (3–4 days)

**Goal**: Admin builds lessons; students watch, read, and download.

### 2a — Lesson admin
- New admin section: `/admin/courses/[id]/lessons`
- Lesson list with drag-to-reorder (display order)
- Lesson editor: title, slug, published toggle
- Content blocks (add/remove/reorder):
  - **Video block**: upload via Files library or paste YouTube/Vimeo URL
  - **Text block**: rich textarea (markdown or plain paragraphs)
  - **PDF block**: pick from Files library

### 2b — Course player (student-facing)
- Route: `/courses/[slug]/learn` — course outline sidebar + lesson player
- Sidebar: list of lessons, checkmark when completed, progress bar
- Lesson player renders content blocks in order:
  - Video: `<video>` for self-hosted, YouTube embed for YouTube IDs
  - Text: rendered paragraphs
  - PDF: `<iframe>` viewer with download link
- "Mark as complete" button → writes `LessonProgress` record
- "Next lesson" button advances to next unpublished lesson

### 2c — Progress tracking
- `LessonProgress` written on "Mark as complete"
- Course progress = completed lessons / total published lessons
- Progress bar shown in sidebar and on student dashboard

---

## Phase 3 — Quizzes and assignments (2–3 days)

**Goal**: Students can be assessed per lesson.

### 3a — Quiz builder (admin)
- Quiz attached to a lesson (one quiz per lesson, optional)
- Question types: multiple choice (4 options, one correct)
- Admin sets pass score (e.g. 80%)
- Questions stored as JSON on the `Quiz` model

### 3b — Quiz player (student)
- Rendered after lesson content
- One question at a time or all at once (admin setting)
- On submit: score calculated, stored as `QuizAttempt`
- Pass: unlock next lesson / show congratulations
- Fail: show correct answers, allow retry

### 3c — Assignments
- Assignment prompt attached to a lesson (optional)
- Student submits text response or uploads a file (PDF/image via Files API)
- Admin reviews at `/admin/courses/[id]/assignments`
- Admin can mark as Approved and leave feedback
- Student sees feedback on their dashboard

---

## Phase 4 — Student dashboard and admin views (2 days)

**Goal**: Students see their progress; admin sees all enrollments.

### 4a — Student dashboard
- Route: `/courses/dashboard`
- Shows: enrolled courses with progress bars, recent activity, upcoming lessons
- Account settings: name, email, password change

### 4b — Admin enrollment view
- Route: `/admin/courses/[id]/enrollments`
- Table: student name, email, enrolled date, status, progress %, Stripe subscription ID
- Actions: cancel enrollment, grant free access (bypass Stripe)

### 4c — Admin assignment review
- Route: `/admin/courses/[id]/assignments`
- List of submitted assignments with student name, lesson, submitted date
- Inline feedback form → sets status to Reviewed/Approved

---

## Environment variables to add

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nfm

# Auth
NEXTAUTH_SECRET=<random 32-char string>
NEXTAUTH_URL=https://www.natalieflemons.com

# Stripe subscriptions (add to existing Stripe vars)
STRIPE_EQUIP_PRICE_ID=price_...
STRIPE_RESTORE_PRICE_ID=price_...
STRIPE_ACTIVATE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MailerLite courses group
MAILERLITE_COURSES_GROUP_ID=
```

---

## Coolify setup required before Phase 1

1. **Add PostgreSQL service** in Coolify → Services → New Service → PostgreSQL
2. **Copy the `DATABASE_URL`** from the PostgreSQL service into the app's environment variables
3. **Add a Stripe webhook** in Stripe Dashboard → Developers → Webhooks:
   - Endpoint: `https://www.natalieflemons.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET` in Coolify
4. **Create subscription products** in Stripe Dashboard for each course

---

## File structure (new files only)

```
prisma/
  schema.prisma
  migrations/

src/
  auth.ts                                    NextAuth config
  lib/
    db.ts                                    Prisma client singleton
    enrollment.ts                            Enrollment read/write helpers
    student-auth.ts                          Password hash, email token helpers
  app/
    api/
      courses/
        subscribe/route.ts                   POST — create Stripe subscription checkout
      webhooks/
        stripe/route.ts                      POST — Stripe webhook handler
    courses/
      login/page.tsx
      register/page.tsx
      verify-email/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
      dashboard/page.tsx                     Student dashboard
      [slug]/
        learn/
          page.tsx                           Course outline
          [lessonSlug]/page.tsx              Lesson player
    admin/
      (dashboard)/
        courses/
          [id]/
            lessons/
              page.tsx                       Lesson list
              new/page.tsx
              [lessonId]/page.tsx            Lesson editor
            enrollments/page.tsx
            assignments/page.tsx
```

---

## Estimated total effort

| Phase | Work | Days |
|---|---|---|
| 1 — Auth + subscriptions | DB, student login, Stripe Billing, MailerLite | 3–4 |
| 2 — Course player | Lesson admin, video/text/PDF player, progress | 3–4 |
| 3 — Quizzes + assignments | Quiz builder/player, assignment submit/review | 2–3 |
| 4 — Dashboards | Student dashboard, admin enrollment/assignment views | 2 |
| **Total** | | **~2 weeks** |

---

## Open questions before starting

1. **Subscription model**: one plan unlocking all 3 courses, or separate subscription per course?
2. **Free courses**: which courses (if any) are free? Free enrollment still requires a student account.
3. **Video hosting**: self-hosted on Coolify volume (large disk needed) or YouTube/Vimeo embeds?
4. **Quiz retakes**: unlimited or capped?
5. **Assignment file types**: PDF only, or images too?
