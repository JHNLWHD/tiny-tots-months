# Upload Photo/Video

## Description
Upload photos and videos to a baby's monthly timeline with automatic HEIC conversion, image compression, and storage management. Supports multiple formats with intelligent processing for optimal storage and performance.

## Capability ID
`upload-photo`

---

## Inputs

| Field         | Type    | Required | Validation                          | Notes                           |
|---------------|---------|----------|-------------------------------------|---------------------------------|
| file          | File    | Yes      | Valid image/video, <10MB/<20MB      | Browser File object             |
| baby_id       | string  | Yes      | Valid UUID, user owns baby          | Baby to associate photo with    |
| month_number  | integer | Yes      | ≥1, typically 1-36                  | Month in baby's timeline        |
| description   | string  | No       | 0-1000 chars                        | Optional caption                |
| is_video      | boolean | Yes      | Determined from file type           | Affects permissions + limits    |

### Accepted File Types

**Images:**
- JPEG/JPG
- PNG
- GIF
- WebP
- HEIC/HEIF (iOS)
- BMP
- TIFF

**Videos** (Premium/Credits Only):
- MP4
- QuickTime (MOV)
- WebM
- AVI

### File Size Limits
- **Images:** 10MB maximum
- **Videos:** 20MB maximum

---

## Process Flow

```
User                    UI                Processing           Storage          DB
 │                      │                     │                  │              │
 │  1. Select file      │                     │                  │              │
 ├─────────────────────>│                     │                  │              │
 │                      │  2. Validate        │                  │              │
 │                      ├────────────────────>│                  │              │
 │                      │  • Check type       │                  │              │
 │                      │  • Check size       │                  │              │
 │                      │  • Magic bytes      │                  │              │
 │                      │<────────────────────│                  │              │
 │                      │  (valid/invalid)    │                  │              │
 │                      │                     │                  │              │
 │  3. Show preview     │  4. Detect HEIC?    │                  │              │
 │<─────────────────────│────────────────────>│                  │              │
 │                      │                     │  5. Convert      │              │
 │  "Converting..."     │                     │     HEIC→JPEG    │              │
 │<─────────────────────│<────────────────────│  (heic2any)      │              │
 │                      │  (converted blob)   │  [1-3 seconds]   │              │
 │                      │                     │                  │              │
 │  6. Add caption      │  7. Check           │                  │              │
 │     (optional)       │     permissions     │                  │              │
 │  8. Click upload     ├──────────────────────────────────────────────────────>
 ├─────────────────────>│                     │                  │  9. Check    │
 │                      │                     │                  │     quota    │
 │                      │<──────────────────────────────────────────────────────│
 │                      │  (OK/blocked)       │                  │              │
 │                      │                     │                  │              │
 │                      │  10. Compress       │                  │              │
 │  "Processing..."     ├────────────────────>│                  │              │
 │<─────────────────────│                     │  • Resize 1600px │              │
 │                      │                     │  • 75% quality   │              │
 │                      │                     │  • WebP if OK    │              │
 │                      │<────────────────────│  [1-2 seconds]   │              │
 │                      │  (compressed file)  │                  │              │
 │                      │                     │  70-85% smaller  │              │
 │                      │                     │                  │              │
 │  "Uploading..."      │  11. Upload file    │                  │              │
 │<─────────────────────│──────────────────────────────────────>│              │
 │                      │                     │                  │  12. Store   │
 │                      │                     │                  │      in      │
 │                      │                     │                  │   baby_images│
 │                      │<──────────────────────────────────────│              │
 │                      │  (storage_path)     │                  │  [2-8 secs]  │
 │                      │                     │                  │              │
 │                      │  13. Insert record  │                  │              │
 │                      │────────────────────────────────────────────────────────>
 │                      │                     │                  │  14. Create  │
 │                      │                     │                  │      photo   │
 │                      │                     │                  │      row     │
 │                      │<────────────────────────────────────────────────────────
 │                      │  (photo with id)    │                  │              │
 │                      │                     │                  │              │
 │                      │  15. Generate URL   │                  │              │
 │                      │──────────────────────────────────────>│              │
 │                      │<──────────────────────────────────────│              │
 │                      │  (signed URL, 1hr)  │                  │              │
 │                      │                     │                  │              │
 │  16. Show in gallery │  17. Clear form     │                  │              │
 │<─────────────────────│                     │                  │              │
 │                      │  18. Track event    │                  │              │
 │  Success toast       │      "photo_        │                  │              │
 │<─────────────────────│       uploaded"     │                  │              │
```

