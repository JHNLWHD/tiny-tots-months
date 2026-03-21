# Create Baby Profile

## Description
Allow users to create a new baby profile with name, date of birth, and optional gender. The system enforces subscription-based limits: free users can create 1 baby, additional babies require premium subscription or 15 credits.

## Capability ID
`create-baby`

---

## Inputs

| Field         | Type   | Required | Validation                          | Notes                           |
|---------------|--------|----------|-------------------------------------|---------------------------------|
| name          | string | Yes      | 1-255 chars                         | Baby's display name             |
| dateOfBirth   | string | Yes      | ISO date (YYYY-MM-DD), not future   | Used for age calculations       |
| gender        | string | No       | 'male', 'female', or 'other'        | Defaults to 'other' if omitted  |

### Input Constraints
- `dateOfBirth` cannot be in the future
- No explicit age limit enforced in code (but milestone tracking assumes babies 0-36 months)
- No duplicate name prevention (allows twins/multiples with same name)

---

## Process Flow

```
User                    UI Layer                Backend               Permissions
  │                        │                        │                      │
  │  1. Click "Add Baby"   │                        │                      │
  ├─────────────────────>  │                        │                      │
  │                        │  2. Check ability      │                      │
  │                        ├───────────────────────────────────────────────>│
  │                        │                        │  3. Query baby count │
  │                        │                        │  4. Check tier/credits│
  │                        │<───────────────────────────────────────────────│
  │                        │  (allowed/denied)      │                      │
  │                        │                        │                      │
  │  5. Show dialog        │                        │                      │
  │  (if allowed) OR       │                        │                      │
  │  upgrade prompt        │                        │                      │
  │<───────────────────────│                        │                      │
  │                        │                        │                      │
  │  6. Fill form          │                        │                      │
  │  7. Submit             │                        │                      │
  ├─────────────────────>  │                        │                      │
  │                        │  8. Validate input     │                      │
  │                        │  9. Insert to DB       │                      │
  │                        ├───────────────────────>│                      │
  │                        │                        │  10. Create baby row │
  │                        │                        │      with user_id    │
  │                        │                        │  11. Return new baby │
  │                        │<───────────────────────│                      │
  │                        │  12. Track event       │                      │
  │                        │      "baby_created"    │                      │
  │                        │  13. Refetch list      │                      │
  │                        │  14. Auto-select baby  │                      │
  │  15. Show toast        │  16. Close dialog      │                      │
  │  "[name] added!"       │                        │                      │
  │<───────────────────────│                        │                      │
```

### Step-by-Step Details

1. **User triggers "Add Baby"**
   - From: Home page "Add Baby" button, empty state CTA, or onboarding flow
   - Action: `handleOnAddBaby()` in `Home.tsx`

2-4. **Permission Check (CASL Abilities)**
   - Calls `abilities.canCreateBaby()`
   - Business Rules:
     - **Free Tier, 0 babies:** ✅ Allowed
     - **Free Tier, 1+ babies, credits < 15:** ❌ Blocked → Show upgrade prompt
     - **Free Tier, 1+ babies, credits >= 15:** ✅ Allowed (will deduct 15 credits)
     - **Family/Lifetime Tier:** ✅ Always allowed

5. **Dialog Display**
   - If blocked: Show upgrade prompt with message: "Additional baby profiles require premium subscription or 15 credits"
   - If allowed: Open `AddBabyDialog` component

6-7. **Form Submission**
   - Component: `AddBabyDialog.tsx`
   - Fields: Name (text), Birthdate (date picker), Gender (select)
   - Validation: React Hook Form with required field checks

8-11. **Database Insertion**
   - Table: `baby`
   - Columns inserted:
     ```typescript
     {
       name: string,           // From form
       date_of_birth: string,  // ISO format YYYY-MM-DD
       gender: string | null,  // 'male'/'female'/'other' or null
       user_id: string,        // From auth context
       created_at: timestamp,  // Auto-generated
       updated_at: timestamp   // Auto-generated
     }
     ```
   - RLS Policy: User can only insert rows with their own `user_id`

