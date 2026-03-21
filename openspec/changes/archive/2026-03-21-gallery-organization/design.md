# Gallery & Organization - System Design

> **Amendment:** **Baby gallery PDF export** was later removed from product scope and is not in active `gallery-backlog-features` specs. The paragraph that points to `gallery-backlog-features` still lists PDF as originally planned when this document was archived.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  GALLERY & ORGANIZATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐ │
│  │  Baby        │───▶│    Month      │───▶│   Photo      │ │
│  │  Gallery     │    │    View       │    │   Grid       │ │
│  │  (All photos)│    │  (Context)    │    │  (Display)   │ │
│  └──────────────┘    └───────────────┘    └──────────────┘ │
│         │                     │                    │        │
│         │                     │                    │        │
│         ▼                     ▼                    ▼        │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐ │
│  │   Filters    │    │    Sorting    │    │  Lightbox    │ │
│  │ (Month/Type) │    │ (Order/View)  │    │ (Full-screen)│ │
│  └──────────────┘    └───────────────┘    └──────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
BabyGallery Page (/app/gallery/:babyId)
├─ Header (Title, Stats, Filters)
├─ Filter Bar (Month, Type, View Mode)
├─ Photo Grid OR Timeline View
│   ├─ PhotoCard (individual photo with month badge)
│   └─ ... more PhotoCards
└─ PhotoLightbox (overlay, conditionally rendered)

Month Page (/app/month/:babyId/:monthNumber)
├─ MonthHeader
├─ BabySelector
├─ Tabs (Photos | Milestones)
└─ PhotoSection
    ├─ PhotoUploader
    ├─ Sort/View Controls
    ├─ PhotoGrid OR Collage
    └─ PhotoLightbox

PhotoGrid Component (reusable)
├─ Maps over photos array
├─ Renders PhotoCard for each
├─ Handles click → opens lightbox
└─ Delete dialog (if editable)

PhotoLightbox Component (reusable)
├─ yet-another-react-lightbox library
├─ Plugins: Captions, Download, Thumbnails
├─ Navigation (arrows, thumbnails, keyboard)
└─ Download functionality
```

## Data Flow

### Fetching Photos

```
Component mounts (BabyGallery or Month page)
  │
  ├─ Call useBabyPhotos(babyId) or useMonthPhotos(babyId, monthNumber)
  │   ↓
  │   React Query fetches photos from Supabase
  │   ↓
  │   SELECT * FROM photo
  │   WHERE baby_id = :babyId
  │   [AND month_number = :monthNumber]
  │   ORDER BY created_at DESC;
  │   ↓
  │   For each photo:
  │   - Generate signed URL (1-hour expiry)
  │   - Attach to photo object as `url` field
  │   ↓
  │   Return: Photo[] with URLs
  │
  ├─ React Query caches result
  │   • Key: ['photos', babyId] or ['photos', babyId, monthNumber]
  │   • Stale time: 5 minutes
  │   • Cache time: 10 minutes
  │
  └─ Component receives photos array
      ↓
      Apply client-side filtering (if any)
      ↓
      Apply sorting
      ↓
      Render grid/timeline
```

### Client-Side Filtering

```
User changes filter (month or type)
  │
  ├─ Update filter state: setFilterMonth('3')
  │   ↓
  │   useMemo recalculates filteredPhotos:
  │   ↓
  │   let filtered = photos;
  │   
  │   if (filterMonth !== 'all') {
  │     filtered = filtered.filter(p => p.month_number === parseInt(filterMonth));
  │   }
  │   
  │   if (filterType === 'photos') {
  │     filtered = filtered.filter(p => !p.is_video);
  │   } else if (filterType === 'videos') {
  │     filtered = filtered.filter(p => p.is_video);
  │   }
  │   
  │   return filtered.sort((a, b) => newest first);
  │   ↓
  │   Grid re-renders with filtered photos
  │
  └─ No network request, instant update
