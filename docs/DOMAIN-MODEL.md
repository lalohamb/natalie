# DOMAIN MODEL
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-H governance synchronization (2026-11-17) -->

Types are defined in `src/content/types.ts` unless noted. That file is the
authority; this document summarizes it. (The duplicated pre-M2 copy of this
model that previously followed the M3-H version has been removed.)

## Entity Relationship

```
Site (singleton, static)
 ├── NavItem[] (main, secondary, legal) + CallToAction (Give)
 ├── SocialLink[] (verified flag gates rendering)
 └── GivingChannels (stripeUrl*, cashAppHandle, cashAppUrl, zelleEmail)
        * overridable at runtime → StripeSettings.paymentLinkUrl

Person — Natalie C. Flemons (singleton, static)
 ├── Bio
 └── Portrait[]

MinistryIdentity (singleton, static)
 └── MinistryPillar[]  EQUIP · RESTORE · ACTIVATE

AdminBook (runtime store, admin-managed)          ← seeded from Book (static)
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
StripeSettings (runtime: paymentLinkUrl)
AdminSession (signed cookie; no stored entity)

External-only records (never stored by the application):
 Order / Payment (Stripe) · Donation (Stripe, Cash App, Zelle)
 NewsletterSubscriber (MailerLite) · MerchOrder (Printify)
```

---

## Entity Details

### Site
Owned by: application (`src/content/site.ts`). Mutable by code change + deploy.
Giving: `stripeUrl`, `cashAppHandle`, `cashAppUrl`, `zelleEmail`. Consumers read
giving through `getGiving()` (`src/lib/giving.ts`), which substitutes the
admin-saved Payment Link when one exists.

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
Internal ID: `slug`. New books get `slugified-title-xxxx` (4 random hex chars).
Owned by: application — `MEDIA_STORAGE_DIR/books.json`, managed at
`/admin/books`, validated by a zod schema in `src/lib/book-store.ts`.
Immutable: `slug` (not editable in the admin; changing it breaks URLs).
Accessors (`src/lib/book-content.ts`): `getPublishedBooks()` / `getBooks()`,
`getAdminBooks()`, `getAdminBook(slug)` / `getBook(slug)`.
Visibility: only `status: "published"` appears on `/books` and in the sitemap.
⚠️ `getBook(slug)` does not filter by status, so `/books/[slug]` renders
forthcoming/unavailable titles by direct URL (with the purchase button
suppressed) — intentional per the detail page's status eyebrow, but not
recorded as an approved decision.

### Book (static seed)
`src/content/books.ts`, type `Book` (cover is a static `ImageAsset`). Used
**only** to seed the store when `books.json` does not exist, and (incorrectly)
by `/admin/book-sales` (G-43).

Catalog (5 titles, all featured in the current runtime store):

| Slug | Title | Companion of | Seed purchase (`books.ts`) | Runtime purchase (local `books.json`) |
|---|---|---|---|---|
| `repairing-the-breach` | Repairing the Breach | — | Stripe Checkout | Stripe Checkout · $14.99 |
| `repair-the-breach-workbook` | Repair the Breach Workbook | `repairing-the-breach` | Squarespace URL ❌ | Stripe Checkout · $25.00 |
| `the-midwife-to-your-destiny` | The Midwife To Your Destiny | — | Squarespace URL ❌ | Stripe Checkout · $14.99 |
| `war-in-the-wait` | War In The Wait | — | Squarespace URL ❌ | Stripe Checkout · $14.99 |
| `from-the-chaos-to-the-call` | From the Chaos to the Call | — | external, **empty URL** ❌ | Stripe Checkout · no display price, label "Purchase on Amazon" ❌ |

Seed/runtime divergence: G-34. Runtime data defects: G-36.

### PurchaseOption
```ts
type PurchaseOption =
  | { kind: "external"; url: string; label: string }
  | { kind: "stripe-checkout"; priceId: string; label: string }
  | { kind: "none" }
```
`none` (or `external` with an empty URL) renders no purchase button.
`stripe-checkout` renders a link to `/api/checkout?priceId=…` (G-31).
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
the local store is test content (G-37).

### PublicCalendar / CalendarEvent
```ts
type CalendarEvent = { id: string; title: string; description?: string; location?: string; allDay: boolean; start: string; end: string }
type PublicCalendar = { timeZone: string; events: CalendarEvent[]; rangeStart: string; rangeEnd: string; currentMonth: string }
```
Owned by: Google Calendar (external). The application holds a 5-minute cached,
public-safe projection covering the previous month through 12 months ahead.
Source: OAuth connection or public iCal feed (see API-CONTRACTS.md).

### MinistryEvent (static)
`src/content/events.ts` — empty. Accessors in `src/lib/content.ts`
(`getEvents`, `getUpcomingEvents`, `getEventsByYear`, `getEventsByMonth`,
`getEvent`). Read only by the homepage `UpcomingEvents` section and
`/events/[slug]`. Retire or reconnect under G-40.

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

Footer "Store" is hard-coded to the external Printify storefront, bypassing
`secondaryNavigation` (G-47).

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
| StripeSettings | `stripe-settings.json` | `paymentLinkUrl?` — donation link override |
| GoogleCalendarConnection | `google-calendar.json` (mode 0600) | Account, chosen `calendarId`, AES-GCM-encrypted refresh token |
| UploadedFile | `files/*` | Videos, posters, book covers |

---

## External-only records

### NewsletterSubscriber — owned by MailerLite
The application sends `{ email }` and stores nothing. Admin view reads
`id, email, status, subscribed_at` and can delete a subscriber. No group or
source is set (G-51).

### Order / Payment — owned by Stripe
Created by Stripe Checkout. The application stores nothing and receives no
webhook (G-33). The admin reads PaymentIntents (amount, status, billing name,
email, receipt URL) on demand. ❌ No shipping address is collected (G-32).

### ContactSubmission
Not delivered, not persisted (G-24).
