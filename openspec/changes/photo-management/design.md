# Photo Management Design

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER LAYER                           │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Month Page   │  │ Gallery Page │  │ Month View   │
│ /app/month/  │  │ /app/gallery │  │ (home)       │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               COMPONENT LAYER                           │
├─────────────────────────────────────────────────────────┤
│  • PhotoUploader (upload UI + file selection)           │
│  • PhotoGrid (gallery display)                          │
│  • PhotoSection (month-specific photos)                 │
│  • Lightbox (full-screen viewer)                        │
│  • PhotoImage (Supabase transform presets + HEIC preview)│
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  PROCESSING LAYER                       │
├─────────────────────────────────────────────────────────┤
│  • File Validation (type, size, format)                 │
│  • HEIC Conversion (heic2any)                           │
│  • Image Compression (compressorjs)                     │
│  • Image Transformation (responsive sizes)              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  STATE LAYER                            │
├─────────────────────────────────────────────────────────┤
│  • usePhotos() - Fetch, upload, delete                  │
│  • useImageUpload() - Upload logic                      │
│  • useFetchPhotos() - Month-scoped photos (full list)   │
│  • useBabyPhotos() - Baby gallery (paginated + infinite)│
│  • useDeletePhoto() - Remove photos                     │
│  • React Query - Cache + optimistic updates            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               PERMISSION LAYER                          │
├─────────────────────────────────────────────────────────┤
│  • useAbilities() - Photo/video upload checks           │
│  • Storage Quota - Check available space                │
│  • Credit System - Photo batch payments                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  STORAGE LAYER                          │
├─────────────────────────────────────────────────────────┤
│  • Supabase Storage (baby_images bucket)                │
│  • Signed URLs (1-hour expiry)                          │
│  • PostgreSQL (photo metadata)                          │
│  • RLS Policies (user-scoped access)                    │
└─────────────────────────────────────────────────────────┘
```

---

## Data Model

### Photo Table Schema

```
┌─────────────────────────────────────────────────────────┐
│                      photo                              │
├──────────────────┬───────────────┬──────────────────────┤
│ Column           │ Type          │ Constraints          │
├──────────────────┼───────────────┼──────────────────────┤
│ id               │ uuid          │ PK, auto-generated   │
│ baby_id          │ uuid          │ FK → baby, NN        │
│ user_id          │ uuid          │ FK → auth.users, NN  │
│ storage_path     │ text          │ NOT NULL, UNIQUE     │
│ month_number     │ integer       │ NOT NULL, ≥1         │
│ description      │ text          │ NULLABLE             │
│ is_video         │ boolean       │ default false        │
│ file_size        │ bigint        │ for quota tracking   │
│ created_at       │ timestamptz   │ default now()        │
│ updated_at       │ timestamptz   │ default now()        │
└──────────────────┴───────────────┴──────────────────────┘

Indexes:
  - PRIMARY KEY (id)
  - INDEX ON (baby_id, month_number)
  - INDEX ON (user_id)
  - INDEX ON (storage_path) UNIQUE

RLS Policies:
  - photo_select_own: Users can SELECT their own photos
  - photo_insert_own: Users can INSERT with their user_id
  - photo_delete_own: Users can DELETE their own photos
  - photo_update_own: Users can UPDATE description only

Foreign Keys:
  - baby_id references baby(id) ON DELETE CASCADE
  - user_id references auth.users(id)
```

### Supabase Storage Bucket

```
Bucket: baby_images
├─ Public: false (private files)
├─ File size limit: 20MB (enforced client-side)
├─ Allowed MIME types: All (validated client-side)
└─ RLS: User can only access their own files

Storage RLS:
  - Users can upload files
  - Users can download files they own
  - Users can delete files they own
  - Files are accessed via signed URLs (1-hour expiry)
