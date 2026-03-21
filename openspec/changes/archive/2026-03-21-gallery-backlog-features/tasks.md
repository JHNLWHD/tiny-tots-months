# Tasks: gallery-backlog-features

## 1. Database and types

- [x] 1.1 Add migration: `photo.is_favorite` (boolean, default false); document RLS for `UPDATE` on favorites; do **not** add `thumbnail_storage_path` (use Storage transforms for grids)
- [x] 1.2 Update `src/integrations/supabase/types.ts` and `src/types/photo.ts` for `is_favorite`; no stored thumbnail path on client model

## 2. List images (Storage transforms, no second object)

- [x] 2.1 Upload flow: single primary object only (no post-insert thumbnail upload)
- [x] 2.2 `enrichPhotoWithSignedUrls`: sign `storage_path` only; optional `imageSize` applies `getTransformedUrl` for list contexts
- [x] 2.3 `useDeletePhoto`: remove primary `storage_path` only
- [x] 2.4 `PhotoCard` / grid: signed primary URL + `HeicImage` size preset (transform), not a separate `thumbnail_url`

## 3. Baby gallery: large lists and React Query

- [x] 3.1 Introduce baby-gallery query key (e.g. `["photos","gallery",babyId]`) with `useInfiniteQuery`, stable order (`created_at` desc, `id` desc), page size ~100
- [x] 3.2 When total count ≤ 500, keep UX equivalent to one-shot load (single page or short-circuit per design)
- [x] 3.3 When total count > 500 or `hasNextPage`, show **Load more** and append pages; invalidate gallery key on upload/delete/favorite updates
- [x] 3.4 Invalidate gallery queries from `useImageUpload` / `useDeletePhoto` success paths alongside month keys

## 4. Search and favorites (UI + mutations)

- [x] 4.1 Add debounced caption search input to `BabyGallery`; filter `filteredPhotos` by description `includes` (case-insensitive); empty search clears text filter
- [x] 4.2 Add “Favorites only” filter; `useTogglePhotoFavorite` updates `is_favorite` in Supabase with **optimistic cache** patch + `rollback` on error, then invalidates month + gallery queries for the baby
- [x] 4.3 Add favorite control on `PhotoCard` (stop propagation); wire through `PhotoGrid` via named `handleToggleFavorite` → `useTogglePhotoFavorite` mutate; visibility from `onToggleFavorite` / `onDelete` (card handler) only (no `showFavoriteButton` / `showDeleteButton`; no `readOnly` on `PhotoGrid`). Month grid: parent `onDelete(id)` vs card `onDelete(photo)` via `openDeleteDialog` + confirm, `onDeleteById` destructuring alias in `PhotoGrid`.
- [x] 4.4 Add search + favorites to month `PhotoSection` / `PhotoGrid` path for parity (same filter semantics on that page’s list)

## 5. Compare mode

- [x] 5.1 Baby Gallery: compare mode toggle; first/second selection; open dialog with two panels (stack on mobile); clear/exit preserves other filters

## 6. Lightbox slideshow

- [x] 6.1 Import Slideshow plugin (+ CSS if required) in `PhotoLightboxContent`; register plugin; toolbar play/pause; default autoplay off, delay ~4s
- [x] 6.2 Hide or disable slideshow for single slide; define behavior for video slides per design (manual advance or plugin video support)

## 7. QA and polish

- [x] 7.1 Manual pass: small baby (<50), large baby (simulate >500 if possible), favorites + search + compare + slideshow
- [x] 7.2 Verify storage cleanup on delete and no duplicate invalidation gaps
