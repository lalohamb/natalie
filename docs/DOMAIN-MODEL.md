# DOMAIN MODEL
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-J section 3 remediation (2026-11-20, HEAD 247c069 + uncommitted working tree) -->

Types are defined in `src/content/types.ts` unless noted. That file is the
authority; this document summarizes it. (The duplicated pre-M2 copy of this
model that previously followed the M3-H version has been removed.)

## Entity Relationship

```
Site (singleton, static)
 ├── NavItem[] (main, secondary, legal) + CallToAction (Give)
 ├── SocialLink[] (verified flag gates rendering)
 └── GivingChannels (stripeUrl*, cashAppHandle, cashAppUrl, zelleEmail)
        * replaced by the STRIPE_DONATION_PAYMENT_LINK env var when set

Person — Natalie C. Flemons (singleton, static)
 ├── Bio
 └── Portrait[]

MinistryIdentity (singleton, static)
 └── MinistryPillar[]  EQUIP · RESTORE · ACTIVATE

AdminBook (runtime store, admin-managed)          ← not seeded (starts empty, by decision)
 ├── coverUrl → UploadedFile (/media-files/…) or absolute URL
 ├── PurchaseOption (external | stripe-checkout | none)
 │      └── stripe-checkout.priceId → Stripe Price   (external, authoritative for amount)
 ├── stripeProductId → Stripe Product                (external, admin sales view)
 └── companionOf → AdminBook.slug

CuratedVideo (runtime store, admin-managed)       ← seeded from media.ts
 └── exactly one source: localSrc | youtubeId | facebookUrl

UploadedFile (runtime, MEDIA_STORAGE_DIR/files)

PublicCalendar (external: Google Calendar, cached 5 min)
 └── CalendarEvent[]

MinistryEvent (static, currently empty — legacy of the pre-calendar design)

Product (static)
 ├── ProductVariant[]
 └── PurchaseOption (external → Printify)

GoogleCalendarConnection (runtime, encrypted refresh token)
AdminSession (signed cookie; no stored entity)

External-only records (never stored by the application):
 Order / Payment (Stripe) · Donation (Stripe, Cash App, Zelle)
 NewsletterSubscriber (MailerLite) · MerchOrder (Printify)
 ContactSubmission (emailed through Resend; never stored)
```

---

## Entity Details

### Site
Owned by: application (`src/content/site.ts`). Mutable by code change + deploy.
Giving: `stripeUrl`, `cashAppHandle`, `cashAppUrl`, `zelleEmail`. Consumers read
giving through `getGiving()` (`src/lib/giving.ts`), which substitutes
`STRIPE_DONATION_PAYMENT_LINK` when that variable is set.

### MinistryIdentity / MinistryPillar
```ts
type MinistryIdentity = { statement: string; pillars: MinistryPillar[] }
type MinistryPillar = { id: "equip" | "restore" | "activate"; name: string; tagline: string; description: string; order: number }
```
Owned by: application (`src/content/ministry-identity.ts`), accessor
`getMinistryIdentity()`.

Official statement (verbatim):
> "Equipping believers to discern the voice of God. Restoring integrity in how they live,
> lead, and carry their calling. Activating them to walk fully in their purpose and advance
> the Kingdom of God."

Prayer, Prophecy, and Purpose are **supporting ministry disciplines**, not
pillars. They must not be presented as organizational pillars.

---

