# Capability: Photo list image delivery (Supabase transforms)

Grid and list views SHALL NOT rely on a second stored object for thumbnails. Delivery SHALL use the primary `storage_path` with **Supabase Storage image transformations** (signed URL + `/render/image/` or equivalent) as implemented in app utilities (e.g. `getTransformedUrl`, `HeicImage` size presets).

## ADDED Requirements

### Requirement: No separate thumbnail storage path on `photo`

The system SHALL NOT require a `thumbnail_storage_path` (or equivalent) column for core grid behavior. Optional video poster paths remain out of scope unless specified elsewhere.

#### Scenario: New image upload

- **WHEN** a new image is uploaded and the row is inserted with `storage_path`
- **THEN** no second thumbnail object is required for the grid to render a resized image

### Requirement: Signed URLs plus transforms for lists

Fetch/enrich logic SHALL produce signed URLs for the primary object. For images in list/grid contexts, the app SHALL apply transformation presets (width/quality/resize) compatible with the project’s Supabase plan.

#### Scenario: Grid render

- **WHEN** a photo card displays a non-video image
- **THEN** the image request uses a transformed variant of the signed primary URL (or the same pipeline as today’s `HeicImage` + size preset)

### Requirement: Delete removes only primary object

When a photo is deleted, storage cleanup SHALL remove the primary object at `storage_path`. No separate thumbnail object is assumed.

#### Scenario: Delete photo

- **WHEN** a photo row is deleted
- **THEN** the object at `storage_path` is removed from `baby_images` (and the DB row removed) without a second thumbnail path

### Requirement: Videos unchanged

- **WHEN** the asset is a video
- **THEN** image transform presets do not apply to the video file; behavior matches existing video handling in the grid/lightbox
