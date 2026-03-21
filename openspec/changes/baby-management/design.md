# Baby Management Design

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
│ Home Page    │  │ Onboarding   │  │ Month Page   │
│ /app         │  │ /onboarding  │  │ /app/month/  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               COMPONENT LAYER                           │
├─────────────────────────────────────────────────────────┤
│  • AddBabyDialog (create)                               │
│  • NavigationHub (selector + delete)                    │
│  • BabySelector (dropdown)                              │
│  • BabyList (card view)                                 │
│  • BabyCard (individual baby display)                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  STATE LAYER                            │
├─────────────────────────────────────────────────────────┤
│  • useBabyProfiles() - CRUD operations                  │
│  • React State - Selected baby (in-memory)              │
│  • React Query - Cache management                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               PERMISSION LAYER                          │
├─────────────────────────────────────────────────────────┤
│  • useAbilities() - CASL permission checks              │
│  • useSubscription() - Tier detection                   │
│  • createAbilityFor() - Rule builder                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER                             │
├─────────────────────────────────────────────────────────┤
│  • Supabase Client - API calls                          │
│  • RLS Policies - Row-level security                    │
│  • PostgreSQL - Data storage                            │
└─────────────────────────────────────────────────────────┘
```

---

## Data Model

### Baby Table Schema

```
┌─────────────────────────────────────────────────────────┐
│                      babies                             │
├──────────────────┬───────────────┬──────────────────────┤
│ Column           │ Type          │ Constraints          │
├──────────────────┼───────────────┼──────────────────────┤
│ id               │ uuid          │ PK, auto-generated   │
│ user_id          │ uuid          │ FK → auth.users, NN  │
│ name             │ text          │ NOT NULL             │
│ date_of_birth    │ date          │ NOT NULL             │
│ gender           │ text          │ NULLABLE             │
│ created_at       │ timestamptz   │ default now()        │
│ updated_at       │ timestamptz   │ default now()        │
└──────────────────┴───────────────┴──────────────────────┘

Indexes:
  - PRIMARY KEY (id)
  - INDEX ON (user_id, created_at DESC)

RLS Policies:
  - baby_select_own: Users can SELECT their own babies
  - baby_insert_own: Users can INSERT with their user_id
  - baby_delete_own: Users can DELETE their own babies
  - baby_update_own: Users can UPDATE their own babies (no UI)
```

### Type Definitions

```typescript
// Client-side type
export type Baby = {
  id: string;
  created_at: string;
  name: string;
  date_of_birth: string;  // ISO date format
  gender: string | null;
  user_id: string | undefined;
};

// Create operation input
type CreateBabyData = {
  name: string;
  dateOfBirth: string;  // YYYY-MM-DD
  gender: string;       // 'male' | 'female' | 'other'
};
```

### Relationships

```
        baby (1)
          │
          ├──────── (N) milestones
          │            └─ ON DELETE CASCADE
          │
          └──────── (N) photos
                       └─ ON DELETE CASCADE
```

**Cascade Behavior:**
- Deleting a baby automatically deletes all associated milestones
- Deleting a baby automatically deletes all associated photos (including storage)
- No orphaned data possible

---

## Key Design Decisions

### 1. Hard Delete vs Soft Delete

**Decision:** Use hard delete with confirmation  
**Rationale:**
- Simpler data model (no `deleted_at` column)
- Cleaner queries (no need to filter deleted rows)
- True data removal for privacy compliance
- Confirmation dialog mitigates accidental deletion risk

**Trade-offs:**
- ❌ No recovery mechanism
- ❌ Accidental deletion is permanent
- ✅ Simpler implementation
- ✅ GDPR-friendly (true deletion)

---

### 2. Selected Baby State Management

**Decision:** In-memory React state, no persistence  
**Rationale:**
- Simplest implementation
- Baby selection resets on page reload (acceptable UX)
- No localStorage complexity
- Auto-selects first baby on load

**Trade-offs:**
- ❌ Selection doesn't persist across sessions
- ❌ Doesn't persist across tabs
- ✅ No stale data issues
- ✅ Simpler state management

**Implementation:**
```typescript
// In Home.tsx
const [selectedBaby, setSelectedBaby] = useState(null);

