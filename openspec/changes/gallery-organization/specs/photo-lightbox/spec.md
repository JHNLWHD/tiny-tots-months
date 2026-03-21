# Capability: Photo Lightbox (Full-Screen Viewer)

## Overview
Provide a full-screen, immersive photo viewing experience with captions, navigation, thumbnails, and download capabilities. The lightbox is the primary way users view individual photos in detail.

## Inputs

### Props
```typescript
type PhotoLightboxProps = {
  photos: Photo[];          // Array of all photos in current context
  open: boolean;            // Is lightbox visible
  index: number;            // Which photo to show initially (0-based)
  onClose: () => void;      // Callback when lightbox closes
  babyName?: string;        // For download filenames
  showCaptions?: boolean;   // Enable caption plugin (default: true)
  showDownload?: boolean;   // Enable download plugin (default: true)
  showThumbnails?: boolean; // Enable thumbnail strip (default: true)
};
```

### Photo Format
```typescript
type Photo = {
  id: string;
  url: string;               // Signed URL for display
  storage_path: string;      // For filename extraction
  month_number: number;      // For caption context
  description: string | null; // User-provided caption
  is_video: boolean;
  created_at: string;        // ISO timestamp
};
```

## Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LIGHTBOX FLOW                            │
└─────────────────────────────────────────────────────────────┘

User clicks photo in grid/timeline
  │
  ├─ Component calls: openLightbox(photoIndex)
  │   ↓
  │   setLightboxIndex(3)  // e.g., 4th photo
  │   setLightboxOpen(true)
  │
  ├─ PhotoLightbox receives props:
  │   photos: [Photo1, Photo2, Photo3, Photo4, ...]
  │   open: true
  │   index: 3
  │   babyName: "Emma"
  │   showCaptions: true
  │   showDownload: true
  │   showThumbnails: true
  │
  ├─ TRANSFORM PHOTOS TO LIGHTBOX SLIDES
  │   ↓
  │   useMemo(() => {
  │     return photos.map(photo => {
  │       const monthDisplay = `Month ${photo.month_number}`;
  │       const dateDisplay = new Date(photo.created_at).toLocaleDateString();
  │       const fileExtension = getFileExtension(photo.storage_path);
  │       const filename = `${babyName}-month-${photo.month_number}-${photo.id}.${fileExtension}`;
  │       
  │       return {
  │         src: photo.url,
  │         alt: photo.description || `Photo from ${monthDisplay.toLowerCase()}`,
  │         title: photo.description || monthDisplay,
  │         description: photo.description 
  │           ? `${photo.description}\n\nMonth ${monthDisplay} • ${dateDisplay}`
  │           : `${monthDisplay} • ${dateDisplay}`,
  │         download: {
  │           url: photo.url,
  │           filename: filename,
  │         },
  │       };
  │     });
  │   }, [photos, babyName]);
  │
  ├─ RENDER LIGHTBOX
  │   ↓
  │   <Lightbox
  │     open={true}
  │     index={3}
  │     slides={transformedSlides}
  │     plugins={[Captions, Download, Thumbnails]}
  │     ...config
  │   />
  │   ↓
  │   Lightbox library renders:
  │   • Full-screen overlay (black background)
  │   • Photo at index 3 displayed (contain, centered)
  │   • Caption at bottom: "[Caption text]\n\nMonth 4 • Feb 20, 2026"
  │   • Thumbnail strip at bottom (current photo highlighted)
  │   • Navigation arrows (left/right)
  │   • Top bar: Close button, Download button, Caption toggle
  │
  ├─ USER NAVIGATES TO NEXT PHOTO
  │   ↓
  │   User presses right arrow key (or clicks right arrow, or swipes left)
  │   ↓
  │   Lightbox internal state: index = 4
  │   ↓
  │   Transition animation (slide left)
  │   ↓
  │   Photo 5 displayed
  │   ↓
  │   Caption updates
  │   ↓
  │   Thumbnail strip scrolls to show Photo 5 highlighted
  │
  ├─ USER CLICKS THUMBNAIL
  │   ↓
  │   User clicks thumbnail for Photo 2 (index 1)
  │   ↓
  │   Lightbox jumps to index 1
  │   ↓
  │   No transition (instant jump)
  │   ↓
  │   Photo 2 displayed
  │
  ├─ USER DOWNLOADS PHOTO
  │   ↓
  │   User clicks download button
  │   ↓
  │   Custom download handler triggered:
  │   ↓
  │   async download({ slide }) {
  │     const blob = await fetch(slide.download.url).then(r => r.blob());
  │     const blobURL = URL.createObjectURL(blob);
  │     
  │     const link = document.createElement('a');
  │     link.href = blobURL;
  │     link.download = slide.download.filename;  // "Emma-month-4-abc123.jpg"
  │     document.body.appendChild(link);
  │     link.click();
  │     document.body.removeChild(link);
  │     
  │     URL.revokeObjectURL(blobURL);
  │   }
  │   ↓
  │   Browser download dialog appears
  │   ↓
  │   Photo saves to user's device
  │
  ├─ USER TOGGLES CAPTIONS
  │   ↓
  │   User clicks caption toggle button (icon in top bar)
  │   ↓
  │   Lightbox plugin toggles visibility
  │   ↓
  │   Caption fades out/in
  │   ↓
  │   More screen space for photo (when hidden)
  │
  └─ USER CLOSES LIGHTBOX
      ↓
      User presses Escape key (or clicks close button, or clicks outside)
      ↓
      onClose() callback triggered
      ↓
      Parent component: setLightboxOpen(false)
      ↓
      Lightbox unmounts
      ↓
      User returns to grid/timeline view
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| **Arrow Left** | Previous photo |
| **Arrow Right** | Next photo |
| **Escape** | Close lightbox |
| **Home** | Go to first photo |
| **End** | Go to last photo |
| **Tab** | Focus next control (close, download, caption toggle) |