```

### Type Definitions

```typescript
// Photo metadata
export type Photo = {
  id: string;
  baby_id: string;
  user_id: string;
  storage_path: string;
  month_number: number;
  description: string | null;
  is_video: boolean;
  file_size?: number;
  created_at: string;
  updated_at: string;
  url?: string;  // Signed URL (generated on fetch)
};

// Upload input
export type CreatePhotoData = {
  file: File;
  baby_id: string;
  month_number: number;
  description?: string;
  is_video: boolean;
};

// Upload options
export type UploadOptions = {
  babyId: string;
  monthNumber: number;
  description?: string;
  onProgress?: (progress: number) => void;
};
```

### Relationships

```
        photo (N)
          │
          ├──────── (1) baby
          │            └─ ON DELETE CASCADE
          │
          └──────── (1) user
                       └─ For RLS + quota tracking
```

---

## Key Design Decisions

### 1. Client-Side HEIC Conversion

**Decision:** Convert HEIC to JPEG in browser using heic2any  
**Rationale:**
- No server infrastructure needed
- Faster for users (immediate conversion)
- Free (no processing costs)
- Works on all modern browsers

**Implementation:**
```typescript
import heic2any from 'heic2any';

const convertedBlob = await heic2any({
  blob: file,
  toType: 'image/jpeg',
  quality: 0.9,
});
```

**Trade-offs:**
- ✅ Zero cost, fast conversion
- ✅ User sees conversion progress
- ❌ Older browsers may not support (fallback: upload original)
- ❌ Conversion happens on every upload (can't cache)

---

### 2. Image Compression Strategy

**Decision:** Compress all images to max 1600px, 75% quality, convert to WebP  
**Rationale:**
- 1600px sufficient for web viewing (4K displays)
- 75% quality imperceptible quality loss for most photos
- WebP offers 30% smaller files than JPEG
- Reduces storage costs and bandwidth

**Implementation:**
```typescript
const DEFAULT_OPTIONS = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.75,
  convertToWebP: true,
};

const compressedFile = await compressImage(file, DEFAULT_OPTIONS);
```

**Compression Results:**
```
Original 5MB iPhone photo (4032x3024)
  ↓ Resize to 1600x1200
  ↓ Compress to 75% quality
  ↓ Convert to WebP
Result: ~800KB (84% reduction)
```

**Trade-offs:**
- ✅ Massive storage savings (70-85% reduction)
- ✅ Faster uploads and page loads
- ❌ Can't view original quality
- ❌ Minor quality loss (acceptable for web)

---

### 3. Signed URLs with 1-Hour Expiry

**Decision:** Generate signed URLs on photo fetch, expire after 1 hour  
**Rationale:**
- Secure: users can't access other users' files
- Temporary: reduces abuse risk
- Performance: URLs can be cached client-side

**Implementation:**
```typescript
const { data } = await supabase.storage
  .from("baby_images")
  .createSignedUrl(storage_path, 3600);  // 1 hour

return {
  ...photo,
  url: data.signedUrl
};
```

**Trade-offs:**
- ✅ Secure access control
- ✅ Prevents direct file access
- ❌ URLs expire (need refresh after 1 hour)
- ❌ Slight latency on fetch (URL generation)

---

### 4. Storage Quota Tracking

**Decision:** Track file_size in photo table, calculate quota on-the-fly  
**Rationale:**
- Simple to implement
- No separate quota table needed
- Real-time accuracy
- Easy to audit

**Implementation:**
```typescript
// Calculate user's storage usage
const { data } = await supabase
  .from("photo")
  .select("file_size")
  .eq("user_id", user.id);

