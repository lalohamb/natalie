# AMAZON Q — NATALIE FLEMONS MINISTRIES
# PHASE M3: VISUAL DESIGN REFINEMENT & RESPONSIVE IMPLEMENTATION

## ROLE

Act as a Senior Next.js Architect, Principal Frontend Engineer, Senior UI/UX Designer, Responsive Design Specialist, Accessibility Engineer, and Quality Assurance Lead.

You are refining the existing Natalie Flemons Ministries application.

Your assignment is to bring the implemented website into close visual alignment with the previously approved Natalie Flemons multi-page design mockup.

**M3 is a visual implementation phase. It is not a content migration, infrastructure migration, or application rebuild.**

The M1 and M2 functionality must remain intact.

---

# 1. PROJECT STATUS AND GOVERNANCE

## Completed milestones

M1 established:

- Primary and secondary navigation
- Home, About, Ministry, Books, Events, Media, and Store routes
- Book detail and event detail routes
- Partnerships, Contact, and supporting pages
- Content accessor architecture
- Facebook media presentation
- 2027 events calendar structure
- Existing Playwright testing infrastructure

M2 established:

- Official ministry identity
- EQUIP, RESTORE, ACTIVATE content model
- Updated 2026 biography
- Reusable CoreValues component
- Updated Ministry and About pages
- Updated homepage content hierarchy
- Ministry identity regression tests

These are reported completed milestones. Verify the actual repository state before relying on them.

## Mandatory governance

Read the existing project governance documents, especially:

`docs/CURRENT-ARCHITECTURE-CONTRACT.md`

Also review, where available:

- BUSINESS-CHARTER.md
- PRODUCT-REQUIREMENTS.md
- DOMAIN-MODEL.md
- KNOWN-GAPS.md
- TEST-STRATEGY.md
- Existing M1 and M2 reports

Follow the established project report naming and location conventions.

Do not recreate governance documents unnecessarily.

## Architectural constraints

Preserve the existing content access boundary:

`src/lib/content.ts`

Do not introduce direct content-module imports into page or presentation components if the architecture contract prohibits them.

Preserve existing Next.js routing, redirect behavior, server components, client components, and API contracts.

Do not replace Tailwind, CSS modules, or another established styling framework merely for visual convenience.

Avoid unnecessary dependencies.

---

# 2. PRIMARY VISUAL REFERENCE

The approved Natalie Flemons multi-page visual mockup is the principal visual reference.

Locate the approved mockup in the repository or an accessible project design directory.

If it is not accessible, request the file path before claiming reference-based visual fidelity.

The reference presents:

- A prominent editorial homepage
- Large portrait-led hero composition
- Warm neutral color palette
- Elegant serif headings
- Copper accent buttons
- Forest-green ministry and events sections
- Structured About and My Story presentation
- A refined Books catalog
- A 2027 Events schedule
- Curated ministry video gallery
- Compact, organized footer
- Store accessible through the footer

## Design interpretation

The mockup is an approved visual direction, not an authoritative source of factual content.

Do not reproduce:

- Fictional event dates or locations
- Invented book covers
- Unverified prices
- Placeholder biographies or testimonials
- Artificial ministry credentials
- AI-generated representations of Natalie in place of authentic approved portraits

Use the actual project content and approved assets.

The original mockup was created before the final M2 ministry framework was approved.

Therefore, where the mockup shows Prayer, Prophecy, and Purpose as the primary values, adapt that composition to the current approved EQUIP, RESTORE, ACTIVATE framework.

Preserve Prayer, Prophecy, and Purpose as supporting ministry content.

---

# 3. M3 BASELINE VISUAL AUDIT

Before changing code, inspect the current rendered application.

## Audit requirements

Determine:

1. Existing layout components and style definitions.
2. Current font families and typography scale.
3. Container widths and responsive breakpoints.
4. Hero layout and image handling.
5. Main navigation and mobile menu behavior.
6. Existing CoreValues component design.
7. About page structure and biography image placement.
8. Books catalog layout.
9. Events calendar presentation.
10. Media gallery behavior.
11. Footer spacing and layout.
12. Any visible blank or incorrectly sized sections.
13. Whether available image assets load correctly.
14. Existing accessibility and responsive defects.

## Baseline browser review

If Playwright or another browser tool is available, capture the current rendered pages at:

- 1440px desktop
- 1024px laptop/tablet landscape
- 768px tablet
- 390px mobile
- 320px narrow mobile