### Step-by-Step Details

**1-2. File Selection & Validation**
- User selects file via file input or drag-drop
- Immediate validation:
  - Check file type via MIME type
  - Use magic byte detection for accuracy
  - Verify file size within limits
  - Check video permission (if video file)

**3-5. HEIC Conversion (if needed)**
- Detect HEIC/HEIF format
- Show "Converting HEIC Image..." message
- Convert to JPEG using heic2any library
- Quality: 90% (high for intermediate step)
- Creates preview for user confirmation
- If conversion fails: show error, suggest manual conversion

**6-8. Caption & Upload Trigger**
- User optionally adds caption
- User clicks "Upload" button
- Permission check runs:
  - Free tier: 10 photos/month free, then 1 credit per 10 photos
  - Videos: Premium or 2 credits
  - Storage quota: Check remaining space

**9-10. Compression**
- Show "Processing..." indicator
- Compress image:
  - Resize to max 1600x1600px
  - 75% quality (minimal visible loss)
  - Convert PNG/BMP to WebP (if supported)
  - Typical 70-85% size reduction
- Skip compression for videos

**11-12. Storage Upload**
- Generate unique filename: `{uuid}.{ext}`
- Upload to `baby_images` bucket
- Show progress (if available)
- If upload fails: retry once, then show error

**13-14. Database Record**
- Insert photo metadata
- Fields: baby_id, user_id, storage_path, month_number, description, is_video, file_size
- If DB insert fails: delete uploaded file (cleanup)
- Transaction-like behavior

**15-17. Finalization**
- Generate signed URL (1-hour expiry)
- Add photo to gallery UI
- Clear upload form
- Reset file input

**18. Analytics**
- Track `photo_uploaded` or `video_uploaded` event
- Include: file_type, file_size, compression_ratio, baby_id

---

## Outputs

### Success Case
- **Storage:** File uploaded to `baby_images` bucket with unique filename
- **Database:** New row in `photo` table
- **UI:** Photo appears in gallery immediately
- **Toast:** "Photo uploaded successfully!"

### Error Cases
| Error Type | Message | Handling |
|------------|---------|----------|
| File too large | "Image too large. Maximum size is 10MB" | Block upload, show size |
| Invalid type | "Please upload JPG, PNG, GIF, WebP, HEIC, MP4..." | Block upload |
| HEIC conversion failed | "HEIC conversion failed. Try converting to JPEG manually." | Allow upload original (may work) |
| Storage quota exceeded | "Storage quota exceeded. Upgrade to add more photos." | Block upload, show upgrade |
| Permission denied | "Video uploads require premium subscription or 2 credits" | Block upload, show upgrade |
| Network error | "Upload failed. Check your internet connection." | Allow retry |
| Compression failed | (Silent) Upload original file | Fallback, log error |

---

## Business Rules

### Upload Limits

**Free Tier:**
```
Photos per month:
  • 1-10: Free
  • 11-20: 1 credit (charged once at photo 11)
  • 21-30: 1 credit (charged once at photo 21)
  • ...

Videos:
  • 2 credits per video
  • Or upgrade to premium
```

**Premium Tier:**
```
Photos: Unlimited
Videos: Unlimited
```

### Storage Quotas

| Tier     | Quota  | Typical Capacity (compressed) |
|----------|--------|-------------------------------|
| Free     | 500MB  | ~700 photos                   |
| Family   | 10GB   | ~14,000 photos                |
| Lifetime | 25GB   | ~35,000 photos                |

### Compression Rules
1. **Always compress images** (except GIFs - preserve animation)
2. **Never compress videos** (too slow client-side)
3. **Max dimensions:** 1600x1600px
4. **Quality:** 75% (good balance)
5. **WebP conversion:** If browser supports
6. **Fallback:** If compression fails, upload original

### File Naming
```
Format: {uuid}.{extension}
Example: "a3f7d9b2-1c4e-4b8d-9f3a-7e2c1d4b5a6f.jpg"

Extensions:
  • JPEG → .jpg
  • HEIC → .jpg (after conversion)
  • PNG → .webp or .png
  • MP4 → .mp4
```

---

## Edge Cases

### 1. HEIC Conversion Failure
**Scenario:** heic2any library fails to convert iOS photo  
**Handling:**
- Show error toast with suggestion
- Option to upload original HEIC (may work in Safari)
- Suggest converting manually via Photos app
- Track conversion failure in analytics