```

### Lightbox Flow

```
User clicks photo in grid
  │
  ├─ onClick handler:
  │   const index = photos.findIndex(p => p.id === clickedPhotoId);
  │   setLightboxIndex(index);
  │   setLightboxOpen(true);
  │
  ├─ PhotoLightbox renders:
  │   ↓
  │   Transform photos to lightbox slides:
  │   photos.map(photo => ({
  │     src: photo.url,
  │     title: photo.description || `Month ${photo.month_number}`,
  │     description: `${photo.description}\n\nMonth ${photo.month_number} • ${date}`,
  │     download: { url: photo.url, filename: `${babyName}-month-${month}-${id}.jpg` }
  │   }))
  │   ↓
  │   <Lightbox
  │     open={true}
  │     index={clickedIndex}
  │     slides={transformedSlides}
  │     plugins={[Captions, Download, Thumbnails]}
  │   />
  │
  ├─ User navigates:
  │   • Arrow keys → Next/Prev photo
  │   • Click thumbnails → Jump to photo
  │   • Swipe gestures (mobile) → Next/Prev
  │   ↓
  │   Lightbox internal state updates index
  │   ↓
  │   Slide transitions smoothly
  │
  ├─ User downloads:
  │   • Click download icon
  │   ↓
  │   Fetch photo as Blob: fetch(slide.download.url).then(r => r.blob())
  │   ↓
  │   Create download link: <a href={blobURL} download={filename} />
  │   ↓
  │   Trigger click programmatically
  │   ↓
  │   Photo saves to user's device
  │
  └─ User closes (Escape key or close button):
      setLightboxOpen(false);
      ↓
      Lightbox unmounts
      ↓
      User back to grid
```

### View Mode Switching

```
User clicks "Timeline" button (was on Grid)
  │
  ├─ setViewMode('timeline')
  │   ↓
  │   React re-renders with Timeline layout
  │   ↓
  │   Group photos by month:
  │   const photosByMonth = useMemo(() => {
  │     const grouped = {};
  │     photos.forEach(photo => {
  │       if (!grouped[photo.month_number]) grouped[photo.month_number] = [];
  │       grouped[photo.month_number].push(photo);
  │     });
  │     return grouped;
  │   }, [photos]);
  │   ↓
  │   Render timeline:
  │   {Object.entries(photosByMonth)
  │     .sort(([a], [b]) => b - a)  // Newest month first
  │     .map(([month, monthPhotos]) => (
  │       <Card key={month}>
  │         <h3>Month {month}</h3>
  │         <PhotoGrid photos={monthPhotos} />
  │       </Card>
  │     ))
  │   }
  │
  └─ Timeline view displayed, grouped by month
```

## Key Impl Details

### Responsive Grid Columns

```typescript
// PhotoGrid component
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
  {photos.map(photo => <PhotoCard photo={photo} />)}
</div>
```

**Breakpoints:**
- `cols-1`: Mobile portrait (<640px) - Large photos, easy tap targets
- `sm:cols-2`: Mobile landscape (≥640px) - Two-column layout
- `md:cols-3`: Tablet (≥768px) - Balanced view
- `lg:cols-4`: Desktop (≥1024px) - Standard gallery density
- `xl:cols-5`: Large desktop (≥1280px) - Maximum density

### Photo Card with Month Badge

```typescript
// PhotoCard component
<div className="relative aspect-square rounded-lg overflow-hidden">
  {/* Photo image */}
  <img src={photo.url} alt={photo.description} className="w-full h-full object-cover" />
  
  {/* Month badge (conditional) */}
  {showMonthBadge && (
    <div className="absolute top-2 right-2 bg-baby-purple text-white text-xs px-2 py-1 rounded-full">
      Month {photo.month_number}
    </div>
  )}
  
  {/* Video indicator */}
  {photo.is_video && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <PlayIcon className="w-12 h-12 text-white" />
    </div>
  )}
  
  {/* Delete button (if editable) */}
  {showDeleteButton && (
    <button className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full">
      <TrashIcon />
    </button>
  )}
</div>
```

### Lightbox Configuration

```typescript
// PhotoLightbox component
const plugins = [];
if (showCaptions) plugins.push(Captions);
if (showDownload) plugins.push(Download);
if (showThumbnails) plugins.push(Thumbnails);

