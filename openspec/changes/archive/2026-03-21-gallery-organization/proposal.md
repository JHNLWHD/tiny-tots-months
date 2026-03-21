# Gallery & Organization System

> **OpenSpec archive:** `openspec/changes/archive/2026-03-21-gallery-organization/` (moved from `openspec/changes/gallery-organization/` on 2026-03-21).

> **Amendment:** After this change was archived, **baby gallery PDF export** was removed from the product and is no longer part of change `gallery-backlog-features` (now archived). Mentions of PDF export below reflect the original backlog; use `openspec/specs/baby-gallery-advanced/spec.md` and `openspec/changes/archive/2026-03-21-gallery-backlog-features/` for shipped scope and history.

## Problem
Users need intuitive ways to browse, view, and organize their baby photos and videos:
- Navigate through months of photos quickly
- View photos in different layouts (grid, timeline, collage)
- Filter photos by month or media type (photos/videos only)
- View photos full-screen with captions and navigation
- Download photos for sharing or backup
- Understand which month each photo belongs to

**Key Challenges:**
- Large photo collections (100+ photos per baby)
- Responsive grid layouts across devices
- Fast photo loading and smooth lightbox experience
- Organizing photos by baby's age (month-based)
- Supporting both photos and videos
- Maintaining context (month, caption, date) across views

## Solution
A multi-view gallery system with powerful organization and viewing capabilities:

**Gallery Views:**
1. **Month View** - Photos organized by baby's month (e.g., Month 1, Month 2)
2. **Baby Gallery** - All photos for a specific baby with filtering
3. **Photo Grid** - Standard grid layout for browsing
4. **Timeline View** - Chronological list grouped by month
5. **Collage View** - Creative mosaic layout
6. **Lightbox** - Full-screen photo viewer with navigation

**Organization Features:**
- Filter by month (1-12 or all)
- Filter by media type (photos only, videos only, all)
- Sort by newest, oldest, or caption
- Month badges on photos
- Thumbnail navigation in lightbox

**Viewing Features:**
- Full-screen lightbox with zoom
- Photo captions displayed
- Next/previous navigation
- Thumbnail strip at bottom
- Download photos
- Video playback support

## Scope

### ✅ In Scope
- Month-based photo organization
- Baby Gallery page (all photos for one baby)
- Month View page (photos for specific month)
- Photo Grid component (responsive grid)
- Photo Lightbox (full-screen viewer)
- Filtering: by month, by media type
- Sorting: newest, oldest, caption
- View modes: Grid, Timeline, Collage
- Photo captions in lightbox
- Photo download from lightbox
- Thumbnail navigation
- Month badges on photos
- Empty states for no photos

### ❌ Out of Scope
- Albums/collections (user-created groups)
- Tags or labels on photos
- Search by caption text
- Facial recognition
- Photo editing (crop, rotate, filters)
- Bulk operations (select multiple, bulk delete)
- Photo sharing directly from gallery
- Favorites/starred photos
- Photo comments
- Automatic photo organization (AI)

### 🔮 Future Enhancements
- Custom albums (e.g., "First Birthday", "Holidays")
- Photo search by caption keywords
- Bulk select and delete
- Favorite photos feature
- Photo comparison (side-by-side view)
- Slideshow mode with auto-advance
- Photo metadata (location, camera info)
- Export album as PDF
- Shared albums with family

### Follow-on OpenSpec change (formal specs and tasks)

Several items above—especially caption search, favorites, compare, slideshow, PDF export, server-side loading for very large libraries, and stored thumbnail generation—are **specified and task-tracked** under a dedicated change (this repo does not fold them into `gallery-organization` implementation tasks).

**Change id:** `gallery-backlog-features`

Paths below are from the **repository root**. Change `gallery-backlog-features` is archived at `openspec/changes/archive/2026-03-21-gallery-backlog-features/`; canonical merged specs live under `openspec/specs/` (`baby-gallery-advanced`, `photo-thumbnail-pipeline`, `photo-lightbox-slideshow`). Relative markdown links between changes were avoided on purpose so archiving does not break hyperlinks.

