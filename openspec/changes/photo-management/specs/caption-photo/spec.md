# Add/Edit Photo Caption

## Description
Add or modify descriptive text captions for photos and videos. Captions can be set during upload or edited afterward to add context and memories to media.

## Capability ID
`caption-photo`

---

## Inputs

| Field       | Type   | Required | Validation          | Notes                           |
|-------------|--------|----------|---------------------|---------------------------------|
| photo_id    | string | Yes      | Valid UUID          | Photo to update caption for     |
| description | string | No       | 0-1000 chars        | New caption (empty = remove)    |

### Input Constraints
- Caption can be empty (removes caption)
- Maximum 1000 characters (reasonable length)
- Plain text only (no rich formatting)
- No HTML/markdown parsing

---

## Process Flow

```
User                  UI                DB
 │                    │                 │
 │  1. Click caption  │                 │
 │     field/edit     │                 │
 ├───────────────────>│                 │
 │                    │  2. Show input  │
 │                    │     field       │
 │  3. Type caption   │                 │
 ├───────────────────>│                 │
 │                    │  4. Submit      │
 │  5. Submit         │     (blur/enter)│
 ├───────────────────>│                 │
 │                    │  6. Update DB   │
 │                    ├────────────────>│
 │                    │                 │  7. UPDATE photo
 │                    │                 │     SET description
 │                    │<────────────────│     WHERE id = $1
 │                    │  (success)      │
 │                    │                 │
 │  8. Show updated   │  9. Refetch     │
 │     caption        │     photos      │
 │<───────────────────│                 │
 │  Success toast     │  10. Track      │
 │                    │      event      │
```

### Step-by-Step Details

**1-2. Edit Trigger**
   - **Option A:** Caption added during upload (PhotoUploader component)
   - **Option B:** Caption edited in lightbox viewer (future)
   - **Option C:** Inline edit in gallery (future)

**3-4. Caption Input**
   - User types caption in text field
   - Auto-saves on blur or Enter key
   - Or explicit "Save" button

**5-7. Database Update**
   - Update description column only
   - RLS ensures user owns photo
   - `updated_at` timestamp refreshed

**8-10. UI Update**
   - Caption displayed in gallery (if shown)
   - Visible in lightbox viewer
   - Cache invalidated and refetched

---

## Outputs

### Success Case
- **Database:** `description` column updated
- **UI:** Caption displayed in lightbox/grid
- **Toast:** "Caption updated" (optional)
- **State:** Cache refreshed

### Error Cases
| Error Type | Message | Handling |
|------------|---------|----------|
| Update failed | "Failed to update caption" | Show error, revert UI |
| Too long | "Caption too long (max 1000 characters)" | Block submission |
| Network error | "Failed to save caption" | Allow retry |
| Not found | "Photo not found" | Show error, refresh page |

---

## Business Rules

### Caption Rules
1. **Optional** - Captions are not required
2. **Plain text** - No formatting, HTML, or markdown
3. **Editable anytime** - Can update after upload
4. **Removable** - Empty string = no caption
5. **Length limit** - 1000 characters maximum

### Display Rules
- **Upload form:** Shows caption input
- **Gallery grid:** Caption not shown (space constraints)
- **Lightbox:** Caption shown below photo
- **Empty caption:** No text displayed (not "No caption")

### Update Permissions
```sql
-- Users can only update description field
CREATE POLICY photo_update_description ON photo
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Edge Cases

### 1. Very Long Caption
**Scenario:** User pastes 2000 character essay  
**Handling:**
- Validation blocks submission
- Show error: "Caption too long (max 1000 characters)"
- Truncate with "..." indicator
- Or allow but warn about truncation

### 2. Special Characters
**Scenario:** User includes emojis, Unicode, quotes  
**Handling:**
- All allowed (stored as text in PostgreSQL)
- Emojis display correctly
- No sanitization needed (not rendered as HTML)

### 3. Caption With Line Breaks
**Scenario:** User presses Enter for multi-line caption  
**Handling:**
- **Current:** Enter submits form (single-line input)
- **Future:** Textarea allows multi-line
- Line breaks preserved in database
- Display with CSS `white-space: pre-wrap`

### 4. Adding Caption to Video
**Scenario:** User captions a video (same as photo)  
**Handling:**
- Identical process
- Caption shows when video is viewed
- No special handling

### 5. Concurrent Edits
**Scenario:** Two tabs editing same photo caption  
**Handling:**
- Last write wins (no conflict resolution)
- Both updates succeed
- Second update overwrites first
- Acceptable UX (rare scenario)

### 6. Caption During Upload
**Scenario:** User sets caption in upload form  
**Handling:**
- Caption saved with photo insert
- Single transaction (no separate update needed)
- Cleaner implementation

---

## UI Locations

### Entry Points
1. **Photo Upload Form** - Caption input field
2. **Lightbox Viewer** - Edit caption button (future)
3. **Photo Grid** - Edit icon (future)

### Visual Flow

**During Upload:**
```
┌─────────────────────────────────────┐
│  Upload New Photo for Month 3      │
├─────────────────────────────────────┤
│  ┌─────────────┐                    │
│  │   PREVIEW   │  [× Clear]         │
│  └─────────────┘                    │
│                                     │
│  Caption (optional):                │
│  ┌───────────────────────────────┐  │
│  │ First steps at the park!      │  │ ← User types here
│  └───────────────────────────────┘  │
│                                     │
│  [Upload Photo]                     │
└─────────────────────────────────────┘
```

**In Lightbox (Future):**
```
┌─────────────────────────────────────┐
│                              [X]    │
│         ┌───────────┐               │
│         │   PHOTO   │               │
│         └───────────┘               │
│                                     │
│  First steps at the park! [✎ Edit] │ ← Click to edit
│  Month 3 • Jan 15, 2024             │
└─────────────────────────────────────┘

