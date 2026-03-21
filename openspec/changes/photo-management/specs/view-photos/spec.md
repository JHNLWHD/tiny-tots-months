# View Photos/Videos Gallery

## Description
Display photos and videos in a responsive grid gallery with lightbox viewer, signed URL generation, and filtering by baby and month. Supports both grid view and full-screen lightbox with navigation.

## Capability ID
`view-photos`

---

## Inputs

| Field        | Type    | Required | Validation          | Notes                           |
|--------------|---------|----------|---------------------|---------------------------------|
| baby_id      | string  | Yes      | Valid UUID          | Filter photos for specific baby |
| month_number | integer | No       | ≥1                  | Filter by month (optional)      |

### Query Parameters
```typescript
// Fetch all photos for a baby
const photos = await fetchPhotos(babyId);

// Fetch photos for specific month
const photos = await fetchPhotos(babyId, monthNumber);
```

---

## Process Flow

```
User                  UI                DB              Storage
 │                    │                 │                 │
 │  1. Navigate to    │                 │                 │
 │     gallery/month  │                 │                 │
 ├───────────────────>│                 │                 │
 │                    │  2. Fetch photos│                 │
 │                    ├────────────────>│                 │
 │                    │                 │  3. Query       │
 │                    │                 │     WHERE       │
 │                    │                 │     baby_id=$1  │
 │                    │                 │     AND month=$2│
 │                    │<────────────────│                 │
 │                    │  (photo list)   │                 │
 │                    │                 │                 │
 │                    │  4. For each photo:               │
 │                    │     Generate signed URL           │
 │                    │─────────────────────────────────>│
 │                    │                 │  5. Create      │
 │                    │                 │     temp URL    │
 │                    │                 │     (1hr expiry)│
 │                    │<─────────────────────────────────│
 │                    │  (signed URLs)  │                 │
 │                    │                 │                 │
 │  6. Display grid   │  7. Render      │                 │
 │<───────────────────│     thumbnails  │                 │
 │                    │                 │                 │
 │  8. Click photo    │  9. Open        │                 │
 ├───────────────────>│     lightbox    │                 │
 │  10. View full     │  11. Fetch full │                 │
 │      size          │      resolution │                 │
 │<───────────────────│                 │                 │
 │                    │                 │                 │
 │  12. Navigate      │  13. Next/prev  │                 │
 │      (arrows/keys) │      photo      │                 │
 ├───────────────────>│                 │                 │
 │<───────────────────│                 │                 │
```

### Step-by-Step Details

1-3. **Gallery Load**
   - User navigates to gallery or month page
   - Fetch photos from database
   - Filter by baby_id and optionally month_number
   - Order by created_at DESC (newest first)

4-5. **Signed URL Generation**
   - For each photo, create one signed object URL for `storage_path` (3600s expiry) → `Photo.url`
   - **Transforms are not applied during enrich**; `PhotoImage` applies `getTransformedUrl` when a `size` preset is passed
   - **Videos** use the same signed `url` on `<video>` (no image transform)
   - React Query caches list data with explicit `staleTime` / `gcTime` (see URL Management)
   - URLs are not persisted in the database

6-7. **Grid Display**
   - Render photos in responsive grid (3-4 columns)
   - Use `PhotoImage` with `src={photo.url}` and a grid preset (e.g. `thumbnail` on `PhotoCard`)
   - Use CSS object-cover for uniform sizing
   - Lazy load images (browser native)
   - Show video icon for videos

8-11. **Lightbox View**
   - User clicks photo
   - Open full-screen lightbox
   - Custom `render.slide` uses `PhotoImage` with `size="full"` for stills; `<video controls>` for videos
   - Download uses raw signed `photo.url` (full object)
   - Show caption if exists
   - Show metadata (date, month)

12-13. **Navigation**
   - Arrow keys or swipe to navigate
   - Next/previous photo in gallery
   - Close with Esc key or close button
   - Supports zoom (pinch or mouse wheel)

---

## Outputs

### Success Case
- **Grid View:** Photos displayed in responsive grid
- **Loading State:** Skeleton or spinner while fetching
- **Empty State:** "No photos yet" if no photos
- **Lightbox:** Full-screen viewer with navigation

### Error Cases
| Error Type | Message | Handling |
|------------|---------|----------|
| Fetch failed | "Failed to load photos" | Show error message, retry button |
| Signed URL generation failed | (Silent) Photo not displayed | Skip photo, log error |
| Image load failed (404) | Broken image icon | Show placeholder, "Failed to load" |
| URL expired | 404 on image | Regenerate signed URL, retry |

---

## Business Rules

### Display Rules
1. **Newest first** - Photos ordered by created_at DESC
2. **Grid layout** - 3-4 columns depending on screen size
3. **Aspect ratio** - Maintain with object-cover (may crop)
4. **Videos** - Show play icon overlay
5. **Empty state** - Show upload prompt if no photos

### Filtering
```typescript
// All photos for baby
SELECT * FROM photo WHERE baby_id = $1 ORDER BY created_at DESC;

// Photos for specific month
SELECT * FROM photo 
WHERE baby_id = $1 AND month_number = $2 
ORDER BY created_at DESC;

// Gallery page: All photos across all months
SELECT * FROM photo WHERE baby_id = $1 ORDER BY created_at DESC;
```