const totalBytes = data.reduce((sum, p) => sum + (p.file_size || 0), 0);
```

**Quota Tiers:**
```typescript
export const STORAGE_QUOTAS = {
  FREE: 500 * 1024 * 1024,      // 500MB
  FAMILY: 10 * 1024 * 1024 * 1024,   // 10GB
  LIFETIME: 25 * 1024 * 1024 * 1024  // 25GB
};
```

**Trade-offs:**
- ✅ Simple, accurate, real-time
- ✅ No quota drift issues
- ❌ Requires SUM query on every upload check
- ❌ No caching (acceptable for now)

---

### 5. Photo vs Video Permission Model

**Decision:** Separate permissions for photos and videos  
**Rationale:**
- Videos are larger, premium-only makes sense
- Free tier gets 10 photos/month, then credit-based
- Premium gets unlimited photos + videos

**Rules:**
```typescript
// Photo uploads (Free tier)
if (monthlyPhotoCount < 10) {
  can('upload', 'Photo');  // First 10 free
} else {
  // Need 1 credit per batch of 10 photos
  if (nextPhotoNumber % 10 === 1 && creditsBalance >= 1) {
    can('upload', 'Photo');  // Charge 1 credit
  }
}

// Video uploads
if (tier === 'free') {
  if (creditsBalance >= 2) {
    can('upload', 'Video');  // 2 credits per video
  } else {
    cannot('upload', 'Video');  // Premium required
  }
}
```

**Trade-offs:**
- ✅ Monetization lever (video = premium feature)
- ✅ Free tier gets reasonable photo allowance
- ✅ Credits provide alternative path
- ❌ Complexity in permission checks
- ❌ Photo batch logic can confuse users

---

### 6. Read-time image delivery (Supabase transforms + client compression)

**Decision:** Client-side compression **on upload**; **Supabase Storage image transformations on read** for grids and lightbox (signed URL → `/render/image/` URL with width/quality/resize). No second stored object.

**Rationale:**
- One object per photo in `baby_images`; transforms are query/path variants of the same signed URL
- Grids use small presets (`thumbnail`); lightbox/download use `full` (e.g. 1600px cap)
- `enrichPhotoWithSignedUrls` signs only; `PhotoImage` applies `getTransformedUrl` per `size`

**Current approach:**
- Upload pipeline: validate → HEIC convert if needed → compress → store once
- Read pipeline: `createSignedUrl` + `getTransformedUrl` (`src/utils/supabaseImageTransform.ts`)
- Enrich signs only: `src/utils/enrichPhotoWithSignedUrls.ts`; sizes via `PhotoImage`

**Trade-offs:**
- ✅ Lower bandwidth for list views vs serving full-width images in every cell
- ✅ No extra thumbnail files or DB columns
- ⚠️ Transform availability depends on Supabase plan; utilities can fall back to raw signed URL where applicable

---

### 7. Caption/Description Field

**Decision:** Optional text field on photos, editable after upload  
**Rationale:**
- Some users want to add context
- Most won't use it (optional, not required)
- Simple to implement

**Implementation:**
- Single `description` text column
- Nullable
- Can be updated via UPDATE permission
- Shown in lightbox view

**Trade-offs:**
- ✅ Simple, optional
- ❌ No rich text formatting
- ❌ No hashtags or structured metadata

---

## Data Flow Diagrams

### Photo Upload Flow

```
User                  UI                Processing           Storage          DB
 │                    │                     │                  │              │
 │  1. Select file    │                     │                  │              │
 ├───────────────────>│                     │                  │              │
 │                    │  2. Validate file   │                  │              │
 │                    ├────────────────────>│                  │              │
 │                    │     (type, size)    │                  │              │
 │                    │<────────────────────│                  │              │
 │                    │  (valid/invalid)    │                  │              │
 │                    │                     │                  │              │
 │  3. Show preview   │  4. Is HEIC?        │                  │              │
 │<───────────────────│────────────────────>│                  │              │
 │                    │                     │  5. Convert      │              │
 │                    │                     │     to JPEG      │              │
 │                    │<────────────────────│  (heic2any)      │              │
 │                    │                     │                  │              │
 │  6. Add caption    │  7. Compress        │                  │              │
 │  8. Click upload   │────────────────────>│                  │              │
 ├───────────────────>│                     │  (compressorjs)  │              │
 │                    │<────────────────────│                  │              │
 │                    │  (compressed file)  │                  │              │
 │                    │                     │                  │              │
 │                    │  9. Check quota     │                  │              │
 │                    │────────────────────────────────────────>│              │
 │                    │<────────────────────────────────────────│              │
 │                    │  (OK/blocked)       │                  │              │
 │                    │                     │                  │              │
 │                    │  10. Upload file    │                  │              │
 │                    │──────────────────────────────────────────────────────>│
 │                    │                     │                  │  11. Store   │
 │                    │                     │                  │      file    │
 │                    │<──────────────────────────────────────────────────────│
 │                    │  (storage_path)     │                  │              │
 │                    │                     │                  │              │
 │                    │  12. Insert record  │                  │              │
 │                    │────────────────────────────────────────────────────────>
 │                    │                     │                  │  13. Create  │
 │                    │                     │                  │      row     │
 │                    │<────────────────────────────────────────────────────────
 │                    │  (photo record)     │                  │              │
 │                    │                     │                  │              │
 │                    │  14. Generate URL   │                  │              │
 │                    │──────────────────────────────────────>│              │
 │                    │<──────────────────────────────────────│              │
 │                    │  (signed URL)       │                  │              │
 │  15. Show success  │                     │                  │              │
 │<───────────────────│                     │                  │              │
