# Natalie Flemons Ministries — Website

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · Motion.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in values; see comments in the file
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run test:contract` | Provider contract tests — offline, no server |
| `npm run build && npm test` | End-to-end tests. Starts its own server on port 3100 with every provider credential blanked, so it cannot reach live accounts |
| `node scripts/screenshot.mjs <url> <outDir> [widths…]` | Full-page screenshots + overflow/error report (uses system Chrome; `REDUCED_MOTION=1` to emulate reduced motion) |

## Where things live

- `src/content/` — static copy, navigation and links (typed)
- `src/lib/content.ts`, `book-content.ts`, `video-content.ts`, `giving.ts` — accessors pages use to read content
- `src/lib/` — provider boundaries (Stripe, MailerLite, Resend, Google Calendar) and the admin stores
- `src/app/admin/` — admin dashboard (books, videos, files, calendar, newsletter, donations, book sales)
- `storage/` — admin-managed data: books, videos, uploads (`MEDIA_STORAGE_DIR`)
- `src/components/` — `layout/`, `sections/`, `ui/`, `forms/`, `motion/`, `seo/`
- `src/app/globals.css` — design tokens (colors, type scale, spacing, motion)
- `scripts/analysis/` — one-off design comparison scripts (run from the repo root)
- `docs/` — governance documents. Start with `docs/README.md`

## Status

All public routes and the admin dashboard are built. The site is **not launch-ready**: see `docs/KNOWN-GAPS.md` §1 for what blocks launch (checkout safety, book catalog data, hosting and storage decisions, stale end-to-end tests).

Use test-mode provider credentials in `.env.local` on a developer machine; `.env.example` lists every variable the code reads.
