## ADDED Requirements

### Requirement: Marketing claim inventory

The project SHALL maintain a documented inventory of substantive marketing claims exposed on the public landing experience (`/` and its landing-specific components), grouped by surface (hero, features, problem/solution, pricing, CTA, footer, meta tags, JSON-LD). Each inventory entry SHALL identify the exact user-visible text (or schema field) and the product behavior or tier rule that satisfies it.

#### Scenario: Reviewer audits the landing page

- **WHEN** a reviewer compares the live or staged landing page to the inventory in this spec
- **THEN** every hero, feature, pricing, trust, SEO description, and JSON-LD assertion that promises product capability, limits, pricing, or social proof appears in the inventory with a mapped satisfaction rule or is flagged for removal

### Requirement: Product feature claims are satisfiable

Any landing copy that states or implies the product can perform an action (for example monthly milestone tracking, custom milestones, photo upload by month, captions, cross-device access, cloud storage) SHALL be satisfiable by an authenticated user (or guest where explicitly promised) through the shipped application without misleading omission of required tier, credits, or eligibility.

#### Scenario: User on a qualifying tier tries the promised feature

- **WHEN** a user has the tier or credits that the claim qualifies (or the claim is unqualified and applies to the free tier)
- **THEN** they can complete the described capability in the app in a way a reasonable reader would expect from the copy

#### Scenario: Feature is gated or partial

- **WHEN** a capability is only available on a paid tier, via credits, or with quantitative limits
- **THEN** the landing copy visible in the same section SHALL state that limitation in clear, proximate language consistent with in-app gating (not only in unrelated fine print)

### Requirement: Pricing and plan bullets match enforcement

Bullet lists under landing pricing (Free, Credits, Family subscription, Lifetime) SHALL accurately describe limits, entitlements, and credit costs that the application and backend enforce at the time of release. If enforcement differs from copy, either copy or enforcement MUST be updated before the change ships.

#### Scenario: Free plan limits

- **WHEN** the Free plan lists baby profiles, months tracked, photos per month, storage, milestone depth, or export availability
- **THEN** those values and booleans match the enforced rules for a new free-tier user

#### Scenario: Credits and paid plans

- **WHEN** the Credits, Family, or Lifetime sections list storage amounts, video availability, templates, collaboration, analytics, export, or support
- **THEN** each item is either implemented for that plan or removed/rewritten on the landing page

### Requirement: Trust and social proof claims are substantiated

Numeric or superlative trust statements on the landing page (for example user counts, milestones tracked, photos stored, “trusted by” figures) and aggregate ratings or review counts in visible copy or JSON-LD SHALL be backed by verifiable data or SHALL be removed or rephrased to non-factual marketing language that cannot be falsified.

#### Scenario: Structured data includes ratings

- **WHEN** `SoftwareApplication` or similar schema includes `aggregateRating` or review counts
- **THEN** those values reflect a real, current source (for example an approved third-party review integration) or the fields SHALL be omitted

### Requirement: No contradictory promises across landing sections

The hero, features, problem/solution, pricing, CTA, and meta descriptions SHALL not contradict each other on the same topic (for example video availability, privacy claims, or “free” scope) in ways that would confuse a reasonable reader.

#### Scenario: Cross-section consistency check

- **WHEN** two sections address the same capability (for example video uploads or how privacy works)
- **THEN** both sections use compatible qualifications and limits

### Requirement: Parity check before shipping landing changes

Before merging a change that alters landing marketing copy, pricing bullets, or structured data, the author SHALL complete a parity pass against this spec’s inventory and scenarios, updating the spec when the canonical promise changes.

#### Scenario: Copy update merged

- **WHEN** a pull request modifies landing components or landing SEO/JSON-LD
- **THEN** the PR description or checklist records parity verification or an update to this spec’s inventory and requirements

### Requirement: Help, legal, and settings copy match shipped product

Support and legal pages (`/help`, `/privacy-policy`, `/terms-of-service`) and in-app settings copy that describe how the product works SHALL not assert user-facing features that are not implemented. When a capability is not yet available, copy SHALL say so clearly or omit instructions for it.

#### Scenario: Share links not in product

- **WHEN** the app does not provide user-generated share links for baby profiles or month timelines
- **THEN** Help FAQs, Privacy Policy, Terms of Service, and Settings privacy text SHALL not describe a Share button, shareable links, or guest viewing of a baby timeline as a current feature

#### Scenario: Future capabilities mentioned

- **WHEN** copy references capabilities that may ship later (for example optional sharing)
- **THEN** it SHALL be explicit that they are not available yet or that the policy will be updated when they launch

---

