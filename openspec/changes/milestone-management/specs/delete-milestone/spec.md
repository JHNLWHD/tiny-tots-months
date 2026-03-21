# Delete Milestone

## Description
Permanently remove a milestone from the database. No confirmation dialog (direct deletion).

## Capability ID
`delete-milestone`

---

## Inputs

| Field        | Type   | Required | Validation | Notes                    |
|--------------|--------|----------|------------|--------------------------|
| milestone_id | string | Yes      | Valid UUID | ID of milestone to delete|

---

## Process Flow

```
User → Click delete → Delete from DB → Refetch → Remove from UI
```

**Steps:**
1. User clicks trash icon on milestone
2. DELETE query executed
3. Invalidate React Query cache
4. Refetch milestones
5. Milestone removed from UI
6. Show success toast

---

## Outputs

### Success
- **Database:** Milestone row deleted
- **UI:** Milestone removed from list
- **Toast:** "Milestone deleted successfully"

### Error
- **Database error:** Toast "Failed to delete milestone"

---

## Business Rules

1. **No confirmation** - Direct deletion (could add confirmation)
2. **Permanent** - No recovery mechanism
3. **Owner-only** - RLS ensures user owns baby

---

## Implementation

```typescript
const deleteMilestoneMutation = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from("milestone")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["milestones", babyId, monthNumber]);
    toast("Success", { description: "Milestone deleted successfully" });
  },
});
```

---

## Future Improvements
- Add confirmation dialog
- Implement undo functionality
- Soft delete with recovery

---

**Status:** Production  
**Version:** 1.0
