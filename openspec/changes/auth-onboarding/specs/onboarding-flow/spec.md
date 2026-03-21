# Capability: First-Time User Onboarding

## Overview
Guide new users through their first app experience by prompting them to create their first baby profile. This is a required step to access the app, as the app is unusable without a baby profile.

## Inputs

### User Context
- User must be authenticated (signed in)
- User must have zero baby profiles

### Baby Creation Form
```typescript
type OnboardingInput = {
  name: string;          // Baby's name (required, min 1 char)
  birthdate: string;     // ISO date string (required, must be in past)
  gender: string;        // "male" | "female" | "other" (optional, defaults to "other")
};
```

## Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│              ONBOARDING FLOW                                │
└─────────────────────────────────────────────────────────────┘

New user signs up/signs in
  │
  ├─ AuthContext: isAuthenticated = true
  │
  ├─ Navigate to /app
  │   ↓
  │   App.tsx (or route guard) checks:
  │   const { babies, loading } = useBabyProfiles();
  │   ↓
  │   if (loading) return <LoadingSpinner />;
  │   ↓
  │   if (babies.length === 0) {
  │     return <Navigate to="/onboarding" replace />;
  │   }
  │
  ├─ ONBOARDING PAGE RENDERS
  │   ↓
  │   Show:
  │   - Welcome header with baby icon
  │   - "Welcome to Tiny Tots!" title
  │   - Subtitle: "Let's set up your baby's milestone journal"
  │   - Baby creation form card
  │
  ├─ USER FILLS FORM
  │   ↓
  │   Enters:
  │   • Baby's name: "Emma"
  │   • Birthdate: "2025-12-15" (date picker)
  │   • Gender: "female" (dropdown, optional)
  │   ↓
  │   Client-side validation (react-hook-form):
  │   ✓ Name not empty
  │   ✓ Birthdate not empty
  │   ✓ Birthdate not in future
  │
  ├─ USER SUBMITS FORM
  │   ↓
  │   onClick "Get Started" button
  │   ↓
  │   createBaby({
  │     name: "Emma",
  │     dateOfBirth: "2025-12-15",
  │     gender: "female"
  │   })
  │   ↓
  │   INSERT INTO baby (user_id, name, date_of_birth, gender)
  │   VALUES (auth.uid(), 'Emma', '2025-12-15', 'female');
  │   ↓
  │   Success? Error?
  │   │
  │   ├─ SUCCESS:
  │   │   ↓
  │   │   onSuccess callback triggered
  │   │   ↓
  │   │   Toast: "Welcome! Emma's milestone journal is ready."
  │   │   ↓
  │   │   navigate("/app")
  │   │   ↓
  │   │   Home page renders:
  │   │   - Selected baby: Emma
  │   │   - Current month view (based on age)
  │   │   - Empty state for photos/milestones (first time)
  │   │
  │   └─ ERROR:
  │       ↓
  │       onError callback triggered
  │       ↓
  │       Toast: "Failed to create profile: [error message]"
  │       ↓
  │       Form stays visible, user can retry
```

### Sequence Diagram

```
User        Onboarding.tsx    useBabyProfiles    Supabase      Home.tsx
  │                │                 │               │             │
  ├─ Page load ───▶│                 │               │             │
  │                ├─ Check babies ─▶│               │             │
  │                │                 ├─ SELECT * ───▶│             │
  │                │                 │◀─ babies: [] ─┤             │
  │                │◀─ no babies ───┤               │             │
  │                │                 │               │             │
  │◀─ Show form ───┤                 │               │             │
  ├─ Fill form ───▶│                 │               │             │
  ├─ Submit ──────▶│                 │               │             │
  │                ├─ createBaby() ─▶│               │             │
  │                │                 ├─ INSERT ─────▶│             │
  │                │                 │◀─ baby obj ───┤             │
  │                │◀─ success ─────┤               │             │
  │◀─ Toast msg ───┤                 │               │             │
  │                ├─ navigate("/app") ──────────────────────────▶│
  │                │                 │               │             │
  │◀─────────────────────────────────────────────────── Home page ┤
  │                │                 │               │             │
