# View Milestone Timeline

## Description
Display milestones in month-by-month timeline view. Shows milestones for a specific month or across all months in various UI contexts.

## Capability ID
`view-timeline`

---

## Inputs

| Field        | Type    | Required | Validation | Notes                         |
|--------------|---------|----------|------------|-------------------------------|
| baby_id      | string  | Yes      | Valid UUID | Baby whose milestones to show |
| month_number | integer | Optional | ≥1         | Specific month (optional)     |

---

## Display Contexts

### 1. Month Page View
**Location:** `/app/month/:babyId/:monthNumber`  
**Shows:** Milestones for specific month  
**Layout:**
- First 4 milestones as cards (2x2 grid)
- Additional milestones as list (if 5+)
- Newest first

### 2. Home Page Progress
**Location:** `/app`  
**Shows:** Milestone count across all months  
**Purpose:** Show progress (e.g., "12 milestones recorded")

### 3. Month Cards Navigation
**Location:** Home page timeline  
**Shows:** Visual indicator if month has milestones  
**Purpose:** Quick glance at which months have content

### 4. Wrapped Page
**Location:** `/app/baby/:babyId/wrapped`  
**Shows:** All milestones for first 12 months  
**Purpose:** Year-in-review recap

---

## Process Flow

```
User → Navigate to month → Fetch milestones → Display → Interact
```

**Steps:**
1. User navigates to month page
2. Fetch milestones for baby + month
3. Order by created_at DESC (newest first)
4. Display first 4 as cards
5. Display remaining as list
6. Show empty state if none

---

## Display Rules

**Card Display (first 4):**
```
┌─────────────┬─────────────┐
│ Milestone 1 │ Milestone 2 │
├─────────────┼─────────────┤
│ Milestone 3 │ Milestone 4 │
└─────────────┴─────────────┘
```

**List Display (5+):**
```
Additional Milestones:
• Milestone 5
• Milestone 6
• Milestone 7
```

**Empty State:**
```
┌─────────────────────────────┐
│ No Milestones Recorded Yet  │
│                             │
│ Add your baby's first       │
│ milestone using the form    │
│ above.                      │
└─────────────────────────────┘
```

---

## Outputs

### Success
- **UI:** Milestones displayed in order
- **Count:** "X Milestone(s) Recorded"
- **Interactive:** Each has delete button

### Loading
- **Spinner:** Loading indicator while fetching

### Error
- **Toast:** "Error loading milestones"
- **Retry:** Page refresh to retry

---

## Business Rules

1. **Ordering:** Newest first (created_at DESC)
2. **Grouping:** By month_number
3. **Display limit:** No pagination (all milestones for month shown)
4. **Empty state:** Clear call-to-action to add first milestone

---

## Month Navigation

**Month Cards** (Home page):
```
┌─────┬─────┬─────┬─────┐
│ M 1 │ M 2 │ M 3 │ M 4 │
│  📷 │ 📷⭐│  ⭐ │     │  ← Icons show content
└─────┴─────┴─────┴─────┘

Legend:
📷 = Has photos
⭐ = Has milestones
```

**Clicking month card:**
- Navigates to `/app/month/:babyId/:monthNumber`
- Shows milestones + photos for that month

---

## Implementation

```typescript
// Fetch milestones
const { data: milestones } = useQuery({
  queryKey: ["milestones", babyId, monthNumber],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("milestone")
      .select("*")
      .eq("baby_id", babyId)
      .eq("month_number", monthNumber)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },
  enabled: !!babyId && !!monthNumber,
});

// Display
<MilestoneSection
  milestones={milestones}
  isLoading={isLoading}
  createMilestone={createMilestone}
  deleteMilestone={deleteMilestone}
/>
```

---

## Month Calculation

**Formula:**
```typescript
// Month name relative to birth
const getMonthNameFromMonthNumber = (birthDate: Date, monthNumber: number) => {
  const birthMonth = birthDate.getMonth(); // 0-11
  const monthIndex = (birthMonth + monthNumber - 1) % 12;
  return monthNames[monthIndex];
};

// Example:
// Baby born: March 15, 2024
// Month 1 → March (age 0-1 month)
// Month 2 → April (age 1-2 months)
// Month 12 → February (age 11-12 months)
// Month 13 → March (age 12-13 months, year 2)
```

---

## Related Capabilities
- `create-milestone` - Add milestones
- `delete-milestone` - Remove milestones

---

## Future Improvements

1. **Search** - Find milestones by text
2. **Filters** - Show specific types (motor, social, etc.)
3. **Timeline view** - Horizontal timeline across all months
4. **Export** - Download milestones as PDF/text
5. **Share** - Share specific milestones

---

**Status:** Production  
**Version:** 1.0