```

### Photo Deletion Flow

```
User                  UI                DB              Storage
 │                    │                 │                 │
 │  1. Click delete   │                 │                 │
 ├───────────────────>│                 │                 │
 │                    │  2. Confirm?    │                 │
 │  3. Confirm        │                 │                 │
 ├───────────────────>│                 │                 │
 │                    │  4. Delete file │                 │
 │                    │─────────────────────────────────>│
 │                    │                 │  5. Remove from │
 │                    │                 │     bucket      │
 │                    │<─────────────────────────────────│
 │                    │  (success)      │                 │
 │                    │                 │                 │
 │                    │  6. Delete DB   │                 │
 │                    ├────────────────>│                 │
 │                    │                 │  7. Remove row  │
 │                    │<────────────────│                 │
 │                    │  (success)      │                 │
 │                    │                 │                 │
 │  8. Remove from UI │                 │                 │
 │<───────────────────│                 │                 │
```

### Photo Viewing Flow

```
User                  UI                DB              Storage
 │                    │                 │                 │
 │  1. Navigate to    │                 │                 │
 │     gallery        │                 │                 │
 ├───────────────────>│                 │                 │
 │                    │  2. Fetch photos│                 │
 │                    ├────────────────>│                 │
 │                    │                 │  3. Query rows  │
 │                    │<────────────────│                 │
 │                    │  (photo list)   │                 │
 │                    │                 │                 │
 │                    │  4. For each photo:               │
 │                    │     Generate signed URL           │
 │                    │─────────────────────────────────>│
 │                    │<─────────────────────────────────│
 │                    │  (signed URLs, 1hr expiry)        │
 │                    │                 │                 │
 │  5. Display grid   │                 │                 │
 │<───────────────────│                 │                 │
 │                    │                 │                 │
 │  6. Click photo    │                 │                 │
 │     (lightbox)     │                 │                 │
 ├───────────────────>│                 │                 │
 │  7. View full size │                 │                 │
 │<───────────────────│                 │                 │
