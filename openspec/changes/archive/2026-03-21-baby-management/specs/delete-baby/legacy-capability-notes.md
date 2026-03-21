# Delete Baby Profile

## Description
Permanently remove a baby profile and all associated data (milestones, photos) from the system. This is a destructive operation that requires explicit user confirmation and cannot be undone.

## Capability ID
`delete-baby`

---

## Inputs

| Field    | Type   | Required | Validation                    | Notes                           |
|----------|--------|----------|-------------------------------|---------------------------------|
| babyId   | string | Yes      | Valid UUID, must be user's baby | ID of baby to delete           |

### Input Constraints
- Baby must exist in database
- Baby must belong to authenticated user (RLS enforcement)
- No validation on whether baby has associated data

---

## Process Flow

```
User                    UI Layer                Backend               Database
  │                        │                        │                      │
  │  1. Click "..." menu   │                        │                      │
  ├─────────────────────>  │                        │                      │
  │                        │                        │                      │
  │  2. Click "Delete"     │                        │                      │
  ├─────────────────────>  │                        │                      │
  │                        │  3. Show confirmation  │                      │
  │  4. Read warning       │     dialog             │                      │
  │  "...will remove all   │                        │                      │
  │  milestones & photos"  │                        │                      │
  │<───────────────────────│                        │                      │
  │                        │                        │                      │
  │  5. Click "Delete"     │                        │                      │
  │  (confirm)             │                        │                      │
  ├─────────────────────>  │                        │                      │
  │                        │  6. deleteBaby(id)     │                      │
  │                        ├───────────────────────>│                      │
  │                        │                        │  7. DELETE FROM baby │
  │                        │                        │     WHERE id = $1    │
  │                        │                        │     AND user_id = $2 │
  │                        │                        ├─────────────────────>│
  │                        │                        │                      │
  │                        │                        │  8. CASCADE DELETE:  │
  │                        │                        │     • milestones     │
  │                        │                        │     • photos (DB)    │
  │                        │                        │  (Storage cleanup    │
  │                        │                        │   happens async)     │
  │                        │                        │<─────────────────────│
  │                        │                        │  (success)           │
  │                        │<───────────────────────│                      │
  │                        │  9. Track event        │                      │
  │                        │     "baby_deleted"     │                      │
  │                        │  10. Refetch list      │                      │
  │                        │  11. Update selection  │                      │
  │                        │     (if deleted baby   │                      │
  │                        │      was selected)     │                      │
  │  12. Show toast        │                        │                      │
  │  "[name] deleted"      │                        │                      │
  │<───────────────────────│                        │                      │
```

### Step-by-Step Details

1-2. **User triggers deletion**
   - From: Dropdown menu (⋮) on baby card in NavigationHub
   - Component: `NavigationHub.tsx` or `BabyCard.tsx`

3-4. **Confirmation Dialog**
   - **Alert Dialog** (shadcn/ui component)
   - **Title:** "Delete Baby Profile"
   - **Message:** "Are you sure you want to delete [Baby Name]'s profile? This action cannot be undone and will remove all associated milestones and photos."
   - **Buttons:**
     - "Cancel" (dismisses dialog)
     - "Delete" (red/destructive style)

5-6. **Deletion Request**
   - Calls `deleteBaby(babyId)` from `useBabyProfiles` hook
   - Adds user_id check for extra security (RLS also enforces this)

7. **Database DELETE**
   ```sql
   DELETE FROM baby 
   WHERE id = $1 AND user_id = $2
   ```
   - RLS policy enforces user_id match
   - Returns success/error

8. **Cascade Delete**
   - Database foreign key constraints trigger cascades:
     ```sql
     -- Automatically deletes all milestones
     DELETE FROM milestone WHERE baby_id = $1
     
     -- Automatically deletes all photos
     DELETE FROM photo WHERE baby_id = $1
     ```
   - **Storage cleanup:** Photo files in Supabase storage are NOT automatically deleted
   - **Current Behavior:** Orphaned files remain in storage (potential issue)

9-11. **State Updates**
   - Track analytics: `baby_deleted` event
   - Refetch baby list
   - **If deleted baby was selected:**
     - Select next available baby (first in list)
     - If no babies remain, clear selection (show empty state)

12. **User Feedback**
   - Success toast: "[Baby Name]'s profile has been deleted."
   - UI updates to remove baby from list
   - If selected baby was deleted, UI switches to next baby or empty state

