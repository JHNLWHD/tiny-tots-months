## 1. Claim inventory and baseline audit

- [x] 1.1 Extract every substantive claim from `Landing.tsx` (Helmet, JSON-LD) and `src/components/landing/*` into a checklist aligned with `specs/landing-marketing-parity/spec.md` (append as a numbered appendix in the spec or a linked doc if the team prefers one file).
- [x] 1.2 For each claim, record: exact text location, satisfied-by (product flow / tier rule), or “remove or rephrase”.
- [x] 1.3 Walk through each scenario in `landing-marketing-parity` on main or staging and mark pass/fail.

## 2. Hero, SEO, and structured data

- [x] 2.1 Verify hero subtitle and trust chips (“Trusted by 1000+ families”, “100% secure & private”, “Free to start”) against substantiation rules; update copy or JSON-LD or remove unverifiable `aggregateRating` data in `Landing.tsx`.
- [x] 2.2 Align meta `description` / Open Graph text with actual sharing and video capabilities (qualify tier if needed).

## 3. Features and problem/solution sections

- [x] 3.1 Validate `FeaturesSection` bullets (milestones, photos/videos, captions, cross-device, cloud) against authenticated flows; add tier qualifiers where copy overstates free access.
- [x] 3.2 Validate `ProblemSolutionSection` (“Private Sharing” / private links) against the share-link feature; fix copy if flows differ from “unique private links” wording.

## 4. Pricing section parity

- [x] 4.1 Cross-check Free plan bullets in `PricingSection.tsx` against enforced quotas (babies, months, photos/month, storage, milestones, export).
- [x] 4.2 Cross-check Credits bullets (credit costs and unlocks) against credit spend rules and UI in `/app/upgrade` or equivalent.
- [x] 4.3 Cross-check Family and Lifetime bullets (storage, templates, analytics, collaboration, export, support) against implemented entitlements; remove or rewrite unsupported lines.
- [x] 4.4 Confirm footer trust line (“30-day money back guarantee”, “No hidden fees”) with operations/legal; update or remove if inaccurate.

## 5. CTA, footer, and cross-section consistency

- [x] 5.1 Reconcile `CtaSection` social proof (“Join 1000+ happy families”) with substantiation rules and hero/pricing stats.
- [x] 5.2 Scan for contradictions between sections on video, sharing, and “free” scope; edit until consistent.

## 6. Close-out

- [x] 6.1 Update `landing-marketing-parity` inventory in-repo to match shipped copy after edits.
- [x] 6.2 Add a short PR checklist item or CONTRIBUTING note: “Landing/marketing changes require parity pass” (only if the repo already documents contribution checks; otherwise skip to avoid unsolicited doc scope). **Skipped:** no `CONTRIBUTING.md` in repo.

## 7. Help, legal, and settings alignment

- [x] 7.1 Update `Help.tsx` (meta + FAQs + data security answer) to remove share-link instructions; clarify free vs premium without false “all features”.
- [x] 7.2 Update `PrivacyPolicy.tsx` (uses of information, sharing section, last updated) for account-based privacy and optional future sharing.
- [x] 7.3 Update `TermsOfService.tsx` (service description, user content wording, replace sharing section with access-to-content, last updated).
- [x] 7.4 Update `Settings.tsx` Data & Privacy copy to match no share-link feature.
- [x] 7.5 Extend OpenSpec `landing-marketing-parity` spec (new requirement + appendix rows), plus `proposal.md` / `design.md` impact.