```

---

## Processing Pipeline Details

### HEIC Conversion

**When:** On file selection, before upload  
**Library:** heic2any  
**Process:**
1. Detect HEIC file (by extension or MIME type)
2. Convert to JPEG with 90% quality (high for intermediate)
3. Create preview for user
4. Compress converted JPEG before upload

**Code:**
```typescript
// src/utils/heicConverter.ts
export const convertHeicToWebFormat = async (
  file: File, 
  options: { quality?: number; format?: 'JPEG' | 'PNG' } = {}
): Promise<Blob | null> => {
  const { quality = 0.9, format = 'JPEG' } = options;

  const convertedBlob = await heic2any({
    blob: file,
    toType: format === 'JPEG' ? 'image/jpeg' : 'image/png',
    quality: quality,
  });

  return Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
};
```

**Error Handling:**
- If conversion fails, show error toast
- Option to upload original (may work on some browsers)
- Fallback: suggest manual conversion

---

### Image Compression

**When:** After HEIC conversion (if applicable), before upload  
**Library:** compressorjs  
**Process:**
1. Resize to max 1600x1600 (preserves aspect ratio)
2. Compress to 75% quality
3. Convert PNG/BMP to WebP or JPEG (if >100KB)
4. Handle EXIF orientation

**Code:**
```typescript
// src/utils/imageCompressor.ts
export const compressImage = async (
  file: File,
  options?: CompressOptions
): Promise<File> => {
  const opts = {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.75,
    convertToWebP: true,
    ...options
  };

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      maxWidth: opts.maxWidth,
      maxHeight: opts.maxHeight,
      quality: opts.quality,
      mimeType: opts.convertToWebP ? 'image/webp' : 'image/jpeg',
      success: (result) => {
        const compressedFile = new File([result], file.name, {
          type: result.type,
        });
        resolve(compressedFile);
      },
      error: (err) => {
        console.error('Compression failed:', err);
        resolve(file);  // Return original on error
      },
    });
  });
};
```

**Compression Statistics:**
```
Original:     5MB (4032x3024 JPEG)
After resize: 1.2MB (1600x1200 JPEG)
After compress: 900KB (75% quality JPEG)
After WebP:   700KB (WebP conversion)

Total reduction: 86%
```

---

### File Validation

**When:** Immediately after file selection  
**Checks:**
1. File type (images + videos for premium)
2. File size (10MB images, 20MB videos)
3. Magic byte detection (detect true file type)

**Code:**
```typescript
// src/components/photoUploader/validateFile.ts
export const validateFile = async (
  file: File,
  canUploadVideo: boolean
): Promise<FileValidationResult> => {
  if (!file) return { isValid: false, isVideo: false, effectiveMimeType: "" };

  // Detect actual file type via magic bytes
  const fileTypeResult = await fileTypeFromBlob(file);
  const detectedMimeType = fileTypeResult?.mime || "";

  // Fallback to extension if detection fails
  const extensionMimeType = getMimeTypeFromExtension(file.name);
  const effectiveMimeType = detectedMimeType || file.type || extensionMimeType;

  const isVideo = effectiveMimeType.startsWith("video/");

  // Check video permission
  if (isVideo && !canUploadVideo) {
    toast("Premium Required", {
      description: "Video uploads require premium subscription",
    });
    return { isValid: false, isVideo, effectiveMimeType };
  }

  // Check file size
  const maxSize = isVideo ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    toast("File too large", {
      description: `Maximum size is ${maxSize / 1024 / 1024}MB`,
    });
    return { isValid: false, isVideo, effectiveMimeType };
  }

  return { isValid: true, isVideo, effectiveMimeType };
};
```

---

### Responsive Image Sizes

**Strategy:** Client-side CSS sizing + optional URL transformation  
**Sizes:**
- **Thumbnail:** 200px (gallery grid)
- **Preview:** 400px (modal preview)
- **Display:** 800px (lightbox on mobile)
- **Full:** 1600px (lightbox on desktop)

**Current Implementation:**
```typescript
// CSS-based sizing (no URL transformation yet)
<img 
  src={photo.url} 
  className="w-48 h-48 object-cover"  // Thumbnail
/>
```

**Future Enhancement (Supabase Transform):**
```typescript
// Would use Supabase image transformation API
const transformUrl = (url: string, width: number) => {
  return url.replace('/object/', `/render/image/`)
    + `&width=${width}&quality=80`;
};

