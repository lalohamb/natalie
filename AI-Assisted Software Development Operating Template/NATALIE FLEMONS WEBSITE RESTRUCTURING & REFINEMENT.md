# AMAZON Q — NATALIE FLEMONS WEBSITE RESTRUCTURING & REFINEMENT

## PROJECT OBJECTIVE

Act as a Senior Next.js Architect, UI/UX Designer, Content Architect, Accessibility Specialist, and Full-Stack Engineer.

Your assignment is to restructure and refine the existing Natalie Flemons website into a professional ministry-first digital platform.

**Primary positioning:**

Natalie Flemons is a minister, speaker, author, and public personality.

The website must prioritize her mission, personal story, messages, speaking engagements, and publications. Commerce should remain available without dominating the visitor experience.

This is an existing Next.js application. Preserve its approved branding, authentic content, functionality, and architecture wherever practical.

Do not start a new project or replace the existing application without explicit authorization.

## PHASE 1 — REPOSITORY AND ARCHITECTURE AUDIT

Before modifying code:

1. Inspect the full Next.js repository and installed dependencies.
2. Identify existing pages, routes, layouts, components, styling, and media assets.
3. Determine how books, products, navigation, contact information, and booking requests currently function.
4. Review the current design and the large empty media regions identified in the screenshot.
5. Identify existing database, CMS, admin features, and deployment integrations, if any.
6. Determine which requested features can be implemented with the current infrastructure.
7. Identify necessary architectural changes and those requiring owner approval.

Create:

`docs/reports/NATALIE-RESTRUCTURING-BASELINE.md`

Use the existing project reports directory instead if one is established.

Document confirmed findings and technical recommendations.

Do not invent integrations, content, or functionality.

## PHASE 2 — INFORMATION ARCHITECTURE

Create or refine the following public routes:

| Route | Purpose |
|---|---|
| `/` | Editorial ministry-first homepage |
| `/about` | Biography, mission, and personal story |
| `/about/my-story` | Extended autobiography narrative, if appropriate |
| `/ministry` | Ministry focus and foundational teachings |
| `/books` | Published books and literary works |
| `/books/[slug]` | Individual book details |
| `/events` | Annual events schedule and appearances |
| `/events/[slug]` | Individual event details |
| `/media` | Curated video messages and media |
| `/store` | Secondary commercial storefront |
| `/partnerships` | Partnership opportunities |
| `/contact` | General contact and inquiries |

These are target routes, not assertions about existing application files.

Review existing routes before introducing replacements.

Preserve backward compatibility where appropriate through redirects.

### Navigation priorities

Primary navigation:

Home | About | Ministry | Books | Events | Media

Secondary navigation and footer:

Store | Partnerships | Contact | Privacy | Social Media

Keep Store out of the main navigation by default.

Books and Store must not become duplicate representations of one product catalog.

Books should emphasize authored works and their messages.

Store should contain commercial merchandise and other products approved for sale.

Individual book pages may link to approved purchasing destinations.

## PHASE 3 — HOMEPAGE REDESIGN

Restructure the homepage into this sequence:

1. Hero: "The Midwife to Your Destiny"
2. Meet Natalie: biography and introduction
3. Ministry and Calling: Prayer, Prophecy, Purpose
4. Featured Message: curated Facebook video
5. Featured Books: selected publications
6. Upcoming Events: next confirmed appearances
7. Invite Natalie: speaking/ministry inquiry
8. Partnership: supporting the mission
9. Footer: navigation, Store, contact, social links

Maintain the existing cream, sand, copper, forest-green, and espresso visual language.

Preserve the current editorial and sophisticated typographic identity.

Remove excessive whitespace and correct unresolved images or unnecessary placeholders.

Do not insert fabricated content to fill space.

## PHASE 4 — BOOKS AND STORE SEPARATION

### Books page

Develop an editorial publications catalog with:

- Book cover
- Title
- Subtitle, where applicable
- Verified synopsis
- Author statement, where available
- Publication status
- Optional excerpt
- Related publications
- Approved purchase links

Preserve existing book data and commercial links.

Create reusable book detail pages using the architecture already available.

Support published, forthcoming, and unavailable states without inventing availability or release dates.

### Store page

Create a separate store route if the existing application already supports the necessary commerce capabilities.

If no commerce backend exists, implement only an appropriate presentation layer or document the required integration.

Do not fabricate checkout, order processing, inventory tracking, payment handling, or fulfillment capabilities.

Keep the Store accessible primarily through the footer.

Do not make merchandise sales the homepage's principal CTA.

## PHASE 5 — AUTOBIOGRAPHY

Investigate the available autobiography content and its format.

Determine whether it is:

- An existing published autobiography
- An unpublished manuscript
- A long-form personal narrative for the website
- A combination of these

Do not assume its publication status.

If it is a published or forthcoming book, include it in the Books catalog with an appropriate detail page.

If it is narrative content, create a dedicated My Story experience under About.

Design a reusable long-form editorial layout supporting:

- Chapters or sections
- Photography
- Headings and quotations
- Personal milestones
- Carefully selected excerpts
- Internal navigation for long content

Do not automatically publish the entire autobiography, confidential material, or unpublished manuscript.

Require explicit editorial approval for excerpts, chapters, photographs, and promotional descriptions.

## PHASE 6 — EVENTS SYSTEM

Replace the primary Booking navigation item with Events.

Create a professional Events page displaying the annual **2027 schedule**.

### Events display

Provide:

- January–December 2027 month navigation or calendar
- Upcoming events list
- Individual event detail views
- Event categories
- Location and venue information
- Registration links, when applicable
- Clear event status
- Responsive mobile layout

Do not generate fictional events.

