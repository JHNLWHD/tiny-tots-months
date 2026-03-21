# Edit Baby Profile

## Description
Modify an existing baby profile's information (name, date of birth, gender). **Note: This capability is NOT currently implemented in the UI** - the database and types support updates, but there is no user interface for editing. Users must delete and recreate babies to change information.

## Capability ID
`edit-baby`

---

## Status: NOT IMPLEMENTED

### What Exists
- ✅ Database schema supports updates (`updated_at` column)
- ✅ TypeScript types include `Update` operations
- ✅ Supabase RLS policy allows updates (`baby_update_own`)
- ✅ Backend supports update mutations

### What's Missing
- ❌ No edit dialog/form component
- ❌ No "Edit" button in UI
- ❌ No edit handler in `useBabyProfiles` hook
- ❌ No edit page or route

### Current Workaround
Users must **delete** the baby and **recreate** it with correct information. This causes:
- Loss of all milestones and photos (cascade delete)
- New baby ID generated
- No history preservation

---

## Inputs (Proposed)

| Field         | Type   | Required | Validation                          | Notes                           |
|---------------|--------|----------|-------------------------------------|---------------------------------|
| babyId        | string | Yes      | Valid UUID, must be user's baby     | ID of baby to update            |
| name          | string | No       | 1-255 chars                         | New name (if changing)          |
| dateOfBirth   | string | No       | ISO date (YYYY-MM-DD), not future   | New DOB (if changing)           |
| gender        | string | No       | 'male', 'female', or 'other'        | New gender (if changing)        |

### Input Constraints
- At least one field must be provided (partial update supported)
- Cannot change `user_id` (enforced by RLS)
- Cannot change `id` or `created_at`

---

## Process Flow (Proposed)

```
User                    UI Layer                Backend               Database
  │                        │                        │                      │
  │  1. Click "Edit"       │                        │                      │
  ├─────────────────────>  │                        │                      │
  │                        │  2. Open EditDialog    │                      │
  │                        │     with pre-filled    │                      │
  │                        │     form               │                      │
  │  3. See current values │                        │                      │
  │  (name, DOB, gender)   │                        │                      │
  │<───────────────────────│                        │                      │
  │                        │                        │                      │
  │  4. Modify fields      │                        │                      │
  │  5. Submit             │                        │                      │
  ├─────────────────────>  │                        │                      │
  │                        │  6. Validate changes   │                      │
  │                        │  7. updateBaby(data)   │                      │
  │                        ├───────────────────────>│                      │
  │                        │                        │  8. UPDATE baby      │
  │                        │                        │     SET ...          │
  │                        │                        │     WHERE id = $1    │
  │                        │                        │     AND user_id = $2 │
  │                        │                        ├─────────────────────>│
  │                        │                        │<─────────────────────│
  │                        │<───────────────────────│  (updated row)       │
  │                        │  9. Track event        │                      │
  │                        │     "baby_updated"     │                      │
  │                        │  10. Refetch list      │                      │
  │                        │  11. Close dialog      │                      │
  │  12. Show toast        │                        │                      │
  │  "[name] updated"      │                        │                      │
  │<───────────────────────│                        │                      │
```

---

## Outputs (Proposed)

### Success Case
- **Database:** Baby row updated with new values, `updated_at` timestamp refreshed
- **UI State:**
  - Baby list refetched
  - Updated baby info displayed in selector
  - If selected baby was edited, context card updates
- **Toast:** "Baby profile updated successfully"