12. **Analytics Tracking**
   - Event: `baby_created`
   - Properties: `{ baby_name: string, baby_gender: string }`

13-14. **State Updates**
   - Refetch baby list from database
   - Auto-select newly created baby as active
   - Update React context

15-16. **User Feedback**
   - Success toast: "[Baby Name] added successfully!"
   - Close dialog
   - Navigate to home with new baby selected

---

## Outputs

### Success Case
- **HTTP:** N/A (client-side Supabase call)
- **Database:** New row in `baby` table with generated UUID
- **UI State:** 
  - Baby appears in selector
  - New baby is auto-selected
  - Month timeline renders for new baby
- **Toast:** Success message with baby's name

### Error Cases
- **Database Error:** Toast with error message, dialog remains open
- **Validation Error:** Inline form errors, dialog remains open
- **Permission Denied:** Upgrade prompt modal shown instead of dialog

---

## Business Rules

### Subscription Limits
| Tier     | Baby Limit | Cost for Additional |
|----------|------------|---------------------|
| Free     | 1          | 15 credits or upgrade |
| Family   | Unlimited  | N/A                 |
| Lifetime | Unlimited  | N/A                 |

### Data Rules
1. **No soft delete** - Babies use hard delete (but confirmation required)
2. **Gender is optional** - Defaults to 'other' in UI, stored as null/string in DB
3. **No photo upload on creation** - Initial implementation had photo support, current version does not
4. **Auto-selection** - Newly created baby is immediately set as active
5. **No uniqueness constraint on names** - Multiple babies can have the same name

### Permission Rules
- Permission check happens **before** dialog opens (prevents form abandonment)
- Free users see upgrade prompt **instead of** dialog when blocked
- Credit deduction happens **on successful creation** (not when opening dialog)

---

## Edge Cases

### 1. Network Error During Creation
**Scenario:** Supabase insert fails due to network timeout  
**Handling:**  
- Show error toast: "Failed to add baby: [error message]"
- Dialog remains open with form data intact
- User can retry submission
- Analytics event: `baby_creation_failed` with error details

### 2. User Closes Dialog Mid-Creation
**Scenario:** User submits form then immediately closes dialog  
**Handling:**  
- Creation continues in background
- If successful: Baby appears in list, toast shows
- If failed: Error silently logged (no toast since dialog is closed)

### 3. Multiple Babies Created Simultaneously
**Scenario:** User opens multiple tabs and creates babies in parallel  
**Handling:**  
- Each request is independent
- Free tier check happens at permission time (race condition possible)
- If 2 babies created simultaneously on free tier: Second one may succeed if check passes before first insert completes
- **Known Issue:** No atomic "check-and-insert" transaction

### 4. Credits Exhausted Between Check and Creation
**Scenario:** User has 15 credits, permission check passes, but credits are spent elsewhere before creation completes  
**Handling:**  
- Current implementation: Creation succeeds (credits deducted afterward)
- Credit deduction happens in separate hook/mutation (not atomic with baby creation)

### 5. Invalid Date Formats
**Scenario:** Malformed date string passed to database  
**Handling:**  
- Browser date input prevents most invalid dates
- Supabase validates date format
- If invalid: Database error shown to user

### 6. Deleted User Mid-Creation
**Scenario:** User's account is deleted while creation is in progress  
**Handling:**  
- Supabase RLS prevents insert (no valid user_id)
- Returns permission error
- User sees generic "Failed to add baby" error

---

## UI Locations

### Entry Points
1. **Home Page** (`/app`)
   - "Add Baby" button in `NavigationHub` card (when babies exist)
   - "Add Your First Baby" in empty state (when no babies)
   - "Add Baby" button in baby list header

