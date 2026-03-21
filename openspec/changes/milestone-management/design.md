# Milestone Management Design

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER LAYER                           │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Month Page   │  │ Home Page    │  │ Wrapped Page │
│ /app/month/  │  │ (timeline)   │  │ (recap)      │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               COMPONENT LAYER                           │
├─────────────────────────────────────────────────────────┤
│  • MilestoneForm (input + suggestions)                  │
│  • MilestoneSection (display container)                 │
│  • MilestoneDisplay (individual milestone card)         │
│  • MilestoneList (list view for 5+ milestones)          │
│  • MonthCardGrid (month navigation)                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  STATE LAYER                            │
├─────────────────────────────────────────────────────────┤
│  • useMilestones() - CRUD operations                    │
│  • React Query - Cache + invalidation                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER                             │
├─────────────────────────────────────────────────────────┤
│  • PostgreSQL (milestone table)                         │
│  • RLS Policies (user-scoped access)                    │
└─────────────────────────────────────────────────────────┘
```

---

## Data Model

### Milestone Table Schema

```
┌─────────────────────────────────────────────────────────┐
│                      milestone                          │
├──────────────────┬───────────────┬──────────────────────┤
│ Column           │ Type          │ Constraints          │
├──────────────────┼───────────────┼──────────────────────┤
│ id               │ uuid          │ PK, auto-generated   │
│ baby_id          │ uuid          │ FK → baby, NN        │
│ milestone_text   │ text          │ NOT NULL             │
│ month_number     │ integer       │ NOT NULL, CHECK ≥1   │
│ created_at       │ timestamptz   │ default now()        │
│ updated_at       │ timestamptz   │ default now()        │
└──────────────────┴───────────────┴──────────────────────┘

Indexes:
  - PRIMARY KEY (id)
  - INDEX ON (baby_id, month_number)

RLS Policies:
  - milestone_select_own: Users can SELECT their own milestones
  - milestone_insert_own: Users can INSERT with their baby_id
  - milestone_delete_own: Users can DELETE their own milestones

Foreign Keys:
  - baby_id references baby(id) ON DELETE CASCADE
```

### Type Definitions

```typescript
export type Milestone = {
  id: string;
  baby_id: string;
  milestone_text: string;
  month_number: number;
  created_at: string;
  updated_at: string;
};

export type CreateMilestoneData = {
  baby_id: string;
  milestone_text: string;
  month_number: number;
};
```

---

## Key Design Decisions

### 1. Text-Only Milestones

**Decision:** Store only text, no photos or rich formatting  
**Rationale:**
- Simplicity: Fast to add, no upload delays
- Photos are separate feature (keeps concerns separate)
- Plain text is universal, no rendering issues
- Faster database queries

**Trade-offs:**
- ✅ Simple, fast, reliable
- ✅ No storage cost
- ❌ Less visual/engaging
- ❌ Can't attach photos to specific milestones

---

### 2. No Edit Functionality

**Decision:** Delete + recreate instead of editing  
**Rationale:**
- Simpler implementation (no update UI)
- Milestones are short (easy to retype)
- Preserves history (created_at accuracy)
- Reduces complexity

**Trade-offs:**
- ✅ Simpler codebase
- ✅ Faster initial development
- ❌ User frustration for typos
- ❌ No edit history tracking

---

### 3. Free Feature (No Premium Gating)

**Decision:** Unlimited milestones for all users  
**Rationale:**
- Core feature that drives engagement
- Not storage-intensive (text is tiny)
- Differentiates from competitors
- Encourages daily use

**Trade-offs:**
- ✅ Better UX, no friction
- ✅ Higher engagement
- ❌ No monetization lever
- ✅ Creates goodwill

---

### 4. Month-Based Organization

**Decision:** Group milestones by month number (1-36+)  
**Rationale:**
- Natural grouping for baby's first years
- Aligns with baby book tradition
- Easy to navigate
- Matches photo organization

**Implementation:**
```typescript
// Month number relative to birth
// Month 1 = age 0-1 month
// Month 2 = age 1-2 months
// Month 12 = age 11-12 months

