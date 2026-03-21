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
   - For each photo, generate signed URL
   - URLs expire after 1 hour (3600 seconds)
   - Cached in React Query
   - URLs regenerated on fetch (not stored in DB)

6-7. **Grid Display**
   - Render photos in responsive grid (3-4 columns)
   - Use CSS object-cover for uniform sizing
   - Lazy load images (browser native)
   - Show video icon for videos

8-11. **Lightbox View**
   - User clicks photo
   - Open full-screen lightbox
   - Display photo at full resolution (1600px max)
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
- **Generation:** On every fetch (not cached in DB)
- **Expiry:** 1 hour (3600 seconds)
- **Refresh:** Manual refresh if user reports broken images
- **Cache:** React Query caches photos + URLs for 5 minutes

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
**Scenario:** Gallery has 100+ photos  
**Handling:**
- All photos fetched at once (no pagination yet)
- Browser lazy loads images (native)
- May be slow on initial load
- Future: Implement pagination (20-30 per page)

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
- **useFetchPhotos** - Fetch photos hook
- **usePhotos** - Composite hook
- **Photo type** - TypeScript types

### External
- **yet-another-react-lightbox** - Lightbox component
- **Supabase Storage** - Signed URL generation
- **React Query** - Data fetching and caching

### Components
- **PhotoGrid** - Grid display component
- **PhotoSection** - Month-specific photos
- **Lightbox** - Full-screen viewer (from library)
- **HeicImage** - Handles HEIC display (fallback)

### Database Query
```typescript
const { data, error } = await supabase
  .from("photo")
  .select("*")
  .eq("baby_id", babyId)
  .eq("month_number", monthNumber)  // Optional
  .order("created_at", { ascending: false });
```

### Signed URL Generation
```typescript
const photosWithUrls = await Promise.all(
  photos.map(async (photo) => {
    const { data } = await supabase.storage
      .from("baby_images")
      .createSignedUrl(photo.storage_path, 3600);
    
    return { ...photo, url: data?.signedUrl };
  })
);
```

---

## Related Capabilities
- `upload-photo` - Add photos to gallery
- `delete-photo` - Remove photos from gallery
- `caption-photo` - Edit photo descriptions

---

## Known Issues & Future Improvements

### Known Issues
1. **No pagination** - All photos fetched at once (slow for 100+ photos)
2. **URL expiry** - Manual refresh needed after 1 hour
3. **No image optimization** - Fetches full compressed size (not thumbnails)
4. **No lazy loading** - All signed URLs generated upfront
5. **Video thumbnails** - No thumbnail generation for videos

### Future Improvements
1. **Pagination** - Load 20-30 photos per page
2. **Infinite scroll** - Load more as user scrolls
3. **Thumbnail sizes** - Fetch optimized sizes for grid
4. **URL refresh** - Auto-regenerate expired URLs
5. **Virtual scrolling** - Better performance for large galleries
6. **Masonry layout** - Pinterest-style variable heights
7. **Bulk actions** - Select multiple, delete/download batch
8. **Search/filter** - Find photos by caption/date
9. **Photo metadata** - Show EXIF data, location
10. **Video thumbnails** - Generate preview images for videos

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
- [ ] Large galleries (50+ photos) load acceptably
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
- **Fetch Hook:** `src/hooks/useFetchPhotos.tsx`
- **Composite Hook:** `src/hooks/usePhotos.tsx`
- **Grid Component:** `src/components/PhotoGrid.tsx`
- **Section Component:** `src/components/month/PhotoSection.tsx`
- **Gallery Page:** `src/pages/BabyGallery.tsx`

### Key Functions
```typescript
// From useFetchPhotos.tsx
export const useFetchPhotos = (babyId?: string, monthNumber?: number) => {
  return useQuery({
    queryKey: ["photos", babyId, monthNumber],
    queryFn: async () => {
      // 1. Fetch photos
      let query = supabase
        .from("photo")
        .select("*")
        .eq("baby_id", babyId)
        .order("created_at", { ascending: false });
      
      if (monthNumber) {
        query = query.eq("month_number", monthNumber);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // 2. Generate signed URLs
      const photosWithUrls = await Promise.all(
        data.map(async (photo) => {
          const { data: urlData } = await supabase.storage
            .from("baby_images")
            .createSignedUrl(photo.storage_path, 3600);
          
          return { ...photo, url: urlData?.signedUrl };
        })
      );
      
      return photosWithUrls;
    },
    enabled: !!babyId,
  });
};
```

### Cache Strategy
```typescript
// React Query caches for 5 minutes (default)
// Invalidated on:
// - Photo upload
// - Photo deletion
// - Caption update

queryClient.invalidateQueries(["photos", babyId, monthNumber]);
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
