# Capability: Feature Gating

## Overview
Control access to app features based on user's subscription tier and credit balance using CASL (isomorphic authorization library). Provides clear upgrade messaging when users hit limits.

## Inputs

### User Context
All feature gates require the following context to determine permissions:

```typescript
type UserContext = {
  tier: 'free' | 'family' | 'lifetime';  // Subscription tier
  creditsBalance: number;                 // Current credit balance
  babyCount: number;                      // Number of babies user has created
  monthlyPhotoCount: number;              // Photos uploaded this month for current baby
  monthNumber: number;                    // Current month being viewed (1-12+)
  storageUsedBytes?: number;              // Total storage used by user
};
```

### Context Sources
- `tier`, `creditsBalance`: Fetched from `useSubscription()` hook
- `babyCount`: Calculated from `baby` table count
- `monthlyPhotoCount`: Calculated from `photo` table count for current month
- `monthNumber`: Derived from current page route
- `storageUsedBytes`: Sum of `file_size` column in `photo` table

## Feature Gate Rules

### 1. Baby Creation
**Rule:** First baby is free, additional babies require 15 credits or premium subscription.

**Implementation:**
```typescript
// Free tier
if (user.babyCount === 0) {
  can('create', 'Baby');  // First baby is free
} else if (user.creditsBalance >= 15) {
  can('create', 'Baby');  // Has credits for additional baby
} else {
  cannot('create', 'Baby')
    .because('Additional baby profiles require premium subscription or 15 credits');
}

// Premium tiers (family, lifetime)
can('create', 'Baby');  // Unlimited
```

**User Experience:**
- Free user with 0 babies: "Add Baby" button enabled
- Free user with 1 baby, 10 credits: "Add Baby" button shows "Need 15 credits or premium"
- Free user with 1 baby, 20 credits: "Add Baby" button enabled, clicking costs 15 credits
- Premium user: Always enabled

### 2. Photo Uploads
**Rule:** 10 photos per month free, then 1 credit per batch of 10 additional photos.

**Implementation:**
```typescript
// Free tier
if (user.monthlyPhotoCount < 10) {
  can('upload', 'Photo');  // First 10 are free
} else {
  const nextPhotoNumber = user.monthlyPhotoCount + 1;
  const enteringNewBatch = nextPhotoNumber % 10 === 1; // Photos 11, 21, 31, etc.
  
  if (enteringNewBatch) {
    if (user.creditsBalance >= 1) {
      can('upload', 'Photo');  // Has credit to enter new batch
    } else {
      cannot('upload', 'Photo')
        .because('Photo upload limit reached. Need 1 credit to upload more photos (1 credit per 10 photos) or premium subscription');
    }
  } else {
    can('upload', 'Photo');  // Already in batch, no additional credit needed
  }
}

// Premium tiers
can('upload', 'Photo');  // Unlimited
```

**Credit Charging:**
- Photos 1-10: No credits
- Photo 11: **Costs 1 credit** (entering batch 2)
- Photos 12-20: No additional credits (already paid for batch 2)
- Photo 21: **Costs 1 credit** (entering batch 3)
- Photos 22-30: No additional credits

**User Experience:**
```
Free user, 5 photos this month:
  ✓ Upload button enabled
  "5/10 photos used"

Free user, 10 photos, 0 credits:
  ✗ Upload button disabled
  "Photo limit reached. Need 1 credit to upload 10 more photos."
  [Buy Credits] button

Free user, 10 photos, 5 credits:
  ✓ Upload button enabled
  "Uploading photo 11 will cost 1 credit (unlocks 10 more photos)"
  User clicks → Photo uploads → 1 credit deducted → Photos 11-20 now free

Free user, 15 photos, 5 credits:
  ✓ Upload button enabled
  "15/20 photos used (5 more free in this batch)"
```

### 3. Video Uploads
**Rule:** Premium subscription or 2 credits per video.

**Implementation:**
```typescript
// Free tier
if (user.creditsBalance >= 2) {
  can('upload', 'Video');
} else {
  cannot('upload', 'Video')
    .because('Video uploads require premium subscription or 2 credits');
}

// Premium tiers
can('upload', 'Video');  // Unlimited
```

