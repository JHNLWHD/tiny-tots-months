# Gallery backlog: advanced browsing, media pipeline, lightbox

> **OpenSpec archive:** `openspec/changes/archive/2026-03-21-gallery-backlog-features/` (moved from `openspec/changes/gallery-backlog-features/` on 2026-03-21). **Canonical specs** (merged from this change): `openspec/specs/baby-gallery-advanced/spec.md`, `openspec/specs/photo-thumbnail-pipeline/spec.md`, `openspec/specs/photo-lightbox-slideshow/spec.md`.

## Why

The core gallery shipped in change id **`gallery-organization`** (archived 2026-03-21) — baseline docs: `openspec/changes/archive/2026-03-21-gallery-organization/proposal.md` and `openspec/changes/archive/2026-03-21-gallery-organization/design.md`. Several high-value features were deferred as backlog (search, favorites, compare, slideshow, large-library loading, and efficient list images via Storage transforms). Parents with growing libraries need faster browsing, quick recall of special shots, and simple ways to share or review photos—without ad-hoc workarounds.

**This change** adds formal specs and tasks for that backlog; **`gallery-organization`** documents the shipped baseline and points here for follow-on work. **Cross-references use repo-root paths** (not relative markdown links) so moving either change into `openspec/changes/archive/` does not break links.

## What Changes

- **Caption search** on baby gallery (and parity on month photo section where it fits): filter the visible set by description text (case-insensitive).
- **Favorites**: persist per photo (`is_favorite`), toggle from cards/grid with **optimistic React Query cache updates** (rollback on error), filter “favorites only” in gallery/month contexts.
- **Compare mode**: user picks two photos and views them side-by-side (dialog or dedicated layout); exit compare without losing gallery filters.
- **Slideshow** in the full-screen lightbox: play/pause with configurable delay; respects single-photo and video edge cases.
- **Large libraries**: when photo count is high (e.g. **>500**), load additional pages from the server (infinite scroll or explicit “Load more”) instead of assuming one bulk fetch.
- **List images**: grids use **Supabase Storage image transforms** on signed primary URLs (no separate stored thumbnail object).

## Capabilities

### New Capabilities

- `baby-gallery-advanced`: Search by caption, favorites (toggle + filter), compare-two-photos flow, and UX for large galleries (load more / pagination).
- `photo-thumbnail-pipeline`: Spec for list/grid delivery via signed URLs + Storage image transforms (see `specs/photo-thumbnail-pipeline/spec.md`).
- `photo-lightbox-slideshow`: Slideshow controls and timing in the existing lightbox; accessibility and edge cases (one item, videos).

### Modified Capabilities

- _(None in root `openspec/specs/` today; gallery behavior lives in change specs. If promoted to root specs later, add deltas here.)_

## Impact

- **Database**: New column on `public.photo` for `is_favorite`; migrations + regenerated or hand-updated Supabase TS types.
- **Storage**: One object per photo at `storage_path`; delete removes that object only.
- **Hooks**: `useBabyPhotos` (and month fetch) use pagination / infinite query where designed; `enrichPhotoWithSignedUrls` signs primary path and may apply transform presets. **`useTogglePhotoFavorite`**: `onMutate` patches `is_favorite` in month + baby-gallery query caches (`["photos", babyId, monthNumber]`, `["photos","gallery",babyId,"all"]`, `["photos","gallery",babyId,"pages"]`), returns a `rollback` callback; `onError` runs rollback + toast; `onSettled` invalidates month + gallery keys for that baby. `PhotoCard` heart reads `photo.is_favorite` from props (cache). `useMutation` is not explicitly generic-typed; `Photo` is annotated on mutation callbacks where inference needs it.
- **UI**: `BabyGallery`, `PhotoSection` / `PhotoGrid` / `PhotoCard`, `PhotoLightbox` (+ lazy chunk). `PhotoCard` shows delete only when `onDelete(photo)` is passed, favorite when `onToggleFavorite` is passed (no parallel boolean props). Month `PhotoGrid` keeps parent `onDelete(id)` separate from the card callback (implementation destructures as `onDeleteById`), passes `openDeleteDialog` to the card as `onDelete`, confirms in an alert, then calls the parent by id—no `readOnly` flag. Favorites: `useTogglePhotoFavorite()` + `handleToggleFavorite` in month grid where used.
- **RLS / policies**: Updates must allow owners to toggle `is_favorite` consistent with existing `photo` policies.