## Appendix A: Marketing claim inventory (shipped copy)

Reference implementation: `src/lib/abilities.ts` (`CREDIT_COSTS`, `STORAGE_QUOTAS`, `createAbilityFor`). Verification date: 2026-03-21 (codebase review + build).

### `Landing.tsx` (Helmet + JSON-LD)

| Claim | Satisfied by |
| --- | --- |
| Page title / keywords | Product is a web milestone tracker; accurate. |
| Meta description, OG/Twitter descriptions | Qualified video access (Premium/Lifetime/credits); private account copy; free to start. |
| `SoftwareApplication.description` (JSON-LD) | Same qualifications; no fabricated ratings (aggregateRating removed). |
| `WebSite.description` | Same. |
| `Offer` price 0 | Free tier exists. |

### `HeroSection.tsx`

| Claim | Satisfied by |
| --- | --- |
| Headline / Beta badge | Product positioning; beta UI component. |
| Subtitle | Photos + milestones for all; videos gated; private account (no share-link claim). |
| Trust row: “Built for busy parents”, “Private by design—not a public feed”, “Free to start” | Non-numeric; no claim of share links. |

### `ProblemSolutionSection.tsx`

| Claim | Satisfied by |
| --- | --- |
| Organized memories (photos/videos by month) | Month-organized media; videos per tier/credits. |
| Track development | Milestones in app. |
| Private by default (third pillar) | Account-based privacy; not a public feed; no share-link feature shipped. |

### `FeaturesSection.tsx`

| Claim | Satisfied by |
| --- | --- |
| Milestone block (month, suggestions, custom) | Milestone CRUD + suggestions in app. |
| Photo/video block | Storage caps stated for paid tiers; video credit/premium path stated. |
| Cross-device / cloud / sync bullet | Web app + Supabase-backed data. |

### `PricingSection.tsx`

| Claim | Satisfied by |
| --- | --- |
| Free plan bullets | Matches abilities: 1 baby, months ≤12, 10 photos/mo + batch credits, 500MB quota, templates/export limitations explicit. |
| Credits bullets | Aligns with `CREDIT_COSTS` and Upgrade page. |
| Family / Lifetime bullets | Storage quotas 10GB / 25GB; dashboard in Settings; export for premium; month 13+ access for premium; no share links or collaboration claims. |
| Trust line | No unverified money-back claim; no fake user/milestone/photo counts. |

### `CtaSection.tsx`

| Claim | Satisfied by |
| --- | --- |
| “Start with a free account. Pay only if you want more.” | Matches monetization model. |

### `Footer.tsx`

| Claim | Satisfied by |
| --- | --- |
| About / links | Navigational; no false product stats in scope of this pass. |

### `Help.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`, `Settings.tsx`

| Surface | Satisfied by |
| --- | --- |
| Help meta + FAQs | No share-link or Share-button instructions; security answer matches private-account model; free vs premium described without false “all features” for free. |
| Privacy (§3 use, §5 sharing) | No “generate shareable links” as current use; disclosure limited to legal, providers, and account storage model; note if sharing added later. |
| Terms (service description, §6) | Service described as account-based documentation; §6 “Access to your content” states no share links today; optional future features acknowledged. |
| Settings → Data & Privacy | Privacy paragraph matches account-only access; no shareable-link claim. |

### `Upgrade.tsx` (in-app parity with landing)

| Claim | Satisfied by |
| --- | --- |
| Credit costs list | Includes export 2 credits; matches `CREDIT_COSTS`. |
| Family includes list | Matches landing Family bullets (storage, dashboard, month 13+, export). |
| Lifetime list | 25GB + Family features; removed vague “priority feature access”. |
| Footer trust line | No unverified money-back; cancel anytime for subscription. |

## Appendix B: Requirement scenario audit

| Requirement | Result | Notes |
| --- | --- | --- |
| Marketing claim inventory | **Pass** | Appendix A; living doc in this change until archive. |
| Product feature claims satisfiable | **Pass** | Copy qualifies videos, export, templates; no share-link claims. |
| Pricing bullets match enforcement | **Pass** | Free export moved to limitations; Family storage fixed vs “unlimited” in Upgrade. |
| Trust / social proof substantiated | **Pass** | Removed numeric stats and JSON-LD ratings; qualitative trust only. |
| No contradictory promises | **Pass** | Hero, features, pricing, meta aligned on video, export, and privacy (no unbuilt sharing). |
| Parity check before shipping | **Process** | Record in PR template when team adds one; this PR updates inventory. |
| Help / legal / settings vs product | **Pass** | Share-link claims removed; Privacy/Terms dated 2026-03-21 for material edits. |