Click edit:
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │ First steps at the park!      │  │ ← Editable field
│  └───────────────────────────────┘  │
│  [Cancel] [Save]                    │
└─────────────────────────────────────┘
```

---

## Dependencies

### Internal
- **Photo type** - TypeScript definitions
- **usePhotos** - For cache invalidation (future)

### External
- **Supabase Database** - UPDATE operation
- **React Hook Form** - Form management
- **Sonner** - Toast notifications (optional)

### Database Operation
```typescript
const { error } = await supabase
  .from("photo")
  .update({ description: caption })
  .eq("id", photoId)
  .eq("user_id", user.id);  // RLS also enforces
```

---

## Related Capabilities
- `upload-photo` - Set caption during upload
- `view-photos` - Display captions in gallery
- `delete-photo` - Remove photo with caption

---

## Known Issues & Future Improvements

### Known Issues
1. **No inline editing** - Can't edit caption after upload (no UI)
2. **Single-line input** - Enter key submits, can't do multi-line
3. **No rich formatting** - Plain text only
4. **No character counter** - User doesn't see remaining characters
5. **No autocomplete** - No suggestions or common phrases

### Future Improvements
1. **Inline editing** - Click caption in lightbox to edit
2. **Textarea** - Multi-line caption support
3. **Character counter** - "950/1000 characters" indicator
4. **Rich text** - Bold, italic, links (if needed)
5. **Hashtags** - Parse and make clickable
6. **Mentions** - Tag people (if social features added)
7. **Search by caption** - Find photos by caption text
8. **Caption templates** - Suggest common captions
9. **Auto-caption** - AI-generated captions (advanced)

---

## Testing Checklist

### Functional Tests
- [ ] Add caption during upload saves correctly
- [ ] Caption displays in lightbox
- [ ] Empty caption allowed (removes caption)
- [ ] Long caption (999 chars) saves
- [ ] Very long caption (1001 chars) blocked

### Edge Case Tests
- [ ] Emojis in caption display correctly
- [ ] Special characters (quotes, unicode) work
- [ ] Multi-line caption preserves line breaks
- [ ] Concurrent edits: last write wins
- [ ] Update non-existent photo fails gracefully

### Security Tests
- [ ] RLS prevents editing other user's captions
- [ ] Cannot update other fields (storage_path, etc.)
- [ ] Cannot inject HTML/scripts

---

## Implementation Notes

### Code Locations
- **Upload Form:** `src/components/PhotoUploader.tsx` (caption input)
- **Form Component:** `src/components/photoUploader/CaptionForm.tsx`
- **Type Definition:** `src/types/photo.ts`

### Current Implementation
```typescript
// During upload (PhotoUploader.tsx)
const [caption, setCaption] = useState("");

// Included in upload data
await uploadPhoto({
  file: file,
  baby_id: babyId,
  month_number: monthNumber,
  description: caption || undefined,  // Omit if empty
  is_video: isVideo,
});

// Saved in database
await supabase.from("photo").insert({
  // ...other fields
  description: data.description || null,
});
```

### Future Edit Implementation
```typescript
// Caption edit mutation
const updateCaption = useMutation({
  mutationFn: async ({ photoId, caption }: { photoId: string; caption: string }) => {
    const { error } = await supabase
      .from("photo")
      .update({ description: caption || null })
      .eq("id", photoId);
    
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["photos", babyId, monthNumber]);
    toast.success("Caption updated");
  },
});

// Usage in lightbox
<input
  value={caption}
  onChange={(e) => setCaption(e.target.value)}
  onBlur={() => updateCaption.mutate({ photoId, caption })}
  maxLength={1000}
/>
```

### Validation
```typescript
// Client-side validation
const schema = z.object({
  description: z.string().max(1000, "Caption too long (max 1000 characters)").optional(),
});

// Or simple check
if (caption.length > 1000) {
  toast.error("Caption too long (max 1000 characters)");
  return;
}
```

---

**Status:** Partial (upload only, no post-upload editing UI)  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
