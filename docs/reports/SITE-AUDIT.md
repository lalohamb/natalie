# Site Audit — natalieflemons.com

**Audited:** 2026-10-10 · **Method:** HTTP fetch of every URL in `/sitemap.xml` (28 URLs), Squarespace `?format=json` product data, outbound-link checks, and a review of the image assets.
**Not verified:** visual rendering, mobile layout, and checkout. No browser screenshots were taken, and no purchases or form submissions were made. Items marked ⚠️ need confirmation from the ministry.

---

## 1. Platform

| Item | Finding |
|---|---|
| Platform | Squarespace 7.0, **Adversary** template (`templateId 515c7bd0…`) |
| Domain | `natalieflemons.com` 301 → `https://www.natalieflemons.com` (HSTS on) |
| Commerce | Squarespace Commerce (native cart and checkout) |
| Donations | External Stripe Payment Link plus Cash App handle |
| Forms | Squarespace form blocks (booking, LEAP application) |
| Viewport | `width=device-width,initial-scale=1` present. Responsive behaviour **not visually tested** |

## 2. Navigation (live)

```
Home · About · Donate · Contact · Store · Purchase Books ▾
                                           ├ Repairing the Breach
                                           ├ Repair the Breach Workbook
                                           ├ The Midwife To Your Destiny
                                           └ War In The Wait
```
Footer: Instagram, Facebook, "Powered by Squarespace". There is no footer navigation, contact info, copyright, or legal links.

## 3. Page Inventory

### Live, linked pages

| URL | Title | Content | Assessment |
|---|---|---|---|
| `/` (`/home`) | Natalie Flemons Ministries | 2 full-screen slides only: "About Natalie → Meet Natalie" (portrait) and "The Midwife To Your Destiny → Purchase Today" (promo graphic). No body copy. | Thin. No intro, no booking/donate/newsletter CTA |
| `/about` | About | Tagline "the midwife to your destiny leading people from their chaos to their call." + one bio paragraph + portrait (DSC00295) + newsletter block | Core content: **preserve bio verbatim** (see §6) |
| `/donate` | Donate | "Thank you for sowing into Natalie Flemons Ministries LLC! You are sowing into good ground. May the Lord bless & prosper you." Stripe button + Cash App `$natalieflemons` | Works. Entity is an **LLC** (so no tax-deductibility claims) |
| `/contact` | Contact | "Use this form for Booking." + "For general questions please email: info@natalieflemons.com" + 13-field booking form | See §7 |
| `/store-1` | Store | Pray Hoodies $55, Pray T-shirts $25 | See §5 |
| `/repairingthebreach` (+ `/prophetic-purity`) | Repairing the Breach | Book listing + product | Good description |
| `/repair-the-breach-workbook` (+ `/training`) | Repair the Breach Workbook | Workbook listing + product | Product SEO title is "Prophetic Training" (mismatch) |
| `/the-midwife-to-your-destiny` (+ `/guide`) | The Midwife To Your Destiny | Book listing + product, "Receive a Signed Copy" | Flagship title |
| `/war-in-the-wait-2` | War In The Wait | Description + "Purchase" → `/war-in-the-wait-1` | Split across two pages |
| `/war-in-the-wait-1` (+ `/book`) | War In The Wait | Shop listing + product | Product page has **no description** |

### Live but unlinked (orphaned / legacy)