<Lightbox
  open={open}
  close={onClose}
  index={index}
  slides={lightboxSlides}
  plugins={plugins}
  
  // Captions config
  captions={{
    showToggle: true,              // Button to show/hide captions
    descriptionTextAlign: "start", // Left-align caption text
  }}
  
  // Download config
  download={{
    download: async ({ slide }) => {
      // Custom download logic
      const blob = await fetch(slide.download.url).then(r => r.blob());
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = slide.download.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  }}
  
  // Thumbnails config
  thumbnails={{
    position: "bottom",
    width: 120,
    height: 80,
    border: 2,
    borderRadius: 4,
    padding: 4,
    gap: 16,
  }}
  
  // Carousel config
  carousel={{
    finite: true,                  // Stop at first/last photo (no loop)
    padding: 0,
    spacing: 0,
    imageFit: "contain",           // Fit entire image in viewport
  }}
  
  // Conditional rendering (hide arrows if only 1 photo)
  render={{
    buttonPrev: slides.length <= 1 ? () => null : undefined,
    buttonNext: slides.length <= 1 ? () => null : undefined,
  }}
/>
```

### Filter Logic

```typescript
// BabyGallery component
const filteredPhotos = useMemo(() => {
  let filtered = photos;

  // Month filter
  if (filterMonth !== 'all') {
    const monthNum = parseInt(filterMonth);
    filtered = filtered.filter(photo => photo.month_number === monthNum);
  }

  // Type filter
  if (filterType === 'photos') {
    filtered = filtered.filter(photo => !photo.is_video);
  } else if (filterType === 'videos') {
    filtered = filtered.filter(photo => photo.is_video);
  }

  // Sort (newest first by default)
  return filtered.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}, [photos, filterMonth, filterType]);
```

### Timeline Grouping

```typescript
// Group photos by month
const photosByMonth = useMemo(() => {
  const grouped: { [key: number]: Photo[] } = {};
  
  filteredPhotos.forEach(photo => {
    const month = photo.month_number || 0;
    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push(photo);
  });
  
  return grouped;
}, [filteredPhotos]);

// Render timeline
{Object.entries(photosByMonth)
  .sort(([a], [b]) => parseInt(b) - parseInt(a))  // Descending order
  .map(([month, monthPhotos]) => (
    <Card key={month}>
      <h3>Month {month}</h3>
      <p>{monthPhotos.length} items</p>
      <div className="grid grid-cols-4 gap-4">
        {monthPhotos.map(photo => <PhotoCard photo={photo} />)}
      </div>
    </Card>
  ))
}
```

## Performance Optimizations

### 1. React Query Caching
```typescript
// Photos cached for 10 minutes
useQuery({
  queryKey: ['photos', babyId],
  queryFn: fetchPhotos,
  staleTime: 5 * 60 * 1000,   // 5 minutes
  cacheTime: 10 * 60 * 1000,  // 10 minutes
});
```

### 2. Lazy Image Loading
```typescript
// PhotoCard uses native lazy loading
<img 
  src={photo.url} 
  loading="lazy"              // Browser native lazy load
  alt={photo.description}
/>
```

### 3. useMemo for Filtering
```typescript
// Expensive filtering only recalculates when dependencies change
const filteredPhotos = useMemo(() => {
  return photos.filter(...).sort(...);
}, [photos, filterMonth, filterType, sortOption]);
```

### 4. Thumbnail Pre-Generation (Future)
Currently photos are full-size, which can slow loading. Future optimization:
- Generate thumbnails on upload (e.g., 300x300)
- Use thumbnails in grid, full-size in lightbox
- Supabase Storage transformations: `?width=300&height=300`

## Empty States

### No Photos (Baby Gallery)
```
┌────────────────────────────────────────┐
│                                        │
│          [Camera Icon]                 │
│                                        │
│          No media found                │
│                                        │
│    Start uploading photos and videos   │
│            for Emma!                   │
│                                        │
│         [Add Photos Button]            │
│                                        │
└────────────────────────────────────────┘
```

### No Photos After Filtering
```
┌────────────────────────────────────────┐
│                                        │
│          [Filter Icon]                 │
│                                        │
│          No media found                │
│                                        │
│  Try adjusting your filters to see     │
│          more content.                 │
│                                        │
└────────────────────────────────────────┘
```

### Loading State
```
┌────────────────────────────────────────┐
│  [Skeleton]  [Skeleton]  [Skeleton]    │
│  [Skeleton]  [Skeleton]  [Skeleton]    │
│  [Skeleton]  [Skeleton]  [Skeleton]    │
└────────────────────────────────────────┘
```

---

## Extensions (related OpenSpec change)

Behavior beyond this design—caption search, persisted favorites, compare-two mode, PDF export (later removed from product), server-paged loading for very large libraries, list delivery via Storage transforms (not stored thumbnails), and lightbox slideshow—is specified under change id **`gallery-backlog-features`** (archived 2026-03-21). Paths from **repo root**:

- `openspec/changes/archive/2026-03-21-gallery-backlog-features/design.md` — decisions for those features
- `openspec/specs/baby-gallery-advanced/spec.md`
- `openspec/specs/photo-thumbnail-pipeline/spec.md`
- `openspec/specs/photo-lightbox-slideshow/spec.md`
- `openspec/changes/archive/2026-03-21-gallery-backlog-features/tasks.md` — implementation tasks

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