**User Experience:**
- Free user, 0 credits: File picker shows "Videos require premium or 2 credits" [Upgrade]
- Free user, 5 credits: File picker allows video selection, shows "This upload will cost 2 credits"
- Premium user: File picker allows videos with no limit messaging

### 4. Month Access
**Rule:** All 12 months are free for all users.

**Implementation:**
```typescript
// Free tier (enhanced from original 3-month limit)
if (user.monthNumber <= 12) {
  can('access', 'Month');
} else {
  cannot('access', 'Month')
    .because('Month access beyond 12 months requires premium subscription');
}

// Premium tiers
can('access', 'Month');  // Unlimited months
```

**User Experience:**
- Month navigation shows months 1-12 enabled for free users
- Month 13+ shows lock icon with "Premium only"

### 5. Storage Quotas
**Rule:** 500MB for free, 10GB for family, 25GB for lifetime.

**Implementation:**
```typescript
// Check before upload
const quota = getStorageQuotaForTier(user.tier);
const currentUsage = user.storageUsedBytes || 0;
const hasSpace = (currentUsage + fileSizeBytes) <= quota;

if (!hasSpace) {
  cannot('upload', 'Photo')
    .because(`Storage quota exceeded. Used ${formatSize(currentUsage)} of ${formatSize(quota)}`);
}
```

**User Experience:**
- Storage meter shows usage: "250MB / 500MB used (50%)"
- When near limit (>90%): Warning banner "Storage almost full. Upgrade to get 10GB."
- When at limit: Upload button disabled, "Storage full. Delete photos or upgrade."

### 6. Premium Templates
**Rule:** Premium subscription or 3 credits per template use.

**Implementation:**
```typescript
// Free tier
if (user.creditsBalance >= 3) {
  can('create', 'Template');
} else {
  cannot('create', 'Template')
    .because('Premium templates require subscription or 3 credits');
}

// Premium tiers
can('create', 'Template');  // Unlimited
```

### 7. Export Features
**Rule:** Premium subscription or 2 credits per export.

**Implementation:**
```typescript
// Free tier
if (user.creditsBalance >= 2) {
  can('export', 'all');
} else {
  cannot('export', 'all')
    .because('Export features require premium subscription or 2 credits');
}

// Premium tiers
can('export', 'all');  // Unlimited
```

### 8. Analytics Dashboard
**Rule:** Premium subscription only (no credit alternative).

**Implementation:**
```typescript
// Free tier
cannot('read', 'Analytics')
  .because('Analytics dashboard requires premium subscription');

// Premium tiers
can('read', 'Analytics');
```

**User Experience:**
- Free user sees "Analytics" menu item with lock icon
- Clicking shows upsell: "Unlock analytics with Family or Lifetime subscription" [Upgrade]

## Process Flow

### Feature Gate Check

```
┌─────────────────────────────────────────────────────────────┐
│                  FEATURE GATE CHECK                         │
└─────────────────────────────────────────────────────────────┘

User Action → Component calls useAbilities()
  │
  ▼
┌──────────────────────────────────────────────────┐
│ useAbilities Hook                                │
│                                                  │
│ 1. Fetch subscription data (tier, status)       │
│ 2. Fetch credits balance                        │
│ 3. Build UserContext object                     │
│    {                                             │
│      tier: "free",                               │
│      creditsBalance: 10,                         │
│      babyCount: 1,                               │
│      monthlyPhotoCount: 12                       │
│    }                                             │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│ abilities.ts - createAbilityFor(userContext)    │
│                                                  │
│ Switch on tier:                                  │
│   case 'free':                                   │
│     // Apply free tier rules                    │
│     if (babyCount === 0) can('create', 'Baby'); │
│     else if (credits >= 15) can('create', ...)  │
│     else cannot('create', 'Baby').because(...); │
│                                                  │
│   case 'family':                                 │
│   case 'lifetime':                               │
│     // Premium users can do everything          │
│     can('create', 'Baby');                       │
│     can('upload', 'Video');                      │
│     can('export', 'all');                        │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│ Return AppAbility object                         │
│ Component calls: check('upload', 'Photo')        │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│ checkAbility() returns:                          │
│ {                                                │
│   allowed: false,                                │
│   creditsRequired: 1,                            │
│   reason: "Need 1 credit to upload 10 more"     │
│   requiresUpgrade: false  (credits can help)    │
│ }                                                │
└──────────────────┬───────────────────────────────┘
                   │
                   ├─ allowed === true ──▶ Enable feature
                   │
                   ├─ creditsRequired > 0 ──▶ Show "Costs X credits" with option to proceed
                   │
                   └─ requiresUpgrade === true ──▶ Show "Premium only" with [Upgrade] button
```

