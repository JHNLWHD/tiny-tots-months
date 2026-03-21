## 1. Modal state and lifecycle

- [x] 1.1 Home SHALL use a single discriminated modal state (e.g. `HomeBabyModal` + `HomeBabyModalKind`) so Add and Edit cannot both be active
- [x] 1.2 Home SHALL keep **one** Radix `Dialog` root mounted; drive **`open`** from **`babyModal.kind !== None`** and render at most one of AddBabyDialog / EditBabyDialog as children (no `key` on `DialogContent` — keys only on inner form components)
- [x] 1.3 `closeBabyModal` SHALL set `babyModal` to “none” in one step (no separate dialog-open flag, no microtask deferral, no dismiss guard unless reintroduced for a verified regression)
- [x] 1.4 `handleEditBaby` SHALL defer `openBabyModal` after menu `onSelect` (Home: `EDIT_BABY_MENU_OPEN_DELAY_MS` = 500ms) so Edit opened from the card dropdown does not instantly dismiss

## 2. Radix Dialog + Select stacking ([#2122](https://github.com/radix-ui/primitives/issues/2122))

- [x] 2.1 Home baby `Dialog` SHALL use **`modal={false}`** so `DialogContent` does not apply modal outside pointer disabling (see [radix-ui/primitives#2122](https://github.com/radix-ui/primitives/issues/2122))
- [x] 2.2 `DialogContent` SHALL support **`staticBackdrop`** (plain dim layer) when paired with `modal={false}` (Radix omits `DialogOverlay` for non-modal roots)
- [x] 2.3 Home SHALL set **`document.body.style.overflow`** while the baby dialog is open when using non-modal Dialog (no overlay `RemoveScroll` scroll lock)
- [x] 2.4 `SelectContent` SHALL support an optional `container` prop forwarded to the Select portal (dropdown portaled into the dialog form)
- [x] 2.5 AddBabyDialog SHALL use controlled gender Select open state cleared when the dialog closes; form-scoped Select portal as in design
- [x] 2.6 EditBabyDialog SHALL match AddBabyDialog patterns (2.5)
- [x] 2.7 Baby shell `DialogContent` SHALL use `overflow-visible` where needed so the gender menu is not clipped

## 3. Verification

- [x] 3.1 Manual: Open Edit Baby → close (Cancel, X, overlay, and successful save) → Add Baby opens and is clickable
- [x] 3.2 Manual: Open Add Baby → close → Edit Baby opens for a profile (from card **⋯** menu, dialog stays open)
- [x] 3.3 Manual: With React Strict Mode (dev), Edit Baby opens on first user attempt without requiring a second click solely due to remount
- [x] 3.4 Manual: Open gender Select inside either dialog → close dialog → no subsequent “dead clicks” on Home primary actions

**QA before archive:** Re-run 3.1–3.4 in the browser after any future change to Home or these dialogs. Implementation matches `Home.tsx`, `AddBabyDialog.tsx`, `EditBabyDialog.tsx`, `dialog.tsx` (`staticBackdrop`), and `select.tsx` as of apply; `main.tsx` does not wrap `<StrictMode>`—enable temporarily to re-check 3.3 if desired.

**Upstream:** [radix-ui/primitives#2122](https://github.com/radix-ui/primitives/issues/2122) — rationale for non-modal Dialog + explicit backdrop vs stuck `pointer-events` / nested portaled UI.
