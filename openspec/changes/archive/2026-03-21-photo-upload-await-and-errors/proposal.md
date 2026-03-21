## Why

Users sometimes see the first photo upload after loading the app fail while a second attempt succeeds. The current React Query `mutate` + `await` combination does not wait for the real upload to finish, which mis-orders UI cleanup, refetches, and (when credits apply) can mis-order **upload vs credit spend**. Error messages are often generic (`error.message` only), which makes it hard to tell whether a failure was validation, storage, database, or auth—slowing future debugging.

## What Changes

- Switch the authenticated month-page upload entry point from **`mutate`** to **`mutateAsync`** (or equivalent) so callers genuinely await completion before success-path UI and before credit deduction.
- Align TypeScript types for `onUpload` / `uploadPhoto` with a **Promise-based** contract.
- Introduce **structured failure context** for uploads: stable **phase** labels (e.g. `validation`, `storage`, `database`, `auth`, `credits`) and attach Supabase/PostgREST **codes and messages** when available—surfaced in user-facing copy where safe, and in `console` / existing analytics helpers for engineers.
- Avoid duplicate or contradictory toasts where success and error handlers both fire; keep a single clear failure story per attempt.

## Capabilities

### New Capabilities

- `month-photo-upload`: Authenticated upload from the baby month page—await semantics, UI ordering after success/failure, structured errors, and credit-safe ordering when uploads are gated.

### Modified Capabilities

- None (root `openspec/specs/` has no existing upload capability; `view-timeline` / `select-baby` are unrelated).

## Impact

- **Code:** `src/hooks/useImageUpload.tsx`, `src/hooks/useMonthPage.tsx`, `src/hooks/usePhotos.tsx`, `src/components/PhotoUploader.tsx`, `src/components/month/PhotoSection.tsx`; possibly `src/hooks/useAbilities.tsx` (credit path ordering verification) and `src/lib/analytics` / upload error tracking.
- **Systems:** Supabase Storage (`baby_images`), `photo` table inserts, existing credit spend mutation.
- **Dependencies:** None new; uses existing `@tanstack/react-query` patterns (`mutateAsync`).