2. **Onboarding Flow** (`/onboarding`)
   - "Add Your Baby" button after login
   - Skips permission check (assumes new user has 0 babies)

### Components
- **Dialog:** `AddBabyDialog.tsx` - Modal with form
- **Form Fields:**
  - Name: Text input
  - Birthdate: HTML5 date picker
  - Gender: Select dropdown (Male/Female/Other)
- **Buttons:**
  - "Add Baby" (submit)
  - "Cancel" (close dialog)

### Visual Design
- Dialog is centered modal
- Purple theme consistent with app branding
- Form fields use shadcn/ui components
- Gender defaults to "Other"

---

## Dependencies

### Internal
- **Auth Context:** `useAuth()` - Provides `user.id`
- **Baby Hook:** `useBabyProfiles()` - Provides `createBaby` mutation
- **Abilities:** `useAbilities()` - Permission checking
- **Subscription:** `useSubscription()` - Tier detection

### External
- **Supabase:** Database insert, RLS enforcement
- **React Hook Form:** Form validation
- **Sonner:** Toast notifications
- **PostHog:** Analytics tracking

### Database Schema
```sql
-- Simplified schema (actual schema in Supabase)
CREATE TABLE baby (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy (inferred)
CREATE POLICY baby_insert_own 
  ON baby FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

---

## Related Capabilities
- `edit-baby` - Modify existing baby profile (not implemented)
- `delete-baby` - Remove baby profile (hard delete with confirmation)
- `select-baby` - Switch active baby context
- `list-babies` - Fetch all babies for current user

---

## Known Issues & Future Improvements

### Known Issues
1. **Race condition:** Permission check and insertion are not atomic - user can create 2 babies simultaneously on free tier
2. **No photo support:** Original design included photo upload, current implementation removed it
3. **Credit deduction timing:** Credits deducted after creation, not atomically checked

### Future Improvements
1. Add baby profile photos back
2. Implement atomic transaction for credit check + baby creation
3. Add "import from another user" for family sharing
4. Support for twins (auto-create multiple babies with similar data)
5. Add baby age validation (warn if DOB > 10 years ago)

---

## Testing Checklist

### Functional Tests
- [ ] Free user (0 babies) can create first baby
- [ ] Free user (1 baby) sees upgrade prompt
- [ ] Free user with 15+ credits can create second baby (credits deducted)
- [ ] Premium user can create unlimited babies
- [ ] Form validation prevents empty name
- [ ] Form validation prevents future date of birth
- [ ] Gender defaults to "other"
- [ ] New baby auto-selected after creation
- [ ] Success toast displays with baby's name

### Edge Case Tests
- [ ] Network error shows error toast, keeps dialog open
- [ ] Rapid double-submit only creates one baby
- [ ] Invalid date format handled gracefully
- [ ] Extremely long name (>255 chars) rejected
- [ ] Special characters in name handled correctly
- [ ] Multiple tabs creating babies simultaneously

### Analytics Tests
- [ ] `baby_created` event fired with correct properties
- [ ] `baby_creation_failed` event fired on errors

---

## Implementation Notes

### Code Locations
- **Dialog Component:** `src/components/home/AddBabyDialog.tsx`
- **Hook:** `src/hooks/useBabyProfiles.tsx` (lines 92-132)
- **Page:** `src/pages/Home.tsx` (lines 72-83)
- **Abilities:** `src/lib/abilities.ts` (lines 129-136)
- **Types:** `src/integrations/supabase/types.ts` (lines 12-40)

### Key Functions
```typescript
// Permission check
abilities.canCreateBaby() -> FeatureGateResult

// Creation mutation
createBaby(data: CreateBabyData, options?: { 
  onSuccess?: () => void; 
  onError?: (err: Error) => void 
}) -> void

// Data shape
type CreateBabyData = {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;      // 'male' | 'female' | 'other'
}
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
