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
| `node scripts/screenshot.mjs <url> <outDir> [widths…]` | Full-page screenshots + overflow/error report (uses system Chrome; `REDUCED_MOTION=1` to emulate reduced motion) |

## Where things live

- `src/content/` — all copy, book data, navigation and links (typed; single source of truth)
- `src/lib/content.ts` — accessors pages use to read content (swap for a CMS later)
- `src/components/` — `layout/`, `sections/`, `ui/`, `forms/`, `motion/`, `seo/`
- `src/app/globals.css` — design tokens (colors, type scale, spacing, motion)
- `docs/reports/` — audit, implementation plan and project reports

## Status

Homepage built. Other routes (`/about`, `/books`, `/store`, `/booking`, `/contact`, `/donate`, `/privacy`, `/terms`) are linked but not yet built and currently show the branded 404. Newsletter sign-up reports "unavailable" until a provider is configured.