### Credit-Based Action Execution

```
┌─────────────────────────────────────────────────────────────┐
│          EXECUTE ACTION WITH CREDIT DEDUCTION               │
└─────────────────────────────────────────────────────────────┘

User clicks "Upload Video" (costs 2 credits)
  │
  ▼
Component: executeWithAbility('upload', 'Video', uploadFn, "Video upload")
  │
  ▼
┌────────────────────────────────────────────────────┐
│ 1. Check if action is allowed                     │
│    result = check('upload', 'Video')              │
│                                                    │
│    result.allowed === false &&                    │
│    result.creditsRequired === null                │
│    → Action forbidden (premium only)              │
│    → Toast: "Video uploads require premium"       │
│    → Return false                                 │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼ allowed OR creditsRequired > 0
┌────────────────────────────────────────────────────┐
│ 2. Check if credits needed                        │
│    creditsRequired = 2                            │
│    currentBalance = 5                             │
│                                                    │
│    if (currentBalance < creditsRequired)          │
│      → Toast: "Insufficient credits. Need 2."    │
│      → Return false                               │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼ Has enough credits
┌────────────────────────────────────────────────────┐
│ 3. Execute action FIRST (before spending credits) │
│    try {                                           │
│      await uploadFn();  // Upload the video       │
│    } catch (error) {                              │
│      → Action failed, credits NOT deducted        │
│      → Toast: "Upload failed"                     │
│      → Return false                               │
│    }                                               │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼ Action succeeded
┌────────────────────────────────────────────────────┐
│ 4. Deduct credits (after success)                 │
│    await spendCredits({                           │
│      amount: 2,                                   │
│      description: "Video upload"                  │
│    });                                            │
│                                                    │
│    → Edge function called                         │
│    → user_credits.balance -= 2                    │
│    → credit_transactions record created           │
│    → React Query invalidates cache                │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────┐
│ 5. Success                                         │
│    Toast: "Video uploaded"                        │
│    UI updates balance: 5 → 3 credits              │
│    Return true                                     │
└────────────────────────────────────────────────────┘
```

**Key Insight:** Action executes BEFORE credits are deducted. If action fails, user doesn't lose credits. This prevents frustrating scenarios where credits are spent but action fails due to network errors, validation issues, etc.

## Outputs

### Gate Check Result
```typescript
type GateResult = {
  allowed: boolean;           // Can user perform action now?
  creditsRequired: number | null;  // Credits needed (if free tier)
  reason: string | null;      // Human-readable denial reason
  requiresUpgrade: boolean;   // Premium-only feature (credits can't help)
};
```

### Examples

**Free user with 0 credits trying to create 2nd baby:**
```typescript
{
  allowed: false,
  creditsRequired: 15,
  reason: "Additional baby profiles require premium subscription or 15 credits",
  requiresUpgrade: false  // Credits CAN help
}
```

**Free user with 20 credits trying to create 2nd baby:**
```typescript
{
  allowed: true,
  creditsRequired: 15,  // Will be deducted on execution
  reason: null,
  requiresUpgrade: false
}
```

**Premium user trying to view analytics:**
```typescript
{
  allowed: true,
  creditsRequired: null,  // No credits needed for premium
  reason: null,
  requiresUpgrade: false
}
```

**Free user with 100 credits trying to view analytics:**
```typescript
{
  allowed: false,
  creditsRequired: null,  // Credits CAN'T help (premium-only)
  reason: "Analytics dashboard requires premium subscription",
  requiresUpgrade: true  // Must upgrade
}
```

## Business Rules

### Tier Hierarchy
```
Free Tier
  ↓ Limited features, can use credits
  
Family Subscription ($2.50/month or $25/year)
  ↓ Unlimited features, renewable
  
Lifetime Premium ($62 one-time)
  ↓ Unlimited features, permanent
```

