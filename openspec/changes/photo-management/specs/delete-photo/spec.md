# Delete Photo/Video

## Description
Permanently remove a photo or video from storage and database. Deletion removes both the file from Supabase storage and the metadata record, with no recovery mechanism.

## Capability ID
`delete-photo`

---

## Inputs

| Field  | Type   | Required | Validation                 | Notes                           |
|--------|--------|----------|----------------------------|---------------------------------|
| photo  | object | Yes      | Valid Photo object with id | Complete photo metadata         |

### Input Structure
```typescript
type Photo = {
  id: string;
  storage_path: string;  // Filename in baby_images bucket
  baby_id: string;
  user_id: string;
  month_number: number;
  description: string | null;
  is_video: boolean;
  // ...other fields
};
```

---

## Process Flow

```
User                  UI                Storage           DB
 │                    │                   │               │
 │  1. Click delete   │                   │               │
 │     icon/button    │                   │               │
 ├───────────────────>│                   │               │
 │                    │  2. Confirm?      │               │
 │                    │     (optional)    │               │
 │  3. Confirm        │                   │               │
 ├───────────────────>│                   │               │
 │                    │  4. Delete file   │               │
 │                    ├──────────────────>│               │
 │                    │                   │  5. Remove    │
 │                    │                   │     from      │
 │                    │                   │   baby_images │
 │                    │<──────────────────│               │
 │                    │  (success)        │               │
 │                    │                   │               │
 │                    │  6. Delete record │               │
 │                    ├──────────────────────────────────>│
 │                    │                   │  7. Remove    │
 │                    │                   │     photo row │
 │                    │<──────────────────────────────────│
 │                    │  (success)        │               │
 │                    │                   │               │
 │  8. Remove from UI │  9. Update quota  │               │
 │<───────────────────│  10. Track event  │               │
 │  Success toast     │      "photo_      │               │
 │                    │       deleted"    │               │
```

### Step-by-Step Details

1-2. **Delete Trigger**
   - User clicks trash icon on photo
   - Optional confirmation (not currently implemented)
   - Could add AlertDialog for important photos

3-4. **Storage Deletion**
   - Delete file from `baby_images` bucket
   - Uses storage path from photo metadata
   - If storage deletion fails: abort, show error

5-6. **Database Deletion**
   - Delete photo record from database
   - Only proceeds if storage deletion succeeded
   - If DB deletion fails: orphaned storage file remains

7-9. **State Updates**
   - Remove photo from gallery UI
   - Invalidate React Query cache
   - Storage quota automatically recalculated (file_size no longer counted)

10. **Analytics**
   - Track `photo_deleted` or `video_deleted` event
   - Include: baby_id, month_number, is_video

---

## Outputs

### Success Case
- **Storage:** File removed from `baby_images` bucket
- **Database:** Photo row deleted
- **UI:** Photo removed from gallery immediately
- **Toast:** "File deleted successfully"
- **Quota:** User's storage usage decreases by file size

### Error Cases
| Error Type | Message | Handling |
|------------|---------|----------|
| Storage deletion failed | "Failed to delete file" | Photo remains, show error |
| DB deletion failed | "Failed to delete file" | Photo remains, show error |
| Network error | "Failed to delete file" | Photo remains, allow retry |
| Already deleted | (Silent) Photo not in database | Remove from UI anyway |

---

## Business Rules

### Deletion Rules
1. **Two-step process** - Delete storage first, then database
2. **No confirmation** - Direct deletion (current UX, could add confirmation)
3. **Permanent deletion** - No recovery, no "trash" folder
4. **Owner-only** - RLS ensures users only delete their own photos
5. **Cascade safe** - No foreign keys reference photos

### Storage Impact
- **Quota freed immediately** - File size no longer counted
- **Signed URLs invalidated** - Existing URLs return 404
- **No orphan prevention** - If DB delete fails, storage file orphaned

### State Management
- **Optimistic removal** - Photo removed from UI before deletion completes
- **Revert on error** - If deletion fails, photo reappears

---

## Edge Cases

### 1. Rapid Double-Delete
**Scenario:** User clicks delete twice quickly  
**Handling:**
- First delete proceeds
- Second delete: photo already gone
- DB returns "no rows affected" (not an error)
- UI already shows photo removed

### 2. Storage Delete Succeeds, DB Delete Fails
**Scenario:** File removed but database update fails  
**Handling:**
- Orphaned storage file (rare)
- Photo still shows in UI (error displayed)
- User can retry delete (will fail on storage but succeed on DB)
- Future: Background job to clean orphaned files

### 3. Signed URL Still Cached
**Scenario:** User deletes photo but another user has URL cached  
**Handling:**
- Cached URL becomes invalid (404)
- Browser naturally handles 404
- No security issue (file is gone)

### 4. Network Interruption
**Scenario:** Network drops mid-deletion  
**Handling:**
- Deletion may partially complete
- User sees error, photo remains in UI
- Retry will attempt full deletion again
- Idempotent (safe to retry)

### 5. Deleting Last Photo in Month
**Scenario:** User deletes the only photo in a month  
**Handling:**
- Photo removed
- Month section shows "No photos yet"
- Upload UI still available
- No special handling needed

