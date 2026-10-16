# BUSINESS CHARTER
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->

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

- Book sales (currently via legacy Squarespace product pages; commerce
  decision pending — see docs/reports/IMPLEMENTATION-PLAN.md §5)
- Merchandise sales (Pray Hoodies, Pray T-shirts; same commerce decision)
- Donations (Stripe Payment Link + Cash App — both verified live)
- Speaking/ministry engagements (inquiry-driven; no direct revenue capture
  on the site)

⚠️ UNVERIFIED: Whether the ministry has a recurring giving program or
intends to add one.

## Primary Business Workflows

1. Visitor discovers site → reads about Natalie → explores books → purchases
   via external Squarespace link (current) or future native checkout
2. Visitor → submits booking inquiry → ministry receives email → responds
   off-platform
3. Visitor → clicks Give → Stripe Payment Link or Cash App → donation
   processed off-platform
4. Visitor → signs up for newsletter → ⚠️ UNVERIFIED (provider not configured)

## Business Owner

⚠️ UNVERIFIED — cannot be inferred from code. Principal is Natalie C. Flemons;
legal entity is Natalie Flemons Ministries LLC.

## Success Metrics

⚠️ UNVERIFIED — no analytics or tracking found in the codebase.
Likely candidates: booking inquiry volume, book purchase click-throughs,
donation conversions, newsletter subscriber count.

## Explicit Non-Goals

⚠️ UNVERIFIED — not stated in code. Inferred from IMPLEMENTATION-PLAN.md:

- No database at launch
- No complex CMS without approval
- No tax-deductibility claims (LLC, not nonprofit)
- No fabricated content (testimonials, events, programs)

## Future Possibilities

⚠️ UNVERIFIED — inferred from docs:

- Native Stripe Checkout for books and merchandise (Option B in IMPLEMENTATION-PLAN.md)
- CMS integration (Sanity mentioned)
- Recurring giving via Stripe Payment Links
- Events system (2027 schedule — referenced in restructuring directive)
- Media/video page (Facebook video embeds)
- Autobiography / My Story section
- LEAP mentorship program (if it returns)
