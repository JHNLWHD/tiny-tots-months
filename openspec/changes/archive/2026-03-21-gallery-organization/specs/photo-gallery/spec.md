# Capability: Baby Gallery (All Photos View)

> **Amendment:** **PDF export** for the baby gallery was later removed from product scope and is not a follow-on requirement in current `gallery-backlog-features` specs. The next paragraph still lists PDF as originally planned when this spec was archived.

## Overview
Provide a dedicated page for browsing all photos and videos for a specific baby, with powerful filtering and organization options. This is the primary photo browsing experience outside of the month-specific context.

**Follow-on requirements** (caption search, favorites, compare, PDF export later removed, large-library loading, list images via Storage transforms) are specified under change **`gallery-backlog-features`** (archived): `openspec/specs/baby-gallery-advanced/spec.md` and `openspec/specs/photo-thumbnail-pipeline/spec.md` (canonical; archived deltas under `openspec/changes/archive/2026-03-21-gallery-backlog-features/specs/`).

## Inputs

### Route Parameters
```typescript
{
  babyId: string;  // UUID of baby whose photos to display
}
```

### User Controls
```typescript
type GalleryControls = {
  filterMonth: 'all' | '1' | '2' | ... | '12';     // Which month to show
  filterType: 'all' | 'photos' | 'videos';         // Media type filter
  viewMode: 'grid' | 'timeline';                   // Display layout
};
```

## Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    BABY GALLERY FLOW                        │
└─────────────────────────────────────────────────────────────┘

User clicks "Gallery" link for selected baby
  │
  ├─ Navigate to /app/gallery/:babyId
  │
  ├─ BabyGallery page loads
  │   ↓
  │   Fetch baby data: useBabyProfiles()
  │   Fetch all photos: useBabyPhotos(babyId)
  │   ↓
  │   SELECT * FROM photo
  │   WHERE baby_id = :babyId
  │   ORDER BY created_at DESC;
  │   ↓
  │   Generate signed URLs for each photo
  │   ↓
  │   Return: Photo[] (e.g., 42 photos)
  │
  ├─ INITIAL RENDER
  │   ↓
  │   Header:
  │   • Title: "Emma's Gallery"
  │   • Stats: "42 items • Born Dec 15, 2025"
  │   • Back button → /app
  │   ↓
  │   Filter Bar:
  │   • Month: "All Months" (dropdown)
  │   • Type: "All Media" (dropdown)
  │   • View: "Grid" (button), "Timeline" (button)
  │   ↓
  │   Photo Grid:
  │   • Responsive grid (1-5 columns based on screen)
  │   • Photos sorted newest first
  │   • Each photo has month badge
  │   • Video indicator on videos
  │
  ├─ USER APPLIES MONTH FILTER
  │   ↓
  │   User selects "Month 3" from dropdown
  │   ↓
  │   setFilterMonth('3')
  │   ↓
  │   useMemo recalculates filteredPhotos:
  │   photos.filter(p => p.month_number === 3)
  │   ↓
  │   Grid re-renders with 8 photos
  │   ↓
  │   Stats update: "8 items"
  │
  ├─ USER APPLIES TYPE FILTER
  │   ↓
  │   User selects "Videos Only"
  │   ↓
  │   setFilterType('videos')
  │   ↓
  │   Further filter: filteredPhotos.filter(p => p.is_video)
  │   ↓
  │   Grid shows 2 videos from Month 3
  │   ↓
  │   Stats update: "2 items"
  │
  ├─ USER SWITCHES TO TIMELINE VIEW
  │   ↓
  │   User clicks "Timeline" button
  │   ↓
  │   setViewMode('timeline')
  │   ↓
  │   Group filtered photos by month:
  │   photosByMonth = { 3: [video1, video2] }
  │   ↓
  │   Render timeline:
  │   - Card for "Month 3"
  │   - "2 items" subtitle
  │   - Grid of 2 videos within card
  │
  ├─ USER CLICKS PHOTO
  │   ↓
  │   onClick handler: openLightbox(photoIndex)
  │   ↓
  │   setLightboxIndex(1)  // Second video
  │   setLightboxOpen(true)
  │   ↓
  │   PhotoLightbox renders:
  │   • Full-screen overlay
  │   • Video player for selected video
  │   • Caption: "[Caption] • Month 3 • Feb 10, 2026"
  │   • Thumbnail strip at bottom (2 videos)
  │   • Download button
  │   ↓
  │   User can navigate, download, or close
  │
  └─ USER CLEARS FILTERS
      ↓
      Selects "All Months" and "All Media"
      ↓
      filteredPhotos = photos (all 42 items)
      ↓
      Grid/Timeline shows all photos again
