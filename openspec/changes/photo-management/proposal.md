# Photo Management System

## Problem
Parents want to preserve precious moments of their baby's first years through photos and videos. The app needs a robust media management system that:

- Handles photos from any device (iOS HEIC, Android JPEG, professional cameras)
- Optimizes storage and bandwidth (compress images, generate thumbnails)
- Works on mobile devices with limited bandwidth
- Supports both photos and videos (premium feature)
- Organizes media by baby and month
- Provides fast loading and smooth browsing experience

**Key Challenges:**
- iOS devices capture photos in HEIC format (incompatible with web browsers)
- High-resolution photos consume excessive storage and bandwidth
- Users on mobile data need fast load times
- Videos are large and require special handling
- Storage costs scale with user base

## Solution
A comprehensive photo and video management system with intelligent processing pipeline:

**Core Capabilities:**
- **Upload Photos** - Support JPEG, PNG, GIF, WebP, HEIC with automatic conversion and compression
- **Upload Videos** - Premium-only feature supporting MP4, QuickTime, WebM
- **View Gallery** - Fast-loading grid with thumbnails and lightbox viewer
- **Add Captions** - Descriptive text for each photo/video
- **Delete Media** - Remove photos/videos from storage and database

**Technical Features:**
- **HEIC Conversion** - Automatic client-side conversion to JPEG for iOS photos
- **Image Compression** - Reduce file size by 60-80% while maintaining quality
- **Responsive Images** - Multiple sizes (thumbnail, preview, display, full) for optimal loading
- **Storage Quota Management** - Track usage per tier (500MB free, 10GB family, 25GB lifetime)
- **Signed URLs** - Secure, time-limited access to private storage
- **Permission Gating** - Free tier gets 10 photos/month, premium unlimited

## Scope

### ✅ In Scope
- Photo upload with HEIC conversion
- Video upload (premium/credits only)
- Image compression (60-80% size reduction)
- Responsive image transformations (thumbnail/preview/display/full)
- File validation (type, size, format)
- Caption management
- Photo deletion (storage + database)
- Storage quota tracking
- Permission gating (free vs premium)
- Credit-based photo batches (free tier: 1 credit per 10 photos after first 10)
- Gallery view with lightbox
- Filtering by baby and month

### ❌ Out of Scope
- Photo editing (crop, rotate, filters)
- Batch upload UI (uploads one at a time)
- Photo albums/collections
- Photo sharing/export
- Face detection/tagging
- Geolocation/EXIF data preservation
- Cloud sync across devices
- Video thumbnails generation
- Video playback controls (uses native browser player)

### 🔮 Future Enhancements
- Batch upload (drag-and-drop multiple files)
- Photo albums within months
- Basic editing (crop, rotate)
- Download original quality
- Export to PDF/slideshow
- Video thumbnail generation
- Progressive image loading
- Lazy loading for large galleries

## Success Metrics

### User Experience
- Photo upload completes in <10 seconds for 5MB image
- HEIC conversion happens transparently (<3 seconds)
- Gallery loads first screenful in <2 seconds
- Storage quota displayed clearly
- Zero failed uploads due to format issues

### Business Metrics
- Free → Premium conversion on video upload attempts
- Credit purchases for photo batches
- Average photos per user (free vs premium)
- Storage cost per user tier
- Upload success rate (target: >98%)

### Technical Metrics
- Average compression ratio (target: 70% reduction)
- HEIC conversion success rate (target: >95%)
- Storage quota accuracy (±1% of actual)
- Signed URL uptime (target: 99.9%)

