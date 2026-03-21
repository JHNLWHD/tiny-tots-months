# Baby Profile Management

## Problem
Parents tracking multiple children need a system to create, manage, and switch between baby profiles. Each baby represents a unique timeline of milestones, photos, and memories that span their first years of life.

The app must support:
- Single-parent households with multiple children
- Parents who want to track twins/multiples
- Users who may start with one baby and add more over time
- Easy context switching between babies without losing progress

## Solution
A comprehensive baby profile management system that provides:

**Core Capabilities:**
- **Create Baby Profiles** - Add unlimited babies (premium) or 1 free baby + credit-based additions
- **Switch Between Babies** - Quick selector UI for changing active baby context
- **Delete Baby Profiles** - Hard delete with cascade to remove all associated data
- **Edit Baby Profiles** - (Currently not implemented - future enhancement)

**Key Features:**
- Multi-baby support with per-user isolation (RLS)
- Subscription-tiered limits (free vs premium)
- Credit-based system for free tier upgrades
- Automatic age calculations from date of birth
- Gender tracking (optional, defaults to "other")
- Analytics tracking for baby lifecycle events

## Scope

### ✅ In Scope
- CRUD operations for baby profiles (currently: Create, Read, Delete only)
- Baby selector UI with dropdown and card views
- Automatic age calculations based on DOB
- Profile data: name, date of birth, gender
- Permission gating based on subscription tier
- Credit-based access for free tier users
- Hard delete with data cascade
- Analytics event tracking

### ❌ Out of Scope
- Baby profile photos (removed from current implementation)
- Soft delete / archive functionality
- Family/co-parent sharing
- Import/export of baby profiles
- Profile editing (Update functionality exists in types but no UI)
- Baby nicknames or alternate names
- Custom fields (height, weight, etc.)

### 🔮 Future Enhancements
- Profile photo support
- Edit baby profile functionality (UI missing)
- Soft delete with restore capability
- Family account sharing
- Twins/multiples wizard
- Age validation warnings (>10 years)
- Profile import from other apps

## Success Metrics

### User Experience
- Users can create first baby profile in <30 seconds from signup
- Baby switching is instant (<100ms state change)
- Zero accidental deletions (confirmation required)
- Zero data loss on baby profile operations

### Business Metrics
- Free tier → Premium conversion on 2nd baby attempt
- Credit purchases for multi-baby on free tier
- Baby profile retention rate (non-deletion)
- Average babies per user (free vs premium)

### Technical Metrics
- <500ms baby list load time
- 100% RLS enforcement (users only see their babies)
- Zero cross-user data leakage
- Cascade delete integrity (no orphaned data)

## Assumptions
1. Most users will have 1-3 babies maximum
2. Date of birth is always accurate (parents know this)
3. Gender is not critical (can be optional/other)
4. Users understand hard delete consequences
5. Baby profiles are primarily created during onboarding or immediately after
6. Mobile-first usage (responsive design critical)

## Constraints
- Must respect Supabase RLS policies
- Free tier: 1 baby profile included
- Additional babies: 15 credits or premium subscription
- No baby profile editing UI (backend supports it)
- Hard delete only (no recovery mechanism)
- Database enforces foreign key cascades

## Dependencies

### External
- **Supabase** - Database, RLS, authentication
- **CASL** - Permission management system
- **React Query** - Data fetching and cache management
- **PostHog** - Analytics tracking

### Internal
- **Auth System** - User identity for profile ownership
- **Subscription System** - Tier detection for limits
- **Credit System** - Alternative payment for free tier
- **Milestone System** - References baby_id (cascade on delete)
- **Photo System** - References baby_id (cascade on delete)

## Risks

### High Priority
1. **Accidental Deletion** - Users may not understand hard delete is permanent
   - Mitigation: Confirmation dialog with explicit warning about cascade

2. **Cross-User Data Leak** - RLS misconfiguration could expose baby data
   - Mitigation: Comprehensive RLS policies, regular audits

3. **Cascade Delete Failure** - Partial deletion could leave orphaned data
   - Mitigation: Database foreign key constraints with CASCADE

### Medium Priority
4. **Credit Race Condition** - Multiple tabs creating babies simultaneously on free tier
   - Mitigation: Atomic credit checks (not currently implemented)

5. **State Sync Issues** - Baby list not refreshing after creation/deletion
   - Mitigation: React Query cache invalidation

### Low Priority
6. **Missing Edit Functionality** - Users can't fix typos in baby names/DOB
   - Workaround: Delete and recreate (loses history)

## Alternative Approaches Considered

### 1. Soft Delete Instead of Hard Delete
**Rejected** - Adds complexity with deleted_at column, makes queries more complex, requires data retention policy

### 2. Unlimited Babies on Free Tier
**Rejected** - Removes monetization lever, encourages abuse/testing accounts

### 3. Baby Profile Photos Required
**Rejected** - Adds friction to onboarding, increases storage costs, not critical for milestone tracking

### 4. LocalStorage for Selected Baby Persistence
**Rejected** - Current in-memory approach simpler, selected baby resets on refresh (acceptable UX)

### 5. Edit-in-Place for Baby Cards
**Rejected** - Separate edit dialog/page provides better validation UX

## Implementation Notes

### Database Schema
```sql
CREATE TABLE baby (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
CREATE POLICY baby_select_own ON baby FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY baby_insert_own ON baby FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY baby_delete_own ON baby FOR DELETE USING (auth.uid() = user_id);

-- Cascade delete to dependent tables
ALTER TABLE milestone ADD CONSTRAINT milestone_baby_fkey 
  FOREIGN KEY (baby_id) REFERENCES baby(id) ON DELETE CASCADE;
  
ALTER TABLE photo ADD CONSTRAINT photo_baby_fkey 
  FOREIGN KEY (baby_id) REFERENCES baby(id) ON DELETE CASCADE;
```

### Key Code Locations
- Hook: `src/hooks/useBabyProfiles.tsx`
- Components: 
  - `src/components/home/AddBabyDialog.tsx` (create)
  - `src/components/home/NavigationHub.tsx` (selector)
  - `src/components/home/BabyList.tsx` (list view)
- Permissions: `src/lib/abilities.ts` (CASL rules)
- Types: `src/integrations/supabase/types.ts`
- Pages:
  - `src/pages/Home.tsx` (main usage)
  - `src/pages/Onboarding.tsx` (first baby)

### Analytics Events
```typescript
// Creation
trackEvent("baby_created", {
  baby_name: string,
  baby_gender: string
});

// Deletion
trackEvent("baby_deleted", {
  baby_id: string
});

// Failures
trackEvent("baby_creation_failed", {
  error_message: string
});

trackEvent("baby_deletion_failed", {
  error_message: string,
  baby_id: string
});
```

## Open Questions
1. Should we add soft delete to prevent accidental data loss?
2. Should selected baby persist in localStorage for continuity?
3. Do we need baby profile editing UI or is delete/recreate acceptable?
4. Should free tier get 2 babies instead of 1?
5. Should we add age validation (warn if DOB > 10 years ago)?
6. Do we need bulk operations (delete all babies)?

---

**Status:** Production  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Version:** 1.0