```

## Outputs

### Success Case: Photos Found
```json
{
  "baby": {
    "id": "baby-uuid",
    "name": "Emma",
    "date_of_birth": "2025-12-15"
  },
  "photos": [
    {
      "id": "photo-uuid-1",
      "url": "https://...signed-url...",
      "month_number": 3,
      "description": "First smile!",
      "is_video": false,
      "created_at": "2026-03-10T10:00:00Z"
    },
    // ... 41 more photos
  ],
  "filteredPhotos": [
    // Subset based on filters
  ],
  "stats": {
    "totalCount": 42,
    "filteredCount": 8
  }
}
```

**UI Display:**
- Header: "Emma's Gallery"
- Stats: "8 items • Born Dec 15, 2025"
- Grid of 8 photos
- Filters active: Month 3, All Media

### Success Case: No Photos
```json
{
  "baby": { "id": "...", "name": "Emma", ... },
  "photos": [],
  "filteredPhotos": []
}
```

**UI Display:**
- Empty state card with camera icon
- Message: "Start uploading photos and videos for Emma!"
- "Add Photos" button → Navigate to `/app/month/${babyId}/1`

### Success Case: No Photos After Filtering
```json
{
  "baby": { ... },
  "photos": [42 photos],
  "filteredPhotos": []  // No videos in Month 3
}
```

**UI Display:**
- Empty state card with filter icon
- Message: "No media found. Try adjusting your filters."
- Filters remain visible for easy adjustment

### Error Cases

| Error | Cause | UI Response |
|-------|-------|-------------|
| Baby not found | Invalid babyId in URL | "Baby not found" message, "Back to App" link |
| Loading photos | API request in progress | Skeleton grid (8 placeholder cards) |
| Photo fetch error | Network/database error | Error toast, retry button |

## Business Rules

### Filtering
- **Month filter**: Show only photos from selected month (1-12) or all
- **Type filter**: Show photos only, videos only, or all media
- **Combined filters**: Filters are AND logic (Month 3 AND videos)
- **No results**: Show clear empty state with guidance

### Sorting
- **Default**: Newest first (by `created_at` descending)
- **Always applied**: After filtering, before rendering

### View Modes
- **Grid**: Flat array, responsive columns (1-5 based on screen)
- **Timeline**: Grouped by month in cards, newest month first
- **Persistence**: View mode persists per session (local component state)

### Photo Display
- **Month badges**: Always shown in Baby Gallery (context needed)
- **Video indicators**: Play icon overlay on video thumbnails
- **Aspect ratio**: Square cards (aspect-square) for uniform grid
- **Lazy loading**: Images load as user scrolls

### Navigation
- **Back button**: Returns to `/app` (home page)
- **Photo click**: Opens lightbox at clicked photo index
- **Lightbox navigation**: Arrow keys, thumbnails, swipe gestures

## Edge Cases

### Large Photo Collections (100+)
**Scenario:** User has 150 photos for one baby.

**Handling:**
- All photos fetched and cached (React Query)
- Client-side filtering remains instant (<50ms)
- Grid uses lazy loading to only render visible images
- Initial load may take 2-3 seconds (acceptable)

**Future Optimization:** Server-side pagination if >500 photos per baby.

### No Photos for Selected Month
**Scenario:** User filters to Month 8, but baby only has photos up to Month 6.

**Handling:**
- `filteredPhotos` = empty array
- Empty state: "No media found. Try adjusting your filters."
- Filters remain visible, easy to change month

### Expired Signed URLs
**Scenario:** User opens gallery, leaves tab open for 2+ hours, returns.

**Handling:**
- Signed URLs expire after 1 hour
- Images fail to load (404 or 403 errors)
- React Query refetches photos on tab focus (staleTime: 5 min)
- New signed URLs generated
- Images reload automatically

**User Experience:** Brief flicker as images reload, but no manual refresh needed.

### Baby Deleted While Viewing Gallery
**Scenario:** User views gallery, another user deletes baby.

**Handling:**
- Gallery still shows cached photos (React Query)
- If user tries to upload or delete: API error ("Baby not found")
- Error toast prompts navigation back to home
- Home page shows baby no longer exists

### Switching Babies Quickly
**Scenario:** User clicks Gallery for Baby A, then immediately switches to Baby B's gallery.

**Handling:**
- React Query cancels in-flight request for Baby A
- New request for Baby B's photos
- Baby A's photos remain cached for 10 minutes
- Returning to Baby A's gallery is instant (cache hit)

### All Photos Filtered Out
**Scenario:** User has 40 photos (all from Months 1-4), filters to Month 8.

**Handling:**
- `filteredPhotos` = empty array
- Empty state with filter icon
- Message: "No media found. Try adjusting your filters."
- User can easily change filter to see photos

## UI Locations

### Baby Gallery Page (`/app/gallery/:babyId`)

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  [←]  Emma's Gallery                                       │
│       42 items • Born Dec 15, 2025                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Filters: [Month ▼] [Type ▼]        [Grid] [Timeline]     │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Photo] [Photo] [Photo] [Photo] [Photo]                  │
│  [Photo] [Photo] [Photo] [Photo] [Photo]                  │
│  [Photo] [Photo] [Photo] [Photo] [Photo]                  │
│  ...                                                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Header:**
- Back button (arrow left icon) → `/app`
- Title: "[Baby Name]'s Gallery"
- Stats: "X items • Born [date]"

**Filter Bar:**
- Month dropdown: All Months, Month 1-12
- Type dropdown: All Media, Photos Only, Videos Only
- View buttons: Grid (grid icon), Timeline (list icon)

**Grid View:**
- Responsive columns (1-5)
- Photo cards with month badges
- Video indicators (play icon overlay)

**Timeline View:**
- Cards grouped by month
- Card header: "Month X" + photo count
- Grid within each card

### Access Points
- Navigation Hub: "Gallery" link (for selected baby)
- Month Page: "View All Photos" button
- Home Page: "Gallery" in baby card dropdown menu

## Dependencies

### Technical
- **useBabyPhotos Hook**: Fetches all photos for baby
- **useBabyProfiles Hook**: Gets baby metadata
- **React Query**: Caching and invalidation
- **PhotoGrid Component**: Displays photo grid
- **PhotoLightbox Component**: Full-screen viewer
- **Signed URLs**: Generated on photo fetch (1-hour expiry)

### UI Components
- **PhotoCard**: Individual photo with month badge, video indicator
- **Select** (shadcn/ui): Filter dropdowns
- **Button** (shadcn/ui): View mode toggle
- **Card** (shadcn/ui): Timeline month cards

## Implementation Notes

### Baby Gallery Page Component
```typescript
const BabyGallery = () => {
  const { babyId } = useParams();
  const { babies } = useBabyProfiles();
  const { photos = [], isLoading } = useBabyPhotos(babyId);
  
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const baby = babies.find(b => b.id === babyId);

  const filteredPhotos = useMemo(() => {
    let filtered = photos;

    if (filterMonth !== 'all') {
      filtered = filtered.filter(p => p.month_number === parseInt(filterMonth));
    }

    if (filterType === 'photos') {
      filtered = filtered.filter(p => !p.is_video);
    } else if (filterType === 'videos') {
      filtered = filtered.filter(p => p.is_video);
    }

    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [photos, filterMonth, filterType]);

  const photosByMonth = useMemo(() => {
    const grouped = {};
    filteredPhotos.forEach(photo => {
      const month = photo.month_number || 0;
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(photo);
    });
    return grouped;
  }, [filteredPhotos]);

  if (isLoading) return <LoadingSkeleton />;
  if (!baby) return <BabyNotFound />;

  return (
    <div className="gallery-page">
      {/* Header */}
      <div className="header">
        <Link to="/app"><ArrowLeft /></Link>
        <h1>{baby.name}'s Gallery</h1>
        <p>{filteredPhotos.length} items • Born {formatDate(baby.date_of_birth)}</p>
      </div>

      {/* Filters */}
      <Card className="filters">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectItem value="all">All Months</SelectItem>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <SelectItem key={m} value={m.toString()}>Month {m}</SelectItem>
          ))}
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectItem value="all">All Media</SelectItem>
          <SelectItem value="photos">Photos Only</SelectItem>
          <SelectItem value="videos">Videos Only</SelectItem>
        </Select>

        <Button variant={viewMode === 'grid' ? 'default' : 'outline'} 
                onClick={() => setViewMode('grid')}>
          <Grid3X3 /> Grid
        </Button>
        <Button variant={viewMode === 'timeline' ? 'default' : 'outline'} 
                onClick={() => setViewMode('timeline')}>
          <List /> Timeline
        </Button>
      </Card>

      {/* Grid or Timeline */}
      {filteredPhotos.length === 0 ? (
        <EmptyState filters={filterMonth !== 'all' || filterType !== 'all'} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
              showMonthBadge={true}
            />
          ))}
        </div>
      ) : (
        <div className="timeline">
          {Object.entries(photosByMonth)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([month, monthPhotos]) => (
              <Card key={month}>
                <h3>Month {month}</h3>
                <p>{monthPhotos.length} items</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {monthPhotos.map(photo => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onClick={() => {
                        const index = filteredPhotos.findIndex(p => p.id === photo.id);
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                      showMonthBadge={false}
                    />
                  ))}
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Lightbox */}
      <PhotoLightbox
        photos={filteredPhotos}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        babyName={baby.name}
      />
    </div>
  );
};
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