const getMonthNameFromMonthNumber = (birthDate: Date, monthNumber: number) => {
  const birthMonth = birthDate.getMonth(); // 0-11
  const monthIndex = (birthMonth + monthNumber - 1) % 12;
  return monthNames[monthIndex];
};
```

**Trade-offs:**
- ✅ Intuitive organization
- ✅ Aligns with development stages
- ❌ Doesn't account for exact ages (31 days vs 28 days)
- ✅ Good enough for baby milestones

---

### 5. Curated Milestone Suggestions

**Decision:** Provide age-appropriate suggestions per month  
**Rationale:**
- Reminds parents what to look for
- Reduces blank page syndrome
- Educates about typical development
- Speeds up milestone entry

**Implementation:**
```typescript
// From src/lib/milestoneSuggestions.ts
export const milestoneSuggestions: Record<number, string[]> = {
  1: [
    "First smile",
    "Can lift head briefly",
    "Responds to sounds",
    "Makes eye contact",
    // ...
  ],
  2: [
    "Holds head steady",
    "Coos and babbles",
    "Follows objects with eyes",
    // ...
  ],
  // ... up to 36 months
};

// Filter out already-used suggestions
const getAvailableSuggestions = (monthNumber: number, existingMilestones: Milestone[]) => {
  const suggestions = milestoneSuggestions[monthNumber] || [];
  const existingTexts = new Set(existingMilestones.map(m => m.milestone_text));
  return suggestions.filter(s => !existingTexts.has(s));
};
```

**Trade-offs:**
- ✅ Helpful for new parents
- ✅ Speeds up entry
- ❌ Requires curation/maintenance
- ❌ May feel prescriptive

---

### 6. Newest First Ordering

**Decision:** Display milestones with newest at top  
**Rationale:**
- Most recent is most interesting
- Aligns with social media patterns
- Easy to see what was just added

**Trade-offs:**
- ✅ Familiar pattern
- ✅ Shows latest progress
- ❌ Not chronological (but month provides context)

---

## Data Flow Diagrams

### Creating a Milestone

```
User                  UI                DB
 │                    │                 │
 │  1. Type text      │                 │
 │     or click       │                 │
 │     suggestion     │                 │
 ├───────────────────>│                 │
 │                    │  2. Submit      │
 │  3. Submit form    ├────────────────>│
 ├───────────────────>│                 │  3. INSERT INTO
 │                    │                 │     milestone
 │                    │<────────────────│     VALUES(...)
 │                    │  (new milestone)│
 │                    │  4. Refetch     │
 │                    │     milestones  │
 │                    ├────────────────>│
 │                    │<────────────────│
 │                    │  (updated list) │
 │  5. See milestone  │  6. Clear form  │
 │     in list        │  7. Track event │
 │<───────────────────│                 │
 │  Success toast     │                 │
```

### Deleting a Milestone

```
User                  UI                DB
 │                    │                 │
 │  1. Click delete   │                 │
 ├───────────────────>│                 │
 │                    │  2. Confirm?    │
 │                    │     (optional)  │
 │  3. Confirm        │                 │
 ├───────────────────>│                 │
 │                    │  4. Delete      │
 │                    ├────────────────>│
 │                    │                 │  5. DELETE FROM
 │                    │                 │     milestone
 │                    │                 │     WHERE id=$1
 │                    │<────────────────│
 │                    │  (success)      │
 │                    │  6. Invalidate  │
 │                    │     cache       │
 │  7. Remove from UI │                 │
 │<───────────────────│                 │
 │  Success toast     │                 │