Use consistent viewport heights for comparable screenshots.

Capture representative full-page screenshots.

Inspect actual browser rendering rather than inferring all layout problems from source code.

If browser access is unavailable, document that limitation.

## Required baseline report

Create:

`docs/reports/PHASE-M3-VISUAL-BASELINE.md`

Or use the established reports location if different.

Include:

- Existing design state
- Differences from the approved mockup
- Component reuse opportunities
- Visual defects
- Responsive defects
- Proposed improvements
- Missing image assets
- Owner decisions requiring approval

Do not stop after writing this report unless a material blocker or approval-required decision is discovered.

Proceed with safe, authorized visual refinements.

---

# 4. GLOBAL DESIGN SYSTEM

Refine the existing visual system without replacing the ministry's visual identity.

## Color palette

Preserve the approved:

- Warm cream
- Sand/beige
- Copper/rust
- Forest green
- Dark espresso

Suggested reference values only:

Cream: #FAF6EF
Sand: #F1E9DC
Espresso: #2A211C
Forest: #2F4A3A
Copper: #A84A23

Use the application's established design tokens wherever feasible.

Do not introduce duplicate or conflicting color definitions.

Verify foreground/background contrast before using a color combination.

## Typography

Preserve an elegant editorial serif for major headings.

Use the established readable sans-serif for:

- Navigation
- Body paragraphs
- Buttons
- Form controls
- Labels
- Metadata

Suggested desktop typography:

Hero: 64–88px
Major section headings: 40–56px
Secondary headings: 28–40px
Body: 17–18px

Suggested mobile typography:

Hero: 40–52px
Major section headings: 30–38px
Secondary headings: 24–30px
Body: 16–17px

Treat these as design targets, not mandatory fixed values.

Use fluid sizing where appropriate.

## Layout system

Standardize:

- Main content container widths
- Horizontal gutters
- Section padding
- Grid gaps
- Vertical rhythm
- Button dimensions
- Card padding
- Image frames
- Section headings
- Eyebrow labels

Suggested maximum content width:

1200–1280px

Use wider editorial layouts selectively where justified by the reference.

Avoid unnecessarily fixed-height sections and empty spacing elements.

Do not introduce arbitrary margins to imitate a screenshot.

## Shared visual primitives

Reuse or refine existing:

- Section containers
- Heading styles
- Button variants
- Link treatments
- Cards
- Image wrappers
- Decorative rules
- CTA sections

Introduce new reusable primitives only when multiple sections would benefit.

Avoid abstraction for its own sake.

---

# 5. HEADER AND NAVIGATION

Match the mockup's refined editorial header.

## Existing navigation policy

Primary:

About
Ministry
Books
Events
Media

Secondary:

Store
Partnerships
Contact

Maintain this approved information architecture.

Store must remain footer-accessible rather than becoming a primary navigation item.

## Desktop behavior

Refine:

- Logo and brand positioning
- Navigation spacing
- Header height
- Contact action where already supported
- Active route treatment
- Hover and focus states

Avoid crowding.

## Mobile behavior

Provide:

- Accessible menu control
- Correct menu opening/closing
- Keyboard support
- Visible focus indicators
- Functional navigation destinations
- Appropriate touch targets

Prevent menu overlays from obscuring content or becoming inaccessible.

Do not add decorative menu controls without working interactions.

---

# 6. HOMEPAGE HERO REFINEMENT

The hero is a critical visual acceptance item.

## Target composition

Desktop:

Two-column editorial layout.

Left:

- Eyebrow label
- Large headline
- Short supporting message
- Primary and secondary actions

Right:

- Approved Natalie portrait
- Intentional image crop
- Refined image framing

The text and photograph must form a balanced composition comparable to the approved mockup.

Mobile:

- Readable headline
- Proper supporting text wrapping
- Accessible actions
- Portrait displayed without destructive cropping
- No horizontal overflow

## Hero headline decision

The existing M2 implementation retained:

"The Midwife to Your Destiny"

The owner has considered replacing this headline but has not finalized the replacement.

Do not independently introduce a new hero headline.

Preserve the currently approved content until the owner confirms a replacement.

Design the component to accommodate future headline changes without structural modifications.

Do not hard-code line breaks that only work for one possible headline.

## Hero CTAs

Preserve approved working destinations.

Maintain a clear hierarchy between primary and secondary actions.

Do not create links to nonexistent pages.

---

# 7. HOMEPAGE CORE VALUES PRESENTATION

