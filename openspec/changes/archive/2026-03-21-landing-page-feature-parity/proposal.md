## Why

The public landing page (`/`) makes specific product, pricing, and trust claims. When marketing copy promises capabilities that are missing, gated differently, or overstated, users lose trust and support burden grows. We need an explicit spec that ties landing copy to verifiable product behavior so claims stay accurate as the app evolves.

## What Changes

- Add a formal capability spec for **landing marketing accuracy**: an inventory of marketed claims and rules that each claim must be true in the product (or the copy must be revised, qualified, or removed).
- Extend parity rules to **Help, Privacy Policy, Terms of Service, and Settings** when those pages describe product behavior, so they do not promise features that are not shipped (for example timeline share links).
- Establish a lightweight **audit process** (checklist or periodic review) so new landing or pricing bullets are checked against the spec before release.
- Align **landing, upgrade, help, legal, and settings** copy with the spec through implementation tasks.

## Capabilities

### New Capabilities

- `landing-marketing-parity`: Defines the set of public marketing claims on the landing experience, maps each to the product behavior or tier that must satisfy it, requires corrections when parity breaks (including trust metrics and legal-adjacent statements where applicable), and requires Help/Privacy/Terms/Settings product descriptions to match shipped features.

### Modified Capabilities

- _(none — this change adds marketing-accuracy requirements without altering existing product capability specs.)_

## Impact

- **Code/docs**: `src/pages/Landing.tsx`, `src/components/landing/*`, `src/pages/Help.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`, `Settings.tsx` (privacy copy), and shared pricing copy (`Upgrade.tsx`, `PricingSection`, `usePricing` / plan definitions). SEO/meta on landing and help where applicable.
- **Process**: Product, design, and engineering share responsibility to keep the claim inventory in `landing-marketing-parity` aligned with shipped behavior.
- **Dependencies**: Existing subscription/credits/gating logic, milestone and photo features must be referenced accurately in the spec (no new backend requirement for the spec artifact itself).
