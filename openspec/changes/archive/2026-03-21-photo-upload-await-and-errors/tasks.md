## 1. Async contract and types

- [x] 1.1 Change `useImageUpload` to expose `uploadPhoto` as `mutateAsync` (or equivalent promise-based API) and verify `isUploading` / `isPending` behavior unchanged
- [x] 1.2 Update `PhotoSection` and `PhotoUploader` prop types so `onUpload` / `uploadPhoto` return `Promise<unknown>` (or a concrete result type) and callers use `await` correctly
- [x] 1.3 Grep for other `uploadPhoto(` usages from `usePhotos` / `useImageUpload` and ensure none assume fire-and-forget without error handling

## 2. Structured errors and observability

- [x] 2.1 Add a small helper (or inline mapping) to normalize errors into `{ phase, userMessage, debug }` from validation throws, Supabase storage errors, and PostgREST insert errors
- [x] 2.2 Extend `trackFileUploadError` / `trackDatabaseError` (or adjacent calls) to include `phase` and provider `code` when present
- [x] 2.3 On failure, log one structured `console.error` (or dev-gated verbose log) with phase, baby/month context, file type/size—no tokens or full signed URLs

## 3. UX and toasts

- [x] 3.1 Eliminate duplicate success/error toasts for one attempt (choose single source: mutation callbacks vs caller `catch`)
- [x] 3.2 Confirm `PhotoUploader` does not call `clearSelection` / `onUploadComplete` until upload promise resolves successfully; on failure, selection remains for easy retry

## 4. Credit path verification

- [x] 4.1 Manually or with a focused test scenario: credit-gated upload that fails at storage MUST NOT call `spendCredits`; success path MUST still spend after upload completes

## 5. Verification

- [x] 5.1 Cold-load manual test: first upload after refresh completes before UI clears; if it fails, error is readable and console/analytics carry phase + code
- [x] 5.2 Run `npx tsc --noEmit` and relevant lint on touched files
