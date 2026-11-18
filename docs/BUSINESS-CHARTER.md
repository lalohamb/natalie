# BUSINESS CHARTER
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-H governance synchronization (2026-11-17) -->

## Product Name

Natalie Flemons Ministries — Website (natalieflemons.com)

## Business Problem

The legacy Squarespace site (audited 2026-10-10) presents a thin, inconsistent
experience: a homepage with no body copy, broken links, expired offers, no
privacy/terms pages, a newsletter block with no storage, and template demo
content indexed by search engines. It does not adequately represent Natalie's
ministry, books, or speaking work.

## Target User

- Ministry visitors: people seeking spiritual guidance, prophetic teaching,
  prayer, and destiny-focused content.
- Book buyers: readers interested in Natalie's published works.
- Booking coordinators: churches, ministries, organizations, and event
  coordinators seeking a speaker/minister.
- Donors/partners: individuals who want to financially support the ministry.
- Newsletter subscribers: people who want ongoing ministry updates.

## Customer Value Proposition

A professional, ministry-first digital platform that communicates Natalie's
calling, makes her books easy to discover and purchase, provides a clear path
for booking inquiries, and enables financial partnership with the ministry.

## Revenue Model

- Book sales — Stripe Checkout on this site (implemented M4; not yet
  launch-ready, see KNOWN-GAPS G-31/G-32/G-33). ⚠️ UNVERIFIED: no recorded
  owner approval of the commerce option (IMPLEMENTATION-PLAN.md §5), and the
  fulfilment/shipping model is not documented.
- Merchandise sales — external Printify storefront
  (`thereformcollective.printify.me`): Pray Hoodie, Pray Coffee Mug. The Pray
  T-shirt is no longer listed. ⚠️ UNVERIFIED storefront ownership (G-41).
- Donations (Stripe Payment Link + Cash App — verified live 2026-10-10;
  Zelle to info@natalieflemons.com — ⚠️ UNVERIFIED)
- Speaking/ministry engagements (inquiry-driven; no direct revenue capture
  on the site)

⚠️ UNVERIFIED: Whether the ministry has a recurring giving program or
intends to add one.

## Primary Business Workflows

1. Visitor discovers site → reads about Natalie → explores books → pays
   through Stripe Checkout → ministry fulfils the order (⚠️ fulfilment
   process UNVERIFIED — no shipping address is collected today, G-32)
2. Visitor → submits booking inquiry → ministry receives email → responds
   off-platform (❌ contact form does not deliver yet, G-24)
3. Visitor → clicks Give → Stripe Payment Link, Cash App or Zelle → donation
   processed off-platform
4. Visitor → signs up for newsletter → subscriber stored in MailerLite
5. Ministry operator → signs in to `/admin` → manages books, videos, events
   calendar connection, donation link; reviews subscribers, donations and
   book orders

## Business Owner

⚠️ UNVERIFIED — cannot be inferred from code. Principal is Natalie C. Flemons;
legal entity is Natalie Flemons Ministries LLC.

## Success Metrics

⚠️ UNVERIFIED — no analytics or tracking found in the codebase (G-09). The
admin now surfaces three raw measures directly from providers: MailerLite
subscriber counts, Stripe payments, and book orders per title.
Likely candidates: booking inquiry volume, book purchase click-throughs,
donation conversions, newsletter subscriber count.

## Explicit Non-Goals

⚠️ UNVERIFIED — not stated in code. Inferred from IMPLEMENTATION-PLAN.md:

- No database at launch (still true — runtime state is JSON files on disk)
- No complex CMS without approval. Note: M4 added a purpose-built admin
  dashboard for books, videos, calendar and donations. ⚠️ No approval record
  for this scope exists in `docs/`.
- No tax-deductibility claims (LLC, not nonprofit)
- No fabricated content (testimonials, events, programs)

## Future Possibilities

⚠️ UNVERIFIED — inferred from docs:

- ~~Native Stripe Checkout for books~~ — implemented M4 (books only; one item per checkout)
- ~~Events system~~ — implemented M4 via Google Calendar
- ~~Media/video page~~ — implemented (admin-managed uploads, YouTube, Facebook)
- Cart / multi-item checkout; on-site merchandise checkout
- CMS integration (Sanity mentioned)
- Recurring giving via Stripe Payment Links
- Autobiography / My Story section
- LEAP mentorship program (if it returns)