### AdminBook (added M4) — the book entity the site renders
```ts
type AdminBook = {
  slug: string;
  title: string;
  subtitle?: string;
  status: "published" | "forthcoming" | "unavailable";
  priceCents?: number;          // display-only
  summary: string;
  description: string[];        // one entry per paragraph
  coverUrl?: string;            // /media-files/<name> or absolute URL
  coverAlt?: string;
  coverIsMockup?: boolean;
  forewordBy?: string;
  note?: string;
  companionOf?: string;
  purchase: PurchaseOption;
  featured: boolean;
  category?: "prophetic" | "destiny" | "warfare" | "autobiography";
  stripeProductId?: string;
  displayOrder: number;
  createdAt: string;
}
```
Internal ID: `slug`. New books get `slugified-title-xxxx` (4 random hex chars);
the admin cannot choose or edit a slug, so a typo in the title at creation is
permanent in the URL (G-54).
Owned by: application — `MEDIA_STORAGE_DIR/books.json`, shape
`{ version: number, books: AdminBook[] }`, managed at `/admin/books`.
Validated by a zod schema in `src/lib/book-store.ts` on read and on write
(G-57 resolved M4-O).
`version` (currently 3) identifies the file format; files with any or no
version, and the original bare-array format, are read as-is and never reset.
No file → empty catalog; the first admin save creates it.
Immutable: `slug` (changing it breaks URLs).
Accessors (`src/lib/book-content.ts`): `getPublishedBooks()` / `getBooks()`,
`getAdminBooks()`, `getAdminBook(slug)` / `getBook(slug)`.
Visibility: only `status: "published"` appears on `/books` and in the sitemap.
⚠️ `getBook(slug)` does not filter by status, so `/books/[slug]` renders
forthcoming/unavailable titles by direct URL (with the purchase button
suppressed) — intentional per the detail page's status eyebrow, but not
recorded as an approved decision.

### Book (static, reference copy)
`src/content/books.ts`, type `Book`. Not read by the application and not a seed. Kept, with a
header saying so, as the record of the original five titles' copy to re-enter
at `/admin/books` (G-54).

Current store contents (`storage/books.json`, version 3, as of 2026-11-20) —
**not launch data** (G-54):

| Slug | Title | Status | Display price | Purchase | Featured |
|---|---|---|---|---|---|
| `reparing-the-breack-b82b` (misspelled) | Repairing the Breach | published | $14.99 | Stripe Checkout | yes |
| `repair-the-breach-workbook-0702` | Repair the Breach Workbook | published | $25.00 | Stripe Checkout | no |
| `test-c3c0` | test | published | $5.00 | none | yes |

Missing from the store: *The Midwife To Your Destiny*, *War In The Wait*,
*From the Chaos to the Call*. Cover files for all five titles are in
`storage/files/`. The workbook's `companionOf` link is not set.

### PurchaseOption
```ts
type PurchaseOption =
  | { kind: "external"; url: string; label: string }
  | { kind: "stripe-checkout"; priceId: string; label: string }
  | { kind: "none" }
```
`none` (or `external` with an empty URL) renders no purchase button.
`stripe-checkout` renders a `CheckoutButton` — a form POST of the book's
`slug` to `/api/checkout`; the `priceId` stays on the server.
`/store` renders a button only for `external`.

---

### CuratedVideo
```ts
type CuratedVideo = {
  id: string; title: string; description: string;
  category: "ministry-message" | "biblical-teaching" | "interview" | "personal-reflection" | "event-highlight";
  facebookUrl?: string; embeddable: boolean;
  localSrc?: string; posterSrc?: string;
  youtubeId?: string;
  thumbnailImage?: ImageAsset;
  featured: boolean; published: boolean; displayOrder: number; createdAt: string;
}
```
Owned by: application — `MEDIA_STORAGE_DIR/videos.json`, managed at
`/admin/videos`; seeded from `src/content/media.ts`.
Accessors (`src/lib/video-content.ts`): `getVideos()`, `getFeaturedVideo()`.
One video may be `featured` (homepage). ⚠️ The currently featured video in
the store is test content, and the seed's first entry carries the same
YouTube id (G-37). Store: 7 videos, all published, all `ministry-message`.

### PublicCalendar / CalendarEvent
```ts
type CalendarEvent = { id: string; title: string; description?: string; location?: string; allDay: boolean; start: string; end: string }
type PublicCalendar = { timeZone: string; events: CalendarEvent[]; rangeStart: string; rangeEnd: string; currentMonth: string }
```
Owned by: Google Calendar (external). The application holds a 5-minute cached,
public-safe projection covering the current month through 12 months ahead.
Source: OAuth connection or public iCal feed (see API-CONTRACTS.md).

