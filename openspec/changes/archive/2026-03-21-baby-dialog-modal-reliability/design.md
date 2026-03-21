## Context

Home hosts **Add Baby** and **Edit Baby** inside one always-mounted Radix **Dialog** shell. Gender uses Radix **Select** inside each form. The app may run under **React 18 Strict Mode** in development. Prior incidents included:

- **`pointer-events: none` stuck on the page** (often `document.body`) after closing **Edit Baby**, so Add Baby and other Home actions felt “dead” — consistent with [radix-ui/primitives#2122](https://github.com/radix-ui/primitives/issues/2122): modal `DialogContent` uses `disableOutsidePointerEvents`, which conflicts with **nested portaled UI** (Select’s `RemoveScroll`, **Dialog opened from DropdownMenu**, third-party modals). Radix does **not** expose `disableOutsidePointerEvents` on `DialogContent` in public types; **`modal={false}`** is the supported way to avoid that layer on the dismissable surface.
- **Edit** failing to show when multiple dialog roots shared one close handler, or when **Strict Mode** remount fired spurious `onOpenChange(false)`.
- **`DialogContent` `key`** flipping from `edit-<id>` to `"add"` on close, **remounting** the Radix shell in the same tick as `open={false}` and breaking `react-remove-scroll` teardown.
- **Edit opened from `DropdownMenu`**: a **non-modal** `Dialog` can see the menu’s teardown as an immediate outside dismiss. **Mitigation:** `handleEditBaby` defers `openBabyModal` with **`setTimeout(..., 500)`** (`EDIT_BABY_MENU_OPEN_DELAY_MS` on Home); shorter delays were unreliable in practice.

## Goals / Non-Goals

**Goals:**

- Single source of truth for “which baby modal is open” (discriminated union / enum); **at most one** of Add or Edit visible.
- **Single** Radix `Dialog` root stays mounted; **`open`** is derived from **`babyModal.kind !== None`**; **`closeBabyModal`** sets **`babyModal`** to closed in one step (no separate `babyDialogOpen`, no microtask deferral, no dismiss guard unless a regression forces a minimal fix).
- Mitigate **Dialog + Select** layering: Home baby **`Dialog` uses `modal={false}`** (per [#2122](https://github.com/radix-ui/primitives/issues/2122)); **`DialogContent`** uses optional **`staticBackdrop`** (plain dim `div`, no `react-remove-scroll`) because Radix omits `DialogOverlay` when `modal={false}`; **body `overflow: hidden`** while the baby dialog is open replaces Radix overlay scroll lock; **portal Select content** into the form via **`container`**; **close Select** when the dialog closes (`useEffect` on `open` / `requestClose`).
- Document regression checks in tasks.

**Non-Goals:**

- Redesigning onboarding or other routes’ baby forms.
- Replacing Radix with another UI kit.
- Full E2E suite (manual checklist is enough unless project already has patterns).

## Decisions

1. **Parent state: `HomeBabyModal` discriminated union**  
   **Rationale:** Prevents conflicting booleans (`isAddOpen` + `isEditOpen`). **Alternative:** two booleans — rejected (easy to desync).

2. **Always mount one `Dialog` root; never put a React `key` on `DialogContent` for Add vs Edit**  
   **Rationale:** Avoids remounting the Radix portal/`RemoveScroll` shell when switching `babyModal` kind (especially `edit-<id>` → default key that looked like `"add"`). **Keys** belong on **AddBabyDialog** / **EditBabyDialog** only so forms reset when switching. **Alternative:** keyed `DialogContent` — rejected (observed stuck `pointer-events` on close from Edit).

3. **Non-modal Dialog + `staticBackdrop` + local scroll lock** ([#2122](https://github.com/radix-ui/primitives/issues/2122))  
   - **`modal={false}`** → `DialogContentNonModal` path → **`disableOutsidePointerEvents: false`** (no Radix body pointer lock from that layer).  
   - **`staticBackdrop`** on shadcn `DialogContent` → visible dim layer without Radix `DialogOverlay` / `react-remove-scroll` on that overlay.  
   - **`useEffect`** on Home sets **`document.body.style.overflow = 'hidden'`** while a baby modal is open — non-modal roots do not get overlay `RemoveScroll`.

4. **Select inside dialog**  
   - Controlled **Select** `open`; clear when dialog closes.  
   - **`SelectContent` `container`** (form ref) so the menu portals inside dialog DOM and unmounts with it.

5. **`DialogContent` `overflow-visible`** on the baby shell  
   **Rationale:** Avoid clipping the gender popper.

## Risks / Trade-offs

- **[Risk] `modal={false}` Dialog** — Weaker focus trapping than modal; dismiss-on-outside still applies via Radix content. Static backdrop does not use `RemoveScroll`; scroll is suppressed via **body overflow** only while open.  
  **Mitigation:** Accept trade-off for reliable pointer/stacking with nested Select and “Edit from dropdown” flows; re-tighten focus if a11y review requires it.

- **[Risk] Portal `container` null on first paint**  
  **Mitigation:** Ref callback on `<form>` updates state so subsequent render passes a valid container; avoid opening Select before form mounted.

## Migration Plan

N/A — front-end behavior only; deploy with normal release. Rollback: revert `Home.tsx`, `dialog.tsx` (`staticBackdrop`), and `select.tsx` (`container`) changes.

## Upstream reference

- **[Dialog] `DialogContent` disables pointer events for the whole page…** — [radix-ui/primitives#2122](https://github.com/radix-ui/primitives/issues/2122) (closed; workarounds discussed include `modal={false}`, `pointer-events: auto` on portaled UI, and clearing body pointer-events in app code). Our approach for Home baby modals: **`modal={false}` + `staticBackdrop` + single `babyModal` state + no `key` on `DialogContent`.**

## Open Questions

- Whether to add a Playwright/Cypress check later for “open Edit → close → click Add” (optional).
