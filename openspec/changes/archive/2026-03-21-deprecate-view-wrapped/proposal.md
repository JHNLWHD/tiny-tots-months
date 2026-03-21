## Why

The "View Wrapped" year-in-review flow adds maintenance surface (dedicated route, data hook, and many UI components) while overlapping with existing home timeline, month pages, and gallery. Deprecating it simplifies the product and reduces the chance of Wrapped-specific bugs affecting core flows—provided we remove entry points and legacy routing in a controlled way so bookmarks and deep links do not strand users or break the app shell.

## What Changes

- Remove the **View Wrapped** navigation action from the home navigation hub for a selected baby.
- Remove or replace the **`/app/baby/:babyId/wrapped`** route so it no longer serves the Wrapped experience (**BREAKING** for users who relied on that URL; mitigated with redirect to a safe in-app destination).
- Remove Wrapped-specific implementation that becomes unused: page (`BabyWrapped`), `useBabyWrapped` hook, and components under `src/components/wrapped/` (after confirming no remaining imports).
- Update OpenSpec capability docs that still describe Wrapped as a first-class display context or navigation target.

## Capabilities

### New Capabilities

- None (behavior is removal and clarification of remaining navigation; no new user-facing capability).

### Modified Capabilities

- `select-baby`: Requirements implied by the home hub must no longer include a Wrapped entry point; selection still drives timeline, gallery, and month content as today.
- `view-timeline`: Remove Wrapped page as a documented display context for milestones; month page, home progress, and month cards remain unchanged.

## Impact

- **Code:** `NavigationHub.tsx`, `App.tsx` (routing), `src/pages/BabyWrapped.tsx`, `src/hooks/useBabyWrapped.tsx`, `src/components/wrapped/*`.
- **Data:** No schema changes; milestone and photo queries used only by Wrapped can be deleted with the hook—must verify no other module imports `useBabyWrapped` or `WrappedStats`.
- **Tests / QA:** Regression pass on home, baby selection, month routes, gallery, milestone create/edit/delete, and any deep link to the old Wrapped path.
- **Docs:** Historical change folders under `openspec/changes/*` may still mention Wrapped; this change updates the delta specs for `select-baby` and `view-timeline` only.
