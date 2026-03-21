# Gallery & Organization - Implementation Tasks

This document reverse-engineers the implementation tasks for the complete gallery and photo organization system.

---

## Phase 1: Data Fetching & Hooks

### 1.1 Photo Fetching Hooks
- [x] Create `useBabyPhotos(babyId)` hook:
  - Fetch all photos for specific baby
  - Generate signed URLs for each photo (1-hour expiry)
  - React Query with 5-minute stale time
  - Sort by created_at descending
- [x] Create `useMonthPhotos(babyId, monthNumber)` hook:
  - Fetch photos for specific baby + month
  - Same signed URL generation
  - React Query caching
- [x] Add React Query cache keys:
  - `['photos', babyId]` for baby-level
  - `['photos', babyId, monthNumber]` for month-level

### 1.2 Data Transformation
- [x] Create utility to generate signed URLs:
  - Call Supabase Storage `createSignedUrl()`
  - 1-hour expiry (3600 seconds)
  - Attach to photo object as `url` field
- [x] Handle missing URLs gracefully:
  - Check if URL generation fails
  - Log error but don't break rendering
  - Show placeholder image for failed URLs

---

## Phase 2: Baby Gallery Page

### 2.1 Page Component (`BabyGallery.tsx`)
- [x] Create `/app/gallery/:babyId` route
- [x] Fetch baby data and photos on mount
- [x] Set up state for filters and view mode:
  - `filterMonth`: 'all' | '1'-'12'
  - `filterType`: 'all' | 'photos' | 'videos'
  - `viewMode`: 'grid' | 'timeline'
  - `lightboxOpen`: boolean
  - `lightboxIndex`: number
- [x] Implement loading skeleton (8 placeholder cards)
- [x] Handle "baby not found" error state

### 2.2 Header Section
- [x] Back button → Navigate to `/app`
- [x] Title: "{Baby Name}'s Gallery"
- [x] Stats: "{count} items • Born {date}"
- [x] Responsive layout (stack on mobile)

### 2.3 Filter Bar
- [x] Create filter card with border
- [x] Month dropdown:
  - Options: All Months, Month 1-12
  - On change: `setFilterMonth(value)`
- [x] Type dropdown:
  - Options: All Media, Photos Only, Videos Only
  - On change: `setFilterType(value)`
- [x] View mode toggle buttons:
  - Grid button (with grid icon)
  - Timeline button (with list icon)
  - Highlight active view
  - On click: `setViewMode(value)`
- [x] Responsive: Stack filters on mobile

### 2.4 Client-Side Filtering
- [x] Implement `useMemo` for filtered photos:
  ```typescript
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
  ```
- [x] Update stats when filters change