Months without published events must display a neutral empty state.

The system should be data-driven and support future years beyond 2027.

### Event content model

Determine whether an existing content management or database solution can support events.

Propose a model containing:

- Unique ID and slug
- Event title
- Description
- Start and end date/time
- Time zone
- Venue
- City and location
- Public or private event classification
- Event category
- Event image
- Registration destination
- Status: draft, scheduled, postponed, cancelled, completed
- Publication state
- Creation and update timestamps

Support updates without requiring source-code modification wherever practical.

Do not introduce a new database or CMS without approval.

### Invitation workflow

Preserve the ability for churches, ministries, organizations, and event coordinators to invite Natalie.

Use a clear **Invite Natalie** CTA on the Events page and relevant supporting pages.

If a functioning inquiry system already exists, integrate with it.

Otherwise, document the required workflow and obtain approval before introducing new third-party services.

Do not claim an inquiry was delivered unless a real submission mechanism exists and succeeds.

## PHASE 7 — FACEBOOK VIDEO AND MEDIA INTEGRATION

Create a `/media` page to showcase approved videos.

The objective is to strengthen Natalie's ministry identity through actual recorded messages and public appearances.

### Media content

Support curated categories such as:

- Ministry messages
- Biblical teachings
- Interviews and conversations
- Personal reflections
- Event highlights

Categories should remain configurable and include only approved content.

### Facebook integration

Investigate currently supported Meta embedding mechanisms.

Implement the simplest reliable method that works within the application's architecture.

Initially favor manually curated public Facebook video URLs.

Support:

- Video title
- Description
- Category
- Public Facebook URL
- Optional approved preview image
- Featured status
- Publication status
- Display order

Validate URLs and never render arbitrary administrator-supplied HTML without appropriate sanitization.

Use supported public embeds where permitted.

Provide a fallback external Facebook link when embedding fails or is restricted.

Defer third-party resource loading and reserve adequate player dimensions.

Prefer a privacy-conscious, user-initiated media loading approach.

Do not assume access to the Facebook Graph API or introduce API credentials without approval.

Do not scrape Facebook pages or bypass platform restrictions.

### Homepage integration

Create a Featured Message component for one administrator-selected video.

The homepage must remain operational even if Facebook is unavailable.

## PHASE 8 — PROFESSIONAL DESIGN REFINEMENT

Maintain and improve the existing visual identity.

Refine:

- Typography hierarchy
- Layout consistency
- Hero positioning
- Authentic portrait treatment
- Section spacing
- Image presentation
- Book catalog visual structure
- Video thumbnail design
- Event cards
- CTA hierarchy
- Footer organization

Use fluid typography and responsive grids.

Avoid fixed-height empty containers.

Do not substitute stock images for missing approved photographs.

Use reusable components without introducing unnecessary abstractions.

## PHASE 9 — ADMINISTRATION AND CONTENT GOVERNANCE

Assess whether the site already contains an administrative dashboard or CMS.

If it exists, propose extensions supporting:

- Events
- Books
- Autobiography content
- Curated videos
- Featured homepage content
- Publication states

If no administration system exists, document implementation options and dependencies.

Do not build a complex CMS without approval.

Prevent unapproved drafts and unpublished personal content from being publicly accessible.

Require appropriate authorization for any content modification endpoints.

## PHASE 10 — ACCESSIBILITY, SEO, AND PERFORMANCE

Target WCAG 2.2 AA.

Validate:

- Correct heading structure
- Keyboard navigation
- Visible focus indicators
- Adequate color contrast
- Accessible mobile menu behavior
- Meaningful image alternative text
- Forms and validation
- Responsive embeds
- Reduced-motion preferences
- No unintended horizontal overflow

Inspect SEO metadata for public pages.

When supported by actual content, implement appropriate structured data for books, articles, people, videos, and events.

Do not publish fictional event, book, or video metadata.

Use the installed Next.js version's supported image, font, and script optimization mechanisms.

Test representative viewport widths:

320px, 375px, 390px, 768px, 1024px, and 1440px.

Run the project's existing lint, type-check, build, and automated test commands.

Where browser tooling is available, perform visual and functional checks.

Do not invent results for unavailable tools.

## PHASE 11 — IMPLEMENTATION APPROVAL AND REPORTING

The work should be divided into two checkpoints.

### Checkpoint A — Audit and Architecture Approval

Before implementing substantial changes, deliver:

`docs/reports/NATALIE-ARCHITECTURE-PROPOSAL.md`

Include:

- Existing architecture
- Recommended route structure
- Component reuse opportunities
- Books/Store separation strategy
- Events data model and management requirements
- Facebook embedding approach
- Autobiography publication options
- Database and integration requirements
- Estimated implementation effort
- Identified risks
- Decisions requiring approval

**Stop and request owner approval before significant architecture changes or new integrations.**

### Checkpoint B — Approved Implementation

After approval, implement changes in controlled phases.

Create:

`docs/reports/NATALIE-IMPLEMENTATION-REPORT.md`

Include:

- Changes completed
- Files created or modified
- New routes
- Preserved redirects
- Content integrations
- Events functionality
- Facebook media results
- Autobiography integration
- Responsive testing
- Accessibility findings
- Build and test results
- Outstanding dependencies
- Recommendations

Do not claim success without verified evidence.

## FINAL INSTRUCTION

Begin with the existing repository audit and architecture proposal.

Do not rewrite the entire application.

Do not assume access to unpublished autobiography content, event schedules, Meta API permissions, or a commerce backend.

Maintain the ministry-first content hierarchy and preserve all approved branding.

**The final product should communicate Natalie's message first, encourage meaningful engagement second, and support commercial activity as a secondary function.**