### 2. Compression Increases File Size
**Scenario:** Small, already-optimized image gets larger after compression  
**Handling:**
- Compare sizes after compression
- If compressed > original, use original
- Log occurrence for investigation

### 3. Network Interruption During Upload
**Scenario:** Wi-Fi drops mid-upload  
**Handling:**
- Supabase client automatically retries
- Show error if all retries fail
- User can click "Upload" again to retry
- File remains selected in UI

### 4. Quota Exhausted Mid-Upload
**Scenario:** User hits quota while file is uploading  
**Handling:**
- Check quota before upload starts
- If check passes but upload fails due to quota, show upgrade prompt
- Rare race condition (multiple tabs)

### 5. Duplicate File Upload
**Scenario:** User uploads same photo twice  
**Handling:**
- Allow it (different UUID filename)
- No deduplication (user may want duplicates)
- Consider future: hash-based duplicate detection

### 6. Very Large Image (within limit)
**Scenario:** 10MB image (max allowed) is slow to process  
**Handling:**
- Show progress indicator during compression
- Compression may take 3-5 seconds
- If browser hangs, suggest smaller file

### 7. Unsupported Video Format
**Scenario:** User selects .avi but browser can't play it  
**Handling:**
- Allow upload (passes validation)
- Video may not play in gallery
- Show message: "Video format may not be supported by all browsers"

### 8. Storage Upload Succeeds, DB Insert Fails
**Scenario:** File uploaded but database insert errors  
**Handling:**
- Delete uploaded file from storage (cleanup)
- Show error to user
- File orphaning prevention
- Implementation:
  ```typescript
  const { data: uploadData, error: uploadError } = await supabase.storage.upload(...);
  if (uploadError) throw uploadError;
  
  const { error: insertError } = await supabase.from("photo").insert(...);
  if (insertError) {
    // Clean up orphaned file
    await supabase.storage.from("baby_images").remove([fileName]);
    throw insertError;
  }
  ```

---

## UI Locations

### Entry Points
1. **Month Page** (`/app/month/:babyId/:monthNumber`)
   - Primary upload location
   - "Upload New Photo" card at top

2. **Gallery Page** (`/app/baby/:babyId/gallery`)
   - Floating "+" button (future)
   - Currently: redirects to month page

### Components
- **PhotoUploader** (`src/components/PhotoUploader.tsx`)
  - File selector
  - Preview
  - Caption input
  - Upload button
- **FileSelector** - File input with styling
- **MediaPreview** - Shows selected photo/video preview
- **CaptionForm** - Optional caption input

### Visual Flow
```
┌─────────────────────────────────────┐
│  Upload New Photo for Month 3      │
├─────────────────────────────────────┤
│                                     │
│  [Click or drag to upload]          │
│                                     │
│  JPG, PNG, GIF, WebP, HEIC up      │
│  to 10MB                            │
│                                     │
└─────────────────────────────────────┘

        ↓ (user selects file)

┌─────────────────────────────────────┐
│  Upload New Photo for Month 3      │
├─────────────────────────────────────┤
│  ┌─────────────┐                    │
│  │   PREVIEW   │                    │
│  │   IMAGE     │  [× Clear]         │
│  └─────────────┘                    │
│                                     │
│  Caption (optional):                │
│  ┌───────────────────────────────┐  │
│  │ First steps at the park!      │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Upload Photo]                     │
└─────────────────────────────────────┘

        ↓ (user clicks upload)

┌─────────────────────────────────────┐
│  Upload New Photo for Month 3      │
├─────────────────────────────────────┤
│                                     │
│  ⏳ Converting HEIC image...        │
│     (if HEIC)                       │
│                                     │
│  ⏳ Processing image...             │
│     (compressing)                   │
│                                     │
│  ⏳ Uploading...                    │
│     (sending to storage)            │
│                                     │
└─────────────────────────────────────┘

        ↓ (upload completes)

✅ Photo uploaded successfully!
(Gallery updates to show new photo)
```

---

## Dependencies

### Internal
- **useImageUpload** - Upload logic hook
- **usePhotos** - Fetch and display photos
- **useAbilities** - Permission checks
- **useBabyProfiles** - Verify baby ownership

### External Libraries
- **heic2any** (`^0.0.4`) - HEIC conversion
- **compressorjs** (`^1.2.1`) - Image compression
- **file-type** (`^19.6.0`) - Magic byte detection
- **uuid** (`^11.1.0`) - Unique filename generation
- **Supabase Storage** - File storage API

