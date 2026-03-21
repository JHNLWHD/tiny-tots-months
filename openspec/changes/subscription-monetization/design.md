# Subscription & Monetization - System Design

## Architecture Overview

The monetization system consists of four interconnected subsystems:

```
┌─────────────────────────────────────────────────────────────┐
│                   MONETIZATION SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐ │
│  │  Subscription│───▶│    Credits    │───▶│   Feature    │ │
│  │  Management  │    │    System     │    │    Gating    │ │
│  └──────────────┘    └───────────────┘    └──────────────┘ │
│         │                     │                    │        │
│         └─────────────────────┼────────────────────┘        │
│                               │                             │
│                     ┌─────────▼────────┐                    │
│                     │  Payment System  │                    │
│                     └──────────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Relationships

1. **Payment System** → Handles all payment proof uploads and transaction tracking
2. **Subscription Management** → Controls tier assignment and subscription lifecycle
3. **Credits System** → Tracks credit balance, purchases, and spending
4. **Feature Gating** → Enforces tier-based and credit-based permissions using CASL

## Data Model

### Core Tables

#### 1. `subscription` Table
Tracks user subscription tier and status.

```sql
CREATE TABLE subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'family', 'lifetime')),
  status VARCHAR(20) DEFAULT 'free' CHECK (status IN ('free', 'pending', 'active')),
  currency VARCHAR(3) DEFAULT 'PHP',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  payment_proof TEXT,
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscription FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscription"
  ON subscription FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscription FOR UPDATE
  USING (auth.uid() = user_id);
```

**Fields:**
- `tier`: Current subscription level (free, family, lifetime)
- `status`: Current state (free, pending approval, active)
- `payment_proof`: Legacy field for direct image URL
- `payment_transaction_id`: Link to payment_transactions table
- `end_date`: Expiration date (NULL for free/lifetime, set for family annual)

#### 2. `user_credits` Table
Tracks user's current credit balance.

```sql
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  credits_balance INTEGER DEFAULT 0 CHECK (credits_balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);
```

**Business Rules:**
- One record per user (UNIQUE constraint on user_id)
- Balance cannot be negative (CHECK constraint)
- Updated atomically via edge functions

#### 3. `credit_transactions` Table
Immutable log of all credit purchases and spends.

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund')),
  description TEXT,
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

**Transaction Types:**
- `purchase`: Credits bought (amount is positive, links to payment_transaction_id)
- `spend`: Credits used (amount is negative)
- `refund`: Credits returned (amount is positive)

**Key Insights:**
- Transactions are append-only (no updates/deletes)
- `payment_transaction_id` links purchases to payments
- Balance is derived from SUM of transactions (but cached in `user_credits`)

#### 4. `payment_transactions` Table
Tracks all payment proofs and their approval status.

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_in_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(50),
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('credits', 'subscription', 'lifetime')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  payment_proof_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
  ON payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Status Flow:**
```
pending → completed (admin approves) → credits granted / subscription activated
        ↘ rejected (admin rejects) → no action
```

### Relationships Diagram

```
┌───────────────┐
│     users     │
└───────┬───────┘
        │ (1)
        │
        ├──────────────────┬──────────────────┬──────────────────┐
        │ (1)              │ (1)              │ (1)              │ (*)
        ▼                  ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│subscription  │  │ user_credits │  │credit_trans  │  │payment_trans     │
│              │  │              │  │  actions     │  │  actions         │
│tier: family  │  │balance: 50   │  │type: spend   │  │status: pending   │
│status: active│  │              │  │amount: -15   │  │type: credits     │
└──────────────┘  └──────────────┘  └──────┬───────┘  └──────────────────┘
                                            │                  ▲
                                            │ (payment_        │
                                            │  transaction_id) │
                                            └──────────────────┘