<img src={transformUrl(photo.url, 200)} />  // Optimized fetch
```

**Trade-offs:**
- Current: Simple, fetches full image (mitigated by compression)
- Future: Optimized bandwidth, requires Supabase Pro or Edge Function

---

## Permission System Details

### Photo Upload Permissions

```typescript
// From src/lib/abilities.ts

// Free tier photo logic
if (user.tier === 'free') {
  if (user.monthlyPhotoCount < 10) {
    can('upload', 'Photo');  // First 10 photos free
  } else {
    // Photos 11-20, 21-30, etc. require 1 credit each batch
    const nextPhotoNumber = user.monthlyPhotoCount + 1;
    const enteringNewBatch = nextPhotoNumber % 10 === 1;
    
    if (enteringNewBatch && user.creditsBalance >= 1) {
      can('upload', 'Photo');  // Deduct 1 credit
    } else if (!enteringNewBatch) {
      can('upload', 'Photo');  // Within current batch, no charge
    } else {
      cannot('upload', 'Photo')
        .because('Photo limit reached. Need 1 credit per 10 photos.');
    }
  }
}

// Premium tier
if (user.tier === 'family' || user.tier === 'lifetime') {
  can('upload', 'Photo');  // Unlimited
}
```

**Credit Costs:**
```typescript
export const CREDIT_COSTS = {
  EXTRA_PHOTOS: 1,    // Per batch of 10 photos
  VIDEO_UPLOAD: 2,    // Per video
};
```

**Examples:**
- Photo 1-10: Free
- Photo 11: Costs 1 credit
- Photo 12-20: Free (already paid for batch)
- Photo 21: Costs 1 credit
- Photo 22-30: Free

### Video Upload Permissions

```typescript
// From src/lib/abilities.ts

if (user.tier === 'free') {
  if (user.creditsBalance >= 2) {
    can('upload', 'Video');  // 2 credits per video
  } else {
    cannot('upload', 'Video')
      .because('Video uploads require premium subscription or 2 credits');
  }
} else {
  can('upload', 'Video');  // Premium unlimited
}
```

---

## API Contracts

### Upload Photo

```typescript
// Input
type UploadOptions = {
  file: File;
  babyId: string;
  monthNumber: number;
  description?: string;
  onProgress?: (progress: number) => void;
};

// Process
const uploadResult = await uploadPhoto({
  file: compressedFile,
  babyId: "uuid",
  monthNumber: 3,
  description: "First steps!",
});

// Supabase storage upload
const { data, error } = await supabase.storage
  .from("baby_images")
  .upload(fileName, file, {
    contentType: file.type,
  });

// Database insert
const { data: photo, error } = await supabase
  .from("photo")
  .insert({
    baby_id: babyId,
    user_id: user.id,
    month_number: monthNumber,
    storage_path: fileName,
    description: description || null,
    is_video: isVideo,
    file_size: file.size,
  })
  .select()
  .single();

// Output
type UploadResult = Photo & { url: string };
```

### Fetch Photos (month vs baby gallery)

```typescript
// Month page — full list for one baby + month (sort/filter need complete set)
const { photos, isLoading, refetch } = useFetchPhotos(babyId, monthNumber);
// useQuery: staleTime/gcTime from src/constants/photoQueryCache.ts
// enrichPhotosWithSignedUrls(rows)