// Auto-select first baby
useEffect(() => {
  if (babies.length > 0 && !selectedBaby) {
    setSelectedBaby(babies[0]);
  }
}, [babies, selectedBaby]);
```

---

### 3. Permission Model (CASL)

**Decision:** Subscription-tiered + credit-based system  
**Rationale:**
- Monetization through premium upgrades
- Alternative path via credits for free users
- Flexible business model

**Rules:**
```typescript
// Free tier with 0 babies
can('create', 'Baby')  // ✅ First baby free

// Free tier with 1+ babies
if (creditsBalance >= 15) {
  can('create', 'Baby')  // ✅ Can buy with credits
} else {
  cannot('create', 'Baby')  // ❌ Needs premium or credits
}

// Premium tier
can('create', 'Baby')  // ✅ Unlimited
```

---

### 4. Baby Creation Flow

**Decision:** Permission check BEFORE dialog opens  
**Rationale:**
- Prevents form abandonment
- Clear upgrade path at point of intent
- Better UX (don't let user fill form just to be blocked)

**Flow:**
```
User clicks "Add Baby"
  │
  ▼
Check permissions
  │
  ├─ ALLOWED ──────────────────────────┐
  │                                    │
  │  Open AddBabyDialog               │
  │   └─ Show form                    │
  │   └─ User submits                 │
  │   └─ Create baby in DB            │
  │                                    │
  └─ DENIED ───────────────────────────┤
                                       │
     Show upgrade prompt               │
      └─ Link to /app/upgrade          │
      └─ Option to buy credits         │
```

---

### 5. No Edit Functionality (Currently)

**Decision:** Create and Delete only, no Edit UI  
**Rationale:**
- Backend supports updates (database + types)
- UI not implemented (lower priority)
- Workaround: Delete and recreate

**Future Enhancement:**
- Add edit dialog component
- Reuse form from AddBabyDialog
- Pre-populate with existing data

---

### 6. Gender Field Design

**Decision:** Optional, defaults to "other"  
**Rationale:**
- Inclusive design
- Not required for milestone tracking
- Some cultures don't reveal gender early

**Values:**
- `'male'`
- `'female'`
- `'other'`
- `null` (backend treats as "other")

---

### 7. No Profile Photos

**Decision:** Removed from current implementation  
**Rationale:**
- Original design included photo upload
- Removed to simplify onboarding
- Storage cost reduction
- Not critical for milestone tracking

**Evidence:**
- Database has no `photo_url` column
- Components don't reference baby photos
- Storage quota applies only to milestone photos

---

## Component Hierarchy

```
Home (page)
 │
 ├─ NavigationHub
 │   ├─ Baby Selector Card
 │   │   ├─ "Add Baby" button
 │   │   └─ Baby Cards (first 4)
 │   │       ├─ Baby name/DOB/icon
 │   │       └─ Delete dropdown menu
 │   │
 │   └─ Selected Baby Context Card
 │       ├─ Large baby display
 │       └─ Action buttons (Wrapped, Gallery)
 │
 └─ AddBabyDialog (modal)
     └─ Form
         ├─ Name field
         ├─ Date picker
         ├─ Gender select
         └─ Submit button

Onboarding (page)
 │
 └─ Baby Creation Form
     └─ Same form fields as AddBabyDialog
     └─ Auto-redirects to /app on success
```

---

## Data Flow Diagrams

### Creating a Baby

```
User                  Component              Hook                 DB
 │                       │                    │                   │
 │  Click "Add Baby"     │                    │                   │
 ├──────────────────────>│                    │                   │
 │                       │  Check permission  │                   │
 │                       │────────────────────>│                   │
 │                       │<────────────────────│                   │
 │                       │  (allowed/denied)  │                   │
 │                       │                    │                   │
 │  [If denied: show upgrade prompt]          │                   │
 │  [If allowed: show dialog]                 │                   │
 │                       │                    │                   │
 │  Fill form            │                    │                   │
 │  Submit               │                    │                   │
 ├──────────────────────>│                    │                   │
 │                       │  createBaby(data)  │                   │
 │                       ├───────────────────>│                   │
 │                       │                    │  INSERT INTO baby │
 │                       │                    ├──────────────────>│
 │                       │                    │<──────────────────│
 │                       │                    │  (new baby row)   │
 │                       │                    │                   │
 │                       │                    │  Track analytics  │
 │                       │                    │  Refetch list     │
 │                       │                    │  Return success   │
 │                       │<───────────────────│                   │
 │                       │                    │                   │
 │                       │  Auto-select baby  │                   │
 │                       │  Close dialog      │                   │
 │  Toast: success       │  Show toast        │                   │
 │<──────────────────────│                    │                   │