The official ministry pillars are:

EQUIP
RESTORE
ACTIVATE

Use the existing M2 content records and accessor.

Do not duplicate the official values directly in JSX.

## Target presentation

Create or refine a visually prominent three-pillar composition.

Each pillar displays:

- Pillar name
- Official tagline
- Official description

Approved content:

EQUIP

Hear Clearly. Stand Firm. Walk Boldly.

Equipping believers to discern the voice of God, develop spiritual maturity, and walk confidently in their Kingdom assignment.

RESTORE

Purity in Character. Integrity in Calling. Excellence in Stewardship.

Calling believers back to holiness, sound doctrine, and faithful stewardship of the gifts, callings and responsibilities entrusted to them.

ACTIVATE

Awaken Purpose. Empowered for Impact. Positioned for Destiny.

Activating believers to overcome spiritual barriers, embrace their God-given identity, and fulfill their divine purpose.

## Presentation requirements

Desktop:

Three balanced cards or columns, with consistent hierarchy.

Tablet:

Responsive grid based on available width.

Mobile:

Readable vertically stacked sections.

Preserve the official Ministry Statement already stored in the M2 content module.

Avoid repeating it unnecessarily on the same page.

Maintain strong readability, consistent spacing, and appropriate contrast.

Use the mockup's premium editorial direction rather than generic corporate dashboard components.

---

# 8. ABOUT PAGE VISUAL REFINEMENT

Retain the six-section biography structure established in M2.

Use the existing verified 2026 biography data.

## Target layout

Refine the page to include:

- Prominent editorial introduction
- Approved portrait imagery
- Professional biography sections
- Ministry journey presentation
- Church leadership and service
- Faith in the marketplace
- Personal testimony where approved
- My Story entry point

## Design requirements

Use alternating image-and-text compositions where appropriate.

Provide readable paragraph widths.

Avoid presenting the biography as one uninterrupted block of text.

Preserve factual content.

Use selected pull quotes only when the exact quotations are sourced and approved.

Do not invent direct quotes from narrative prose.

Do not publish unapproved autobiography material.

## Existing visual defect

The earlier design screenshot showed a large empty beige media region.

Inspect whether a similar issue remains in the current application.

Fix the actual root cause if present.

Do not replace a missing portrait with unrelated stock photography.

---

# 9. MINISTRY PAGE VISUAL REFINEMENT

Preserve the M2 ministry structure and official framework.

## Required hierarchy

1. Ministry introduction
2. Official Ministry Statement
3. EQUIP, RESTORE, ACTIVATE
4. Prayer, Prophecy, Purpose as supporting subjects
5. Ministry history and calling
6. Speaking or ministry engagement action

Retain approved content even if its current grouping differs slightly.

Do not introduce contradictory ministry classifications.

## Visual presentation

Use the approved dark espresso, forest-green, cream, and copper design language.

Make the three primary pillars visually prominent.

Distinguish supporting ministry subjects through a secondary visual treatment.

Avoid creating two equally prominent competing three-column pillar systems.

Use the existing imagery and approved content.

---

# 10. BOOKS PAGE REFINEMENT

Preserve:

`/books`

and

`/books/[slug]`

## Catalog presentation

Match the mockup's curated editorial publications design.

Refine:

- Featured publication treatment
- Book-cover sizes
- Cover image framing
- Title typography
- Description spacing
- Publication-status display
- CTA placement
- Responsive product grids

Ensure book covers remain fully recognizable.

Avoid inconsistent cropping of cover artwork.

## Book detail pages

Provide visual consistency across titles.

Preserve accurate:

- Titles
- Synopses
- Publication states
- Prices
- Valid purchase destinations

The existing project may contain unresolved placeholder data for *From the Chaos to the Call*.

Do not treat placeholder artwork or the generic Amazon homepage as a verified product destination.

Report these items as production blockers.

Do not invent book artwork or sales links.

---

# 11. EVENTS PAGE REFINEMENT

Preserve:

`/events`

and

`/events/[slug]`

## Visual objective

Reproduce the reference's refined annual events experience while retaining the actual approved data model.

The year 2027 remains the current schedule focus.

## Events layout

Include:

- Editorial events header
- 2027 year heading
- Accessible month navigation
- Twelve-month calendar/list experience
- Event cards for actual records
- Neutral empty states
- Invitation-to-speak section

No events may be fabricated to match the mockup.

## Responsive requirements

Desktop:

Organized monthly grid or navigation.