All premium tiers (Family and Lifetime) have identical permissions. Difference is payment model, not features.

### Credit Costs (Defined in abilities.ts)
```typescript
export const CREDIT_COSTS = {
  EXTRA_BABY: 15,      // Creating 2nd, 3rd, etc. baby
  VIDEO_UPLOAD: 2,     // Per video upload
  EXTRA_PHOTOS: 1,     // Per batch of 10 photos (photos 11-20, 21-30, etc.)
  PREMIUM_TEMPLATES: 3,// Using premium milestone templates
  EXPORT_FEATURES: 2,  // Exporting data (PDF, etc.)
} as const;
```

### Storage Quotas (Defined in abilities.ts)
```typescript
export const STORAGE_QUOTAS = {
  FREE: 500 * ONE_MB,     // 500MB
  FAMILY: 10 * ONE_GB,    // 10GB
  LIFETIME: 25 * ONE_GB,  // 25GB
} as const;
```

### Milestones Exception
**Milestones are FREE for all tiers.** No credit cost, no premium requirement. This is a core feature to encourage engagement.

```typescript
// All users can create, update, delete milestones
can('create', 'Milestone');
can('update', 'Milestone');
can('delete', 'Milestone');
```

### Credit Spending Order
1. **Check permission** → Can user do this (tier + credits)?
2. **Execute action** → Upload, create, export, etc.
3. **Deduct credits** → Only if action succeeded
4. **Update balance** → Via edge function (atomic)

This order prevents credit loss on failed actions.

## Edge Cases

### Race Condition: Simultaneous Actions
**Scenario:** User with 2 credits uploads two videos simultaneously (each costs 2 credits).

**Handling:**
- Both requests check balance (both see 2 credits available)
- First request executes and deducts 2 credits → balance = 0
- Second request tries to deduct 2 credits → edge function fails with "Insufficient credits"
- Second action fails, first action succeeds

**Mitigation:**
- Edge function uses database-level CHECK constraint (balance >= 0)
- Atomic balance updates prevent overdraft

### Credit Balance During Pending Payment
**Scenario:** User buys 30 credits (pending), sees balance as 50 (had 50 before). Payment approved while user is uploading video.

**Handling:**
- Before approval: `fetchUserCredits()` excludes 30 pending credits → shows 50
- User uploads video (costs 2) → balance = 48
- Admin approves payment → balance = 48 + 30 = 78
- React Query invalidates cache → UI updates to 78

**No issues:** User can't "double spend" pending credits.

### Storage Quota After Downgrade
**Scenario:** User on Family tier (10GB) uses 8GB, then cancels subscription (back to Free 500MB).

**Handling:**
- User's storage: 8GB used, 500MB quota
- Uploads are blocked: "Storage quota exceeded (8GB / 500MB)"
- User must delete photos to get under 500MB, or re-upgrade

**Mitigation:**
- Grace period: Allow viewing existing photos for 30 days after downgrade
- Soft enforcement: Block uploads but don't delete files
- Upgrade prompt: "You're using 8GB. Upgrade to Family to upload more."

### Expired Family Subscription
**Scenario:** User's annual subscription ends (1 year after `start_date`).

**Handling:**
- Cron job checks `end_date` < NOW() daily
- Updates `subscription.tier = 'free', status = 'free'`
- User's permissions revert to free tier immediately
- Email notification: "Your subscription expired. Renew to regain premium access."

**User Experience:**
- Next app load: User sees free tier limits
- Existing data (babies, photos) remains intact
- Upload limits enforced: 10 photos/month, no videos (unless has credits)

### Admin Grants Manual Credits
**Scenario:** Support grants 100 free credits to a user as compensation.

**Handling:**
- Admin uses Admin Panel "Grant Credits" button
- Calls edge function with `transaction_type: 'purchase'`, `payment_transaction_id: NULL`
- `credit_transactions` record created with description "Manual grant - compensation"
- User sees updated balance immediately

## UI Locations

### Feature Gate Indicators

**1. Navigation Hub**
- Credits balance badge (always visible for free tier)
- "Upgrade" button for free tier users

**2. Baby Management**
- "Add Baby" button shows:
  - Free tier, 0 babies: No indication (free)
  - Free tier, 1+ babies, <15 credits: Disabled with tooltip "Need 15 credits or premium"
  - Free tier, 1+ babies, ≥15 credits: Enabled with warning "Creating this baby will cost 15 credits"