```

## Key Design Decisions

### 1. Hybrid Monetization Model
**Decision:** Four-tier pricing (Free, Credits, Family, Lifetime) instead of two-tier (Free, Premium).

**Rationale:**
- **Free tier attracts users**: 1 baby, 12 months, 10 photos/month is enough for many users to experience value
- **Credits provide flexibility**: Pay-as-you-go for users who need "just one more baby" without committing to subscription
- **Family subscription for heavy users**: Unlimited everything at affordable price
- **Lifetime for committed users**: One-time payment captures revenue upfront

**Alternatives Considered:**
- Simple Free + Premium: Less flexible, harder to upsell free users
- Usage-based pricing: Too complex for parents, mental overhead

**Trade-offs:**
- ✅ Better conversion funnel (free → credits → subscription)
- ✅ Captures more revenue from casual users
- ❌ More complex to implement and explain
- ❌ Credit system requires careful UX to avoid confusion

### 2. Manual Payment Verification
**Decision:** GCash/PayPal manual proof-of-payment upload with admin approval workflow.

**Rationale:**
- **Market fit**: Philippines market heavily uses GCash, automated gateways have high fees
- **Quick to ship**: No payment gateway integration complexity
- **Trust**: Users comfortable with GCash, less friction than credit card
- **Revenue protection**: Admin approval prevents fraud

**Alternatives Considered:**
- Stripe/PayPal automated: Higher fees (3-5%), complex integration, international-focused
- Xendit/PayMongo: Philippines-focused but still 2-3% fees + integration time

**Trade-offs:**
- ✅ Zero transaction fees
- ✅ Fast to implement
- ✅ Works with familiar payment methods
- ❌ Manual approval delay (up to 24 hours)
- ❌ Doesn't scale with high volume
- ❌ Admin overhead

**Future Path:** Add automated Stripe/Xendit for instant credits once volume justifies fees.

### 3. Credit System Architecture
**Decision:** Atomic credit operations via Supabase Edge Functions, not client-side transactions.

**Rationale:**
- **Consistency**: Edge functions ensure balance updates and transaction logs are atomic
- **Security**: Credits can't be manipulated client-side
- **Audit trail**: All transactions immutable and traceable

**Implementation:**
```typescript
// Edge function: purchase-credits
export async function handler(req: Request) {
  const { amount, credits, paymentTransactionId } = await req.json();
  
  // 1. Verify payment transaction exists and is completed
  const payment = await supabase
    .from('payment_transactions')
    .select('status')
    .eq('id', paymentTransactionId)
    .single();
  
  if (payment.status !== 'completed') {
    throw new Error('Payment not yet approved');
  }
  
  // 2. Atomic credit grant in transaction
  await supabase.rpc('grant_credits', {
    p_user_id: userId,
    p_amount: credits,
    p_payment_transaction_id: paymentTransactionId
  });
}
```

**Trade-offs:**
- ✅ Bulletproof consistency
- ✅ Prevents race conditions
- ✅ Full audit trail
- ❌ Requires edge function deployment
- ❌ Slightly slower than direct DB access

### 4. Feature Gating with CASL
**Decision:** Use CASL (isomorphic authorization) for all feature access control.

**Rationale:**
- **Centralized rules**: All permission logic in `abilities.ts`, not scattered across components
- **Type-safe**: TypeScript integration prevents permission bugs
- **Flexible**: Supports tier-based, credit-based, and usage-based rules
- **Isomorphic**: Same rules work client and server-side (future)

**Example Ability Rules:**
```typescript
// Free tier: First baby free, additional cost credits
if (user.babyCount === 0) {
  can('create', 'Baby');
} else if (user.creditsBalance >= 15) {
  can('create', 'Baby');
} else {
  cannot('create', 'Baby').because('Need 15 credits or premium');
}

// Premium tiers: Everything allowed
if (user.tier === 'family' || user.tier === 'lifetime') {
  can('create', 'Baby');
  can('upload', 'Video');
  can('export', 'all');
}
```

**Trade-offs:**
- ✅ Single source of truth
- ✅ Easier to test and update rules
- ✅ Clear upgrade messaging (can show exactly what's needed)
- ❌ Learning curve for CASL
- ❌ Slightly more boilerplate

### 5. Pending Payment Credits Exclusion
**Decision:** Exclude credits from pending payments in displayed balance.

**Rationale:**
- **Prevent fraud**: Users can't immediately use credits before payment is verified
- **User expectation**: Balance shows "available now" credits
- **Reversibility**: If payment rejected, no cleanup needed

**Implementation:**
```typescript
// In fetchUserCredits()
const pendingCredits = creditTransactions
  .filter(ct => paymentTransaction.status === 'pending')
  .reduce((sum, ct) => sum + ct.amount, 0);