### URL Management
- **Generation:** On fetch (not stored in DB); one `createSignedUrl` per row (object URL on `Photo.url`); display transforms in `PhotoImage`
- **Expiry:** 1 hour (3600 seconds)
- **Refresh:** Refetch invalidates queries (upload, delete, favorite toggle, etc.); user can refresh the page
- **Cache:** `src/constants/photoQueryCache.ts` — `PHOTO_QUERY_STALE_MS` (5 minutes) and `PHOTO_QUERY_GC_MS` (50 minutes) so cached data is refreshed before typical signed URL expiry

### Responsive Sizing
```
Mobile:    2 columns, 150px thumbnails
Tablet:    3 columns, 200px thumbnails
Desktop:   4 columns, 250px thumbnails
Lightbox:  Full screen, up to 1600px
```

---

## Edge Cases

### 1. Signed URL Expires While Viewing
**Scenario:** User opens gallery, URL expires after 1 hour  
**Handling:**
- Image fails to load (404)
- Show error state
- User refreshes page → new URLs generated
- Future: Auto-regenerate on error

### 2. Many Photos (100+)
**Scenario:** Baby gallery (`/app/baby/:id/gallery`) has many photos  
**Handling:**
- **Baby gallery:** Fetched in pages of **24** via `useInfiniteQuery` (`useBabyPhotos`); **Load more** button and **infinite scroll** (IntersectionObserver) load additional pages
- **Month page:** Still loads **all** photos for that baby + month in one query so client-side sort (newest/oldest/description), caption search, and favorites filtering stay correct on the full set
- Browser lazy-loads images in the DOM where applicable

### 3. Video Playback in Lightbox
**Scenario:** User clicks video in gallery  
**Handling:**
- Lightbox shows video player
- Uses browser native video controls
- Some formats may not play (browser-dependent)
- Show "Video format not supported" if fails

### 4. Mixed Photos and Videos
**Scenario:** Month has both photos and videos  
**Handling:**
- Display in same grid
- Videos show play icon
- Clicking video opens lightbox with player
- No special filtering

### 5. No Photos Available
**Scenario:** Baby has no photos yet  
**Handling:**
```
┌─────────────────────────────────────┐
│                                     │
│        📷 No photos yet             │
│                                     │
│   Start capturing memories by       │
│   uploading your first photo!       │
│                                     │
│        [Upload Photo]               │
│                                     │
└─────────────────────────────────────┘
```

### 6. HEIC Images in Gallery
**Scenario:** User uploaded HEIC, converted to JPEG  
**Handling:**
- Stored as JPEG in storage
- Displays normally (no special handling)
- Conversion happened at upload time

### 7. Slow Network
**Scenario:** Images take long to load  
**Handling:**
- Show loading skeleton/spinner
- Browser handles progressive JPEG loading
- User can navigate before all images load

---

## UI Locations

### Entry Points
1. **Month Page** (`/app/month/:babyId/:monthNumber`)
   - Photos section below milestones
   - Grid of photos for that month

2. **Gallery Page** (`/app/baby/:babyId/gallery`)
   - All photos for baby across all months
   - Filterable by month

3. **Home Page** - "View Gallery" button

### Visual Layout

**Grid View:**
```
┌─────────────────────────────────────────────────┐
│  Photos (12)                      [Upload +]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │ Photo  │  │ Photo  │  │ Photo  │           │
│  │   1    │  │   2    │  │   3    │           │
│  │  [🗑]  │  │  [🗑]  │  │  [🗑]  │           │
│  └────────┘  └────────┘  └────────┘           │
│                                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │ Video  │  │ Photo  │  │ Photo  │           │
│  │  [▶]   │  │   5    │  │   6    │           │
│  │  [🗑]  │  │  [🗑]  │  │  [🗑]  │           │
│  └────────┘  └────────┘  └────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Lightbox View:**
```
┌─────────────────────────────────────────────────┐
│                                         [X]     │
│                                                 │
│                                                 │
│              ┌───────────────┐                  │
│     [<]      │               │      [>]         │
│              │     PHOTO     │                  │
│              │   FULL SIZE   │                  │
│              │               │                  │
│              └───────────────┘                  │
│                                                 │
│        "First steps at the park!"               │
│        Month 3 • Jan 15, 2024                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Dependencies

### Internal
- **useFetchPhotos** - Month-scoped photos (full list + signed URLs)
- **useBabyPhotos** - Baby-wide gallery (paginated + infinite scroll)
- **usePhotos** - Composite hook (month page)
- **Photo type** - TypeScript types (`url` = signed object URL)

### External
- **yet-another-react-lightbox** - Lightbox component
- **Supabase Storage** - Signed URL generation
- **React Query** - Data fetching and caching

### Components
- **PhotoGrid** - Grid display component
- **PhotoSection** - Month-specific photos
- **Lightbox** - Full-screen viewer (from library)
- **PhotoImage** - Signed `src` + optional Supabase `size` preset; client HEIC/HEIF fetch→convert→object URL when URL looks like HEIC; blob URL revoked on effect cleanup