**3. Photo Uploader**
- Below file picker: "5/10 photos used this month"
- When at limit: "Photo limit reached. 1 credit unlocks 10 more photos. [Buy Credits]"
- When uploading with credits: "This upload will cost 1 credit (photos 11-20)"

**4. Video Selection**
- File picker shows video option only if allowed
- If blocked: Grayed out with tooltip "Video uploads require 2 credits or premium"
- If allowed with credits: "Selecting video will cost 2 credits"

**5. Month Navigation**
- Free tier: Months 1-12 enabled, 13+ locked
- Locked months show lock icon with tooltip "Premium subscription unlocks all months"

**6. Storage Meter** (Settings page or bottom of Photo Gallery)
```
Storage: [██████░░░░] 250MB / 500MB (50%)
[Upgrade to 10GB] button (if free tier)
```

**7. Feature Upsell Modals**
When user hits a gate:
```
┌────────────────────────────────────────┐
│  Unlock Video Uploads                 │
├────────────────────────────────────────┤
│  Video uploads are available with:    │
│                                        │
│  • 2 credits per video                │
│    [Buy Credits] button               │
│                                        │
│  • Family Subscription (unlimited)    │
│    [Upgrade to Family] button         │
│                                        │
│  • Lifetime Premium (unlimited)       │
│    [Get Lifetime Access] button       │
│                                        │
│  [Maybe Later] [Upgrade]              │
└────────────────────────────────────────┘
```

## Dependencies

### Technical
- **CASL Library** (`@casl/ability`): Core authorization engine
- **useSubscription Hook**: Provides tier, creditsBalance, spendCredits mutation
- **useAbilities Hook**: Wraps CASL ability with user context
- **Edge Functions**: `spend-credits` for atomic credit deduction
- **React Query**: Cache management for subscription/credits data

### Data
- **subscription table**: User's tier and status
- **user_credits table**: Current balance
- **credit_transactions table**: Audit log of spending
- **photo table**: For calculating monthlyPhotoCount, storageUsedBytes
- **baby table**: For calculating babyCount

## Implementation Notes

### abilities.ts - Core Rules Engine
```typescript
export function createAbilityFor(user: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Base permissions (all users)
  can('read', 'all');
  can('create', 'Milestone');
  can('update', 'Milestone');
  can('delete', 'Milestone');

  // Tier-specific permissions
  switch (user.tier) {
    case 'lifetime':
    case 'family':
      // Premium users can do everything
      can('create', 'Baby');
      can('upload', 'Photo');
      can('upload', 'Video');
      can('access', 'Month');
      can('create', 'Template');
      can('export', 'all');
      can('read', 'Analytics');
      break;

    case 'free':
      // Free tier with conditional rules
      
      // Baby creation
      if (user.babyCount === 0) {
        can('create', 'Baby');
      } else if (user.creditsBalance >= CREDIT_COSTS.EXTRA_BABY) {
        can('create', 'Baby');
      } else {
        cannot('create', 'Baby').because('Additional baby profiles require premium subscription or 15 credits');
      }

      // Photo uploads (batch logic)
      if (user.monthlyPhotoCount < 10) {
        can('upload', 'Photo');
      } else {
        const nextPhotoNumber = user.monthlyPhotoCount + 1;
        const enteringNewBatch = nextPhotoNumber % 10 === 1;
        
        if (enteringNewBatch && user.creditsBalance >= CREDIT_COSTS.EXTRA_PHOTOS) {
          can('upload', 'Photo');
        } else if (!enteringNewBatch) {
          can('upload', 'Photo');  // Already in batch
        } else {
          cannot('upload', 'Photo').because('Photo upload limit reached. Need 1 credit to upload more photos (1 credit per 10 photos) or premium subscription');
        }
      }

      // Video uploads
      if (user.creditsBalance >= CREDIT_COSTS.VIDEO_UPLOAD) {
        can('upload', 'Video');
      } else {
        cannot('upload', 'Video').because('Video uploads require premium subscription or 2 credits');
      }

      // Month access
      if (user.monthNumber <= 12) {
        can('access', 'Month');
      } else {
        cannot('access', 'Month').because('Month access beyond 12 months requires premium subscription');
      }

      // Premium templates
      if (user.creditsBalance >= CREDIT_COSTS.PREMIUM_TEMPLATES) {
        can('create', 'Template');
      } else {
        cannot('create', 'Template').because('Premium templates require subscription or 3 credits');
      }

      // Export features
      if (user.creditsBalance >= CREDIT_COSTS.EXPORT_FEATURES) {
        can('export', 'all');
      } else {
        cannot('export', 'all').because('Export features require premium subscription or 2 credits');
      }

      // Analytics (premium-only, no credit alternative)
      cannot('read', 'Analytics').because('Analytics dashboard requires premium subscription');
      break;
  }

  return build();
}
```