```

### Deleting a Baby

```
User                  Component              Hook                 DB
 │                       │                    │                   │
 │  Click delete         │                    │                   │
 ├──────────────────────>│                    │                   │
 │                       │  Show confirmation │                   │
 │  Confirm delete       │                    │                   │
 ├──────────────────────>│                    │                   │
 │                       │  deleteBaby(id)    │                   │
 │                       ├───────────────────>│                   │
 │                       │                    │  DELETE FROM baby │
 │                       │                    │  WHERE id = $1    │
 │                       │                    ├──────────────────>│
 │                       │                    │                   │
 │                       │                    │  CASCADE:         │
 │                       │                    │   • milestones    │
 │                       │                    │   • photos        │
 │                       │                    │<──────────────────│
 │                       │                    │                   │
 │                       │                    │  Track analytics  │
 │                       │                    │  Refetch list     │
 │                       │<───────────────────│                   │
 │                       │                    │                   │
 │                       │  If deleted baby   │                   │
 │                       │  was selected:     │                   │
 │                       │   • Select next    │                   │
 │                       │   • Or clear       │                   │
 │  Toast: success       │                    │                   │
 │<──────────────────────│                    │                   │
```

### Selecting a Baby

```
User                  Component              State
 │                       │                    │
 │  Click baby card      │                    │
 ├──────────────────────>│                    │
 │                       │  onSelectBaby(baby)│
 │                       ├───────────────────>│
 │                       │                    │
 │                       │  setSelectedBaby   │
 │                       │<───────────────────│
 │                       │                    │
 │                       │  UI updates:       │
 │                       │   • Highlight card │
 │                       │   • Update context │
 │                       │   • Load timeline  │
 │  See updated UI       │                    │
 │<──────────────────────│                    │
```

---

## Permission System Details

### CASL Ability Rules

```typescript
// From src/lib/abilities.ts

export function createAbilityFor(user: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  switch (user.tier) {
    case 'lifetime':
    case 'family':
      // Premium: unlimited babies
      can('create', 'Baby');
      break;

    case 'free':
      // Free: complex rules
      if (user.babyCount === 0) {
        can('create', 'Baby');  // First baby free
      } else if (user.creditsBalance >= CREDIT_COSTS.EXTRA_BABY) {
        can('create', 'Baby');  // Can buy with credits
      } else {
        cannot('create', 'Baby')
          .because('Additional baby profiles require premium subscription or 15 credits');
      }
      break;
  }

  return build();
}
```

### Credit Costs

```typescript
export const CREDIT_COSTS = {
  EXTRA_BABY: 15,
  // ... other costs
} as const;
```

---

## API Contracts

### Create Baby

```typescript
// Input
type CreateBabyData = {
  name: string;
  dateOfBirth: string;  // YYYY-MM-DD format
  gender: string;       // 'male' | 'female' | 'other'
};

// Supabase call
const { data, error } = await supabase
  .from("baby")
  .insert({
    name: data.name,
    date_of_birth: data.dateOfBirth,
    gender: data.gender,
    user_id: user.id,  // Injected from auth context
  })
  .select()
  .single();

// Output
data: Baby | null
error: PostgrestError | null
```

### List Babies

```typescript
// Supabase call
const { data, error } = await supabase
  .from("baby")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

// Output
data: Baby[] | null
error: PostgrestError | null
```

### Delete Baby

```typescript
// Supabase call
const { error } = await supabase
  .from("baby")
  .delete()
  .eq("id", babyId)
  .eq("user_id", user.id);  // Double-check ownership

// Output
error: PostgrestError | null
```

---

## State Management

### React Query Cache Keys

```typescript
// Baby list
['babies', user.id]

// Individual baby (not used, always fetch list)
['baby', babyId]
```

### Cache Invalidation

```typescript
// After create
queryClient.invalidateQueries({ queryKey: ["babies", user?.id] });

// After delete
// (handled by refetch() in useBabyProfiles)
```

---

## Analytics Implementation

### Events Tracked

```typescript
// Baby created successfully
trackEvent("baby_created", {
  baby_name: string,
  baby_gender: string,
});

// Baby creation failed
trackEvent("baby_creation_failed", {
  error_message: string,
});