```

---

## Component Architecture

### MilestoneForm Component

**Purpose:** Input for new milestones  
**Features:**
- Text input field
- Submit button
- Suggestion chips (age-appropriate)
- Character counter (optional)
- Loading state during submission

**UI Flow:**
```
┌─────────────────────────────────────────────┐
│  Add a Milestone for Month 3               │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ First steps!                        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Add Milestone]                            │
│                                             │
│  Suggestions:                               │
│  [Can stand with support] [First steps]    │
│  [Responds to name] [Waves bye-bye]        │
└─────────────────────────────────────────────┘
```

### MilestoneDisplay Component

**Purpose:** Display individual milestone  
**Features:**
- Milestone text (truncated if long)
- Delete button
- Star icon
- Card styling

```
┌─────────────────────────────────┐
│ ⭐ First smile                  │
│                                 │
│ Feb 15, 2024            [🗑]    │
└─────────────────────────────────┘
```

### MilestoneSection Component

**Purpose:** Container for milestones + form  
**Features:**
- Shows first 4 milestones as cards
- Shows remaining as list (if 5+)
- Empty state
- Loading state

---

## API Contracts

### Create Milestone

```typescript
// Input
const data: CreateMilestoneData = {
  baby_id: "uuid",
  milestone_text: "First smile!",
  month_number: 2,
};

// Supabase call
const { data: newMilestone, error } = await supabase
  .from("milestone")
  .insert(data)
  .select()
  .single();

// Output
type Milestone = {
  id: string;
  baby_id: string;
  milestone_text: string;
  month_number: number;
  created_at: string;
  updated_at: string;
};
```

### Fetch Milestones

```typescript
// Supabase query
const { data, error } = await supabase
  .from("milestone")
  .select("*")
  .eq("baby_id", babyId)
  .eq("month_number", monthNumber)
  .order("created_at", { ascending: false });

// Output
type Milestone[] = [...];
```

### Delete Milestone

```typescript
// Supabase call
const { error } = await supabase
  .from("milestone")
  .delete()
  .eq("id", milestoneId);

// Output: success or error
```

---

## State Management

### React Query Cache Keys

```typescript
// Milestones per baby per month
['milestones', babyId, monthNumber]

// Example
['milestones', 'abc123', 3]
```

### Cache Invalidation

```typescript
// After create
queryClient.invalidateQueries({
  queryKey: ["milestones", babyId, monthNumber],
});

// After delete
queryClient.invalidateQueries({
  queryKey: ["milestones", babyId, monthNumber],
});
```

---

## Performance Considerations

### Query Performance
```
Typical query: ~50-100ms
Index on (baby_id, month_number) ensures fast lookups
Average milestones per month: 2-3 (very lightweight)
```

### Rendering Performance
```
Text-only = instant rendering
No images to load
Minimal DOM nodes
```

---

## Security

### RLS Policies

```sql
-- Users can only see milestones for their babies
CREATE POLICY milestone_select_own ON milestone
  FOR SELECT
  USING (
    baby_id IN (
      SELECT id FROM baby WHERE user_id = auth.uid()
    )
  );

-- Users can only insert milestones for their babies
CREATE POLICY milestone_insert_own ON milestone
  FOR INSERT
  WITH CHECK (
    baby_id IN (
      SELECT id FROM baby WHERE user_id = auth.uid()
    )
  );

-- Users can only delete their own milestones
CREATE POLICY milestone_delete_own ON milestone
  FOR DELETE
  USING (
    baby_id IN (
      SELECT id FROM baby WHERE user_id = auth.uid()
    )
  );
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('useMilestones', () => {
  it('fetches milestones for baby and month');
  it('creates milestone successfully');
  it('deletes milestone successfully');
});

describe('milestoneSuggestions', () => {
  it('returns suggestions for month');
  it('filters out used suggestions');
});
```

### Integration Tests
```typescript
describe('Milestone Flow', () => {
  it('adds milestone from text input');
  it('adds milestone from suggestion');
  it('deletes milestone');
  it('displays in correct order');
});
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
