# DOMAIN MODEL
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M3-H governance synchronization -->

## Entity Relationship

```
Site (singleton)
 │
 ├── has NavItem[] (main navigation, legal navigation)
 ├── has CallToAction (Give)
 ├── has SocialLink[] (verified flag gates rendering)
 └── has GivingChannels (stripeUrl, cashAppHandle, cashAppUrl)

Person — Natalie C. Flemons (singleton)
 │
 ├── has Bio (short, full[], roles[], yearsInMinistry, speakingSummary, identityLine, sections)
 └── has Portrait[] (autumn, garden)

MinistryIdentity (singleton) — M2
 │
 ├── statement: string (official ministry statement)
 └── pillars: MinistryPillar[]
     ├── EQUIP  (id: "equip",    order: 1) — PRIMARY organizational pillar
     ├── RESTORE (id: "restore", order: 2) — PRIMARY organizational pillar
     └── ACTIVATE (id: "activate", order: 3) — PRIMARY organizational pillar

  Supporting ministry disciplines (NOT pillars — preserved in HomeContent and Ministry page):
  Prayer · Prophecy · Purpose

Book
 │
 ├── has ImageAsset (cover)
 ├── has PurchaseOption (external | none)
 └── optionally companionOf → Book.slug

MinistryEvent — M1
 │
 ├── slug, title, description
 ├── startDate, endDate?, timeZone
 ├── venue?, city, state?, country
 ├── category: EventCategory
 ├── status: EventStatus
 ├── coverImage?: ImageAsset
 └── registrationUrl?, published

CuratedVideo — M1
 │
 ├── id, title, description
 ├── category: VideoCategory
 ├── facebookUrl (validated pattern)
 ├── thumbnailImage?: ImageAsset
 └── featured, published, displayOrder

Product — M1
 │
 ├── id, name, description
 ├── variants: ProductVariant[]
 │    └── size, color, priceCents, inStock
 └── purchase: PurchaseOption

HomeContent (singleton)
 ├── hero (headline: ["Shaping Destinies.", "Advancing the", "Kingdom."])
 ├── introduction
 ├── message
 │    └── pillars[] (Prayer, Prophecy, Purpose — supporting disciplines)
 ├── publications
 ├── booking
 ├── partner
 └── newsletter
```

---

## Entity Details

### Site
Internal ID: none (singleton constant)
Owned by: application (`src/content/site.ts`)
Mutable: all fields (edit TS source and redeploy)
Immutable: none enforced by code
External mappings:
- `giving.stripeUrl` → Stripe Payment Link (outbound)
- `giving.cashAppUrl` → Cash App (outbound)
- `socialLinks[].href` → social platform profiles (outbound)

---

### MinistryIdentity (added M2)
```ts
type MinistryIdentity = {
  statement: string;
  pillars: MinistryPillar[];
}
```
Internal ID: none (singleton)
Owned by: application (`src/content/ministry-identity.ts`)
Accessor: `getMinistryIdentity()` in `src/lib/content.ts`
Mutable: all fields
Immutable: none enforced by code

Official statement (verbatim):
> "Equipping believers to discern the voice of God. Restoring integrity in how they live,
> lead, and carry their calling. Activating them to walk fully in their purpose and advance
> the Kingdom of God."

---

### MinistryPillar (added M2)
```ts
type MinistryPillar = {
  id: "equip" | "restore" | "activate";
  name: string;
  tagline: string;
  description: string;
  order: number;
}
```
Three records — the PRIMARY organizational framework:

| id | name | order |
|---|---|---|
| `equip` | Equip | 1 |
| `restore` | Restore | 2 |
| `activate` | Activate | 3 |

Prayer, Prophecy, and Purpose are **supporting ministry disciplines**, not pillars.
They are preserved in `src/content/home.ts` and the Ministry page under
"Ministry in Practice." They must not be presented as organizational pillars.

---

### Book
Internal ID: `slug` (string, URL-safe, application-assigned)
Owned by: application (`src/content/books.ts`)
Mutable: all fields
Immutable: `slug` — changing it breaks URLs and any external links to `/books/[slug]`
External mappings: `purchase.url` → legacy Squarespace product page (outbound)

Current catalog:

| Slug | Title | Featured | Companion of |
|---|---|---|---|
| `repairing-the-breach` | Repairing the Breach | ✅ | — |
| `repair-the-breach-workbook` | Repair the Breach Workbook | ✅ | `repairing-the-breach` |
| `the-midwife-to-your-destiny` | The Midwife To Your Destiny | ✅ | — |
| `war-in-the-wait` | War In The Wait | ✅ | — |
| `from-the-chaos-to-the-call` | From the Chaos to the Call | ❌ | — |