| Artifact | Path (from repo root) |
|----------|------------------------|
| Proposal | `openspec/changes/archive/2026-03-21-gallery-backlog-features/proposal.md` |
| Design | `openspec/changes/archive/2026-03-21-gallery-backlog-features/design.md` |
| Tasks | `openspec/changes/archive/2026-03-21-gallery-backlog-features/tasks.md` |
| Spec: advanced gallery | `openspec/specs/baby-gallery-advanced/spec.md` |
| Spec: thumbnails | `openspec/specs/photo-thumbnail-pipeline/spec.md` |
| Spec: lightbox slideshow | `openspec/specs/photo-lightbox-slideshow/spec.md` |

Implement that work with `/opsx-apply gallery-backlog-features` (or equivalent) after reviewing those artifacts.

## User Journeys

### Browse Baby Gallery

```
User clicks "Gallery" in nav (for selected baby)
  │
  ├─ Navigate to /app/gallery/:babyId
  │
  ├─ Gallery page loads:
  │   • Header: "[Baby Name]'s Gallery"
  │   • Stats: "42 items • Born Dec 15, 2025"
  │   • Filters: Month dropdown, Type dropdown
  │   • View mode: Grid/Timeline toggle
  │   • Photo grid: All photos newest first
  │
  ├─ User applies filters:
  │   • Select "Month 3" from month filter
  │   • Grid updates to show only Month 3 photos
  │   • Stats update: "8 items"
  │
  ├─ User switches to Timeline view:
  │   • Photos grouped by month in cards
  │   • "Month 3" card with 8 photos
  │   • Newest month first
  │
  └─ User clicks photo → Opens lightbox
```

### View Photos in Month Context

```
User on Month 2 page
  │
  ├─ Tabs: Photos | Milestones
  │   • Photos tab selected
  │
  ├─ Photo Section shows:
  │   • Upload button at top
  │   • Sort dropdown (Newest, Oldest, Description)
  │   • View mode toggle (Grid, Collage)
  │   • Photo grid below
  │
  ├─ User switches to Collage view:
  │   • Photos arranged in mosaic layout
  │   • Varying sizes for visual interest
  │
  ├─ User clicks photo → Opens lightbox
  │   • Full-screen photo display
  │   • Caption: "[Caption text] • Month 2 • Feb 15, 2026"
  │   • Thumbnail strip at bottom
  │   • Navigation arrows
  │
  ├─ User navigates to next photo:
  │   • Press right arrow or click next thumbnail
  │   • Photo transitions smoothly
  │
  ├─ User downloads photo:
  │   • Click download icon
  │   • Photo saves as "Emma-month-2-[id].jpg"
  │
  └─ User closes lightbox → Returns to grid
```

### Filter and Search

```
User in Baby Gallery with 100+ photos
  │
  ├─ Wants to see only videos
  │   • Opens "Type" filter dropdown
  │   • Selects "Videos Only"
  │   • Grid updates to show 12 videos
  │
  ├─ Wants to see Month 6 specifically
  │   • Opens "Month" filter dropdown
  │   • Selects "Month 6"
  │   • Grid updates to show 3 videos from Month 6
  │
  ├─ Wants to see all Month 6 media (photos + videos)
  │   • Changes "Type" filter to "All Media"
  │   • Grid updates to show 15 items from Month 6
  │
  └─ Clears filters:
      • Selects "All Months" and "All Media"
      • Grid shows all 100+ photos again
```

## Data Model

### Photo Records
Photos are stored in the `photo` table with organization metadata:

```typescript
type Photo = {
  id: string;                    // UUID
  user_id: string;               // Owner (for RLS)
  baby_id: string;               // Which baby
  month_number: number;          // 1-12+ (baby's age)
  storage_path: string;          // Supabase Storage path
  url?: string;                  // Signed URL (temporary, generated on fetch)
  description: string | null;    // Optional caption
  is_video: boolean;             // Photo or video
  file_size?: number;            // Bytes (for quota tracking)
  created_at: string;            // Upload timestamp
  updated_at: string;            // Last modified
};
```

