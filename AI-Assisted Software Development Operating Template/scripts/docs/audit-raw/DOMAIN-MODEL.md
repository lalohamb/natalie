# DOMAIN MODEL
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->

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

⚠️ UNVERIFIED: "From the Chaos to the Call" (autobiography) is referenced in
`docs/reports/SITE-AUDIT.md` §3 and §4 as an unlinked legacy page with an
Amazon link. It is NOT in `src/content/books.ts`. Decision pending
(IMPLEMENTATION-PLAN.md §9 item 3).

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
