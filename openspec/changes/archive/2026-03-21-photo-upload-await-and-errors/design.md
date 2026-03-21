## Context

The month page uses `useMonthPage` → `usePhotos` → `useImageUpload`. The mutation is exposed as `uploadPhoto: uploadPhotoMutation.mutate`. Callers use `await uploadPhotoApi(...)`, but **`mutate` does not return a promise for the mutation work**, so `await` resolves immediately. `PhotoUploader` then runs `clearSelection()` and `onUploadComplete()` while the upload may still be in flight. `executeWithAbility` in `useAbilities` is written to run **`await executeFunction()`** before `spendCredits`; with a non-awaiting `executeFunction` body, credit deduction can run before the upload finishes—violating the intended **upload first, then spend credits** invariant.

Separately, failures often surface as a single string from `Error.message`, while Supabase storage and PostgREST return richer `message` / `code` / `statusCode` fields that are dropped.

## Goals / Non-Goals

**Goals:**

- Ensure **one async boundary**: the promise callers await matches the full upload pipeline (validation → storage → row insert → signed URL as today).
- Preserve **upload succeeds before credits are spent** when the credit-gated path is used.
- Add **structured, phase-labeled errors** for debugging (and user-visible clarity where it does not leak sensitive internals).
- Keep changes scoped to the **authenticated month photo** flow unless the same `mutate`-without-await pattern is found elsewhere with the same bug.

**Non-Goals:**

- Redesigning the gallery, changing storage buckets or RLS policies, or rewriting guest upload flows in this change (unless the same bug is confirmed there).
- Adding a new third-party error reporting service (reuse `console` + existing `trackFileUploadError` / `trackDatabaseError`).

## Decisions

1. **`mutateAsync` for `uploadPhoto` (primary fix)**  
   - **Rationale:** React Query’s `mutateAsync` returns a promise that settles when the mutation completes; errors reject and success resolves with `UploadResult`. This aligns `useMonthPage`, `executeWithAbility`, and `PhotoUploader` without custom promise wrappers.  
   - **Alternative considered:** Wrap `mutate` in a manual `new Promise((resolve, reject) => { mutate(..., { onSuccess: resolve, onError: reject }) })`—more boilerplate and easier to get wrong with concurrent calls.

2. **Centralize “enriched” error shaping in one helper used by `uploadImageLogic` / mutation `onError`**  
   - **Rationale:** Map thrown values to `{ phase, userMessage, debug }` where `debug` holds `supabaseCode`, `statusCode`, `storagePath` prefix (no full secrets), `babyId`, `monthNumber`. Toast shows `userMessage` plus a short hint (“If this keeps happening, check the browser console for details”) in dev or always—product choice in implementation.  
   - **Alternative considered:** Only improve `console.error`—insufficient for support without devtools.

3. **Logging: extend existing analytics calls with `phase` and codes rather than only strings**  
   - **Rationale:** Keeps one pipeline for production signals; matches “debug further in the future.”

4. **Toast duplication**  
   - **Rationale:** With `mutateAsync`, callers may catch and toast; mutation `onError` also toasts. **Decision:** Prefer a single toast source—either mutation callbacks only, or throw to caller and let `PhotoUploader` / hook handle once. Implementation task: pick one path and remove duplicate.

## Risks / Trade-offs

- **[Risk] Unhandled rejection** if something calls `uploadPhoto` without `.catch()` — **Mitigation:** Primary call sites use `await`; grep for other `uploadPhoto(` usages; document in hook JSDoc if needed.  
- **[Risk] Exposing raw Supabase errors to end users** — **Mitigation:** Map known codes to friendly text; put raw details in console / analytics only.  
- **[Risk] `isUploading` already tied to mutation** — **Mitigation:** `mutateAsync` still drives `isPending`; no change expected.

## Migration Plan

1. Ship behind normal deploy; no DB migration.  
2. Verify manually: cold load → upload → UI clears only after success; credit-gated upload: failed storage does not reduce credits.  
3. Rollback: revert hook export to `mutate` (not recommended once verified).

## Open Questions

- Should structured `debug` fields be logged in production consoles or only when `import.meta.env.DEV`? (Default recommendation: **always** log phase + codes to analytics; **dev-only** for verbose `console`.)
