## Context

- Gallery v1 is implemented (OpenSpec change **`gallery-organization`**, archived at `openspec/changes/archive/2026-03-21-gallery-organization/`): Baby Gallery route, month views, grid/timeline, lightbox with lazy-loaded `yet-another-react-lightbox`, client-side filters, Supabase `photo` rows + `baby_images` storage, signed URLs, optional Supabase **image transform** params for resized delivery (not separate stored files today).
- Backlog items are user-visible product features spanning **data model**, **fetch strategy**, **upload pipeline**, and **lightbox plugins**.

## Goals / Non-Goals

**Goals:**

- Ship the six backlog themes with predictable UX, minimal regression risk for small libraries, and clear limits where needed (slideshow + video).
- Keep parity where reasonable between **Baby Gallery** and **month PhotoSection** for search and favorites (compare may be gallery-first if month UI is cramped).

**Non-Goals:**

- Social sharing, collaborative albums, AI tagging, or bulk multi-select beyond what compare needs.
- Gallery PDF export (removed from product; not enough demand vs maintenance).
- Server-generated PDFs or email delivery.
- Storing a second thumbnail object in `baby_images` plus `thumbnail_storage_path` on `photo`—list/grid use **Supabase Storage image transforms** on signed primary URLs instead.

## Decisions

1. **Favorites persistence and toggle UX**  
   - **Choice (data)**: `photo.is_favorite boolean NOT NULL DEFAULT false`. Single source of truth for gallery and month queries; no join table.  
   - **Choice (client)**: `useTogglePhotoFavorite` uses TanStack Query **cache** optimistic updates: `onMutate` cancels `["photos"]` queries, snapshots then patches `is_favorite` for the toggled row in (a) month list `["photos", babyId, monthNumber]`, (b) gallery small fetch `["photos","gallery",babyId,"all"]`, (c) gallery infinite `["photos","gallery",babyId,"pages"]`; returns `{ rollback }` to restore snapshots on `onError` (plus error toast); `onSettled` invalidates month + gallery keys for that baby. `PhotoCard` heart reads `photo.is_favorite` from the cached row—no `useMutationState` / dedicated `mutationKey` for this flow.  
   - **Rationale**: Durable favorites across devices; instant UI without duplicating favorite state in card-local state; rollback if the mutation fails.  
   - **Alternative**: Client-only favorites → rejected. Pessimistic-only toggle or `useMutationState`-only optimistic → rejected for lag or extra wiring.

2. **List/grid image size (no stored thumbnail file)**  
   - **Choice**: Single object per photo at `storage_path`. After signing, apply Supabase **image transformation** URLs (`/render/image/` + width/quality presets via `getTransformedUrl` / `HeicImage` size) for cards; lightbox keeps full-quality path as today.  
   - **Rationale**: Fewer uploads and DB fields; transforms are built into Storage on Pro+; avoids orphan `t/` objects and delete complexity.  
   - **Alternative**: Pre-generated thumbnail object + column → rejected (extra pipeline and storage for marginal gain here).

3. **Large library loading**  
   - **Choice**: `useInfiniteQuery` (or equivalent) for baby-level photo list with stable ordering (`created_at desc`, `id desc` tie-break) and page size ~100; UI exposes **Load more** (and optionally infinite scroll later). Switch to paginated mode when total count **> 500** *or* always use infinite query for baby gallery if it simplifies code (one code path).  
   - **Rationale**: Bounded memory and network; predictable Supabase `range()`.  
   - **Alternative**: Always full fetch → rejected for >500 requirement.

4. **Caption search**  
   - **Choice**: Client-side filter over the loaded set for typical libraries; for paginated mode, search applies to **loaded pages** unless we add server `ilike`—document that search may be “within loaded photos” until a future server-search change.  
   - **Rationale**: Avoids new RPC for v1; acceptable with load-more.  
   - **Alternative**: Server full-text → defer unless product insists.

5. **Compare mode**  
   - **Choice**: Explicit mode on Baby Gallery: user selects two items (click-to-select), then **Compare** opens a dialog with two panels (responsive stack on narrow view).  
   - **Rationale**: Clear mental model; no change to default single-click opens lightbox unless we use a modifier (prefer dedicated mode to avoid accidental opens).

6. **Slideshow**  
   - **Choice**: Official `yet-another-react-lightbox` **Slideshow** plugin; toolbar play/pause; default autoplay off; delay ~4s; disable or no-op for video slides if library behavior is awkward (document in spec).  
   - **Rationale**: Maintained plugin vs custom timer.

7. **React Query keys**  
   - **Choice**: Distinct key for baby gallery infinite list e.g. `["photos", "gallery", babyId]`; invalidate on upload/delete/favorite alongside existing `["photos", babyId, monthNumber]`.  
   - **Rationale**: Avoid stale gallery after month upload.

8. **Month `PhotoGrid`: no read-only mode**  
   - **Choice**: Remove `readOnly` from `PhotoGrid`. `PhotoCard` exposes `onDelete?: (photo: Photo) => void` and `onToggleFavorite?: (photo: Photo) => void`; delete and favorite chrome appear only when those props are passed (no `showDeleteButton` / `showFavoriteButton`). The grid’s **parent** prop remains `onDelete?: (id: string) => void` (invoked only after the user confirms in an alert dialog). In code, destructure that prop as `onDeleteById` so it is not confused with the card prop, then pass `onDelete={onDeleteById ? openDeleteDialog : undefined}` where `openDeleteDialog` sets dialog state with the full `Photo`. On confirm, call `onDeleteById(photoToDelete.id)` and clear state. Wire favorites with a named `handleToggleFavorite` that delegates to `useTogglePhotoFavorite`’s `mutate` (a plain function is enough; memoization not required).  
   - **Rationale**: One source of truth (handlers present or absent); avoids redundant boolean props and name shadowing between parent id-delete and card photo-delete.  
   - **Alternative**: Guest/read-only grid variant → use a separate component or page if needed later, not a prop on this grid.

## Risks / Trade-offs

- **[Risk] RLS blocks `UPDATE` on `is_favorite`** → **Mitigation**: migration documents required policy; verify in staging.  
- **[Risk] Compare mode vs lightbox click** → **Mitigation**: only alter click behavior when compare mode is active.  
- **[Risk] Search incomplete under pagination** → **Mitigation**: UI hint “Search applies to loaded photos” or load-all when search non-empty (optional follow-up).

## Migration Plan

1. Apply SQL migration (`is_favorite` + RLS).  
2. Deploy app that matches schema (deploy migration before or same release as app).  
3. No thumbnail object backfill—grids rely on transforms only.  
4. Rollback: revert migration / app in lockstep if needed.

## Open Questions

- Should month view get compare in v1 or gallery-only? (Default: gallery-first; month gets search + favorites.)
