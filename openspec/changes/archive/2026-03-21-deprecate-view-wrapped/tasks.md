## 1. Discovery and safety checks

- [x] 1.1 Search the repo for `wrapped`, `BabyWrapped`, `useBabyWrapped`, and `/wrapped` to list every reference (components, routes, tests, docs).
- [x] 1.2 Confirm no feature flags, subscription gates, or shared hooks depend on Wrapped-specific APIs beyond `useBabyWrapped`.

## 2. Remove entry points and route behavior

- [x] 2.1 Remove the **View Wrapped** link (and any related UI) from `NavigationHub` while keeping Gallery and other baby actions intact.
- [x] 2.2 Replace the `baby/:babyId/wrapped` route in `App.tsx`: remove `BabyWrapped` as the element and add a redirect to `/app` (or project-standard home path) so legacy bookmarks do not 404.

## 3. Delete deprecated implementation

- [x] 3.1 Delete `src/pages/BabyWrapped.tsx` and remove its default import from `App.tsx`.
- [x] 3.2 Delete `src/hooks/useBabyWrapped.tsx` if nothing else imports it after step 2.
- [x] 3.3 Delete `src/components/wrapped/` (all Wrapped-only cards and helpers) after confirming zero imports.

## 4. Regression verification

- [x] 4.1 Run TypeScript build / tests and fix any broken imports or tests that referenced Wrapped.
- [x] 4.2 Manually verify: baby selection, home timeline, month page (`/app/month/...`), gallery, milestone and photo flows; open old Wrapped URL and confirm redirect and no console errors.