## Assumptions
1. Most users upload 5-10 photos per month per baby
2. iOS users are significant portion of user base (HEIC critical)
3. Users accept lossy compression for web viewing
4. Mobile data users need bandwidth optimization
5. Videos are less frequently uploaded than photos
6. Captions are optional (most users won't use them)
7. Users understand storage quotas

## Constraints
- **Storage Limits:**
  - Free: 500MB total
  - Family: 10GB total
  - Lifetime: 25GB total
- **File Size Limits:**
  - Images: 10MB max
  - Videos: 20MB max
- **Upload Limits (Free Tier):**
  - 10 photos/month free
  - Additional photos: 1 credit per batch of 10
- **Browser Compatibility:**
  - HEIC conversion requires modern browser
  - Video formats vary by browser (MP4 safest)
- **Supabase Storage:**
  - Signed URLs expire (3600 seconds = 1 hour)
  - No server-side image transformation
  - Storage pricing: $0.021/GB/month

## Dependencies

### External Libraries
- **heic2any** - HEIC to JPEG/PNG conversion
- **compressorjs** - Image compression
- **file-type** - Magic byte file detection
- **Supabase Storage** - File storage and signed URLs
- **yet-another-react-lightbox** - Gallery viewer

### Internal Systems
- **Auth System** - User identity for file ownership
- **Baby Management** - Associate photos with babies
- **Subscription System** - Tier-based limits
- **Credit System** - Photo batch payments
- **Month System** - Organize photos by month

### Database
- **photo table** - Metadata storage
- **baby_images bucket** - Supabase storage bucket
- **user_storage_stats** - Quota tracking (if exists)

## Risks

### High Priority
1. **Storage Costs Runaway** - Users upload huge videos, exhaust quotas
   - Mitigation: Hard file size limits, quota enforcement, compression

2. **HEIC Conversion Fails** - iOS users can't upload photos
   - Mitigation: Fallback to upload original, server-side conversion option

3. **Storage Quota Drift** - Tracking gets out of sync with actual usage
   - Mitigation: Periodic reconciliation, fail-safe calculations

### Medium Priority
4. **Signed URL Expiration** - URLs expire while user viewing gallery
   - Mitigation: 1-hour expiry, regenerate on error, cache URLs

5. **Compression Quality Issues** - Over-compression ruins photos
   - Mitigation: Conservative quality settings (75%), user feedback loop

6. **Upload Failures** - Network issues, large files, timeouts
   - Mitigation: Retry logic, progress indicators, clear error messages

### Low Priority
7. **Browser Compatibility** - Older browsers don't support formats
   - Mitigation: Feature detection, graceful degradation

8. **Mobile Performance** - Large galleries lag on low-end devices
   - Mitigation: Pagination, lazy loading, thumbnail optimization

## Alternative Approaches Considered

### 1. Server-Side HEIC Conversion
**Rejected** - Adds server infrastructure, increases costs, slower for users. Client-side conversion (heic2any) works well and is free.

### 2. Store Original + Compressed Versions
**Rejected** - Doubles storage costs. Users can keep originals on their devices. Compression quality (75%) is sufficient for web viewing.

### 3. Unlimited Storage on Free Tier
**Rejected** - Unsustainable costs. 500MB is reasonable for 50-100 photos, sufficient for one baby's first year.

### 4. Video Thumbnails Generation
**Rejected** - Complex, requires video processing libraries or server-side. Browsers handle video playback natively. Future enhancement.

### 5. Progressive/Adaptive Image Loading
**Rejected** - Adds complexity. Signed URLs and responsive sizes provide good enough performance. Consider for future.

### 6. Batch Upload UI
**Rejected** - Single-file upload simpler for MVP. Most users upload 1-3 photos at a time. Future enhancement.

## Implementation Notes

### Storage Architecture
```
Supabase Storage Bucket: baby_images
├─ {uuid}.jpg         (compressed photos)
├─ {uuid}.webp        (WebP conversions)
├─ {uuid}.png         (PNG uploads)
├─ {uuid}.mp4         (videos)
└─ {uuid}.webm        (WebM videos)

Database: photo table
├─ id (uuid)
├─ baby_id (FK)
├─ user_id (FK)
├─ storage_path (filename in bucket)
├─ month_number (1-12+)
├─ description (caption, nullable)
├─ is_video (boolean)
├─ file_size (bytes, for quota tracking)
├─ created_at
└─ updated_at
```

### Image Processing Pipeline
```
┌─────────────┐
│ User selects│
│    file     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Validate   │
│ type & size │
└──────┬──────┘
       │
       ├──── is HEIC? ───> Convert to JPEG (heic2any)
       │                           │
       ▼                           ▼
┌─────────────┐           ┌─────────────┐
│  Compress   │<──────────│ Compressed  │
│  (75% qual) │           │    JPEG     │
└──────┬──────┘           └─────────────┘
       │
       ├──── PNG/BMP? ───> Convert to WebP or JPEG
       │
       ▼
┌─────────────┐
│  Generate   │
│   preview   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Upload to  │
│   storage   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Insert DB   │
│   record    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Generate   │
│  signed URL │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Display   │
│  in gallery │
└─────────────┘
```

### Storage Quota Calculation
```typescript
// Calculated per user
totalStorageUsed = SUM(photo.file_size WHERE photo.user_id = user.id)

// Quota by tier
quota = {
  free: 500 * 1024 * 1024,      // 500MB
  family: 10 * 1024 * 1024 * 1024,   // 10GB
  lifetime: 25 * 1024 * 1024 * 1024  // 25GB
}

// Check before upload
if (totalStorageUsed + fileSize > quota[userTier]) {
  // Block upload, show upgrade prompt
}
```

### Key Code Locations
- **Upload Hook:** `src/hooks/useImageUpload.tsx`
- **Upload Component:** `src/components/PhotoUploader.tsx`
- **Delete Hook:** `src/hooks/useDeletePhoto.tsx`
- **Fetch Hooks:** `src/hooks/useFetchPhotos.tsx` (month, full list), `src/hooks/useBabyPhotos.tsx` (baby gallery, paginated)
- **URL enrichment:** `src/utils/enrichPhotoWithSignedUrls.ts`, `src/constants/photoQueryCache.ts`
- **HEIC Converter:** `src/utils/heicConverter.ts`
- **Image Compressor:** `src/utils/imageCompressor.ts`
- **File Validation:** `src/components/photoUploader/validateFile.ts`
- **Image Transform:** `src/utils/supabaseImageTransform.ts`
- **Gallery Component:** `src/components/PhotoGrid.tsx`
- **Display image:** `src/components/PhotoImage.tsx` (transform presets + HEIC preview, blob URL lifecycle)
- **Lightbox:** `yet-another-react-lightbox` + `PhotoLightboxContent` custom `render.slide`

### Compression Settings
```typescript
const DEFAULT_OPTIONS = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.75,  // 75% quality
  convertToWebP: true  // If browser supports
};
```

### Signed URL Strategy
```typescript
// One sign per row; PhotoImage applies display transforms (grid / lightbox)
import { enrichPhotosWithSignedUrls } from "@/utils/enrichPhotoWithSignedUrls";

const photos = await enrichPhotosWithSignedUrls(rows);
// Display: PhotoImage(photo.url, size). React Query: photoQueryCache tuning.
```

## Open Questions
1. ~~Should we generate multiple image sizes server-side or client-side?~~ **Resolved for read path:** Supabase Storage image transforms on signed URLs; single object stored. *Open:* premium “original quality” download semantics.
2. Should original-quality downloads be a premium feature?
3. How often should we reconcile storage quotas?
4. Should we implement photo versioning (edit history)?
5. What's the optimal signed URL expiry time?
6. Should videos auto-play or require click?
7. Do we need video processing (trim, compress)?

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-22  
**Version:** 1.2
