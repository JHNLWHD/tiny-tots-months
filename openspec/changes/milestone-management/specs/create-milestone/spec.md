# Create Milestone

## Description
Add a text-based milestone to a baby's monthly timeline. Milestones can be typed manually or selected from age-appropriate suggestions.

## Capability ID
`create-milestone`

---

## Inputs

| Field          | Type    | Required | Validation          | Notes                           |
|----------------|---------|----------|---------------------|---------------------------------|
| baby_id        | string  | Yes      | Valid UUID          | Baby to associate milestone with|
| milestone_text | string  | Yes      | 1-1000 chars        | The milestone description       |
| month_number   | integer | Yes      | ≥1                  | Month in baby's timeline        |

---

## Process Flow

```
User → Type text OR click suggestion → Submit → Insert DB → Refetch → Display
```

**Steps:**
1. User types milestone text or clicks suggestion
2. Form validates (non-empty, reasonable length)
3. Insert milestone record in database
4. Track analytics event
5. Invalidate React Query cache
6. Refetch milestones for month
7. Clear form input
8. Show success toast
9. Display new milestone at top of list

---

## Outputs

### Success
- **Database:** New milestone row created
- **UI:** Milestone appears at top (newest first)
- **Toast:** "Milestone added successfully"

### Error
- **Empty text:** Validation prevents submission
- **Database error:** Toast "Failed to add milestone"

---

## Business Rules

1. **No limits** - Unlimited milestones (free feature)
2. **No duplicates check** - Same text can be added multiple times
3. **Text only** - Plain text, no formatting
4. **Newest first** - Display order: created_at DESC

---

## UI Locations

**Month Page** (`/app/month/:babyId/:monthNumber`)
- MilestoneForm component
- Text input field
- Suggestion chips below input

---

## Implementation

```typescript
// From useMilestones.tsx
const createMilestoneMutation = useMutation({
  mutationFn: async (data: CreateMilestoneData) => {
    const { error, data: newMilestone } = await supabase
      .from("milestone")
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newMilestone;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["milestones", babyId, monthNumber]);
    toast("Success", { description: "Milestone added successfully" });
  },
});
```

---

## Related Capabilities
- `view-timeline` - Display milestones
- `delete-milestone` - Remove milestones

---

**Status:** Production  
**Version:** 1.0