⚠️ OPEN GAPS: "From the Chaos to the Call" was added in M1-B (G-05 resolved).
The Amazon purchase URL is still a stub (`https://www.amazon.com`) — G-05b OPEN (HIGH, pre-launch blocker).
The cover image is a placeholder (uses `repairingTheBreachCover`) — G-05c OPEN (MEDIUM, pre-launch blocker).
Both require ministry-supplied assets before launch.

---

### MinistryEvent (added M1)
```ts
type EventStatus = "scheduled" | "postponed" | "cancelled" | "completed";
type EventCategory = "conference" | "workshop" | "service" | "appearance" | "other";

type MinistryEvent = {
  id: string;          // UUID, application-assigned
  slug: string;        // URL-safe, immutable after publish
  title: string;
  description: string;
  startDate: string;   // ISO 8601
  endDate?: string;
  timeZone: string;    // IANA tz
  venue?: string;
  city: string;
  state?: string;
  country: string;
  isPublic: boolean;
  category: EventCategory;
  coverImage?: ImageAsset;
  registrationUrl?: string;
  status: EventStatus;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
```
Internal ID: `slug`
Owned by: application (`src/content/events.ts`)
Current state: events array is empty — no 2027 schedule supplied (G-19 OPEN).
Accessors: `getEvents()`, `getUpcomingEvents(n)`, `getEventsByYear()`, `getEventsByMonth()`, `getEvent(slug)`

---

### CuratedVideo (added M1)
```ts
type VideoCategory =
  | "ministry-message" | "biblical-teaching" | "interview"
  | "personal-reflection" | "event-highlight";

type CuratedVideo = {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  facebookUrl: string;        // must match facebook.com/*/videos/* pattern
  thumbnailImage?: ImageAsset;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  createdAt: string;
}
```
Internal ID: `id`
Owned by: application (`src/content/media.ts`)
URL validation rule: `facebookUrl` must match `https://www.facebook.com/[page]/videos/[id]/`
Accessors: `getVideos()`, `getFeaturedVideo()`

---

### Product / ProductVariant (added M1)
```ts
type ProductVariant = {
  size: string;
  color: string;
  priceCents: number;
  inStock: boolean;
}

type Product = {
  id: string;
  name: string;
  description: string;
  variants: ProductVariant[];
  purchase: PurchaseOption;
}
```
Internal ID: `id`
Owned by: application (`src/content/products.ts`)
Accessors: `getProducts()`, `getProduct(id)`
Current products: Pray Hoodies, Pray T-shirts (verified in SITE-AUDIT.md §5)

---

### ImageAsset
```ts
type ImageAsset = { src: StaticImageData; alt: string }
```
Internal ID: none
Owned by: application (static imports from `src/assets/images/`)
Mutable: `src`, `alt`
Immutable: none enforced

---

### SocialLink
```ts
type SocialLink = {
  platform: "instagram" | "facebook";
  label: string;
  href: string;
  verified: boolean;
}
```
Internal ID: `platform` enum value
Owned by: application (`src/content/site.ts`)
`verified: false` → filtered out of `getSocialLinks()` → not rendered anywhere.

Current state:
- Instagram (`instagram.com/natalieflemons`): `verified: true` ✅
- Facebook (numeric personal-profile ID): `verified: false` ❌ — not rendered

---

### PurchaseOption
```ts
type PurchaseOption =
  | { kind: "external"; url: string; label: string }
  | { kind: "none" }
```
Discriminated union. `kind: "none"` renders no purchase button.

❌ GAP: A `"checkout"` variant is noted in a comment in `src/content/types.ts`
as a future addition pending the commerce decision. It does not exist yet and
must not be implemented until the commerce option is approved.

---

### NavItem
```ts
type NavItem = { label: string; href: string }
```
No internal ID. Owned by application. Order in array determines render order.

Current navigation:
- Primary (header): About · Ministry · Books · Events · Media
- Secondary (footer): Store · Partnerships · Contact
- Legal: Privacy Policy · Terms of Use

---

### CallToAction
```ts
type CallToAction = { label: string; href: string }
```
Inline type used for CTA buttons throughout content modules.

---

### NewsletterSubscription
Not persisted. No entity exists in the application today.

❌ GAP: When a provider is configured, a subscriber entity will need to be
defined at minimum as: `{ email: string; subscribed_at: Date; source: string }`.
The provider will own the authoritative record; the application will own the
submission boundary only.