// Baby deleted successfully
trackEvent("baby_deleted", {
  baby_id: string,
});

// Baby deletion failed
trackEvent("baby_deletion_failed", {
  error_message: string,
  baby_id: string,
});

// Database errors (all operations)
trackDatabaseError(
  error: Error,
  operation: 'select' | 'insert' | 'delete',
  table: 'baby',
  user_id: string
);
```

---

## Error Handling

### Database Errors

```typescript
// Pattern used in useBabyProfiles
try {
  const { data, error } = await supabase.from("baby").insert(...);
  
  if (error) {
    console.error("Error creating baby:", error);
    trackDatabaseError(error, "insert", "baby", user?.id);
    trackEvent("baby_creation_failed", { error_message: error.message });
    options?.onError?.(new Error(error.message));
  } else {
    trackEvent("baby_created", { ... });
    refetch();
    options?.onSuccess?.();
  }
} catch (err) {
  // Unexpected errors
  console.error("Unexpected error:", err);
  trackDatabaseError(err, "insert", "baby", user?.id);
}
```

### User-Facing Errors

```typescript
// Toast notifications
toast.success(`${name} added successfully!`);
toast.error(`Failed to add baby: ${error.message}`);

// Validation errors
// (Handled by React Hook Form inline)
{errors.name && <p className="text-red-500">{errors.name.message}</p>}
```

---

## Security Considerations

### Row-Level Security (RLS)

All baby operations are protected by RLS policies:

```sql
-- Users can only see their own babies
CREATE POLICY baby_select_own ON baby
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert with their own user_id
CREATE POLICY baby_insert_own ON baby
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own babies
CREATE POLICY baby_delete_own ON baby
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Client-Side Validation

```typescript
// Zod schema (BabyForm.tsx)
const formSchema = z.object({
  name: z.string().min(1, "Baby's name is required"),
  dateOfBirth: z
    .date({ required_error: "Date of birth is required" })
    .refine((date) => date <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
});

// React Hook Form (AddBabyDialog.tsx)
{...register("name", { required: "Name is required" })}
{...register("birthdate", { required: "Birthdate is required" })}
```

---

## Performance Considerations

### Baby List Loading

- Fetches once on mount
- Refetches after create/delete
- Uses React Query cache
- Order by `created_at DESC` (newest first)

**Optimization:** Could add pagination if user has >50 babies (unlikely)

### Selected Baby State

- In-memory only (instant access)
- No localStorage reads/writes
- No network calls to persist selection

### Cascade Delete Performance

- Database handles cascade via foreign keys
- Single DELETE query removes baby + all related data
- No N+1 queries
- Potential issue: Large number of photos could slow delete (mitigated by async cascade)

---

## Testing Strategy

### Unit Tests (Recommended)

```typescript
// useBabyProfiles hook
describe('useBabyProfiles', () => {
  it('fetches babies on mount');
  it('creates baby with correct data shape');
  it('deletes baby and refetches list');
  it('handles permission errors');
  it('handles database errors');
});

// CASL abilities
describe('createAbilityFor', () => {
  it('allows first baby on free tier');
  it('blocks second baby without credits');
  it('allows unlimited babies on premium');
});
```

### Integration Tests (Recommended)

```typescript
describe('Baby Management Flow', () => {
  it('complete create flow from button to database');
  it('complete delete flow with confirmation');
  it('permission check blocks unauthorized creation');
  it('cascade delete removes milestones and photos');
});
```

---

## Migration Path (Future Enhancements)

### Adding Soft Delete

```sql
ALTER TABLE baby ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update RLS policies
CREATE POLICY baby_select_active ON baby
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Update queries
.eq("user_id", user.id)
.is("deleted_at", null)  // Add this filter
```

### Adding Profile Photos

```sql
ALTER TABLE baby ADD COLUMN photo_url TEXT;

-- Update Supabase storage
// Upload to baby-profile-photos bucket
// Store signed URL or path in photo_url
```

### Adding Edit Functionality

```typescript
// Add to useBabyProfiles
const updateBaby = (babyId: string, data: UpdateBabyData) => {
  return supabase
    .from("baby")
    .update({
      name: data.name,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
    })
    .eq("id", babyId)
    .eq("user_id", user.id);
};

// Create EditBabyDialog component
// Reuse form from AddBabyDialog with pre-populated values
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