**Month Organization:**
- `month_number` calculated from baby's age when uploaded
- Month 1: Birth to 1 month old
- Month 2: 1-2 months old
- etc.

### Gallery State
```typescript
type GalleryState = {
  photos: Photo[];               // All photos for current context
  filterMonth: string;           // 'all' | '1' | '2' | ... | '12'
  filterType: string;            // 'all' | 'photos' | 'videos'
  viewMode: 'grid' | 'timeline'; // Display mode
  sortOption: 'newest' | 'oldest' | 'description';
  lightboxOpen: boolean;         // Is lightbox visible
  lightboxIndex: number;         // Current photo index in lightbox
};
```

### Lightbox Slide Format
```typescript
type LightboxSlide = {
  src: string;                   // Photo URL
  alt: string;                   // Accessibility text
  title: string;                 // Caption or month
  description: string;           // Full caption + metadata
  download: {
    url: string;                 // Download URL
    filename: string;            // "BabyName-month-X-id.jpg"
  };
};
```

## Key Design Decisions

### 1. Month-Based Organization (Not Date-Based)
**Decision:** Organize photos by baby's age in months, not calendar months.

**Rationale:**
- **User mental model**: Parents think "my baby's third month" not "March 2026"
- **Consistency across babies**: Month 1 means the same for all babies regardless of birth date
- **Natural navigation**: Aligns with milestones (also organized by month)
- **Growth tracking**: Easy to compare "Month 3" photos across different babies

**Example:**
- Baby born Dec 15, 2025
- Photo uploaded Jan 20, 2026 → Month 2 (baby is 1-2 months old)
- Photo uploaded Feb 20, 2026 → Month 3 (baby is 2-3 months old)

**Trade-offs:**
- ✅ Matches parent expectations
- ✅ Aligns with milestone tracking
- ✅ Easy to find photos by age
- ❌ Less intuitive for exact date searching (no "Show me January")

### 2. Two Gallery Views: Month View vs. Baby Gallery
**Decision:** Provide both context-specific (month) and comprehensive (baby) gallery views.

**Rationale:**
- **Month View**: Quick access while browsing a specific month (alongside milestones)
- **Baby Gallery**: Dedicated page for browsing all photos, with powerful filters
- **Different use cases**: Month view for "what happened this month?", Baby gallery for "show me all videos"

**Trade-offs:**
- ✅ Optimized for different workflows
- ✅ Month view keeps user in context
- ✅ Baby gallery provides full control
- ❌ Two similar but different interfaces (acceptable trade-off)

### 3. Client-Side Filtering (Not Server-Side)
**Decision:** Fetch all photos, filter client-side.

**Rationale:**
- **Performance**: React useMemo efficiently filters 100-200 photos
- **Instant feedback**: No network delay when changing filters
- **Simpler code**: No API parameters, no loading states for filters
- **Caching**: React Query caches all photos, subsequent views are instant

**When to reconsider:** If users have >500 photos per baby, add server-side pagination.

**Trade-offs:**
- ✅ Instant filter updates
- ✅ No loading spinners
- ✅ Works offline (after initial load)
- ❌ Initial load fetches all photos (mitigated by lazy loading images)

### 4. yet-another-react-lightbox Library
**Decision:** Use `yet-another-react-lightbox` instead of building custom lightbox.

**Rationale:**
- **Feature-rich**: Captions, thumbnails, download, keyboard nav, touch gestures
- **Accessibility**: ARIA labels, keyboard navigation built-in
- **Performance**: Optimized image loading and transitions
- **Plugins**: Modular (can disable captions, thumbnails, etc.)
- **Maintained**: Active development and bug fixes

**Alternatives Considered:**
- Custom lightbox: Too much work for little benefit
- react-image-lightbox: Less maintained, fewer features

