# M3-G — CINEMATIC HERO & MINISTRY PILLAR ANIMATIONS

## Objective

Implement the approved homepage motion design for Natalie Flemons Ministries.

This work extends the existing M3 Visual Design Refinement phase. It does not replace or supersede the current architecture, branding, content, or layout requirements.

**Approved motion direction: Cinematic Hero + Animated Ministry Pillars.**

All animations must enhance the existing editorial design rather than distract from its message.

## 1. Cinematic Hero Animation

Implement a coordinated entrance sequence when the homepage initially loads.

### Animation sequence

1. The hero headline appears with a subtle upward fade.
2. Natalie's authentic portrait enters with a soft fade and slight horizontal movement.
3. Supporting text appears.
4. Primary and secondary CTA buttons enter sequentially.
5. An optional thin copper accent line draws into view, provided it complements the approved layout.

Target approximately 1.2–1.8 seconds for the complete sequence.

### Critical requirement

**Once the entrance animation finishes, the entire hero must remain stationary.**

Do not introduce:

- Continuously moving backgrounds
- Ambient pulsing light or glow
- Floating particles
- Infinite text animation
- Repeated portrait motion
- Automatic animation loops
- Excessive parallax
- Continuous zoom effects

The final state must be a stable, elegant editorial composition.

Do not alter the approved hero copy or select a new headline without owner approval.

## 2. EQUIP, RESTORE, ACTIVATE Animations

Enhance the existing M2 CoreValues component.

Preserve all official ministry descriptions and the Ministry Statement.

### EQUIP

Symbol: Open book.

Animation: Fine copper or cream SVG strokes progressively draw an open-book illustration.

Meaning: Understanding, spiritual discernment, and maturity.

### RESTORE

Symbol: Growing botanical branch.

Animation: A delicate line grows upward while two or three leaves unfold.

Meaning: Renewal, purity, integrity, and faithful stewardship.

### ACTIVATE

Symbol: Expanding pathways.

Animation: Three thin paths extend outward from a central origin.

Meaning: Purpose, spiritual empowerment, and movement into one's calling.

### Card entrance

When the three-pillar section becomes visible:

1. EQUIP enters.
2. RESTORE enters shortly afterward.
3. ACTIVATE enters last.

Each illustration animates as its associated pillar becomes visible.

Target approximately 1.5–2 seconds for the complete coordinated sequence.

Animations should activate once when the section first enters the viewport.

After completion, the cards and illustrations must remain in their fully rendered state.

Do not continuously repeat the animation as users scroll.

## 3. Technical Implementation

Prefer:

- CSS transitions and keyframes
- Inline SVG or approved reusable SVG components
- IntersectionObserver for scroll-triggered behavior

Reuse existing application dependencies when suitable.

Do not introduce Motion, GSAP, Lottie, Rive, or another animation dependency without first demonstrating a specific need and requesting approval.

Avoid unnecessary client-side JavaScript.

Animate opacity and transform where possible.

Avoid layout-affecting animations that cause cumulative layout shift.

Ensure content remains accessible and visible when JavaScript is disabled or animation initialization fails.

## 4. Accessibility

Respect `prefers-reduced-motion: reduce`.

Under reduced-motion preferences:

- Disable entrance movement.
- Display headings, images, descriptions, and CTAs immediately.
- Display completed SVG illustrations.
- Preserve all functional interactions.

Do not make important information available only through animation.

Animations must not trap keyboard focus or interfere with screen readers.

## 5. Responsive Design

Validate the animation experience at:

320px, 375px, 390px, 768px, 1024px, and 1440px.

Ensure:

- No horizontal overflow
- No clipped headings
- No distorted portraits
- No animation-induced layout shifts
- Correct stacking of ministry cards
- Proper SVG scaling
- Fully visible CTA buttons

Use the existing responsive architecture.

## 6. Performance Requirements

Animations must not significantly degrade initial page loading or Core Web Vitals.

Keep SVG assets lightweight.

Do not delay the display of essential homepage information unnecessarily.

Do not allow hero entrance effects to create persistent invisible content or large layout shifts.

## 7. Testing

Add focused tests or visual verification covering:

- Hero entrance completion
- Stable final hero state
- Pillar sequence completion
- No unintended continuous looping
- Reduced-motion behavior
- Mobile rendering
- Existing navigation and CTA functionality

Preserve M1 and M2 regression tests.

## 8. Implementation Order

Update the M3 execution sequence as follows:

M3-A — Baseline Visual Audit

M3-B — Global Design System

M3-C — Homepage Visual Refinement

M3-D — Interior Page Refinement

M3-E — Responsive and Accessibility Refinement

**M3-G — Cinematic Hero & Animated Ministry Pillars**

M3-F — Final Visual Acceptance, Regression Testing, and Reporting

M3-G should begin only after the static homepage layout is stable.

## 9. Reporting

Include M3-G results in the existing:

`PHASE-M3-VISUAL-REFINEMENT-REPORT.md`

Document:

- Components modified
- Animations implemented
- Trigger and completion behavior
- Reduced-motion support
- Responsive testing
- Performance observations
- Any new dependencies
- Outstanding visual issues

Do not create a separate governance framework or restart previous milestones.

## Final Acceptance

The hero should make a memorable first impression, then become completely still.

The three ministry pillars should appear through a coordinated sequence of meaningful SVG illustrations.

The finished experience must remain elegant, accessible, responsive, and faithful to the approved Natalie Flemons Ministries design.