return {
  ...data,
  credits_balance: data.credits_balance - pendingCredits
};
```

**Trade-offs:**
- ✅ Security against fraud
- ✅ Accurate "available" balance
- ❌ Users see credits instantly in DB but not in UI (could confuse)
- ❌ Additional complexity in balance calculation

### 6. Storage Quota Enforcement
**Decision:** Track file size in database, enforce quota at upload time.

**Rationale:**
- **Fair limits**: Different tiers get different storage (500MB free, 10GB family, 25GB lifetime)
- **Client-side feedback**: Can show storage meter before upload
- **Monetization lever**: Storage quota is a premium upsell

**Implementation:**
- `photo` table has `file_size` column (bytes)
- `useAbilities` hook calculates total usage from photo records
- Upload is blocked if `usage + file_size > quota`

**Trade-offs:**
- ✅ Clear upgrade path
- ✅ Real-time storage meter in UI
- ❌ Database query to sum file sizes (optimized with index)
- ❌ Orphaned storage files don't count (acceptable trade-off)

### 7. Subscription Lifecycle
**Decision:** No auto-renewal for Family Subscription initially.

**Rationale:**
- **Simplicity**: Manual payment avoids recurring billing complexity
- **User control**: No surprise charges, users renew intentionally
- **Philippines market**: Annual subscriptions common, less expectation of auto-renewal

**Future Enhancement:** When adding Stripe, enable auto-renewal with explicit opt-in.

**Status Flow:**
```
FREE (tier=free, status=free)
  ↓ Upload payment proof
PENDING FAMILY (tier=family, status=pending)
  ↓ Admin approves
ACTIVE FAMILY (tier=family, status=active, end_date=+1 year)
  ↓ end_date passes
EXPIRED FAMILY (tier=free, status=free) ← User can renew
```

For Lifetime:
```
FREE (tier=free, status=free)
  ↓ Upload payment proof
PENDING LIFETIME (tier=lifetime, status=pending)
  ↓ Admin approves
ACTIVE LIFETIME (tier=lifetime, status=active, end_date=NULL)
  ↓ Forever
ACTIVE LIFETIME (never expires)
```

### 8. Credit Spending Strategy
**Decision:** Execute action first, then deduct credits (not pre-deduct).

**Rationale:**
- **User experience**: If action fails (e.g., photo upload errors), credits aren't wasted
- **Atomicity**: Edge function `spend-credits` is called only after successful action
- **Fairness**: Users only pay for successful operations

**Error Handling:**
- If action succeeds but credit deduction fails → Log critical error, contact support
- If action fails → No credits deducted, user can retry

**Trade-offs:**
- ✅ Fair to users
- ✅ Prevents "lost credits" complaints
- ❌ Small window for users to use credits they don't have (race condition)
- ❌ Slightly more complex error handling

### 9. Multi-Currency Support
**Decision:** PHP and USD pricing, timezone-based auto-detection, no currency conversion.

**Rationale:**
- **Target markets**: Philippines (primary) and International (secondary)
- **Simplicity**: Fixed prices per currency, no exchange rate API
- **User experience**: Auto-detect via timezone, manual toggle available

**Configuration:**
```typescript
// config/payment.ts
export const PAYMENT_CONFIG = {
  supportedCurrencies: "PHP" | "USD" | "BOTH",
  gcashNumber: "0917-123-4567",
};
```

**Trade-offs:**
- ✅ Simple implementation
- ✅ No exchange rate volatility
- ❌ Can't support all countries
- ❌ Users can't pay in local currency if not PHP/USD

### 10. No Refunds (Initially)
**Decision:** No self-service refunds, manual process via support.

**Rationale:**
- **Simplicity**: Manual payments don't have automated refund mechanisms
- **Trust**: Small user base, can handle manually
- **Fraud prevention**: Reduces chargeback gaming

**Future Path:** Add self-service refunds when using Stripe.

## Data Flow Diagrams

### Credit Purchase Flow

```
┌───────┐
│ User  │
└───┬───┘
    │ 1. Select credit package (10, 30, or 70 credits)
    ▼
┌─────────────────┐
│ Upgrade.tsx     │ Get pricing from usePricing()
└────────┬────────┘
         │ 2. Click "Buy Credits"
         ▼
┌──────────────────────┐
│ PaymentFlow.tsx      │
│                      │
│ Steps:               │
│ - Method: GCash/PayPal
│ - Details: Amount, Account
│ - Proof: Upload screenshot
│ - Processing: Submit
└────────┬─────────────┘
         │ 3. Upload payment proof + create payment_transaction
         ▼