### 6. Deleting Video
**Scenario:** User deletes a video (same as photo)  
**Handling:**
- Identical process
- No special video handling
- Larger file = more quota freed

---

## UI Locations

### Entry Points
1. **Photo Grid** - Trash icon on hover
2. **Lightbox** - Delete button in viewer
3. **Month Page** - Delete option in photo menu

### Visual Flow
```
Gallery Grid:
┌─────────┬─────────┬─────────┐
│ Photo 1 │ Photo 2 │ Photo 3 │
│         │  [🗑]   │         │  ← Hover reveals trash icon
└─────────┴─────────┴─────────┘

Click trash icon:
┌─────────────────────────────────┐
│  Are you sure? (optional)       │
│  [Cancel] [Delete]              │
└─────────────────────────────────┘

After deletion:
┌─────────┬─────────┬─────────┐
│ Photo 1 │         │ Photo 3 │  ← Photo 2 removed
│         │         │         │
└─────────┴─────────┴─────────┘

✅ File deleted successfully
```

---

## Dependencies

### Internal
- **useDeletePhoto** - Deletion logic hook
- **usePhotos** - Provides delete function
- **React Query** - Cache invalidation

### External
- **Supabase Storage** - File deletion API
- **Supabase Database** - Record deletion
- **Sonner** - Toast notifications

### Database Operations
```typescript
// Storage deletion
await supabase.storage
  .from("baby_images")
  .remove([photo.storage_path]);

// Database deletion
await supabase
  .from("photo")
  .delete()
  .eq("id", photo.id);
```

---

## Related Capabilities
- `upload-photo` - Add photos to gallery
- `view-photos` - Display photos in gallery
- `caption-photo` - Edit photo descriptions

---

## Known Issues & Future Improvements

### Known Issues
1. **No confirmation dialog** - Direct deletion (could be accidental)
2. **No undo/recovery** - Permanent deletion
3. **Orphaned files possible** - If DB delete fails after storage delete
4. **No batch delete** - Must delete photos one at a time

### Future Improvements
1. **Confirmation dialog** - "Are you sure?" with photo preview
2. **Soft delete** - Move to trash, allow recovery for 30 days
3. **Batch delete** - Select multiple photos, delete all
4. **Undo functionality** - Recent deletions can be restored
5. **Orphan cleanup** - Background job to find and remove orphaned storage files
6. **Delete all photos for baby** - Bulk operation when deleting baby

---

## Testing Checklist

### Functional Tests
- [ ] Delete photo removes from storage
- [ ] Delete photo removes from database
- [ ] Photo removed from UI immediately
- [ ] Storage quota decreases by file size
- [ ] Success toast shows
- [ ] Can delete videos same as photos

### Edge Case Tests
- [ ] Rapid double-delete handled gracefully
- [ ] Storage delete fails: photo remains
- [ ] DB delete fails: show error
- [ ] Network error: show error, allow retry
- [ ] Delete last photo in month: UI updates correctly

### Security Tests
- [ ] RLS prevents deleting other user's photos
- [ ] Cannot delete via direct API call without auth
- [ ] Signed URLs invalidated after deletion

---

## Implementation Notes

### Code Locations
- **Hook:** `src/hooks/useDeletePhoto.tsx`
- **Usage:** `src/hooks/usePhotos.tsx` (re-exports deletePhoto)
- **UI:** Photo grid components with delete buttons

### Key Function
```typescript
// From useDeletePhoto.tsx
const deletePhotoMutation = useMutation({
  mutationFn: async (photo: Photo) => {
    // 1. Delete from storage FIRST
    const { error: storageError } = await supabase.storage
      .from("baby_images")
      .remove([photo.storage_path]);
    
    if (storageError) throw storageError;
    
    // 2. Delete from database
    const { error: dbError } = await supabase
      .from("photo")
      .delete()
      .eq("id", photo.id);
    
    if (dbError) throw dbError;
  },
  onSuccess: () => {
    // Invalidate cache
    queryClient.invalidateQueries(["photos", babyId, monthNumber]);
    toast("Success", { description: "File deleted successfully" });
  },
  onError: (error) => {
    console.error("Error deleting file:", error);
    toast("Error", { description: "Failed to delete file" });
  },
});
```

### Order of Operations
**Critical:** Storage MUST be deleted before database
- Reason: If DB deleted first, can't find storage_path to delete file
- Result of wrong order: Orphaned storage files

### Optimistic Updates (Not Implemented)
**Could add:**
```typescript
onMutate: async (photo) => {
  // Cancel outgoing fetches
  await queryClient.cancelQueries(["photos", babyId, monthNumber]);
  
  // Snapshot
  const previous = queryClient.getQueryData(["photos", babyId, monthNumber]);
  
  // Optimistically remove
  queryClient.setQueryData(["photos", babyId, monthNumber], old => 
    old.filter(p => p.id !== photo.id)
  );
  
  return { previous };
},
onError: (err, photo, context) => {
  // Rollback
  queryClient.setQueryData(["photos", babyId, monthNumber], context.previous);
},
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