```

## Outputs

### Success Case
```json
{
  "baby": {
    "id": "baby-uuid-123",
    "user_id": "user-uuid-abc",
    "name": "Emma",
    "date_of_birth": "2025-12-15",
    "gender": "female",
    "created_at": "2026-03-08T10:00:00Z",
    "updated_at": "2026-03-08T10:00:00Z"
  }
}
```

**UI Response:**
- Toast notification: "Welcome! Emma's milestone journal is ready."
- Navigate to `/app`
- Home page renders with Emma's current month view

### Error Cases

| Error | Cause | User Message | Recovery |
|-------|-------|--------------|----------|
| **Empty name** | User didn't enter name | "Name is required" | Show field error, require input |
| **Empty birthdate** | User didn't select date | "Birthdate is required" | Show field error, require selection |
| **Future birthdate** | Birthdate after today | "Birthdate cannot be in the future" | Show field error, require past date |
| **Database error** | Supabase insert failed | "Failed to create profile: [error]" | Show toast, allow retry |
| **Network error** | No internet connection | "Failed to create profile: Network error" | Show toast, allow retry |

## Business Rules

### Baby Profile Requirements
- **Name**: Required, any non-empty string accepted
- **Birthdate**: Required, must be in the past (cannot be today or future)
- **Gender**: Optional, defaults to "other" if not selected
- **Uniqueness**: No restriction on duplicate names (users can have multiple babies with same name)

### Onboarding Flow
- **Required step**: User cannot skip onboarding if they have no babies
- **One-time only**: Once user creates first baby, they don't see onboarding again
- **Re-entry**: If user deletes all babies, they return to onboarding on next /app visit

### Navigation
- **Redirect from /app**: Users without babies automatically redirected to /onboarding
- **Redirect from /onboarding**: Users with babies automatically redirected to /app
- **No back button**: Onboarding page doesn't have back navigation (user is already signed in)
- **Sign out option**: User can sign out from onboarding if they change their mind

### Default Values
- **Gender**: Defaults to "other" (meaning "prefer not to say")
- **Selected baby**: First created baby automatically becomes the selected baby
- **Current month**: Calculated from baby's age relative to birthdate

## Edge Cases

### User Already Has Babies
**Scenario:** User with existing babies navigates to `/onboarding` directly.

**Handling:**
```typescript
// In Onboarding.tsx
if (babies.length > 0) {
  return <Navigate to="/app" replace />;
}
```

User immediately redirected to home page.

### User Creates Baby Then Navigates Back
**Scenario:** User completes onboarding, then uses browser back button.

**Handling:**
- Browser navigates to `/onboarding`
- Onboarding page detects `babies.length > 0`
- Redirects to `/app` immediately

**No infinite loop:** `/app` → `/onboarding` → `/app` doesn't happen because redirect uses `replace` flag.

### Baby Creation Fails
**Scenario:** Database error prevents baby creation.

**Handling:**
- Error caught in `createBaby` mutation
- `onError` callback shows toast with error message
- Form state resets: `isSubmitting = false`
- User sees form again and can retry
- No redirect occurs (user stays on onboarding)

**Debugging:** Error logged to PostHog for monitoring.

### User Closes Tab During Submission
**Scenario:** User clicks "Get Started", then closes browser tab before baby is created.

**Handling:**
- Request may or may not reach server (race condition)
- If request completes: Baby created, but user doesn't see confirmation
- Next time user opens app: Redirected to `/app` (baby exists)
- If request fails: No baby created, user sees onboarding again

**No data loss:** Worst case, user re-enters baby info (unlikely edge case).

### User Enters Baby Born Today
**Scenario:** User's baby was born today, enters today's date.

**Current Handling:**
- Validation allows today's date (birthdate <= today)
- Baby created with month_number = 1 (month 1 is from birth to 1 month)

**Future Consideration:** Add "newborn" special case for babies 0-30 days old.

### Multiple Babies with Same Name
**Scenario:** User creates "Emma", later creates another "Emma".

**Handling:**
- No uniqueness constraint on baby names
- Both babies exist with different IDs
- User can distinguish by birthdate or edit names later

**UI Consideration:** Baby selector shows "Emma (Dec 2025)" and "Emma (Mar 2026)" to distinguish.

### User Deletes All Babies After Onboarding
**Scenario:** User completes onboarding, creates baby, then deletes baby. Later visits /app.

**Handling:**
- `/app` detects `babies.length === 0`
- Redirects to `/onboarding`
- User goes through onboarding again

**Intent:** User must always have at least one baby to use the app.

## UI Locations

### Onboarding Page (`/onboarding`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Baby Icon]                          │
│                                                         │
│             Welcome to Tiny Tots!                       │
│                                                         │
│     Let's set up your baby's milestone journal to      │
│           start capturing precious memories.            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │              Add Your Baby                        │ │
│  │         Tell us about your little one             │ │
│  ├───────────────────────────────────────────────────┤ │
│  │                                                   │ │
│  │  Baby's Name                                      │ │
│  │  [___________________________________________]    │ │
│  │                                                   │ │
│  │  Birthdate                                        │ │
│  │  [___________________________________________]    │ │
│  │     (Date picker: MM/DD/YYYY)                     │ │
│  │                                                   │ │
│  │  Gender (optional)                                │ │
│  │  [___________________________________________]    │ │
│  │     (Dropdown: Male, Female, Prefer not to say)   │ │
│  │                                                   │ │
│  │  [          Get Started          ]               │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│     You can add more babies later from the home page.  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Visual Design:**
- Gradient background (same as auth page)
- Floating baby icon with animation
- Centered card with form
- Clear, friendly copy
- Large "Get Started" button

### After Onboarding
- Navigate to `/app`
- Home page shows:
  - Baby selector (if user later adds more babies)
  - Current month view for new baby
  - Empty states for photos and milestones
  - Call-to-action: "Add your first photo" and "Record a milestone"

## Dependencies

### Technical
- **useBabyProfiles Hook**: Provides `babies` array and `createBaby` mutation
- **React Hook Form**: Form state and validation
- **React Router**: Navigation after baby creation
- **Sonner**: Toast notifications

### Context
- **AuthContext**: Verify user is authenticated
- **BabyContext** (implicit): Selected baby updated after creation

### Backend
- **baby table**: INSERT new baby record
- **RLS policy**: Ensure `user_id = auth.uid()`

## Implementation Notes

### Onboarding Page Component
```typescript
// In Onboarding.tsx
const Onboarding = () => {
  const navigate = useNavigate();
  const { babies, loading, createBaby } = useBabyProfiles();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: "",
      birthdate: "",
      gender: "other",
    },
  });

  // Redirect if user already has babies
  if (loading) return <LoadingSpinner />;
  if (babies.length > 0) {
    return <Navigate to="/app" replace />;
  }

  const onSubmit = async (data) => {
    createBaby(
      {
        name: data.name,
        dateOfBirth: data.birthdate,
        gender: data.gender,
      },
      {
        onSuccess: () => {
          toast.success(`Welcome! ${data.name}'s milestone journal is ready.`);
          navigate("/app");
        },
        onError: (error) => {
          toast.error(`Failed to create profile: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className="onboarding-page">
      <h1>Welcome to Tiny Tots!</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("name", { required: "Name is required" })} />
        {errors.name && <span>{errors.name.message}</span>}

        <input type="date" {...register("birthdate", { required: "Birthdate is required" })} />
        {errors.birthdate && <span>{errors.birthdate.message}</span>}

        <select {...register("gender")}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Prefer not to say</option>
        </select>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Get Started"}
        </button>
      </form>
    </div>
  );
};
```

### Onboarding Redirect Logic
```typescript
// In App.tsx or ProtectedRoute component
const OnboardingGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { babies, loading } = useBabyProfiles();

  if (loading) return <LoadingSpinner />;

  // Not authenticated → go to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but no babies → go to onboarding
  if (babies.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  // Has babies → show app
  return children;
};

// Usage
<Route path="/app" element={<OnboardingGuard><Home /></OnboardingGuard>} />
```

### First Baby Auto-Selection
```typescript
// In useBabyProfiles or BabyContext
useEffect(() => {
  if (babies.length === 1 && !selectedBabyId) {
    // Auto-select first baby
    setSelectedBaby(babies[0].id);
  }
}, [babies, selectedBabyId]);
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