┌─────────────────────────────┐
│ payment_transactions        │
│ status: "pending"           │
│ type: "credits"             │
│ amount_in_cents: 2000 (₱20) │
│ payment_proof_url: "..."    │
└────────┬────────────────────┘
         │
         │ 4. Admin reviews payment proof
         ▼
┌─────────────────────────┐
│ Admin Panel             │
│ - View proof screenshot │
│ - Approve or Reject     │
└────────┬────────────────┘
         │ 5. Admin approves
         ▼
┌─────────────────────────────┐
│ Update payment status       │
│ status: "completed"         │
└────────┬────────────────────┘
         │ 6. Trigger: Call edge function
         ▼
┌──────────────────────────────┐
│ Edge Function:               │
│ purchase-credits             │
│                              │
│ BEGIN TRANSACTION;           │
│ INSERT credit_transactions   │
│ UPDATE user_credits          │
│ COMMIT;                      │
└────────┬─────────────────────┘
         │ 7. Credits granted
         ▼
┌─────────────────────┐
│ user_credits        │
│ credits_balance: 60 │ (was 50, +10 credits)
└─────────────────────┘
         │
         │ 8. React Query invalidates cache
         ▼
┌─────────────────────┐
│ UI Updates          │
│ Shows new balance   │
└─────────────────────┘
```

### Subscription Upgrade Flow

```
┌───────┐
│ User  │
└───┬───┘
    │ 1. Select Family or Lifetime plan
    ▼
┌─────────────────┐
│ Upgrade.tsx     │
└────────┬────────┘
         │ 2. Click "Choose Yearly"
         ▼
┌──────────────────────┐
│ PaymentFlow.tsx      │
│ (same steps)         │
└────────┬─────────────┘
         │ 3. Create payment_transaction (type: "subscription" or "lifetime")
         ▼
┌─────────────────────────────────┐
│ payment_transactions            │
│ status: "pending"               │
│ type: "subscription"/"lifetime" │
│ amount_in_cents: 249900         │
└────────┬────────────────────────┘
         │ 4. Admin approves
         ▼
┌──────────────────────────────┐
│ Admin Panel                  │
│ Approves payment             │
└────────┬─────────────────────┘
         │ 5. Update subscription record
         ▼
┌────────────────────────────────┐
│ subscription                   │
│ tier: "family" or "lifetime"   │
│ status: "active"               │
│ start_date: NOW()              │
│ end_date: NOW() + 1 year or NULL
└────────┬───────────────────────┘
         │ 6. React Query refetch
         ▼
┌─────────────────────┐
│ UI Updates          │
│ Premium features    │
│ unlocked            │
└─────────────────────┘
```

### Feature Gate Check Flow

```
┌───────┐
│ User  │ Attempts action (e.g., upload video)
└───┬───┘
    ▼
┌──────────────────┐
│ Component        │ useAbilities({ monthlyPhotoCount: 5 })
└────────┬─────────┘
         │
         ▼
┌────────────────────────────┐
│ useAbilities.tsx           │
│                            │
│ 1. Fetch subscription      │
│ 2. Fetch credits balance   │
│ 3. Build UserContext       │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ abilities.ts               │
│ createAbilityFor(context)  │
│                            │
│ Rules Engine:              │
│ - if tier === 'premium'    │
│   → can('upload', 'Video') │
│ - if creditsBalance >= 2   │
│   → can('upload', 'Video') │
│ - else                     │
│   → cannot().because(...)  │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Component receives:        │
│ {                          │
│   allowed: false,          │
│   creditsRequired: 2,      │
│   reason: "Need 2 credits" │
│ }                          │
└────────┬───────────────────┘
         │
         ├─ allowed === true? ──▶ Execute action
         │
         └─ allowed === false ──▶ Show upgrade prompt
                                   "Need 2 credits or premium"
