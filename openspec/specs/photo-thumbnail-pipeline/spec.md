# photo-thumbnail-pipeline Specification

## Purpose

Grid, collage, compare, and lightbox views SHALL NOT rely on a second stored object for thumbnails. The **`Photo.url`** field SHALL be a **signed Supabase object URL** only (no transform query baked in at enrich time). **Supabase Storage image transformations** (`/storage/v1/render/image/` + params) SHALL be applied in **`PhotoImage`** via the optional `size` prop, which calls `getTransformedUrl`.

## Requirements

### Requirement: No separate thumbnail storage path on `photo`

The system SHALL NOT require a `thumbnail_storage_path` (or equivalent) column for core grid behavior. Optional video poster paths remain out of scope unless specified elsewhere.

#### Scenario: New image upload

- **WHEN** a new image is uploaded and the row is inserted with `storage_path`
- **THEN** no second thumbnail object is required for the grid to render a resized image

### Requirement: Enrichment signs only

`enrichPhotoWithSignedUrls` / `enrichPhotosWithSignedUrls` SHALL call `createSignedUrl` for `storage_path` and set **`Photo.url`**. They SHALL NOT call `getTransformedUrl`.

#### Scenario: Fetch photos

- **WHEN** photo rows are enriched after a DB query
- **THEN** each image row has `url` as the signed object URL, suitable as `PhotoImage`’s `src`

### Requirement: Transforms only in PhotoImage (display)

For non-video images shown with **`PhotoImage`**, callers SHALL pass an **`ImageSize`** preset when a transformed request is desired (`thumbnail`, `preview`, `display`, `full`). **`PhotoImage`** SHALL apply `getTransformedUrl(src, size)` when `size` is set and `src` is not treated as video.

#### Scenario: Grid card

- **WHEN** `PhotoCard` renders a still image
- **THEN** it uses `PhotoImage` with `src={photo.url}` and a grid-appropriate `size` (default `thumbnail`)

#### Scenario: Lightbox main slide

- **WHEN** `PhotoLightboxContent` renders the active slide for a still image
- **THEN** it uses `PhotoImage` with `size="full"` (or equivalent) so the main view matches other display transforms

### Requirement: Delete removes only primary object

When a photo is deleted, storage cleanup SHALL remove the primary object at `storage_path`. No separate thumbnail object is assumed.

#### Scenario: Delete photo

- **WHEN** a photo row is deleted
- **THEN** the object at `storage_path` is removed from `baby_images` (and the DB row removed) without a second thumbnail path

### Requirement: Videos unchanged

- **WHEN** the asset is a video
- **THEN** image transform presets do not apply to the video file; use the signed `url` on `<video>` (grid, lightbox custom slide render, etc.)

### Requirement: Plan compatibility

Image transformation URLs depend on the project’s Supabase plan. If transformation is unavailable, behavior follows `getTransformedUrl` / fallbacks as implemented.

### Requirement: PhotoImage rendering model

**Transform URL:** For each render, when `size` is set and `src` is not a video URL, the request URL is `getTransformedUrl(src, size)`; otherwise the raw `src` is used. No `useMemo` is required for that derivation.

**HEIC / HEIF in the browser:** If the resolved URL looks like HEIC (path or token heuristics via `urlLooksLikeHeic`), `PhotoImage` runs an async pipeline in `useEffect`: fetch → `convertHeicToWebFormat` → `URL.createObjectURL` for an `<img>`-friendly preview. A ref tracks the blob URL so **`revokeObjectURL`** runs on dependency change, unmount, and error fallback (no revoke from a stray `return` inside the async callback).

**Effect shape:** The effect defines a named `async function fetchConvertAndSetHeicPreview()` and invokes it with **`void fetchConvertAndSetHeicPreview()`** so the effect callback stays synchronous while the promise is intentionally not awaited (valid React pattern).

**Display URL:** `heicObjectUrl ?? transformedSrc` — non-HEIC images use only the transformed or raw URL; HEIC uses the object URL when conversion succeeds.

---

## Implementation reference (as built)

| Area | Location |
|------|----------|
| Sign only | `src/utils/enrichPhotoWithSignedUrls.ts` |
| Display image + HEIC preview | `src/components/PhotoImage.tsx` (`getTransformedUrl`, `urlLooksLikeHeic`, blob ref cleanup) |
| Presets | `src/utils/supabaseImageTransform.ts` |
| `Photo.url` | `src/types/photo.ts` |
| Grid | `PhotoCard`, `PhotoCollage`, `PhotoCompareDialog` |
| Lightbox | `PhotoLightboxContent` (`render.slide` + `PhotoImage`) |

**Status:** Production (aligned with app as of 2026-03-22)