### useAbilities Hook - Context Provider
```typescript
export const useAbilities = (context?: Partial<UserContext>) => {
  const { tier, creditsBalance, spendCredits } = useSubscription();

  // Build user context
  const userContext: UserContext = useMemo(() => ({
    tier: tier as 'free' | 'family' | 'lifetime',
    creditsBalance: creditsBalance || 0,
    babyCount: context?.babyCount || 0,
    monthlyPhotoCount: context?.monthlyPhotoCount || 0,
    monthNumber: context?.monthNumber || 1,
    storageUsedBytes: context?.storageUsedBytes || 0,
  }), [tier, creditsBalance, context]);

  // Create ability
  const ability = useMemo(() => createAbilityFor(userContext), [userContext]);

  // Check method
  const check = (action: Actions, subject: Subjects) => {
    return checkAbility(ability, action, subject, userContext);
  };

  // Execute with credit deduction
  const executeWithAbility = async (
    action: Actions,
    subject: Subjects,
    executeFunction: () => Promise<any>,
    description?: string
  ): Promise<boolean> => {
    const abilityCheck = check(action, subject);

    // If not allowed and credits can't help → deny
    if (!abilityCheck.allowed && abilityCheck.creditsRequired === null) {
      toast.error(abilityCheck.reason || 'Action not permitted');
      return false;
    }

    // If credits needed
    if (abilityCheck.creditsRequired > 0) {
      if (creditsBalance < abilityCheck.creditsRequired) {
        toast.error(`Insufficient credits. You need ${abilityCheck.creditsRequired} credits for this action.`);
        return false;
      }

      try {
        // 1. Execute action FIRST
        await executeFunction();

        // 2. Deduct credits AFTER success
        await spendCredits({
          amount: abilityCheck.creditsRequired,
          description: description || `${action} ${subject}`
        });
        
        return true;
      } catch (error) {
        console.error('Error executing action with credits:', error);
        toast.error(error.message || 'Action failed. Please try again.');
        return false;
      }
    } else {
      // Action allowed without credits
      try {
        await executeFunction();
        return true;
      } catch (error) {
        console.error('Error executing action:', error);
        toast.error('Action failed. Please try again.');
        return false;
      }
    }
  };

  return {
    ability,
    check,
    executeWithAbility,
    canCreateBaby: () => check('create', 'Baby'),
    canUploadPhoto: () => check('upload', 'Photo'),
    canUploadVideo: () => check('upload', 'Video'),
    // ... more convenience methods
  };
};
```

### Component Usage Example
```typescript
// In AddBabyDialog.tsx
function AddBabyDialog() {
  const { createBaby } = useBabyProfiles();
  const { executeWithAbility, check } = useAbilities({ babyCount: babies.length });

  // Check if can create baby
  const babyGate = check('create', 'Baby');

  const handleSubmit = async (data: CreateBabyData) => {
    // Execute with automatic credit deduction
    const success = await executeWithAbility(
      'create',
      'Baby',
      () => createBaby(data),
      'Extra baby profile'
    );

    if (success) {
      toast.success('Baby profile created!');
      onClose();
    }
  };

  return (
    <Dialog>
      <Button
        disabled={!babyGate.allowed}
        onClick={() => setOpen(true)}
      >
        Add Baby {babyGate.creditsRequired > 0 && `(${babyGate.creditsRequired} credits)`}
      </Button>
      
      {!babyGate.allowed && (
        <Tooltip>{babyGate.reason}</Tooltip>
      )}
    </Dialog>
  );
}
```

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