### 2.5 Grid View
- [x] Responsive grid layout:
  - `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- [x] Render `PhotoCard` for each photo
- [x] Pass `onClick` to open lightbox
- [x] Show month badges (context needed)
- [x] Gap between cards: 6 (1.5rem)

### 2.6 Timeline View
- [x] Group photos by month:
  ```typescript
  const photosByMonth = useMemo(() => {
    const grouped = {};
    filteredPhotos.forEach(photo => {
      const month = photo.month_number || 0;
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(photo);
    });
    return grouped;
  }, [filteredPhotos]);
  ```
- [x] Sort months descending (newest first)
- [x] Render month cards:
  - Card header: "Month X" + item count
  - Calendar icon
  - Grid of photos within card
- [x] Responsive grid within each month card

### 2.7 Empty States
- [x] No photos at all:
  - Camera icon
  - Message: "Start uploading photos and videos for {name}!"
  - "Add Photos" button → Month 1 page
- [x] No photos after filtering:
  - Filter icon
  - Message: "No media found. Try adjusting filters."
  - Filters remain visible

---

## Phase 3: Month View Page

### 3.1 Month Page Integration (`Month.tsx`)
- [x] Tabs: Photos | Milestones
- [x] PhotoSection component renders in Photos tab
- [x] Pass baby ID, month number, and photos array

### 3.2 Photo Section Component
- [x] Create `PhotoSection.tsx`
- [x] State for sort and view:
  - `sortOption`: 'newest' | 'oldest' | 'description'
  - `viewMode`: 'grid' | 'collage'
- [x] PhotoUploader at top
- [x] Controls bar:
  - "View:" dropdown (Grid, Collage)
  - "Sort by:" dropdown (Newest, Oldest, Description)
- [x] Implement sorting logic:
  ```typescript
  const sortedPhotos = [...photos].sort((a, b) => {
    switch (sortOption) {
      case 'newest': return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest': return new Date(a.created_at) - new Date(b.created_at);
      case 'description': return (a.description || '') > (b.description || '') ? 1 : -1;
    }
  });
  ```
- [x] Render PhotoGrid or PhotoCollage based on viewMode

---

## Phase 4: Photo Display Components

### 4.1 PhotoCard Component
- [x] Create `PhotoCard.tsx`
- [x] Props: photo, onClick, onDelete, showDeleteButton, showMonthBadge
- [x] Square aspect ratio (`aspect-square`)
- [x] Image with lazy loading: `loading="lazy"`
- [x] Object-fit: cover (fill square)
- [x] Hover effects: scale slightly, show overlay
- [x] Month badge (conditional):
  - Position: top-right corner
  - Background: baby-purple
  - Text: "Month X"
  - Rounded pill shape
- [x] Video indicator (if is_video):
  - Play icon overlay (centered)
  - Semi-transparent black background
- [x] Delete button (if showDeleteButton):
  - Position: top-left corner
  - Red background
  - Trash icon
  - Click: trigger onDelete

### 4.2 PhotoGrid Component
- [x] Create `PhotoGrid.tsx`
- [x] Props: photos, onDelete, readOnly, babyName
- [x] Responsive grid: 1-5 columns
- [x] Map over photos, render PhotoCard
- [x] Handle photo click: open lightbox
- [x] Handle delete click: show confirmation dialog
- [x] Alert dialog for delete confirmation:
  - Title: "Delete Photo"
  - Description: "Are you sure? This cannot be undone."
  - Actions: Cancel, Delete (destructive style)
- [x] Empty state: "No photos uploaded yet"
- [x] Integrate PhotoLightbox

### 4.3 PhotoCollage Component (Future)
- [x] Create `PhotoCollage.tsx`
- [x] Mosaic layout with varying sizes
- [x] Algorithm to distribute photos in interesting pattern
- [x] Props: photos, maxDisplayCount
- [x] Fallback to grid if algorithm fails

---

## Phase 5: Photo Lightbox

### 5.1 Lightbox Library Integration
- [x] Install `yet-another-react-lightbox`:
  ```bash
  npm install yet-another-react-lightbox
  ```
- [x] Import plugins:
  - Captions
  - Download
  - Thumbnails
- [x] Import CSS:
  - Core styles
  - Plugin-specific styles

### 5.2 PhotoLightbox Component
- [x] Create `PhotoLightbox.tsx`
- [x] Props: photos, open, index, onClose, babyName, show* flags
- [x] Transform photos to lightbox slides:
  ```typescript
  const lightboxSlides = useMemo(() => {
    return photos.map(photo => ({
      src: photo.url,
      alt: photo.description || `Photo from month ${photo.month_number}`,
      title: photo.description || `Month ${photo.month_number}`,
      description: `${photo.description}\n\nMonth ${photo.month_number} • ${date}`,
      download: {
        url: photo.url,
        filename: `${babyName}-month-${photo.month_number}-${photo.id}.${ext}`,
      },
    }));
  }, [photos, babyName]);
  ```
- [x] Build plugins array conditionally
- [x] Configure Lightbox component:
  - Captions config (showToggle, align)
  - Download config (custom handler)
  - Thumbnails config (position, size)
  - Carousel config (finite, imageFit)
- [x] Hide arrows if only 1 photo

### 5.3 Download Functionality
- [x] Custom download handler:
  ```typescript
  download: async ({ slide }) => {
    const blob = await fetch(slide.download.url).then(r => r.blob());
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = slide.download.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  ```
- [x] Error handling: try/catch with toast on failure
- [x] Filename format: `{BabyName}-month-{X}-{ID}.{ext}`

### 5.4 Caption Formatting
- [x] Extract month number and date from photo
- [x] Format: "{Caption}\n\nMonth X • {Date}"
- [x] Fallback if no caption: "Month X • {Date}"
- [x] Preserve newlines in caption
- [x] Left-align caption text

### 5.5 File Extension Extraction
- [x] Create `getFileExtension()` utility:
  - Try storage_path first
  - Fallback to URL
  - Return empty string if no extension found
- [x] Use in download filename generation

---

## Phase 6: Navigation & Routes

### 6.1 Route Setup
- [x] Add `/app/gallery/:babyId` route
- [x] Protected route (requires authentication)
- [x] Baby must exist (404 if not found)

### 6.2 Navigation Links
- [x] Navigation Hub: "Gallery" link
  - Shows for selected baby
  - Navigate to `/app/gallery/{selectedBabyId}`
- [x] Month Page: "View All Photos" button
  - Navigate to Baby Gallery with month filter pre-applied
- [x] Home Page: Baby card dropdown
  - "Gallery" option in menu

### 6.3 Back Navigation
- [x] Baby Gallery: Back button → `/app`
- [x] Month Page: Breadcrumb/header → `/app`

---

## Phase 7: Performance Optimizations

### 7.1 React Query Caching
- [x] Configure stale time: 5 minutes
- [x] Configure cache time: 10 minutes
- [x] Enable refetch on window focus
- [x] Invalidate cache after photo upload/delete

### 7.2 useMemo for Expensive Operations
- [x] Filter/sort photos with useMemo
- [x] Group photos by month with useMemo
- [x] Transform lightbox slides with useMemo
- [x] Dependencies properly specified

### 7.3 Image Loading
- [x] Lazy loading: `<img loading="lazy" />`
- [x] Aspect ratio placeholders to prevent layout shift
- [x] Skeleton loaders during initial fetch

### 7.4 Code Splitting (Future)
- [ ] Lazy load PhotoLightbox component
- [ ] Lazy load yet-another-react-lightbox library
- [ ] Only load when user opens lightbox

---

## Phase 8: Responsive Design

### 8.1 Grid Breakpoints
- [x] Mobile (< 640px): 1 column
- [x] Mobile landscape (≥ 640px): 2 columns
- [x] Tablet (≥ 768px): 3 columns
- [x] Desktop (≥ 1024px): 4 columns
- [x] Large desktop (≥ 1280px): 5 columns

### 8.2 Filter Bar Responsive
- [x] Stack filters vertically on mobile
- [x] Horizontal layout on tablet+
- [x] Touch-friendly dropdowns and buttons

### 8.3 Lightbox Mobile
- [x] Touch gestures (swipe left/right)
- [x] Tap to hide/show UI
- [x] Pinch to zoom (if enabled)
- [x] Thumbnails scrollable horizontally

---

## Phase 9: Error Handling & Edge Cases

### 9.1 Error States
- [x] Baby not found: Show "Baby not found" message
- [x] Photo fetch error: Error toast, retry button
- [x] Expired signed URLs: React Query refetches on focus
- [x] Download failure: Error toast, allow retry

### 9.2 Empty States
- [x] No photos: Encourage upload with CTA
- [x] No photos after filtering: Suggest adjusting filters
- [x] Single photo: Hide navigation arrows

### 9.3 Edge Cases
- [x] Very long captions: Scrollable, max height
- [x] Missing file extension: Download without extension
- [x] Special characters in caption: Properly escaped
- [x] Large photo collections (100+): Client-side filter remains fast

---

## Phase 10: Testing & Quality Assurance

### 10.1 Manual Testing
- [x] Baby Gallery: All filters, both view modes
- [x] Month View: Both view modes, sorting
- [x] Lightbox: Navigation, download, captions
- [x] Mobile: Touch gestures, responsive layout
- [x] Edge cases: Single photo, no photos, 100+ photos

### 10.2 Browser Testing
- [x] Chrome/Edge (Chromium)
- [x] Firefox
- [x] Safari (macOS and iOS)
- [x] Mobile browsers (Chrome, Safari)

### 10.3 Performance Testing
- [x] Large gallery (100+ photos): Load time, filter speed
- [x] Image lazy loading: Scroll performance
- [x] Lightbox transitions: Smooth on mobile

---

## Summary

**Total Tasks:** 90+ tasks organized into 10 phases

**Implementation Status:** All tasks complete (reverse-engineered from existing codebase)

**Key Achievements:**
- ✅ Baby Gallery page with filtering and view modes
- ✅ Month View photo section with sorting
- ✅ Responsive photo grid (1-5 columns)
- ✅ Full-featured lightbox (captions, download, thumbnails)
- ✅ Client-side filtering (instant updates)
- ✅ Timeline view (grouped by month)
- ✅ Collage view (creative mosaic)
- ✅ Empty states and error handling
- ✅ Mobile-optimized (touch gestures)
- ✅ Performance optimized (React Query, useMemo, lazy loading)

**Next Steps (Future Enhancements):**
- [ ] Custom albums/collections
- [ ] Photo search by caption
- [ ] Bulk select and delete
- [ ] Favorite photos
- [ ] Photo comparison (side-by-side)
- [ ] Slideshow mode
- [ ] Export album as PDF
- [ ] Server-side pagination for >500 photos
- [ ] Thumbnail pre-generation

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
