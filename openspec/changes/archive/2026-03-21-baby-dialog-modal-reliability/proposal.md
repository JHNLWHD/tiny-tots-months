## Why

Add Baby and Edit Baby on Home share the page with Radix **Dialog** and nested **Select** components. Incorrect stacking (scroll lock, pointer-events, portal targets) or mount patterns (e.g. conditional mount with `open={true}` under React Strict Mode) has caused **Add Baby to become unclickable** after using Edit, or **Edit to never appear**. We need an explicit product/engineering contract so both flows stay reliable in dev and production.

## What Changes

- Define **required UX**: user can open **Add Baby** and **Edit Baby** in any reasonable order; closing one must not break the other.
- Document **technical guardrails**: mutually exclusive modal state (single enum/discriminated union), a **single always-mounted** `Dialog` root with **`open` derived from `babyModal`**, **no `key` on `DialogContent`**, and mitigations aligned with [radix-ui/primitives#2122](https://github.com/radix-ui/primitives/issues/2122): Home baby **`Dialog` with `modal={false}`**, shadcn **`DialogContent` with `staticBackdrop`**, **body `overflow` lock** while open, **Select** portal **`container`** + controlled open cleared on close.
- Add **verification tasks** (manual or automated) for regression checks.

## Capabilities

### New Capabilities

- `home-baby-modals`: Behavioral requirements for Add Baby and Edit Baby modals on Home—mutual exclusivity, open/close semantics, no stuck overlays or dead clicks, and compatibility with React Strict Mode in development.

### Modified Capabilities

- _(none — root `openspec/specs/` has no prior baby-dialog capability; this is scoped as a new change-local spec.)_

## Impact

- **Code**: `src/pages/Home.tsx` (`babyModal` + `modal={false}`, body overflow), `src/components/home/HomeBabyModal.types.ts`, `src/components/home/AddBabyDialog.tsx`, `src/components/home/EditBabyDialog.tsx`, `src/components/ui/select.tsx` (portal `container`), `src/components/ui/dialog.tsx` (**`staticBackdrop`** for non-modal + dim layer without Radix overlay `RemoveScroll`).
- **Dependencies**: `@radix-ui/react-dialog`, `@radix-ui/react-select`, React 18 Strict Mode behavior.
- **Docs**: Change-local spec under `openspec/changes/baby-dialog-modal-reliability/specs/`.