**Trade-offs:**
- ✅ Professional UX out of the box
- ✅ Saves development time
- ✅ Accessible by default
- ❌ Adds 50KB to bundle (acceptable for feature richness)

### 5. Grid and Timeline View Modes
**Decision:** Offer two view modes in Baby Gallery, toggle in Month View.

**Rationale:**
- **Grid**: Standard gallery view, familiar pattern
- **Timeline**: Groups photos by month, shows chronological story
- **User preference**: Some users prefer visual density (grid), others want context (timeline)

**Implementation:**
```typescript
// Grid: Flat array of photos
<div className="grid grid-cols-4 gap-4">
  {photos.map(photo => <PhotoCard photo={photo} />)}
</div>

// Timeline: Grouped by month
{Object.entries(photosByMonth).map(([month, photos]) => (
  <Card>
    <h3>Month {month}</h3>
    <div className="grid grid-cols-4 gap-4">
      {photos.map(photo => <PhotoCard photo={photo} />)}
    </div>
  </Card>
))}
```

**Trade-offs:**
- ✅ Flexibility for user preferences
- ✅ Timeline shows progression clearly
- ❌ More code to maintain (acceptable)

### 6. Month Badges on Photos
**Decision:** Show month badge on photo cards (except in Month View where it's redundant).

**Rationale:**
- **Context**: Users know which month each photo is from
- **Visual hierarchy**: Colored badges with month number
- **Conditional display**: Hidden in Month View (all photos are same month)

**Design:**
```
┌─────────────────┐
│                 │
│    [Photo]      │
│                 │
│  ┌──────────┐   │
│  │ Month 3  │   │  ← Badge in corner
│  └──────────┘   │
└─────────────────┘
```

**Trade-offs:**
- ✅ Clear visual indicator
- ✅ No need to click to see month
- ❌ Slightly clutters photo (minimal impact)

### 7. Sorting Options: Newest, Oldest, Description
**Decision:** Provide three sorting options for photos within a view.

**Rationale:**
- **Newest (default)**: Most recent photos first (what users want to see)
- **Oldest**: Chronological order (good for "story of growth")
- **Description**: Alphabetical by caption (good for finding specific photo)

**Trade-offs:**
- ✅ Covers most use cases
- ✅ Simple to implement
- ❌ No "random" or "most viewed" sorts (not needed)

### 8. Responsive Grid: 2-5 Columns
**Decision:** Adaptive grid that changes columns based on screen size.

**Rationale:**
- **Mobile (1-2 cols)**: Large enough to see details, not overwhelming
- **Tablet (3 cols)**: Balanced view
- **Desktop (4-5 cols)**: Dense view for quick browsing

**Implementation:**
```css
grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
```

**Trade-offs:**
- ✅ Optimal experience on all devices
- ✅ Tailwind utilities make it simple
- ❌ More complex layout math (handled by CSS Grid)

### 9. Collage View (Mosaic Layout)
**Decision:** Offer creative collage/mosaic layout as alternative to grid.

**Rationale:**
- **Visual interest**: Breaking up uniform grid with varied sizes
- **Scrapbook feel**: More personal, less formal
- **Highlight favorites**: Larger photos draw more attention

**Trade-offs:**
- ✅ Unique, engaging layout
- ✅ Makes gallery feel special
- ❌ Less predictable scrolling (acceptable for aesthetic value)

### 10. Download Filenames: Descriptive Convention
**Decision:** Downloaded photos use format `BabyName-month-X-photoID.jpg`.

**Rationale:**
- **Sortable**: Alphabetical order matches chronological
- **Identifiable**: Know which baby and month without opening
- **Unique**: Photo ID prevents duplicates
- **Organized**: Easy to organize in file system

**Example:** `Emma-month-3-abc123.jpg`

**Trade-offs:**
- ✅ Self-documenting filenames
- ✅ No overwrites (unique IDs)
- ❌ Longer filenames (acceptable)

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
