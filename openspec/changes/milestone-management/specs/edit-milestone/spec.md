# Edit Milestone

## Description
**NOT IMPLEMENTED** - Currently, users must delete and recreate milestones to make changes. No edit UI exists.

## Capability ID
`edit-milestone`

---

## Status: NOT IMPLEMENTED

### What Exists
- ✅ Database schema supports updates (`updated_at` column)
- ✅ TypeScript types exist
- ✅ RLS could support UPDATE (not configured)

### What's Missing
- ❌ No edit button in UI
- ❌ No edit form/dialog
- ❌ No update mutation in hook
- ❌ No UPDATE RLS policy

---

## Current Workaround

Users must:
1. Delete existing milestone
2. Re-add with corrected text

**Impact:**
- New `created_at` timestamp (not historically accurate)
- Loses original creation time

---

## Future Implementation

### Proposed UX
```
Milestone card:
┌─────────────────────────────────┐
│ ⭐ First smile                  │
│                                 │
│ Feb 15, 2024    [✎ Edit] [🗑]  │ ← Add edit button
└─────────────────────────────────┘

Click edit:
┌─────────────────────────────────┐
│ Edit Milestone                  │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ First smile!              │   │ ← Pre-filled input
│ └───────────────────────────┘   │
│ [Cancel] [Save]                 │
└─────────────────────────────────┘
```

### Implementation Plan

**Step 1: Add RLS Policy**
```sql
CREATE POLICY milestone_update_own ON milestone
  FOR UPDATE
  USING (
    baby_id IN (
      SELECT id FROM baby WHERE user_id = auth.uid()
    )
  );
```

**Step 2: Add Update Mutation**
```typescript
const updateMilestoneMutation = useMutation({
  mutationFn: async ({ id, text }: { id: string; text: string }) => {
    const { error } = await supabase
      .from("milestone")
      .update({ 
        milestone_text: text,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["milestones", babyId, monthNumber]);
    toast.success("Milestone updated");
  },
});
```

**Step 3: Add Edit UI**
- Add edit button to MilestoneDisplay
- Create EditMilestoneDialog component
- Pre-populate with existing text
- Save on submit

---

## Why Not Implemented?

**Prioritization:**
- Milestones are short (easy to retype)
- Delete+recreate pattern acceptable
- Limited development time
- Higher priority features (photo management)

**Complexity Added:**
- Edit button in UI
- Edit modal/dialog
- Update mutation
- Validation
- Optimistic updates

**Estimated Effort:** 4-6 hours

---

**Status:** NOT IMPLEMENTED  
**Priority:** LOW  
**Version:** 1.0