Mobile:

Simplified stacked monthly cards or accessible month navigation.

Avoid tiny calendar text.

The public interface must remain useful when no events have been entered.

## Invitation section

Preserve a prominent:

"Invite Natalie"

CTA.

Use the approved forest-green treatment.

Do not invent booking availability, event venues, or schedule details.

---

# 12. MEDIA PAGE REFINEMENT

Preserve the existing curated Facebook media architecture.

## Target layout

Create a professional editorial media gallery containing:

- Media page hero
- Featured video
- Category navigation
- Video cards
- Clear titles
- Watch actions
- Responsive media grid

Use the actual stored video records.

The previously supplied Facebook Reel:

"When God Had to Interrupt Me"

must retain a working external viewing option.

Do not force iframe embedding for unsupported Reel formats.

## Visual requirements

- Consistent 16:9 media frames where appropriate
- Clearly visible play affordances
- Proper loading states
- Fallback preview states
- No layout shifts from unavailable media
- Accessible video titles and links

Do not fabricate video thumbnails or additional ministry recordings.

Preserve M2 content and allow for future EQUIP, RESTORE, ACTIVATE classification without requiring it now.

---

# 13. STORE AND SECONDARY PAGES

Preserve the Store as a secondary destination.

## Store

Refine:

- Product presentation
- Product image framing
- Color and size information
- Pricing presentation
- Purchase CTA layout
- Responsive product cards

Do not build or modify checkout functionality as part of M3.

Do not fabricate merchandise photography or inventory.

## Partnerships

Maintain an editorial design consistent with the main site.

Preserve approved giving and partnership information.

Do not alter payment destinations.

## Contact

Refine the existing form's visual presentation.

Preserve actual validation and error-handling behavior.

If the email provider remains unconfigured, maintain an honest unavailable state.

Never display a false submission success message.

## Privacy and Terms

Improve layout readability if appropriate.

Do not fabricate legal text.

Unapproved legal content must remain clearly identified as incomplete.

---

# 14. FOOTER REFINEMENT

The footer should be professional, compact, and visually organized.

## Requirements

Preserve:

- Brand identity
- Primary navigation links
- Secondary links
- Store
- Partnerships
- Contact
- Approved social destinations
- Existing legal links

Use balanced desktop columns and a readable mobile arrangement.

Review excessive vertical whitespace.

Do not remove intentional design elements without assessing their purpose.

Do not generate social links for unverified accounts.

---

# 15. IMAGES AND MEDIA PERFORMANCE

Inspect all existing image assets.

Use appropriate Next.js image optimization.

Requirements:

- Correct aspect ratios
- Responsive sizing
- Reserved image dimensions
- No distorted portraits
- No clipped book covers
- Appropriate lazy loading
- Correct LCP image loading strategy
- Accessible alternative text
- Minimal layout shift

Do not replace authentic photographs merely to match colors in the AI mockup.

Use approved assets first.

Document missing assets.

---

# 16. RESPONSIVE DESIGN VERIFICATION

Test at:

320px
375px
390px
768px
1024px
1440px

Verify every major public route.

At each viewport, inspect:

- Navigation
- Headline wrapping
- Paragraph readability
- Card stacking
- Image presentation
- Grid transitions
- CTA visibility
- Form usability
- Footer layout
- Horizontal overflow
- Excessive whitespace
- Media embed behavior

Resolve actual rendering defects.

Do not merely confirm that responsive classes exist in the source code.

---

# 17. ACCESSIBILITY AND PERFORMANCE

Target WCAG 2.2 AA.

Check:

- Semantic heading hierarchy
- Navigation landmarks
- Skip navigation
- Keyboard operation
- Focus indicators
- Menu behavior
- Form labels
- Contrast
- Tap targets
- Image alternatives
- Reduced-motion preferences
- Link purpose
- Responsive text resizing

Protect existing performance.

Target good Core Web Vitals where measurable:

LCP ≤ 2.5 seconds

CLS ≤ 0.1

INP ≤ 200 milliseconds

Report measurements only when actual measurements have been taken.

Do not add unnecessary animation libraries or heavy client-side components solely for cosmetic improvements.

---

# 18. VISUAL COMPARISON AND ACCEPTANCE

After implementation, compare the rendered application to the approved mockup.

Review:

- Homepage
- About
- Ministry
- Books
- Events
- Media
- Store
- Footer

For each applicable page, assess:

1. Overall composition
2. Visual hierarchy
3. Typography
4. Spacing
5. Colors
6. Image placement
7. CTA treatment
8. Responsive presentation
9. Content fidelity

The goal is close design fidelity, not forced pixel equality to conceptual artwork.

A faithful implementation may legitimately differ where the reference contains fictional information, unavailable photographs, incomplete content, or a layout unsuitable for accessible responsive use.

Capture actual before-and-after screenshots where browser tooling is available.

Store screenshots in a predictable project directory, such as:

`docs/reports/assets/m3/`

Use the project's established artifact directory if one already exists.

---

# 19. REGRESSION TESTING

Before implementing visual changes, run or inspect the existing baseline test results.

After each major group of changes, perform appropriate targeted checks.

At the end of M3, run the full production build and test suite.

Use the project's established Node.js environment.

Previously documented environment:

```bash
nvm use 20.18.3
```

Full verification:

```bash
npm run build && npm test
```

Port 3000 must be available if the existing Playwright configuration requires it.

## Required checks

- TypeScript
- Lint
- Production build
- Existing M1/M2 regression tests
- Ministry identity tests
- Navigation tests
- Contact-form tests
- Newsletter tests
- Accessibility tests
- Responsive visual checks

Preserve existing tests.

Do not remove assertions or convert failures into skips merely to produce passing results.

Document any intentionally skipped tests and the reason.

A test passing does not automatically establish visual fidelity.

---

# 20. IMPLEMENTATION SEQUENCE

Execute in controlled stages.

## M3-A — Baseline Audit

Inspect the existing rendered application and document visual differences.

## M3-B — Global Design System

Refine typography, spacing, containers, buttons, and shared primitives.

## M3-C — Homepage Refinement

Implement the hero, biography preview, core values, media, publications, events, and footer composition.

## M3-D — Interior Page Refinement

Refine About, Ministry, Books, Events, Media, Store, and supporting pages.

## M3-E — Responsive and Accessibility

Validate actual rendering and correct visual defects.

## M3-F — Visual Acceptance and Regression

Compare browser screenshots with the approved mockup.

Execute the production build and available tests.

Generate the final M3 report.

Proceed through these stages without requesting approval for every minor CSS refinement.

Request approval only when changes require new content, unapproved image assets, a changed brand identity, major architecture changes, or new external integrations.

---

# 21. REPORTING REQUIREMENTS

Create the final report:

`docs/reports/PHASE-M3-VISUAL-REFINEMENT-REPORT.md`

Or use the established reporting convention.

Include:

1. Executive summary
2. Baseline findings
3. Visual design goals
4. Shared style changes
5. Homepage refinements
6. Interior page refinements
7. Core values presentation
8. Responsive testing
9. Accessibility results
10. Performance findings
11. Before-and-after screenshot references
12. Modified file inventory
13. Build and test results
14. Remaining visual discrepancies
15. Missing content or assets
16. Outstanding owner decisions
17. Production-readiness recommendations

Update the governed report index.

Do not leave the report only in the coding assistant's chat response.

The final report must exist as an actual Markdown file in the project.

---

# 22. FINAL ACCEPTANCE CRITERIA

M3 is complete when:

- The website closely reflects the approved visual design.
- EQUIP, RESTORE, ACTIVATE remain the primary ministry pillars.
- The 2026 biography remains intact.
- The homepage has a polished editorial hero.
- The About and Ministry pages display professional layouts.
- Book covers and publication content are presented consistently.
- The 2027 Events interface is visually refined.
- The Media page presents curated Facebook content professionally.
- Store remains a secondary footer destination.
- Responsive layouts have been validated.
- Accessibility regressions have been addressed.
- Existing functionality remains intact.
- The production build succeeds.
- Available regression tests have been executed and results documented.
- The M3 report and visual evidence are saved.

Do not claim M3 is complete when only the homepage has been styled.

---

# FINAL EXECUTION INSTRUCTION

Begin with the current application and established governance documents.

Locate and inspect the approved multi-page visual mockup.

Perform the baseline audit, then proceed through M3-A to M3-F.

Do not rebuild the application or modify approved ministry content.

Preserve M1 and M2 functionality, including content accessors, routes, ministry identity, book records, 2027 event structure, and Facebook media records.

Use actual browser rendering to validate the results.

Produce a complete governed M3 report.

**The objective is a visually cohesive, responsive, accessible, and professionally refined Natalie Flemons Ministries website that closely reflects the approved mockup while preserving the application's verified content and working architecture.**