### Error Cases
- **Database Error:** Toast with error message
- **Validation Error:** Inline form errors
- **Permission Error:** RLS prevents update (shouldn't happen)

---

## Business Rules (Proposed)

### Update Rules
1. **Partial updates allowed** - Can change one field without touching others
2. **No cascade effects** - Updating baby doesn't affect milestones/photos
3. **Preserve relationships** - Baby ID remains same, all foreign keys stay valid
4. **Update timestamp** - `updated_at` automatically refreshed

### Validation Rules
- Same as create: name required, DOB not in future, gender optional
- No uniqueness checks on name
- Cannot change to empty name

### Use Cases
| Change Needed | Current Process | With Edit Feature |
|---------------|-----------------|-------------------|
| Fix typo in name | Delete + Recreate (loses all data) | Edit name field |
| Correct DOB | Delete + Recreate (loses all data) | Edit DOB field |
| Update gender | Delete + Recreate (loses all data) | Edit gender field |
| Add missing gender | Delete + Recreate (loses all data) | Edit gender field |

---

## Implementation Plan (Future)

### Phase 1: Backend Hook
```typescript
// Add to useBabyProfiles.tsx
const updateBaby = (
  babyId: string,
  data: UpdateBabyData,
  options?: { onSuccess?: () => void; onError?: (err: Error) => void }
) => {
  setUpdating(true);

  const updates = {
    ...(data.name && { name: data.name }),
    ...(data.dateOfBirth && { date_of_birth: data.dateOfBirth }),
    ...(data.gender && { gender: data.gender }),
    updated_at: new Date().toISOString(),
  };

  supabase
    .from("baby")
    .update(updates)
    .eq("id", babyId)
    .eq("user_id", user?.id)
    .select()
    .single()
    .then(({ data: updatedBaby, error }) => {
      if (error) {
        console.error("Error updating baby:", error);
        trackEvent("baby_update_failed", { error_message: error.message });
        options?.onError?.(new Error(error.message));
      } else {
        trackEvent("baby_updated", { baby_id: babyId });
        refetch();
        options?.onSuccess?.();
      }
      setUpdating(false);
    });
};
```

### Phase 2: UI Component
```typescript
// Create EditBabyDialog.tsx (similar to AddBabyDialog)
const EditBabyDialog = ({ baby, isOpen, setIsOpen, updateBaby }) => {
  const form = useForm({
    defaultValues: {
      name: baby.name,
      birthdate: baby.date_of_birth,
      gender: baby.gender || 'other',
    },
  });

  const onSubmit = async (data) => {
    await updateBaby(baby.id, data);
    setIsOpen(false);
    toast.success(`${data.name}'s profile updated!`);
  };

  // ... render form with same fields as AddBabyDialog
};
```

### Phase 3: Add to UI
```tsx
// In NavigationHub or BabyCard dropdown menu
<DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
  <Edit className="h-4 w-4 mr-2" />
  Edit Baby
</DropdownMenuItem>

<EditBabyDialog
  baby={baby}
  isOpen={editDialogOpen}
  setIsOpen={setEditDialogOpen}
  updateBaby={updateBaby}
/>
```

---

## Dependencies (When Implemented)

### Internal
- **Auth Context:** `useAuth()` - Provides `user.id`
- **Baby Hook:** `useBabyProfiles()` - Would add `updateBaby` function
- **Form Validation:** React Hook Form + Zod

### External
- **Supabase:** Database update
- **Sonner:** Toast notifications
- **PostHog:** Analytics tracking

### Database Schema (Already Exists)
```sql
-- RLS Policy already exists
CREATE POLICY baby_update_own 
  ON baby FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at column exists
ALTER TABLE baby ALTER COLUMN updated_at SET DEFAULT now();
```

---

## Related Capabilities
- `create-baby` - Form can be largely reused
- `delete-baby` - Current workaround for "editing"
- `select-baby` - Selected baby should update if edited

---

## Known Issues & Considerations

### Why Not Implemented?
1. **Low priority:** Delete+recreate workaround works (though destructive)
2. **Onboarding focus:** Creation flow more important for new users
3. **Development bandwidth:** Limited resources, focused on core features

### Trade-offs of Current Approach
| Without Edit | Impact | Workaround |
|--------------|--------|------------|
| Typo in name | Must delete baby, lose all data | Be careful during creation |
| Wrong DOB | Must delete baby, lose all data | Double-check before submitting |
| Missing gender | Gender stored as 'other' | Acceptable default |

### Risks of Adding Edit
1. **Date of birth changes:** Could invalidate month calculations if baby's age changes significantly
2. **Name changes:** May confuse users if they don't remember changing it
3. **Audit trail:** No history of what changed (unless we add versioning)

---

## Testing Checklist (When Implemented)

### Functional Tests
- [ ] Edit dialog opens with pre-filled values
- [ ] Can update name only
- [ ] Can update DOB only
- [ ] Can update gender only
- [ ] Can update multiple fields at once
- [ ] Validation prevents empty name
- [ ] Validation prevents future DOB
- [ ] Updated baby reflected in list
- [ ] Selected baby updates if edited

### Edge Case Tests
- [ ] Editing non-selected baby doesn't change selection
- [ ] Editing selected baby updates context card
- [ ] Network error shows error message
- [ ] Rapid edit+edit doesn't break state

### Security Tests
- [ ] RLS prevents editing other user's babies
- [ ] Cannot change user_id via edit
- [ ] Cannot edit deleted baby

---

## Implementation Notes

### Code Structure (Proposed)
```
src/
├─ hooks/
│  └─ useBabyProfiles.tsx  (add updateBaby function)
├─ components/
│  └─ home/
│     ├─ AddBabyDialog.tsx  (existing)
│     └─ EditBabyDialog.tsx  (NEW)
├─ pages/
│  └─ Home.tsx  (add edit state + handlers)
```

### Estimated Effort
- Backend hook: 2 hours
- UI component: 3 hours
- Integration + testing: 2 hours
- **Total: ~7 hours** (1 day of work)

### Priority: LOW
- Not critical path
- Workaround exists (destructive but functional)
- Consider implementing after higher-priority features

---

**Status:** NOT IMPLEMENTED  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0 (specification only)