### Touch Gestures (Mobile)

| Gesture | Action |
|---------|--------|
| **Swipe Left** | Next photo |
| **Swipe Right** | Previous photo |
| **Tap photo** | Toggle UI visibility (arrows, captions, thumbnails) |
| **Pinch** | Zoom in/out (if zoom plugin enabled) |
| **Double tap** | Zoom to fit / Zoom to fill toggle |

## Outputs

### Lightbox Slide Structure
```typescript
type LightboxSlide = {
  src: string;                          // "https://...signed-url..."
  alt: string;                          // "First smile!"
  title: string;                        // "First smile!" (or "Month 4" if no caption)
  description: string;                  // "First smile!\n\nMonth 4 • Feb 20, 2026"
  download: {
    url: string;                        // Same as src
    filename: string;                   // "Emma-month-4-abc123.jpg"
  };
};
```

### Download Filename Convention
```
Format: {BabyName}-month-{MonthNumber}-{PhotoID}.{Extension}

Examples:
- Emma-month-3-abc123.jpg
- Oliver-month-12-def456.png
- Sophie-month-1-ghi789.heic
```

**Benefits:**
- **Sortable**: Alphabetical sort = chronological order
- **Identifiable**: Know baby and month without opening
- **Unique**: Photo ID prevents overwrites
- **Organized**: Easy to group by baby or month in file system

## Business Rules

### Navigation
- **Finite carousel**: Stops at first/last photo (no infinite loop)
- **Arrow visibility**: Hide prev arrow on first photo, hide next arrow on last
- **Single photo**: Hide both arrows if only 1 photo in array
- **Thumbnail scroll**: Auto-scrolls to keep current photo centered

### Captions
- **Display**: Caption + context (Month X • Date)
- **Toggle**: User can show/hide captions
- **Fallback**: If no caption, show "Month X • Date" only
- **Text align**: Left-aligned for readability