### MinistryEvent (static)
`src/content/events.ts` — empty. Accessors in `src/lib/content.ts`
(`getEvents`, `getUpcomingEvents`, `getEventsByYear`, `getEventsByMonth`,
`getEvent`). Read only as the homepage fallback (when the calendar has no
upcoming events) and by the unlinked `/events/[slug]` route (G-23).

---

### Product / ProductVariant
```ts
type ProductVariant = { size: string; color: string; available: boolean }
type Product = { slug: string; title: string; description: string; priceCents: number; imageUrl?: string; variants: ProductVariant[]; purchase: PurchaseOption; published: boolean }
```
Internal ID: `slug`. Owned by: application (`src/content/products.ts`) for
presentation; Printify owns the real catalog, price, stock and orders.
Accessors: `getProducts()`, `getProduct(slug)`.
Current products: Pray Hoodie ($55.00; Burnt Orange / Hunter Green),
Pray Coffee Mug ($19.99; 11oz Black). ⚠️ UNVERIFIED against Printify (G-41).

---

### SocialLink
```ts
type SocialLink = { platform: "instagram" | "facebook" | "youtube"; label: string; href: string; verified: boolean }
```
`verified: false` → filtered out by `getSocialLinks()` → not rendered.
Current state: Facebook (`facebook.com/natalie.flemons`), Instagram
(`instagram.com/natalieflemons`), YouTube (`youtube.com/@natalieflemons`) —
all `verified: true`. ⚠️ Owner confirmation for Facebook/YouTube not recorded (G-06).

### NavItem / CallToAction
```ts
type NavItem = { label: string; href: string }
type CallToAction = { label: string; href: string }
```
- Primary (header): About · Ministry · Books · Events · Media
- Secondary: Store · Partnerships · Contact
- Legal: Privacy Policy · Terms of Use
- Give CTA → `/donate` (redirects to `/partnerships`)

Every "Store" link (secondary navigation and footer) points at `STORE_URL`
in `site.ts`, the external Printify storefront.

### ImageAsset
```ts
type ImageAsset = { src: StaticImageData; alt: string }
```
Static imports from `src/assets/images/`. Used by bio/portraits and the book
seed; runtime books and videos use URL strings instead.

---

## Runtime settings entities

| Entity | File (under `MEDIA_STORAGE_DIR`) | Contents |
|---|---|---|
| GoogleCalendarConnection | `google-calendar.json` (mode 0600) | Account, chosen `calendarId`, AES-GCM-encrypted refresh token |
| BookStore | `books.json` | `{ version, books }` |
| VideoStore | `videos.json` | `CuratedVideo[]` |
| UploadedFile | `files/*` | Videos, posters, book covers. A file used by a video or as a book cover cannot be deleted |

The `./storage` directory is tracked in git and is the authoritative content
source. `ADMIN_READONLY=true` must be set in production to prevent runtime
writes (G-53, G-35 resolved M4-P).

---

## External-only records

### NewsletterSubscriber — owned by MailerLite
The application sends `{ email }` (plus a group when `MAILERLITE_GROUP_ID` is
set) and stores nothing. Admin view reads `id, email, status, subscribed_at`
and can delete a subscriber (G-51).

### Order / Payment — owned by Stripe
Created by Stripe Checkout. The application stores nothing and receives no
webhook (none planned — G-33 resolved M4-Q; Stripe receipt email + Dashboard
is the accepted order notification). The admin reads PaymentIntents (amount,
status, billing name, email, receipt URL, delivery address) on demand.
Checkout collects a delivery address in the United States or Canada; Stripe
holds it — the application does not store it.
The Stripe account in use is live mode (G-42).

### ContactSubmission — transient
Name, email, optional organization, subject, message. Emailed through Resend
to info@natalieflemons.com when `CONTACT_EMAIL_PROVIDER=resend`; never
persisted by the application. Delivery unverified (G-24).
