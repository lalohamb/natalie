# AMAZON Q — NATALIE FLEMONS MINISTRIES
# M3-I: APPROVED MOCKUP FIDELITY & VISUAL ACCEPTANCE

## OBJECTIVE

Bring the existing Next.js 16 website into close visual alignment with the previously approved Natalie Flemons Ministries multi-page mockup.

This is a visual fidelity implementation and verification milestone.

It is not an architecture rebuild, content rewrite, or M4 integration phase.

## 1. AUTHORITATIVE REFERENCES

First read the current governance documentation following M3-H synchronization.

Locate the approved design reference, previously identified as:

`public/Natalie Flemons Ministry Website Mockup.png`

Verify the file exists and inspect the actual image.

If the approved mockup is unavailable, stop and request its location.

Do not substitute a newly generated design or assume its appearance from descriptions alone.

The approved mockup is authoritative for visual direction, subject to subsequent owner-approved content changes.

## 2. VISUAL FIDELITY REQUIREMENT

The existing website must closely match the approved mockup in:

- Page composition
- Section proportions and order
- Content container widths
- Typography and heading hierarchy
- Spacing and alignment
- Color distribution
- Image placement
- Card and grid structures
- Buttons and CTA treatments
- Section transitions
- Footer presentation

Do not treat merely similar colors or fonts as sufficient evidence of visual fidelity.

Do not redesign sections according to independent creative preferences where the approved reference already defines their composition.

## 3. APPROVED CONTENT OVERRIDES

Preserve these later-approved decisions:

### Hero

"Shaping Destinies. Advancing the Kingdom."

Do not revert to the previous "The Midwife to Your Destiny" hero headline.

### Ministry framework

EQUIP

RESTORE

ACTIVATE

Prayer, Prophecy, and Purpose remain supporting ministry subjects.

### Biography

Use the approved 2026 Natalie C. Flemons biography.

### Navigation

Primary:

About · Ministry · Books · Events · Media

Secondary/footer:

Store · Partnerships · Contact

### Motion

Preserve the final M3-Corrective animations:

- Single cinematic hero entrance
- No continuous Ken Burns movement
- Animated EQUIP open-book symbol
- Animated RESTORE botanical branch
- Animated ACTIVATE pathways
- Reduced-motion support

## 4. BASELINE SCREENSHOT CAPTURE

Start the actual application locally.

Use Playwright or another available browser automation tool to capture screenshots for:

- Homepage
- About
- Ministry
- Books
- Events
- Media
- Store

Capture desktop screenshots at 1440px width.

Capture mobile screenshots at 390px width.

Also inspect 320px, 768px, and 1024px layouts.

Use the post-animation stable state when capturing screenshots, and verify that the animations complete properly.

Save screenshots under:

`docs/reports/assets/m3-i/before/`

Use the established project artifact location if it differs.

## 5. DESIGN COMPARISON MATRIX

For each page, compare the actual rendered output with the corresponding approved mockup panel.

Identify differences in:

1. Hero and top-section composition
2. Section ordering
3. Image positioning
4. Typography and headline wrapping
5. Background colors
6. Padding and whitespace
7. Grid layout
8. Card proportions
9. Buttons and CTA placement
10. Footer presentation

Classify discrepancies:

CRITICAL — Major section missing, wrong layout, or broken visual composition.

HIGH — Significant differences in layout, proportions, imagery, or hierarchy.

MEDIUM — Noticeable spacing, styling, or typography differences.

LOW — Minor decorative or alignment differences.

Prepare a page-by-page discrepancy matrix before implementation.

## 6. VISUAL CORRECTION

Correct confirmed discrepancies in the existing application.

Prioritize:

1. Homepage
2. Ministry
3. About
4. Books
5. Events
6. Media
7. Store
8. Shared header and footer

Use existing components and design tokens wherever practical.

Do not introduce a second competing design system.

Do not remove functional sections solely to make the page shorter.

Do not fabricate real-world content to match the conceptual mockup.

Do not substitute AI-generated representations of Natalie for approved photographs.

Retain legitimate differences where the mockup includes fictional events, missing assets, or content superseded by owner-approved decisions.

## 7. RESPONSIVE DESIGN

The approved mockup defines the desktop visual target.

Develop corresponding tablet and mobile compositions consistent with that target.

Verify:

- No horizontal overflow
- Readable typography
- Appropriate image crops
- Working navigation
- Correct responsive grids
- Accessible controls
- No clipped headings
- No excessive blank regions
- No content hidden by animation

## 8. ITERATIVE VISUAL VALIDATION

After each page is refined:

1. Build or run the updated application.
2. Capture a new screenshot.
3. Compare it with the approved mockup.
4. Identify remaining high-impact differences.
5. Correct discrepancies.
6. Repeat until the visual acceptance criteria are satisfied.

Do not declare visual fidelity solely from source-code inspection.

Where feasible, produce side-by-side comparison images showing:

Approved Mockup | Current Implementation

For mobile, compare the implementation against a responsive interpretation of the approved design rather than claiming exact pixel equality with a desktop-only reference.

## 9. PRESERVE APPLICATION GOVERNANCE

Maintain:

- Existing route architecture
- `src/lib/content.ts` content-access boundary
- M2 ministry identity
- 2026 biography
- Book data
- Events data model
- Media data model
- Store separation
- Existing redirects
- Contact and newsletter failure rules
- Accessibility and motion requirements

Do not implement M4 commerce, email, or analytics integrations.

## 10. FINAL VALIDATION

Execute applicable project checks:

- TypeScript
- Lint
- Production build
- Playwright regression suite
- Accessibility verification
- Responsive browser review
- Visual comparison

Do not disable failing tests to obtain a passing result.

Distinguish visual acceptance from functional test success.

## 11. GOVERNED REPORT

Create:

`docs/reports/PHASE-M3-I-VISUAL-FIDELITY-ACCEPTANCE.md`

Include:

- Pages reviewed
- Reference mockup location
- Baseline screenshots
- Visual discrepancies
- Corrections implemented
- Before-and-after screenshots
- Remaining differences
- Responsive verification
- Accessibility results
- Build and test results
- Files modified
- Missing authentic assets
- Owner acceptance status

Update `REPORT-INDEX.md`.

## 12. OWNER ACCEPTANCE GATE

Do not automatically mark M3-I as Product Owner accepted.

Implementation completion does not constitute owner acceptance.

At the end, present the finished page screenshots for owner review.

Record:

Implementation: COMPLETE or IN PROGRESS

Verification: PASS / PARTIAL / FAIL

Owner Acceptance: PENDING

Closure: OPEN

Only update acceptance to ACCEPTED and closure to CLOSED following explicit owner approval.

## FINAL DIRECTIVE

Begin by inspecting the actual approved mockup and current rendered website.

Perform a page-by-page visual comparison.

Implement the necessary corrections to bring the application into close alignment with the reference.

Preserve all approved functional architecture and content.

Capture final screenshots and provide an evidence-based visual fidelity report.

Do not begin M4 until the owner has reviewed the completed visual implementation.

**Success means the website visibly matches the approved design—not merely that the code builds and the pages render.**