### Download
- **Async fetch**: Fetch photo as Blob before downloading
- **Filename**: Descriptive, includes baby name, month, and ID
- **Extension**: Preserve original file extension (.jpg, .png, .heic, etc.)
- **Error handling**: If download fails, show error toast

### Thumbnails
- **Position**: Bottom of lightbox
- **Size**: 120x80px each
- **Current highlight**: Border around current photo thumbnail
- **Scroll behavior**: Scroll to keep current thumbnail in view
- **Click**: Jump to clicked photo (no animation)

### Image Display
- **Fit mode**: `contain` (entire image visible, no cropping)
- **Padding**: No padding (maximize screen usage)
- **Background**: Black (#000) for contrast
- **Loading**: Show spinner while image loads

## Edge Cases

### Signed URL Expires During Viewing
**Scenario:** User opens lightbox with Photo 1, navigates slowly, URL expires after 1 hour, tries to view Photo 10.

**Handling:**
- Lightbox attempts to load Photo 10 → 403 Forbidden
- Image shows broken image icon
- User closes lightbox
- Parent component refetches photos (React Query staleTime expired)
- New signed URLs generated
- User reopens lightbox → Photos load correctly

**Mitigation:** React Query refetches photos on focus, so expired URLs rarely encountered.

### Single Photo in Array
**Scenario:** User views month with only 1 photo.

**Handling:**
- Lightbox renders with index 0
- Navigation arrows hidden (render function returns null)
- Thumbnails still shown (single thumbnail)
- Swipe/keyboard navigation disabled (no next/prev)

### Very Long Caption
**Scenario:** User has 500-character caption.

**Handling:**
- Caption area scrollable (overflow-y: auto)
- Max height: 30% of viewport
- Caption doesn't obscure photo
- Caption toggle allows hiding for full photo view

### Download Failure
**Scenario:** Network error during download fetch.

**Handling:**
```typescript
try {
  const blob = await fetch(slide.download.url).then(r => r.blob());
  // ... create download link
} catch (error) {
  console.error('Download failed:', error);
  toast.error('Download failed. Please try again.');
}
```

User sees error toast, can retry download.

### Special Characters in Caption
**Scenario:** Caption contains newlines, quotes, emojis.

**Handling:**
- Caption rendered as plain text (no HTML parsing)
- Newlines preserved: "Line 1\n\nLine 2" displays on separate lines
- Emojis supported: "First smile! 😊" displays correctly
- Quotes escaped automatically by React

### Missing File Extension
**Scenario:** Photo has no file extension in storage_path or URL.

**Handling:**
```typescript
const fileExtension = getFileExtension(photo.storage_path) || '';
const filename = fileExtension 
  ? `${babyName}-month-${month}-${id}.${fileExtension}`
  : `${babyName}-month-${month}-${id}`;  // No extension
```

Photo downloads without extension (browser may add default .bin or .jpg).

### Mobile: Tap to Hide UI
**Scenario:** User on mobile taps photo to hide captions/thumbnails for full-screen view.

**Handling:**
- Lightbox library handles tap detection
- UI fades out (captions, thumbnails, arrows, top bar)
- Tap again to show UI
- Does NOT close lightbox (only Escape/close button does)

## UI Locations

### Lightbox Overlay (Full-Screen)

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  [X]  [Caption Toggle]  [Download]                         │  ← Top bar
├────────────────────────────────────────────────────────────┤
│                                                            │
│                                                            │
│                    [◀]  [Photo]  [▶]                       │  ← Main area
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  Caption: "First smile!"                                   │  ← Caption
│           Month 4 • Feb 20, 2026                           │
├────────────────────────────────────────────────────────────┤
│  [Thumb] [Thumb] [Thumb] [Thumb*] [Thumb] [Thumb]          │  ← Thumbnails
└────────────────────────────────────────────────────────────┘
         (* = current photo, highlighted border)
```

**Components:**
- **Top bar**: Close (X), Caption toggle (💬), Download (⬇)
- **Main area**: Photo (centered, contain), Navigation arrows (left/right)
- **Caption area**: Text (scrollable if long), Context (month + date)
- **Thumbnail strip**: Small previews (scrollable), Current photo highlighted

### Opened From
- Baby Gallery page (grid or timeline)
- Month View page (photos tab)
- Any component rendering `PhotoGrid`

## Dependencies

### Technical
- **yet-another-react-lightbox**: Core lightbox library
- **Plugins**:
  - `Captions`: Display captions below photo
  - `Download`: Download button functionality
  - `Thumbnails`: Thumbnail strip at bottom
- **CSS**:
  - `yet-another-react-lightbox/styles.css` (core)
  - `yet-another-react-lightbox/plugins/captions.css`
  - `yet-another-react-lightbox/plugins/thumbnails.css`

### Utilities
- `getFileExtension()`: Extract extension from path/URL
- `URL.createObjectURL()`: Create blob URL for download
- `URL.revokeObjectURL()`: Clean up blob URL after download

## Implementation Notes

### PhotoLightbox Component
```typescript
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const PhotoLightbox = ({
  photos,
  open,
  index,
  onClose,
  babyName = "baby",
  showCaptions = true,
  showDownload = true,
  showThumbnails = true,
}) => {
  // Transform photos to lightbox slides
  const lightboxSlides = useMemo(() => {
    return photos.map(photo => {
      const monthDisplay = `Month ${photo.month_number}`;
      const dateDisplay = new Date(photo.created_at).toLocaleDateString();
      const fileExtension = getFileExtension(photo.storage_path) || getFileExtension(photo.url) || '';
      const filename = `${babyName}-month-${photo.month_number}-${photo.id}${fileExtension ? '.' + fileExtension : ''}`;
      
      return {
        src: photo.url,
        alt: photo.description || `Photo from ${monthDisplay.toLowerCase()}`,
        title: photo.description || monthDisplay,
        description: photo.description 
          ? `${photo.description}\n\n${monthDisplay} • ${dateDisplay}`
          : `${monthDisplay} • ${dateDisplay}`,
        download: { url: photo.url, filename },
      };
    });
  }, [photos, babyName]);

  // Build plugins array
  const plugins = [];
  if (showCaptions) plugins.push(Captions);
  if (showDownload) plugins.push(Download);
  if (showThumbnails) plugins.push(Thumbnails);

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={lightboxSlides}
      plugins={plugins}
      
      captions={showCaptions ? {
        showToggle: true,
        descriptionTextAlign: "start",
      } : undefined}
      
      download={showDownload ? {
        download: async ({ slide }) => {
          const download = slide.download;
          if (!download) return;
          
          try {
            const blob = await fetch(download.url).then(r => r.blob());
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = download.filename || 'photo';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
          } catch (error) {
            console.error('Download failed:', error);
            toast.error('Download failed. Please try again.');
          }
        },
      } : undefined}
      
      thumbnails={showThumbnails ? {
        position: "bottom",
        width: 120,
        height: 80,
        border: 2,
        borderRadius: 4,
        padding: 4,
        gap: 16,
      } : undefined}
      
      carousel={{
        finite: true,                  // No infinite loop
        padding: 0,
        spacing: 0,
        imageFit: "contain",           // Fit entire image
      }}
      
      render={{
        // Hide arrows if only 1 photo
        buttonPrev: lightboxSlides.length <= 1 ? () => null : undefined,
        buttonNext: lightboxSlides.length <= 1 ? () => null : undefined,
      }}
    />
  );
};
```

### Usage in Parent Component
```typescript
const Gallery = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  
  return (
    <div>
      <div className="grid">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => openLightbox(index)}
          />
        ))}
      </div>
      
      <PhotoLightbox
        photos={photos}
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