```

## Edge Functions

### 1. `purchase-credits`
Atomically grants credits after payment approval.

```typescript
// supabase/functions/purchase-credits/index.ts
export async function handler(req: Request) {
  const { amount, credits, paymentTransactionId } = await req.json();
  const userId = getUserFromRequest(req);
  
  // 1. Verify payment is completed
  const { data: payment } = await supabase
    .from('payment_transactions')
    .select('status')
    .eq('id', paymentTransactionId)
    .single();
  
  if (!payment || payment.status !== 'completed') {
    return error('Payment not approved');
  }
  
  // 2. Call database function (atomic transaction)
  const { data, error } = await supabase.rpc('grant_credits', {
    p_user_id: userId,
    p_amount: credits,
    p_payment_transaction_id: paymentTransactionId
  });
  
  if (error) throw error;
  
  return { newBalance: data.new_balance, credits };
}
```

### 2. `spend-credits`
Atomically deducts credits after action succeeds.

```typescript
// supabase/functions/spend-credits/index.ts
export async function handler(req: Request) {
  const { amount, description } = await req.json();
  const userId = getUserFromRequest(req);
  
  // Call database function (atomic transaction)
  const { data, error } = await supabase.rpc('spend_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description
  });
  
  if (error) {
    if (error.message.includes('Insufficient credits')) {
      return error('Not enough credits');
    }
    throw error;
  }
  
  return { newBalance: data.new_balance, spent: amount };
}
```

## React Hooks

### `useSubscription()`
Main hook for subscription and credits state.

```typescript
export const useSubscription = () => {
  const { user } = useAuth();
  
  // Queries
  const subscription = useQuery(['subscription', user?.id], fetchSubscription);
  const userCredits = useQuery(['userCredits', user?.id], fetchUserCredits);
  
  // Derived state
  const tier = subscription?.tier || 'free';
  const isPremium = tier === 'family' || tier === 'lifetime';
  const creditsBalance = userCredits?.credits_balance || 0;
  
  // Mutations
  const purchaseCredits = useMutation(purchaseCreditsAPI);
  const spendCredits = useMutation(spendCreditsAPI);
  const requestSubscriptionUpgrade = useMutation(upgradeSubscriptionAPI);
  
  return { tier, isPremium, creditsBalance, purchaseCredits, spendCredits, ... };
};
```

### `useAbilities(context)`
Hook for feature gating checks.

```typescript
export const useAbilities = (context?: Partial<UserContext>) => {
  const { tier, creditsBalance } = useSubscription();
  
  // Build full user context
  const userContext = useMemo(() => ({
    tier, creditsBalance,
    babyCount: context?.babyCount || 0,
    monthlyPhotoCount: context?.monthlyPhotoCount || 0,
    monthNumber: context?.monthNumber || 1,
  }), [tier, creditsBalance, context]);
  
  // Create CASL ability
  const ability = useMemo(() => createAbilityFor(userContext), [userContext]);
  
  // Check methods
  const check = (action, subject) => checkAbility(ability, action, subject, userContext);
  const executeWithAbility = async (action, subject, fn, description) => {
    const result = check(action, subject);
    if (result.creditsRequired > 0) {
      await fn();
      await spendCredits({ amount: result.creditsRequired, description });
    } else if (result.allowed) {
      await fn();
    } else {
      throw new Error(result.reason);
    }
  };
  
  return { ability, check, executeWithAbility, canCreateBaby, canUploadVideo, ... };
};
```

## UI Components

### Key Pages
1. **Upgrade.tsx** - Main monetization page (tabs for Credits, Family, Lifetime)
2. **PaymentFlow.tsx** - Multi-step payment proof upload
3. **Admin Panel** - Payment approval interface

### UI States

#### Upgrade Page States
```typescript
// Loading
if (loading) return <LoadingSpinner />;

// Already Premium
if (isPremium) return <Badge>Current: {tier}</Badge>;

// Can Upgrade
return <Tabs>
  <Tab value="credits">
    <CreditPackages onPurchase={handleCreditPurchase} />
  </Tab>
  <Tab value="subscription">
    <SubscriptionPlans onUpgrade={handleSubscriptionUpgrade} />
  </Tab>
  <Tab value="lifetime">
    <LifetimePlan onUpgrade={handleLifetimeUpgrade} />
  </Tab>
</Tabs>;
```

#### Payment Flow States
```
[Method Selection] → [Payment Details] → [Proof Upload] → [Processing] → [Success]
```

Each step shows:
- **Method**: GCash or PayPal radio buttons
- **Details**: Amount, account number, QR code
- **Proof**: File upload for screenshot
- **Processing**: "Submitting payment proof..."
- **Success**: "Payment submitted! Approval within 24 hours."

---

**Status:** Production  
**Last Updated:** 2026-03-08  
**Version:** 1.0