// Baby gallery — paginated infinite query (24 per page)
const {
  photos,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useBabyPhotos(babyId);

// Enrichment (shared): one signed object URL per row; transforms in PhotoImage
import { enrichPhotosWithSignedUrls } from "@/utils/enrichPhotoWithSignedUrls";
const withUrls = await enrichPhotosWithSignedUrls(rows);

// Photo shape (client) — transforms via PhotoImage `size`, not on url
type Photo = {
  id: string;
  storage_path: string;
  url?: string; // signed object URL
  is_video: boolean;
  // ...
};
```

### Delete Photo

```typescript
// Input
deletePhoto(photo);

// Process
// 1. Delete from storage
const { error: storageError } = await supabase.storage
  .from("baby_images")
  .remove([photo.storage_path]);

// 2. Delete from database
const { error: dbError } = await supabase
  .from("photo")
  .delete()
  .eq("id", photo.id);

// Output
// Success: Photo removed from UI, cache invalidated
// Error: Toast notification, photo remains
```

---

## State Management

### React Query Cache Keys

```typescript
// Photo list per baby per month
['photos', babyId, monthNumber]

// Example: Photos for baby "abc123" in month 3
['photos', 'abc123', 3]
```

### Cache Invalidation

```typescript
// After upload
queryClient.invalidateQueries({
  queryKey: ["photos", babyId, monthNumber],
});

// After delete
queryClient.invalidateQueries({
  queryKey: ["photos", babyId, monthNumber],
});

// After caption update
queryClient.invalidateQueries({
  queryKey: ["photos", babyId, monthNumber],
});
```

### Optimistic Updates (Not Implemented)

**Future Enhancement:**
```typescript
// Could add optimistic UI updates
const mutation = useMutation({
  mutationFn: uploadPhoto,
  onMutate: async (newPhoto) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['photos', babyId, monthNumber]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['photos', babyId, monthNumber]);
    
    // Optimistically update
    queryClient.setQueryData(['photos', babyId, monthNumber], old => {
      return [...old, { ...newPhoto, id: 'temp' }];
    });
    
    return { previous };
  },
  onError: (err, newPhoto, context) => {
    // Rollback on error
    queryClient.setQueryData(['photos', babyId, monthNumber], context.previous);
  },
});
```

---

## Error Handling

### Upload Errors

```typescript
try {
  await uploadPhoto(options);
} catch (error) {
  if (error.message.includes('storage quota')) {
    toast.error('Storage quota exceeded. Upgrade to add more photos.');
  } else if (error.message.includes('network')) {
    toast.error('Upload failed. Check your internet connection.');
  } else if (error.message.includes('mime')) {
    toast.error('File format not supported. Try converting to JPEG.');
  } else {
    toast.error(`Upload failed: ${error.message}`);
  }
  
  trackFileUploadError(error, fileType, fileSize, 'upload');
}
```

### HEIC Conversion Errors

```typescript
try {
  const converted = await convertHeicToWebFormat(file);
} catch (error) {
  toast.error('HEIC conversion failed. Try converting to JPEG manually.');
  // Fallback: upload original (may work in some browsers)
  return file;
}
```

### Signed URL Expiration

```typescript
// On image load error (URL expired)
const handleImageError = async () => {
  try {
    // Regenerate signed URL
    const { data } = await supabase.storage
      .from("baby_images")
      .createSignedUrl(photo.storage_path, 3600);
    
    // Update photo URL
    setPhotoUrl(data.signedUrl);
  } catch (error) {
    toast.error('Failed to load image');
  }
};
```

---

## Security Considerations

### Row-Level Security

```sql
-- Users can only see their own photos
CREATE POLICY photo_select_own ON photo
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert photos with their user_id
CREATE POLICY photo_insert_own ON photo
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own photos
CREATE POLICY photo_delete_own ON photo
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only update description (not storage_path or user_id)
CREATE POLICY photo_update_description ON photo
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Storage RLS

```sql
-- Users can upload to baby_images
CREATE POLICY upload_own_photos ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'baby_images' AND auth.uid() = owner);

-- Users can download their own photos via signed URLs
CREATE POLICY download_own_photos ON storage.objects
  FOR SELECT
  USING (bucket_id = 'baby_images' AND auth.uid() = owner);

-- Users can delete their own photos
CREATE POLICY delete_own_photos ON storage.objects
  FOR DELETE
  USING (bucket_id = 'baby_images' AND auth.uid() = owner);
```