### Browser APIs
- FileReader - Read file as data URL
- Blob API - Handle file conversions
- Canvas API - (Used internally by compressorjs)

### Database Schema
```sql
CREATE TABLE photo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID NOT NULL REFERENCES baby(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  storage_path TEXT NOT NULL UNIQUE,
  month_number INTEGER NOT NULL CHECK (month_number >= 1),
  description TEXT,
  is_video BOOLEAN DEFAULT false,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photo_baby_month ON photo(baby_id, month_number);
CREATE INDEX idx_photo_user ON photo(user_id);
```

---

## Related Capabilities
- `view-photos` - Display uploaded photos in gallery
- `delete-photo` - Remove photo from storage and database
- `caption-photo` - Add/edit photo descriptions

---

## Known Issues & Future Improvements

### Known Issues
1. **No batch upload** - Can only upload one file at a time
2. **No resume on failure** - Must restart entire upload
3. **No duplicate detection** - Same photo can be uploaded multiple times
4. **HEIC conversion browser-dependent** - Older browsers may fail
5. **No progress bar** - Upload progress not shown (Supabase limitation)

### Future Improvements
1. **Batch upload UI** - Drag-drop multiple files
2. **Upload queue** - Show progress for multiple uploads
3. **Resumable uploads** - Continue after network interruption
4. **Duplicate detection** - Hash-based deduplication
5. **Client-side editing** - Crop, rotate before upload
6. **Server-side fallback** - Convert HEIC server-side if client fails
7. **Progressive upload** - Upload chunks for large files
8. **Thumbnail generation** - Create multiple sizes on upload

---

## Testing Checklist

### Functional Tests
- [ ] Upload JPEG successfully
- [ ] Upload PNG successfully
- [ ] Upload GIF (preserves animation)
- [ ] Upload HEIC (converts to JPEG)
- [ ] Upload video (premium user)
- [ ] Compression reduces file size (70-85%)
- [ ] Caption saves correctly
- [ ] Photo appears in gallery immediately

### Permission Tests
- [ ] Free user can upload first 10 photos
- [ ] Free user blocked after 10 photos (no credits)
- [ ] Free user can upload with 1 credit (photo 11-20)
- [ ] Free user can upload video with 2 credits
- [ ] Premium user uploads unlimited photos
- [ ] Premium user uploads unlimited videos

### Edge Case Tests
- [ ] File too large (10MB+) blocked
- [ ] Invalid file type blocked
- [ ] HEIC conversion failure shows error
- [ ] Network error during upload shows error
- [ ] Storage quota exceeded shows upgrade prompt
- [ ] Duplicate upload allowed (different UUID)
- [ ] Very large image (9.9MB) compresses successfully

### Error Recovery Tests
- [ ] Retry after network error works
- [ ] Storage upload fails: no orphaned file
- [ ] DB insert fails: storage file cleaned up
- [ ] Compression failure: falls back to original

---

## Implementation Notes

### Code Locations
- **Hook:** `src/hooks/useImageUpload.tsx` (lines 28-284)
- **Component:** `src/components/PhotoUploader.tsx`
- **Validation:** `src/components/photoUploader/validateFile.ts`
- **HEIC Conversion:** `src/utils/heicConverter.ts`
- **Compression:** `src/utils/imageCompressor.ts`

### Key Functions
```typescript
// Main upload function
const uploadPhoto = async (data: CreatePhotoData) => {
  // 1. Validate file
  const validation = await validateFile(file);
  
  // 2. Convert HEIC if needed
  const converted = await convertHeicToWebFormat(file);
  
  // 3. Compress image
  const compressed = await compressImage(converted || file);
  
  // 4. Upload to storage
  const { data: uploadData } = await supabase.storage
    .from("baby_images")
    .upload(fileName, compressed);
  
  // 5. Insert database record
  const { data: photo } = await supabase
    .from("photo")
    .insert({ ... })
    .select()
    .single();
  
  // 6. Generate signed URL
  const { data: urlData } = await supabase.storage
    .from("baby_images")
    .createSignedUrl(fileName, 3600);
  
  return { ...photo, url: urlData.signedUrl };
};
```

### Performance Metrics
```
Typical upload timeline (5MB iPhone photo):
  • HEIC detection: <100ms
  • HEIC conversion: 1-3 seconds
  • Compression: 1-2 seconds
  • Upload (10 Mbps): 0.6 seconds (700KB compressed)
  • DB insert: 100-200ms
  • Total: 3-6 seconds
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
