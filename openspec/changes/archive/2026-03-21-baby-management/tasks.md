# Baby Management - Implementation Tasks

## Overview
This is a **reverse-engineered** task breakdown documenting how the Baby Management system was implemented. These tasks represent the conceptual phases of work, not an implementation TODO list.

---

## Phase 1: Database & Schema Design

### Task 1.1: Design Baby Data Model
- [x] Define baby table schema
- [x] Identify required fields (id, user_id, name, date_of_birth, gender)
- [x] Add timestamp fields (created_at, updated_at)
- [x] Document relationships (babies → milestones, babies → photos)

### Task 1.2: Create Database Table
- [x] Create `baby` table with schema
- [x] Add UUID primary key with auto-generation
- [x] Add foreign key to `auth.users`
- [x] Add indexes (user_id, created_at)

### Task 1.3: Setup Row-Level Security
- [x] Create SELECT policy (`baby_select_own`)
- [x] Create INSERT policy (`baby_insert_own`)
- [x] Create DELETE policy (`baby_delete_own`)
- [x] Create UPDATE policy (`baby_update_own`)
- [x] Test RLS policies for security

### Task 1.4: Configure Cascade Deletes
- [x] Add FK constraint on `milestone.baby_id` with CASCADE
- [x] Add FK constraint on `photo.baby_id` with CASCADE
- [x] Test cascade behavior

---

## Phase 2: Backend Logic & Hooks

### Task 2.1: Create useBabyProfiles Hook
- [x] Setup hook skeleton with useAuth integration
- [x] Implement baby list fetching
- [x] Add loading/error state management
- [x] Order babies by created_at DESC

### Task 2.2: Implement Baby Creation
- [x] Create `createBaby` mutation function
- [x] Add gender field (optional, defaults to null)
- [x] Insert baby with user_id from auth context
- [x] Return new baby data
- [x] Implement refetch on success

### Task 2.3: Implement Baby Deletion
- [x] Create `deleteBaby` mutation function
- [x] Add double user_id check (RLS + query)
- [x] Handle success/error callbacks
- [x] Implement refetch after delete

### Task 2.4: Add Analytics Tracking
- [x] Integrate PostHog tracking
- [x] Track `baby_created` event
- [x] Track `baby_deleted` event
- [x] Track `baby_creation_failed` event
- [x] Track `baby_deletion_failed` event
- [x] Add database error tracking

---

## Phase 3: Permission System

### Task 3.1: Design CASL Ability Rules
- [x] Define actions (create, read, update, delete)
- [x] Define subjects (Baby)
- [x] Create `UserContext` type with tier/credits/babyCount

### Task 3.2: Implement Baby Creation Rules
- [x] Free tier: Allow first baby (babyCount === 0)
- [x] Free tier: Block additional babies if credits < 15
- [x] Free tier: Allow with credits (≥15)
- [x] Premium: Unlimited babies
- [x] Add helpful error messages

### Task 3.3: Create useAbilities Hook
- [x] Integrate with useSubscription
- [x] Implement `canCreateBaby()` check
- [x] Return structured result (allowed, reason, creditsRequired)
- [x] Add `showUpgradePrompt()` helper

---

## Phase 4: UI Components

### Task 4.1: Create AddBabyDialog Component
- [x] Build modal dialog with shadcn/ui
- [x] Add form fields (name, birthdate, gender)
- [x] Integrate React Hook Form
- [x] Add client-side validation
- [x] Handle form submission
- [x] Show success/error toasts
- [x] Reset form on close

### Task 4.2: Build NavigationHub Component
- [x] Create baby selector card section
- [x] Display first 4 babies as clickable cards
- [x] Add "Add Baby" button
- [x] Implement delete dropdown menu
- [x] Create selected baby context card
- [x] Add links to Wrapped and Gallery

### Task 4.3: Create BabySelector Component
- [x] Build dropdown selector with shadcn Select
- [x] Show all babies in dropdown
- [x] Display selected baby with icon
- [x] Handle selection changes
- [x] Add quick-switch tabs (if ≤4 babies)