---

### ContactSubmission
Not persisted. No entity exists in the application today.

❌ GAP (G-24): When `CONTACT_EMAIL_PROVIDER` is configured, submissions are
delivered via email. No database record is created. The provider owns delivery;
the application owns the submission boundary and validation only.

## Entity Relationship

```
Site (singleton)
 │
 ├── has NavItem[] (main navigation, legal navigation)
 ├── has CallToAction (Give)
 ├── has SocialLink[] (verified flag gates rendering)
 └── has GivingChannels (stripeUrl, cashAppHandle, cashAppUrl)

Person — Natalie C. Flemons (singleton)
 │
 ├── has Bio (short, full[], roles[], yearsInMinistry, speakingSummary)
 └── has Portrait[] (autumn, garden)

Book
 │
 ├── has ImageAsset (cover)
 ├── has PurchaseOption (external | none)
 └── optionally companionOf → Book.slug

HomeContent (singleton)
 ├── hero
 ├── introduction
 ├── message
 │    └── pillars[] (Prayer, Prophecy, Purpose)
 ├── publications
 ├── booking
 ├── partner
 └── newsletter
```

---

## Entity Details

### Site
Internal ID: none (singleton constant)
Owned by: application (`src/content/site.ts`)
Mutable: all fields (edit TS source and redeploy)
Immutable: none enforced by code
External mappings:
- `giving.stripeUrl` → Stripe Payment Link (outbound)
- `giving.cashAppUrl` → Cash App (outbound)
- `socialLinks[].href` → social platform profiles (outbound)

---

### Book
Internal ID: `slug` (string, URL-safe, application-assigned)
Owned by: application (`src/content/books.ts`)
Mutable: all fields
Immutable: `slug` — changing it breaks URLs and any external links to `/books/[slug]`
External mappings: `purchase.url` → legacy Squarespace product page (outbound)

Current catalog:

| Slug | Title | Featured | Companion of |
|---|---|---|---|
| `repairing-the-breach` | Repairing the Breach | ✅ | — |
| `repair-the-breach-workbook` | Repair the Breach Workbook | ✅ | `repairing-the-breach` |
| `the-midwife-to-your-destiny` | The Midwife To Your Destiny | ✅ | — |
| `war-in-the-wait` | War In The Wait | ✅ | — |
| `from-the-chaos-to-the-call` | From the Chaos to the Call | ❌ | — |

⚠️ OPEN GAPS: "From the Chaos to the Call" was added in M1-B (G-05 resolved).
The Amazon purchase URL is still a stub (`https://www.amazon.com`) — G-05b OPEN.
The cover image is a placeholder (uses `repairingTheBreachCover`) — G-05c OPEN.
Both are pre-launch blockers requiring ministry-supplied assets.

---

### ImageAsset
```ts
type ImageAsset = { src: StaticImageData; alt: string }
```
Internal ID: none
Owned by: application (static imports from `src/assets/images/`)
Mutable: `src`, `alt`
Immutable: none enforced

---

### SocialLink
```ts
type SocialLink = {
  platform: "instagram" | "facebook";
  label: string;
  href: string;
  verified: boolean;
}
```
Internal ID: `platform` enum value
Owned by: application (`src/content/site.ts`)
`verified: false` → filtered out of `getSocialLinks()` → not rendered anywhere.

Current state:
- Instagram (`instagram.com/natalieflemons`): `verified: true` ✅
- Facebook (numeric personal-profile ID): `verified: false` ❌ — not rendered

---

### PurchaseOption
```ts
type PurchaseOption =
  | { kind: "external"; url: string; label: string }
  | { kind: "none" }
```
Discriminated union. `kind: "none"` renders no purchase button.

❌ GAP: A `"checkout"` variant is noted in a comment in `src/content/types.ts`
as a future addition pending the commerce decision. It does not exist yet and
must not be implemented until the commerce option is approved.

---

### NavItem
```ts
type NavItem = { label: string; href: string }
```
No internal ID. Owned by application. Order in array determines render order.

---

### CallToAction
```ts
type CallToAction = { label: string; href: string }
```
Inline type used for CTA buttons throughout content modules.

---

### NewsletterSubscription
Not persisted. No entity exists in the application today.

❌ GAP: When a provider is configured, a subscriber entity will need to be
defined at minimum as: `{ email: string; subscribed_at: Date; source: string }`.
The provider will own the authoritative record; the application will own the
submission boundary only.
