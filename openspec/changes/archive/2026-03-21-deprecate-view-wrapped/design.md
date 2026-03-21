## Context

Today, **View Wrapped** is exposed from `NavigationHub` and implemented as route `baby/:babyId/wrapped` rendering `BabyWrapped`, which aggregates photos and milestones via `useBabyWrapped` and several `wrapped/*` cards. Milestones and photos are already fully available through month pages, the home timeline, and the gallery—Wrapped is a parallel presentation layer, not a separate backend capability.

## Goals / Non-Goals

**Goals:**

- Remove user-visible entry points to Wrapped so the main app flows stay the supported path.
- Eliminate dead code (page, hook, wrapped components) once unreachable, shrinking bundle and test surface.
- Preserve stable behavior for **gallery**, **month pages**, **milestone CRUD**, **photo upload**, and **baby selection**; no API or schema changes.
- Handle legacy URLs (`/app/baby/:id/wrapped`) without a blank screen or broken layout.

**Non-Goals:**

- Replacing Wrapped with a new recap feature in this change.
- Migrating historical analytics or user messaging (e.g. in-app announcement) unless product asks later.
- Editing archived OpenSpec change folders (`openspec/changes/baby-management`, etc.) beyond the new delta specs in this change.

## Decisions

1. **Route handling after removal**  
   **Choice:** Remove the `BabyWrapped` route and register a **redirect** from `baby/:babyId/wrapped` to `/app` (or `/app/` with same effect), using React Router’s `Navigate`/`redirect` pattern consistent with the rest of `App.tsx`.  
   **Rationale:** **BREAKING** URL for power users is acceptable; redirect avoids 404 and keeps the app shell intact. Alternatives: 404 page (worse UX for bookmarks) or leaving the page but hidden (leaves dead feature and maintenance).

2. **Code removal vs. feature flag**  
   **Choice:** **Delete** Wrapped-specific modules after the route and nav link are gone, and grep confirms no imports.  
   **Rationale:** No parallel “half-live” code path. Alternative feature flag adds complexity for a feature we are dropping.

3. **Verification order**  
   **Choice:** (1) Remove nav link, (2) replace route with redirect, (3) delete page/hook/components, (4) run typecheck/tests and manual smoke.  
   **Rationale:** Early UI removal prevents new usage; redirect stays until page is gone so links never 404.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Hidden `Link` or `navigate()` to Wrapped elsewhere | Repo-wide search for `wrapped`, `BabyWrapped`, `useBabyWrapped` before merge. |
| Tests or E2E asserting Wrapped | Update or remove those tests in the same change. |
| Users expect recap | Copy on home/month/gallery already covers content; no product copy change required unless stakeholders want a one-line note (open question). |

## Migration Plan

1. Ship nav removal + redirect + code deletion in one release (or redirect first if deploying in stages).
2. **Rollback:** Restore route and nav from VCS; no data migration.

## Open Questions

- Should the redirect target be `/app` always, or preserve baby context if we later add `?baby=` (currently out of scope; `/app` is sufficient).