### Task 4.4: Build BabyCard Component (Alternative UI)
- [x] Create card with baby info
- [x] Add delete button with AlertDialog
- [x] Show age calculation
- [x] Add "View Milestones" button
- [x] Implement selection highlight

---

## Phase 5: State Management

### Task 5.1: Setup Selected Baby State
- [x] Add state in Home.tsx (`selectedBaby`)
- [x] Pass down to child components
- [x] Implement selection handler

### Task 5.2: Implement Auto-Selection
- [x] Auto-select first baby on load
- [x] Auto-select new baby on creation
- [x] Handle selection when baby deleted

### Task 5.3: React Query Integration
- [x] Setup query keys (`['babies', user.id]`)
- [x] Implement cache invalidation on create
- [x] Implement cache invalidation on delete
- [x] Handle optimistic updates (optional, not implemented)

---

## Phase 6: Integration & UX

### Task 6.1: Home Page Integration
- [x] Import all baby components
- [x] Wire up create/delete handlers
- [x] Add permission checks before dialog open
- [x] Handle delete confirmation
- [x] Show empty state when no babies

### Task 6.2: Onboarding Flow
- [x] Create onboarding page
- [x] Add baby creation form
- [x] Skip permission check (first baby free)
- [x] Redirect to /app on success

### Task 6.3: Month Page Integration
- [x] Pass selectedBabyId to useMonthPage
- [x] Filter milestones by baby
- [x] Filter photos by baby
- [x] Handle baby switching via URL

### Task 6.4: Wrapped & Gallery Integration
- [x] Use baby ID from route params
- [x] Fetch baby-specific data
- [x] Display baby name in UI

---

## Phase 7: Testing & Polish

### Task 7.1: Manual Testing
- [x] Test create flow (free tier, premium tier)
- [x] Test delete flow with confirmation
- [x] Test selection persistence
- [x] Test permission gating
- [x] Test multi-baby scenarios
- [x] Test edge cases (no babies, last baby deletion)

### Task 7.2: Analytics Verification
- [x] Verify events firing in PostHog
- [x] Check event properties
- [x] Validate error tracking

### Task 7.3: Mobile Responsiveness
- [x] Test on mobile devices
- [x] Verify dropdown works on touch
- [x] Check card layout on small screens

---

## Known Gaps (implemented in follow-up)

### Edit Functionality
- [x] Create EditBabyDialog component
- [x] Add updateBaby function to hook
- [x] Add "Edit" button to UI
- [x] Implement form pre-population

### Soft Delete
- [x] Add deleted_at column
- [x] Update queries to filter deleted
- [x] Add restore functionality
- [x] Update RLS policies

### Profile Photos
- [x] Add photo_url column
- [x] Implement photo upload
- [x] Add storage cleanup
- [x] Display photos in UI

### Selection Persistence
- [x] Save selectedBabyId to localStorage
- [x] Load from localStorage on mount
- [x] Sync across tabs

---

## Dependencies Between Tasks

```
Database (1.1-1.4)
  │
  ├─── Backend (2.1-2.4)
  │     │
  │     └─── Permission System (3.1-3.3)
  │           │
  │           └─── UI Components (4.1-4.4)
  │                 │
  │                 └─── State Management (5.1-5.3)
  │                       │
  │                       └─── Integration (6.1-6.4)
  │                             │
  │                             └─── Testing (7.1-7.3)
```

---

## Estimated Effort (Actual)

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Database | 4 hours |
| Phase 2 | Backend | 8 hours |
| Phase 3 | Permissions | 6 hours |
| Phase 4 | UI Components | 16 hours |
| Phase 5 | State Management | 4 hours |
| Phase 6 | Integration | 12 hours |
| Phase 7 | Testing & Polish | 8 hours |
| **Total** | **58 hours** | **~2 weeks** |

---

**Status:** Completed (in production)  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-21  
**Version:** 1.0