### Database Query
```typescript
const { data, error } = await supabase
  .from("photo")
  .select("*")
  .eq("baby_id", babyId)
  .eq("month_number", monthNumber)  // Optional
  .order("created_at", { ascending: false });
```

### Signed URL enrichment (no transform here)
```typescript
import { enrichPhotosWithSignedUrls } from "@/utils/enrichPhotoWithSignedUrls";

const photos = await enrichPhotosWithSignedUrls(rows);
// PhotoImage(src: photo.url, size: 'thumbnail' | 'full' | …) applies transforms.
```

---

## Related Capabilities
- `upload-photo` - Add photos to gallery
- `delete-photo` - Remove photos from gallery
- `caption-photo` - Edit photo descriptions
- `photo-thumbnail-pipeline` (workspace spec: `openspec/specs/photo-thumbnail-pipeline/spec.md`) - Sign in enrich; transform in `PhotoImage`

---

## Known Issues & Future Improvements

### Known Issues
1. **Month page scale** - Very large single-month libraries load all rows at once (by design for sort/filter correctness)
2. **URL expiry** - After ~1 hour without refetch, images may 404 until page refresh or query refetch
3. **Video thumbnails** - No generated poster image; grid uses video element / play affordance
4. **Signed URL volume** - Each visible row still requires signing work on fetch (batched per row, not per variant beyond transform URLs)

### Future Improvements
1. **URL refresh** - Auto-regenerate on image `error` / 404
2. **Virtual scrolling** - For very large baby galleries after load
3. **Month pagination** - If needed: server-driven sort + filters with matching API (or hybrid load-all when filters active)
4. **Masonry layout** - Pinterest-style variable heights
5. **Bulk actions** - Select multiple, delete/download batch
6. **Search/filter** - Server-side or indexed caption search across months
7. **Photo metadata** - EXIF, location
8. **Video thumbnails** - Generated poster frame or uploaded poster path

---

## Testing Checklist

### Functional Tests
- [ ] Gallery displays all photos for baby
- [ ] Month filter works correctly
- [ ] Photos ordered newest first
- [ ] Lightbox opens on click
- [ ] Navigation arrows work (next/prev)
- [ ] Keyboard shortcuts work (←/→/Esc)
- [ ] Captions display in lightbox
- [ ] Videos play in lightbox

### Performance Tests
- [ ] Gallery loads in <2 seconds (10 photos)
- [ ] Signed URLs generate quickly (<100ms each)
- [ ] Large baby galleries: first page (~24 items) loads without fetching entire library
- [ ] Load more / infinite scroll fetches next page without duplicating prior rows
- [ ] Images lazy load on scroll

### Edge Case Tests
- [ ] Empty gallery shows empty state
- [ ] Mixed photos and videos display correctly
- [ ] Expired URLs show error (manual test)
- [ ] Video formats display correctly
- [ ] Broken image shows placeholder

### Responsive Tests
- [ ] Grid responsive on mobile (2 columns)
- [ ] Grid responsive on tablet (3 columns)
- [ ] Grid responsive on desktop (4 columns)
- [ ] Lightbox works on mobile (swipe)

---

## Implementation Notes

### Code Locations
- **Month fetch:** `src/hooks/useFetchPhotos.tsx` — `useQuery`, full month list, `enrichPhotosWithSignedUrls(rows)`, `PHOTO_QUERY_*` cache tuning
- **Baby gallery fetch:** `src/hooks/useBabyPhotos.tsx` — `useInfiniteQuery`, page size **24**, same enrichment
- **Composite (month page):** `src/hooks/usePhotos.tsx`
- **Enrichment:** `src/utils/enrichPhotoWithSignedUrls.ts`
- **Transforms:** `src/utils/supabaseImageTransform.ts`
- **Cache constants:** `src/constants/photoQueryCache.ts`
- **Grid / collage:** `src/components/PhotoGrid.tsx`, `PhotoCard.tsx`, `PhotoCollage.tsx`
- **Month UI:** `src/components/month/PhotoSection.tsx`
- **Gallery UI:** `src/pages/BabyGallery.tsx` (infinite scroll sentinel + load more)
- **Lightbox:** `src/components/PhotoLightboxContent.tsx` (`render.slide` + `PhotoImage` / `<video>`)

### Key behavior
- **Query keys:** Month `["photos", babyId, monthNumber]`; gallery pages `["photos", "gallery", babyId, "pages"]`
- **Invalidation:** Upload/delete/favorite mutations invalidate month and gallery prefixes via `queryClient.invalidateQueries`
- **Optimistic favorites:** `useTogglePhotoFavorite` patches month `Photo[]` and gallery infinite pages

### Cache strategy
```typescript
// src/constants/photoQueryCache.ts
export const PHOTO_QUERY_STALE_MS = 5 * 60 * 1000;
export const PHOTO_QUERY_GC_MS = 50 * 60 * 1000;

// Applied to useFetchPhotos + useBabyPhotos photo queries
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-22  
**Version:** 1.2