### Client-Side Validation

```typescript
// Validate before upload
if (!file) throw new Error("No file selected");
if (!user) throw new Error("Not authenticated");

// Validate file size
const maxSize = isVideo ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
if (file.size > maxSize) {
  throw new Error("File too large");
}

// Validate file type
const acceptedTypes = ["image/jpeg", "image/png", /* ... */];
if (!acceptedTypes.includes(file.type)) {
  throw new Error("Invalid file type");
}

// Validate storage quota
const quotaCheck = await checkStorageQuota(user.id, file.size);
if (!quotaCheck.allowed) {
  throw new Error("Storage quota exceeded");
}
```

---

## Performance Considerations

### Upload Performance

**Compression Impact:**
```
5MB original → 700KB compressed = 7x faster upload
On 10 Mbps connection: 4 seconds → 0.6 seconds
```

**HEIC Conversion:**
```
Conversion time: 1-3 seconds (client-side)
Acceptable UX with progress indicator
```

**Concurrent Uploads:**
- Currently: One at a time
- Future: Batch upload with Promise.all()

### Gallery Loading

**Current:**
- Fetch all photos for baby/month
- Generate signed URLs (1 per photo)
- Display in grid

**Optimization Opportunities:**
1. **Pagination:** Load 20 photos at a time
2. **Lazy loading:** Load more as user scrolls
3. **Thumbnail optimization:** Fetch smaller sizes for grid
4. **URL caching:** Cache signed URLs (within 1-hour expiry)

### Storage Quota Calculation

**Current:**
```sql
SELECT SUM(file_size) 
FROM photo 
WHERE user_id = $1
```

**Optimization:**
- Cache in Redis/memory (invalidate on upload/delete)
- Background job for periodic reconciliation
- Materialized view for fast access

---

## Testing Strategy

### Unit Tests

```typescript
describe('heicConverter', () => {
  it('converts HEIC to JPEG');
  it('handles conversion failure gracefully');
  it('preserves image quality');
});

describe('imageCompressor', () => {
  it('compresses to target size');
  it('maintains aspect ratio');
  it('converts to WebP when supported');
});

describe('validateFile', () => {
  it('accepts valid image types');
  it('rejects oversized files');
  it('blocks videos for free tier');
});
```

### Integration Tests

```typescript
describe('Photo Upload Flow', () => {
  it('uploads JPEG successfully');
  it('converts and uploads HEIC');
  it('compresses large images');
  it('enforces storage quota');
  it('creates database record');
  it('generates signed URL');
});

describe('Photo Deletion Flow', () => {
  it('deletes file from storage');
  it('deletes database record');
  it('updates storage quota');
});
```

---

## Migration Path (Future Enhancements)

### Adding Server-Side Transformations

```typescript
// Edge Function for image transformation
export async function POST(request: Request) {
  const { storage_path, width, quality } = await request.json();
  
  // Fetch original from storage
  const { data: file } = await supabase.storage
    .from('baby_images')
    .download(storage_path);
  
  // Transform using Sharp or similar
  const transformed = await sharp(file)
    .resize(width)
    .jpeg({ quality })
    .toBuffer();
  
  // Return transformed image
  return new Response(transformed, {
    headers: { 'Content-Type': 'image/jpeg' },
  });
}
```

### Adding Batch Upload

```typescript
const uploadMultiple = async (files: File[]) => {
  const results = await Promise.allSettled(
    files.map(file => uploadPhoto({ file, ... }))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  
  return { successful, failed };
};
```

### Adding Photo Editing

```typescript
// In-browser editing with canvas API
const cropImage = async (file: File, crop: Crop) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // ... crop logic
  return canvas.toBlob();
};
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-22
**Version:** 1.2