| URL | Content | Recommendation |
|---|---|---|
| `/purchase-book` | Page titled **"Copy of Purchase Book"**. *From The Chaos To The Call* (autobiography) description + Amazon link (link resolves, HTTP 200) | ⚠️ Keep as a backlist title with an Amazon link if it's still in print and the ministry wants it shown |
| `/new-products` (+ `/destinywithbook`, `/destinywithoutbook`) | "Webinar series": *Destiny Decisions* with book $30 / w/o book $15 (Zoom link emailed after payment), published Dec 2020, still purchasable | ⚠️ Likely expired. Retire and redirect unless it's still offered |
| `/destinywebinarwithbook` (+ `/teach-me-how-to-war`) | Duplicate Destiny Decisions $30 product (slug unrelated to content) | Retire and redirect |
| `/leap-registration` | LEAP Mentorship application (32 fields), "applications Feb 11 – Mar 4, **2019**". Fee links → **404** | Retire. ⚠️ Ask whether LEAP will return |
| `/polaris`, `/vanguard-set`, `/meltdown-tour`, `/read-me-adversary` | **Squarespace template demo content** ("Adversary helps tell your story…", stock Flickr photos from another Squarespace account, dead `/mixes-adversary` and `/schedule-adversary` links). Polaris uses "From the chaos to the call" as a caption | Remove. Redirect to `/` (they're indexed in the sitemap) |

### Checked, not present (404)
`/privacy-policy`, `/terms`, `/books`, `/store`, `/from-the-chaos-to-the-call`

## 4. Books (verified 2026-10-10)

| Title | Price | Stock (Squarespace) | Notes |
|---|---|---|---|
| Repairing the Breach: Restoring Purity to the Prophetic | $14.99 | 192 | Foreword by Matthew R. Blumenberg (from the cover). Full description available |
| Repair the Breach Workbook (*Repair the Breach: 3-Phase Journey to Prophetic Purity*) | $25.00 | Unlimited | Published 2026-09-07. Image is a mockup, not a flat cover. ⚠️ Confirm whether it ships now or is a pre-order/POD |
| The Midwife To Your Destiny (*A Guide to Living at Your Fullest Potential*) | $14.99 | 41 | Foreword by Louis C. Wimbley (from the cover). "Signed copy" promise. ⚠️ confirm still true |
| War In The Wait | $14.99 | Unlimited | Description only on `/war-in-the-wait-2` |
| From The Chaos To The Call | Amazon | n/a | Legacy autobiography, unlinked |

Not found anywhere on the site: ISBNs, page counts, formats (paperback/ebook), publisher, publication dates, or a shipping policy. ⚠️

## 5. Merchandise (verified 2026-10-10)

| Product | Price | Sizes | Colors | Stock | Description |
|---|---|---|---|---|---|
| Pray Hoodies | $55.00 | S, M, L, XL, 2X, 3X | Burnt Orange, Hunter Green | Unlimited (all variants) | **None** |
| Pray T-shirts | $25.00 | S, M, L, XL, 2X, 3X | Orange, Green | **Limited:** S/Orange 1, S/Green 1, M/Green 1, L/Orange 2. **All other 8 variants sold out** | **None** |

- Design: "Pray" script with a heartbeat line and the tagline **"Spirit . Truth . Strategy"** in gold.
- Hoodie image is a candid table photo of mixed shirts (including an unrelated "ROAR" garment), not a product shot. The T-shirt image is a 2-up mockup. There are no per-color images.
- Color naming is inconsistent between the two products (Burnt Orange/Hunter Green vs Orange/Green).
- ⚠️ No size chart, fabric, fulfilment, shipping, or returns information.

## 6. Verified Copy to Preserve

**Bio (About page, verbatim source):**
> Natalie C. Flemons is a trailblazing spiritual midwife, pure Prophet of the Lord, powerful intercessor and founder of Natalie Flemons Ministries. With over 20 years of ministry experience, she has been instrumental in shaping destinies and empowering individuals and teams through the ministry of prayer and prophecy. Natalie is sought-after speaker, spiritual advisor and builder of God's Kingdom. She holds a Bachelor of Science in Nursing, Master of Health Services Administration degrees, and Certification for Case Management. She is married to the love of her life, Michael D. Flemons, and together they have an adoptive daughter, Sophia Naomi, affectionately known as Suddenly Sophia. Sophia is a product of the faithful prayers of Natalie as she warred and patiently awaited the Promise to be fulfilled.

Minor copy fixes to propose (pending approval): "Natalie is **a** sought-after speaker"; the degree sentence implies two master's degrees.

**Brand lines:** "The Midwife To Your Destiny" · "Leading people from their chaos to their call" · "Spirit . Truth . Strategy" (merch) · "You are sowing into good ground."

Full book descriptions for Repairing the Breach, the Workbook, Midwife, War in the Wait, and Chaos to the Call were captured and will be migrated verbatim.

**Gaps in verified content:** there are no testimonials, speaking history, event list, media, or ministry programs on the site. The new site cannot include these unless the ministry supplies them.

## 7. Forms & Workflows

| Workflow | Finding |
|---|---|
| Booking form (`/contact`) | Fields: Name, Email, Purpose (Booking / Collaboration / Other), Phone, Event Name, Event Theme, Event Date, Event Type, **Prepared honorarium amount**, Contact Person, Contact Person phone, Contact Person email, Additional Information. **All 13 required**, and several are textareas used for short answers. No CAPTCHA. ⚠️ Destination of submissions unknown, so we can't confirm whether it's delivering |
| General contact | Email address only, no form |
| Newsletter | One block on `/about`. Page HTML contains *"This newsletter signup form needs a storage option"*, so it is **most likely not saving signups**. ⚠️ Ask whether a subscriber list exists anywhere |
| Donations | Stripe Payment Link `donate.stripe.com/9AQaGHcs250e2R2aEE` → live Stripe Checkout (HTTP 200). Cash App `$NatalieFlemons` resolves. No recurring option or giving amounts are shown |
| Checkout | Squarespace cart (not tested) |

## 8. Brand & Visual Audit

| Element | Finding |
|---|---|
| Logo | "NF" script monogram in **bright yellow with drop shadow** inside a black ring. 500×500 PNG only. Dated and low-resolution, and it doesn't match the gold used on the books and merch. ⚠️ Request vector/original. Recommend a refined wordmark (monogram retained, recoloured) |
| Fonts | Dosis (headings) and Roboto (body) via Squarespace. Generic |
| Colors | Template defaults. Gold `#be9b35` appears in site styles |
| Photography | 3 authentic portraits: `2020 Natalie-28.jpg` (outdoor, striped jacket), `DSC00295.jpg` (autumn, burnt-orange sweater, portrait orientation, strongest image), `MidW1.jpg` (same 2020 shoot on a busy gradient/brushstroke graphic, not reusable as-is). There is no recent hero-grade landscape portrait. ⚠️ |
| Book covers | Repairing the Breach (black/fire/gold), Midwife (teal/gold script), War in the Wait (purple/gold), Chaos to the Call (magenta). Workbook only as a mockup on an orange background ⚠️ need a flat cover |
| Real brand palette (derived) | Recurring colors across merch, covers, and portraits: **burnt orange, hunter green, metallic gold, black**, warm skin and foliage tones |

## 9. SEO

- **No meta descriptions** on any page. og:image is set only on product pages. The homepage og:image is the yellow logo.
- Garbage descriptions are indexed from demo pages ("Adversary helps tell your story…").
- Page titles are wrong in places: "Copy of Purchase Book", "Prophetic Training" (workbook).
- Heading structure is broken: every page has an empty `<h1>` (logo), and product pages repeat the title in 3 `<h1>`s.
- Image alt text is mostly filenames (`2020 Natalie-28.jpg`, `book cover.png`).
- URLs are inconsistent: `/store-1`, `/war-in-the-wait-1` vs `-2`, `/guide`, `/training`, `/prophetic-purity`, `/book`.
- The sitemap advertises 4 template-demo pages and 3 stale product pages.
- No structured data beyond Squarespace defaults.

## 10. Social & Links

| Link | Status |
|---|---|
| `instagram.com/natalieflemons` | ✅ resolves |
| `facebook.com/10205043747588759` | ⚠️ numeric personal-profile ID. Facebook returned 400 to automated check, so it's unverified. Ask whether there's a ministry Page |
| Other socials (YouTube, TikTok, etc.) | None listed ⚠️ |

## 11. Broken / Inconsistent Summary

1. LEAP fee links → 404 (`/war-in-the-wait-1/application-fee`, `/mentorship-registration-fee`).
2. Demo pages link to 404s (`/mixes-adversary`, `/schedule-adversary`). Vanguard "Watch Video" → `#`.
3. Newsletter block likely has no storage configured.
4. No privacy policy or terms, even though the site collects payments and personal data.
5. War in the Wait is split across 2 pages, and its product page has no description.
6. Expired 2019/2020 offers (LEAP, Destiny Decisions) are still public, and Destiny Decisions is still purchasable.
7. Merch has no descriptions and the images don't match the products. T-shirt stock is mostly sold out.
8. Homepage has no introductory copy and doesn't show the books catalog, booking, giving, or newsletter.

## 12. Asset Inventory (source URLs, for migration only. Not for hotlinking)

Base: `https://images.squarespace-cdn.com/content/v1/564cb174e4b0a20fb219c73b/`

| Asset | Path | Size available |
|---|---|---|
| Logo | `7250b4e9-…/NF+Logopng.png` | 500×500 |
| Portrait (about) | `df5bd77d-…/DSC00295.jpg` | original TBD |
| Portrait (home) | `1594941885096-SSSD77IGIZUHRCIXY7ZF/2020+Natalie-28.jpg` | original TBD |
| Promo graphic | `1594947694475-C6FLJ0UTJ85HEB41XLOQ/MidW1.jpg` | — |
| RTB cover | `bf2f9634-…/RTB+Front+Cover.jpg` | — |
| Workbook mockup | `5f56913e-…/Natalie+flemons+book+mock.jpg` | — |
| Midwife cover | `1594907433623-0VMV7FL42QUU6597S1CV/Midwife+front+cover.JPG` | — |
| War in the Wait cover | `1514429041087-29XC9PY1FK05HNM367LL/book+cover.png` | — |
| Chaos to the Call cover | `1447869171419-IH9FBO8D649MLUKLGUYL/image-asset.jpeg` | 432×648 (low-res) |
| Hoodie photo | `7b160ea2-…/565330161_…_n.jpg` | Facebook-sourced, low quality |
| T-shirt mockup | `243a9d3b-…/Pray+Custom+Print.png` | — |

**Requested from the ministry:** original-resolution portraits (and photographer usage rights), vector logo, print-ready flat covers (especially the Workbook), clean per-color merch photos, and any newer photography.