---

## Outputs

### Success Case
- **HTTP:** N/A (client-side Supabase call)
- **Database:** 
  - Baby row deleted
  - All milestones deleted (cascade)
  - All photo records deleted (cascade)
  - **Storage files NOT deleted** (orphaned)
- **UI State:**
  - Baby removed from selector
  - If deleted baby was selected: next baby auto-selected
  - If no babies remain: empty state shown
- **Toast:** Confirmation message with baby's name

### Error Cases
- **Database Error:** Toast with error message
- **Permission Error:** RLS prevents deletion (shouldn't happen with proper UI logic)
- **Network Error:** Operation fails, baby remains in database

---

## Business Rules

### Deletion Rules
1. **Confirmation Required** - Two-step process (click delete → confirm in dialog)
2. **Hard Delete Only** - No soft delete, no recovery mechanism
3. **Cascade Delete** - Automatically removes all dependent data
4. **User Ownership** - Can only delete own babies (RLS enforced)
5. **No Undo** - Deletion is permanent

### Data Cascade
| Entity      | Action on Baby Delete | Mechanism            |
|-------------|-----------------------|----------------------|
| Milestones  | DELETE ALL            | Database FK CASCADE  |
| Photos (DB) | DELETE ALL            | Database FK CASCADE  |
| Photos (Storage) | NONE (orphaned)  | Manual cleanup needed |

### State Management
- If deleted baby was selected:
  - Select first remaining baby (newest created)
  - If no babies left, set selection to `null`
- If deleted baby was not selected:
  - Selection remains unchanged

---

## Edge Cases

### 1. Deleting Last Baby
**Scenario:** User deletes their only baby profile  
**Handling:**
- Deletion succeeds
- Selection cleared (`selectedBaby = null`)
- Empty state component shown
- User can create new baby or navigate away

### 2. Deleting Currently Selected Baby
**Scenario:** User deletes the baby currently active in UI  
**Handling:**
- Deletion succeeds
- Auto-select next baby from list (if any)
- UI updates to show newly selected baby
- Timeline/photos reload for new selection

**Code:**
```typescript
if (selectedBaby?.id === baby.id) {
  const remainingBabies = babies.filter(b => b.id !== baby.id);
  if (remainingBabies.length > 0) {
    setSelectedBaby(remainingBabies[0]);  // Select first remaining
  } else {
    setSelectedBaby(null);  // No babies left
  }
}
```

### 3. Network Error During Deletion
**Scenario:** Supabase delete fails due to network timeout  
**Handling:**
- Error toast: "Failed to delete [name]'s profile: [error message]"
- Baby remains in database
- Baby remains in UI list
- User can retry deletion

### 4. Rapid Double-Delete
**Scenario:** User clicks delete twice quickly (before first completes)  
**Handling:**
- First delete initiates
- Second delete request sent (if click happens before state updates)
- First delete succeeds, removes baby
- Second delete fails (baby no longer exists) - error silently ignored or shown in toast

### 5. Baby with Many Photos/Milestones
**Scenario:** Baby has 1000+ photos or milestones  
**Handling:**
- Database cascade may take several seconds
- UI shows loading state (`deleting` flag in hook)
- Delete button disabled during operation
- Orphaned storage files accumulate

### 6. Storage File Orphaning
**Scenario:** Baby deleted but photo files remain in storage  
**Handling:**
- **Current Behavior:** Files remain in storage indefinitely
- **Impact:** Storage quota consumed by inaccessible files
- **Mitigation:** Needs background job to clean up orphaned files

### 7. Deleted Baby in Another Tab
**Scenario:** Baby deleted in one tab, user interacts with it in another  
**Handling:**
- Other tab may still show deleted baby in list (stale cache)
- Attempting to load deleted baby's milestones/photos returns empty
- Refetch in other tab will update list

---

## UI Locations

### Entry Points
1. **NavigationHub** (`/app`)
   - Dropdown menu (⋮) on each baby card
   - "Delete Baby" option in dropdown

2. **BabyCard** (alternative location in older UI)
   - Delete icon button (trash icon)
   - AlertDialog triggered on click

### Components
- **Trigger:** Dropdown menu item or icon button
- **Confirmation:** AlertDialog (shadcn/ui)
  - Title: "Delete Baby Profile"
  - Description: Warning about permanent deletion
  - Actions: Cancel | Delete (destructive)

### Visual Design
- Delete button/option styled red/destructive
- Confirmation dialog uses alert styling
- No visual loading state during deletion (instant from user perspective)

---

## Dependencies

### Internal
- **Auth Context:** `useAuth()` - Provides `user.id` for ownership check
- **Baby Hook:** `useBabyProfiles()` - Provides `deleteBaby` mutation
- **Selected Baby State:** Local state in `Home.tsx` - Must update if deleted

### External
- **Supabase:** Database delete, RLS enforcement, cascade triggers
- **Sonner:** Toast notifications
- **PostHog:** Analytics tracking
- **shadcn/ui:** AlertDialog component

### Database Schema
```sql
-- Foreign key constraints handle cascade
ALTER TABLE milestone 
  ADD CONSTRAINT milestone_baby_id_fkey 
  FOREIGN KEY (baby_id) REFERENCES baby(id) 
  ON DELETE CASCADE;

ALTER TABLE photo 
  ADD CONSTRAINT photo_baby_id_fkey 
  FOREIGN KEY (baby_id) REFERENCES baby(id) 
  ON DELETE CASCADE;

-- RLS Policy
CREATE POLICY baby_delete_own 
  ON baby FOR DELETE 
  USING (auth.uid() = user_id);
```

---

## Related Capabilities
- `create-baby` - Create new baby profile
- `edit-baby` - Modify existing baby (not implemented)
- `select-baby` - Switch active baby context
- `list-babies` - Fetch all babies

---

## Known Issues & Future Improvements

### Known Issues
1. **Storage file orphaning:** Photo files in Supabase storage not deleted, only database records
2. **No undo mechanism:** Accidental deletion is permanent
3. **No export before delete:** Users can't backup data before deletion
4. **Cascade timing:** Large deletions may cause UI lag

### Future Improvements
1. **Soft delete:** Add `deleted_at` column, allow recovery within 30 days
2. **Storage cleanup:** Background job to delete orphaned storage files
3. **Export option:** "Download data before deleting" button
4. **Bulk delete:** Delete multiple babies at once (admin feature)
5. **Deletion history:** Log of deleted babies for audit trail
6. **Require re-authentication:** Add password confirmation for high-value deletions

---

## Testing Checklist

### Functional Tests
- [ ] Confirmation dialog appears before deletion
- [ ] Deletion removes baby from database
- [ ] Milestones cascade deleted
- [ ] Photos cascade deleted
- [ ] Selected baby updates if deleted
- [ ] Empty state shows if last baby deleted
- [ ] Success toast displays
- [ ] Baby removed from UI list

### Edge Case Tests
- [ ] Deleting last baby shows empty state
- [ ] Deleting selected baby auto-selects next
- [ ] Network error shows error message
- [ ] Rapid double-delete handled gracefully
- [ ] Large deletion (100+ photos) completes successfully
- [ ] Storage files orphaned (expected behavior)

### Security Tests
- [ ] RLS prevents deleting other user's babies
- [ ] user_id check in query enforced
- [ ] Cannot delete baby via direct API call without auth

### Analytics Tests
- [ ] `baby_deleted` event fired on success
- [ ] `baby_deletion_failed` event fired on error
- [ ] Database error tracking called

---

## Implementation Notes

### Code Locations
- **Hook:** `src/hooks/useBabyProfiles.tsx` (lines 134-168)
- **Component:** `src/components/home/NavigationHub.tsx` (lines 121-150)
- **Page Logic:** `src/pages/Home.tsx` (lines 47-70)
- **Alternative UI:** `src/components/BabyCard.tsx` (lines 92-118)

### Key Functions
```typescript
// Deletion mutation
deleteBaby(
  babyId: string, 
  options?: { 
    onSuccess?: () => void; 
    onError?: (err: Error) => void 
  }
) -> void

// Supabase query
const { error } = await supabase
  .from("baby")
  .delete()
  .eq("id", babyId)
  .eq("user_id", user?.id);  // Extra security check
```

### Confirmation Dialog Example
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <Trash2 className="h-4 w-4 mr-2" />
      Delete Baby
    </DropdownMenuItem>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Baby Profile</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete {baby.name}'s profile? 
        This action cannot be undone and will remove all associated 
        milestones and photos.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => onDeleteBaby(baby)}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
