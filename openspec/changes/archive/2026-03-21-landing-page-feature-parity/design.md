## Context

The marketing surface lives in `src/pages/Landing.tsx` (SEO, JSON-LD) and `src/components/landing/*` (hero, features, problem/solution, pricing, CTA, footer). **Support and legal surfaces** (`src/pages/Help.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`) and **in-app explanatory copy** (`Settings.tsx` privacy tab) must stay aligned with shipped behavior so users are not directed to non-existent flows (for example a Share button). Landing copy was corrected for tier limits, trust stats, and privacy without unbuilt sharing; Help/Privacy/Terms/Settings were updated in the same spirit.

## Goals / Non-Goals

**Goals:**

- Treat the landing page as a **contract**: every substantive claim is mapped to product behavior, a specific tier/credit rule, or is removed/softened.
- Centralize a **claim inventory** in the OpenSpec capability so reviewers can diff copy against requirements.
- Prefer **single source of truth** for numeric limits (photos per month, storage, credit costs) between pricing UI and backend-enforced rules where feasible, or document the manual sync rule if not.

**Non-Goals:**

- Redesigning visual layout or brand voice (unless copy must change for accuracy).
- Implementing missing product features solely to match marketing—those belong in separate capability changes; this design allows either **implement** or **fix copy** outcomes.
- Legal review of every phrase (still flag obviously misleading stats and ratings).

## Decisions

1. **Spec-first parity** — The `landing-marketing-parity` spec lists claims and acceptance criteria. Implementation tasks either update the app to satisfy a requirement or change landing copy/structured data to satisfy it; the spec is updated when the canonical promise changes.

2. **Inventory location** — Keep the authoritative claim list in `openspec/changes/.../specs/landing-marketing-parity/spec.md` until the change is archived; after archive, the capability lives under `openspec/specs/landing-marketing-parity/spec.md` per project workflow.

3. **Tier-qualified language** — Any capability that depends on subscription, credits, or free limits MUST be labeled in marketing with the same tier semantics enforced in-app (for example “Premium”, “with credits”, “Family plan”), not only in fine print.

4. **Structured data** — JSON-LD (`aggregateRating`, `ratingCount`, offers) MUST follow the same substantiation rules as visible copy; fabricated ratings violate the parity spec.

5. **Verification style** — Manual checklist per release is acceptable initially; automated tests are optional and only practical for a subset (for example asserting plan feature strings match a shared config).

## Risks / Trade-offs

- **[Risk] Drift between pricing component and enforcement** → **Mitigation**: Document in tasks to cross-check `PricingSection` (and `usePricing`) against Supabase/feature-gating logic; consider extracting shared constants in a later change.
- **[Risk] Over-scoped spec** → **Mitigation**: Primary inventory remains the landing route; Help, Privacy, Terms, and Settings are in scope when they assert product capabilities (see spec requirement “Help, legal, and settings copy match shipped product”).
- **[Risk] Subjective “available”** → **Mitigation**: Requirements reference concrete user-visible flows (screens, actions), not internal code presence.

## Migration Plan

1. Finalize `landing-marketing-parity` spec (this change).
2. Run a parity pass: for each requirement scenario, mark pass/fail against production or main branch.
3. For each failure, either open a product change or edit landing copy/JSON-LD in the same or follow-up PR.
4. Archive the change when parity checks pass and the spec is promoted to `openspec/specs/`.

## Open Questions

- Whether **social proof numbers** (1000+ families, 50K+ milestones, 100K+ photos) are backed by analytics; if not, should they be removed, replaced with non-numeric copy, or marked as illustrative?
- Whether **30-day money back guarantee** and similar trust lines are operationally true; legal/commerce owner should confirm before spec marks them as required truths.
