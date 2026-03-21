# Subscription & Monetization - Implementation Tasks

This document reverse-engineers the implementation tasks for the complete subscription and monetization system.

---

## Phase 1: Database Schema & Foundation

### 1.1 Core Tables
- [x] Create `subscription` table with tier, status, payment fields
- [x] Add RLS policies for subscription (user can view/update own)
- [x] Create `user_credits` table with balance tracking
- [x] Add RLS policies for user_credits (user can view own)
- [x] Create `credit_transactions` table with transaction log
- [x] Add RLS policies for credit_transactions (user can view own)
- [x] Create `payment_transactions` table for payment proof tracking
- [x] Add RLS policies for payment_transactions (user can view/create own)
- [x] Add foreign key relationships (user_id, payment_transaction_id)
- [x] Add CHECK constraints (balance >= 0, valid statuses, valid tiers)

### 1.2 Database Functions
- [x] Create `grant_credits` function (atomic credit purchase)
  - Insert credit_transactions record
  - Update user_credits balance
  - Return new balance
- [x] Create `spend_credits` function (atomic credit deduction)
  - Check sufficient balance
  - Insert credit_transactions record (negative amount)
  - Update user_credits balance
  - Return new balance
- [x] Create `initialize_user_subscription` trigger
  - On user signup, create subscription record (tier: free, status: free)
  - Create user_credits record (balance: 0)

### 1.3 Storage Buckets
- [x] Create `payment_proofs` bucket for payment screenshot uploads
- [x] Set RLS policies (users can upload to own folder, admins can view all)
- [x] Configure CORS for upload

---

## Phase 2: Pricing & Currency System

### 2.1 Configuration
- [x] Create `config/payment.ts` with currency support config
  - `supportedCurrencies`: "PHP" | "USD" | "BOTH"
  - `gcashNumber`, `businessName` env vars
  - Helper functions: `isPhpSupported`, `getDefaultCurrency`
- [x] Add environment variables to `.env`
  - `VITE_SUPPORTED_CURRENCIES`
  - `VITE_GCASH_NUMBER`
  - `VITE_BUSINESS_NAME`

### 2.2 Pricing Hook (usePricing)
- [x] Define credit packages (10, 30, 70 credits) with PHP/USD pricing
- [x] Define subscription plans (Family monthly/yearly) with PHP/USD pricing
- [x] Define lifetime pricing (PHP/USD)
- [x] Implement currency auto-detection (timezone-based)
- [x] Implement manual currency switching (if BOTH currencies enabled)
- [x] Create `formatPrice` function (₱ vs $)
- [x] Create `getCreditPackagePrice`, `getSubscriptionPrice`, `getLifetimePrice`
- [x] Export constants: `CREDIT_PACKAGES`, `SUBSCRIPTION_PLANS`, `LIFETIME_PRICING`

---

## Phase 3: Subscription Management

### 3.1 Subscription Hook (useSubscription)
- [x] Create `fetchSubscription` query function
  - Fetch subscription record for current user
  - Handle no subscription (create default free tier)
- [x] Create `fetchUserCredits` query function
  - Fetch user_credits record
  - Calculate effective balance (exclude pending payment credits)
  - Query credit_transactions linked to pending payment_transactions
- [x] Set up React Query for subscription
  - Query key: `['subscription', userId]`
  - Enabled when user logged in
- [x] Set up React Query for user_credits
  - Query key: `['userCredits', userId]`
  - Enabled when user logged in
- [x] Derive tier and status state
  - `isFree`, `isFamily`, `isLifetime`, `isPremium`
  - `isPending` (subscription pending approval)
  - `creditsBalance` (with pending exclusion)

### 3.2 Subscription Mutations
- [x] Create `createSubscription` mutation
  - Initialize subscription for new user (tier: free, status: free)
  - Also create user_credits record
- [x] Create `requestSubscriptionUpgrade` mutation
  - Upsert subscription with new tier
  - Set status to "pending" for lifetime, "active" for family
  - Link to payment_transaction_id
  - Set start_date, end_date (1 year for family, null for lifetime)
  - Show success toast with approval timeline

---

## Phase 4: Credit System

### 4.1 Edge Functions
- [x] Create `purchase-credits` edge function
  - Verify payment_transaction exists and status = "completed"
  - Check idempotency (credits already granted?)
  - Call `grant_credits` database function
  - Return new balance
- [x] Create `spend-credits` edge function
  - Verify user has sufficient balance
  - Call `spend_credits` database function
  - Return new balance
  - Handle insufficient credits error

### 4.2 Credit Mutations (in useSubscription)
- [x] Create `purchaseCredits` mutation
  - Call `purchase-credits` edge function
  - Pass amount, credits, paymentTransactionId
  - Invalidate userCredits query on success
  - Show success toast
- [x] Create `spendCredits` mutation
  - Call `spend-credits` edge function
  - Pass amount, description
  - Invalidate userCredits query on success
  - Handle error (insufficient credits)
- [x] Export `canPerformAction` helper
  - Check if user can do action (isPremium or has enough credits)

---

## Phase 5: Feature Gating (CASL)

### 5.1 Abilities Core (abilities.ts)
- [x] Define Actions type: 'create' | 'read' | 'update' | 'delete' | 'upload' | 'export' | 'access'
- [x] Define Subjects type: 'Baby' | 'Photo' | 'Video' | 'Milestone' | 'Month' | 'Template' | 'Export' | 'Analytics' | 'all'
- [x] Define UserContext type (tier, creditsBalance, babyCount, monthlyPhotoCount, monthNumber, storageUsedBytes)
- [x] Define CREDIT_COSTS constants (EXTRA_BABY: 15, VIDEO_UPLOAD: 2, etc.)
- [x] Define STORAGE_QUOTAS constants (FREE: 500MB, FAMILY: 10GB, LIFETIME: 25GB)
- [x] Implement `createAbilityFor(user: UserContext)` function
  - Base permissions (read all, milestone CRUD)
  - Premium tiers: Allow everything
  - Free tier: Conditional rules
    - Baby creation (first free, then 15 credits)
    - Photo uploads (10 free per month, then 1 credit per 10)
    - Video uploads (2 credits)
    - Month access (12 months free)
    - Premium templates (3 credits)
    - Export features (2 credits)
    - Analytics (premium-only)
- [x] Implement `getRequiredCredits(user, action, subject)` helper
- [x] Implement `checkAbility(ability, action, subject, user)` helper
  - Return: { allowed, creditsRequired, reason, requiresUpgrade }
- [x] Implement storage helpers: `hasStorageAvailable`, `getStorageQuotaForTier`, `formatStorageSize`

### 5.2 Abilities Hook (useAbilities)
- [x] Create `useAbilities` hook with optional context
- [x] Fetch subscription (tier, creditsBalance) from useSubscription
- [x] Build UserContext from subscription + optional context
- [x] Create CASL ability with useMemo (recompute when context changes)
- [x] Implement `can(action, subject)` method
- [x] Implement `cannot(action, subject)` method
- [x] Implement `check(action, subject)` method (returns GateResult)
- [x] Implement `executeWithAbility(action, subject, fn, description)` method
  - Check if allowed
  - If creditsRequired > 0:
    - Verify sufficient balance
    - Execute action FIRST
    - Deduct credits AFTER success
  - If allowed without credits: Execute action
  - Handle errors and show toasts
- [x] Implement convenience methods:
  - `canCreateBaby()`, `canUploadPhoto()`, `canUploadVideo()`
  - `canAccessMonth(monthNumber)`, `canUsePremiumTemplates()`
  - `canExportData()`, `canViewAnalytics()`
- [x] Implement storage methods:
  - `checkStorageForUpload(fileSizeBytes)`
  - `getStorageInfo()` (used, quota, remaining, usagePercent, formatted)
- [x] Return ability, check functions, convenience methods, storage methods

### 5.3 Feature Gating Hook (useFeatureGating)
- [x] Create `useFeatureGating` hook (wrapper around useAbilities)
- [x] Implement `canCreateBaby(currentBabyCount)` with user-friendly result
- [x] Implement `canUploadPhoto(monthlyPhotoCount)` with batch logic messaging
- [x] Implement `canUploadVideo()` with clear pricing
- [x] Return feature gate results with upgrade paths

---

## Phase 6: Payment Flow

### 6.1 Payment Integration Hook (usePaymentIntegration)
- [x] Create `usePaymentIntegration` hook
- [x] Define PaymentRequest type (amount, currency, type, description, metadata)
- [x] Implement `submitPayment` mutation
  - Upload payment proof to Supabase Storage
  - Create payment_transactions record (status: pending)
  - Link to payment_transaction_id in metadata
  - Return transaction ID
- [x] Implement `uploadPaymentProof` helper
  - Validate file (image type, <5MB)
  - Generate unique filename (uuid)
  - Upload to `payment_proofs` bucket
  - Return storage path
- [x] Handle errors (upload failure, transaction creation failure)

### 6.2 Payment Flow Component (PaymentFlow.tsx)
- [x] Create multi-step payment dialog
- [x] Step 1: Payment Method Selection
  - Radio buttons: GCash (if PHP) or PayPal (if USD)
  - Show method icons
- [x] Step 2: Payment Details
  - Display amount, currency, description
  - Show GCash number + QR code OR PayPal email
  - Instructions: "Transfer the amount, then upload proof"
- [x] Step 3: Upload Proof
  - File picker for image upload
  - Preview uploaded image
  - Validate file type and size
- [x] Step 4: Processing
  - Loading spinner: "Submitting payment proof..."
- [x] Step 5: Success
  - Success message: "Payment submitted! Approval within 24 hours."
  - Show transaction ID
  - "Got it" button to close
- [x] Implement step navigation (Next, Back buttons)
- [x] Implement cancel handling (close dialog, reset state)
- [x] Call `usePaymentIntegration` to submit payment
- [x] Call `onSuccess(paymentTransactionId)` callback on completion

---

## Phase 7: Upgrade Page

### 7.1 Main Upgrade Page (Upgrade.tsx)
- [x] Fetch subscription (isPremium, tier, creditsBalance, isPending)
- [x] Fetch pricing (currency, formatPrice, packages, plans)
- [x] Implement currency switcher (if enabled)
  - Toggle between PHP and USD
  - Update all displayed prices
- [x] Show current status badge (Free Plan, Family Subscription, Lifetime Premium)
- [x] Show credits balance badge
- [x] Create tabs layout:
  - Tab 1: Buy Credits
  - Tab 2: Family Subscription
  - Tab 3: Lifetime Premium

### 7.2 Credits Tab
- [x] Display three credit package cards
  - Starter Pack: 10 credits
  - Value Pack: 30 credits (highlighted)
  - Premium Pack: 70 credits
- [x] Show price per credit
- [x] "Buy Credits" button on each card
- [x] Info card: "What can you do with credits?"
  - List credit costs (extra baby, videos, photos, templates)

### 7.3 Subscription Tab
- [x] Display two subscription plan cards
  - Monthly: ₱99/month or $2.50/month
  - Yearly: ₱999/year or $25/year (highlighted, "Save 17%" badge)
- [x] Show billing cycle toggle (Monthly / Yearly)
- [x] "Choose Monthly" / "Choose Yearly" buttons
- [x] Disable buttons if user already has Family subscription
- [x] Info card: "Family Subscription includes:"
  - List all premium features

### 7.4 Lifetime Tab
- [x] Display single lifetime plan card
  - ₱2,499 one-time or $62 one-time
  - Crown icon, gold border
- [x] "Get Lifetime Access" button
- [x] Disable button if user already has Lifetime
- [x] List lifetime benefits (all features, no recurring payments, grandfathered pricing)

### 7.5 Payment Flow Integration
- [x] Handle credit purchase click
  - Open PaymentFlow dialog
  - Pass PaymentRequest (type: "credits", amount, credits)
  - Track analytics event
- [x] Handle subscription upgrade click
  - Open PaymentFlow dialog
  - Pass PaymentRequest (type: "subscription" or "lifetime", tier, billing)
  - Track analytics event
- [x] Handle payment success
  - Close dialog
  - Show success message (depends on type)
  - Track completion event
- [x] Handle payment cancel
  - Close dialog
  - Reset state

### 7.6 Analytics Tracking
- [x] Track page view with tier info
- [x] Track "credit_purchase_initiated" event
- [x] Track "subscription_upgrade_initiated" event
- [x] Track "credit_purchase_submitted" event (with paymentId)
- [x] Track "subscription_upgrade_submitted" event (with paymentId)

---

## Phase 8: UI Integration

### 8.1 Navigation Hub Updates
- [x] Add credits balance badge (for free tier users)
- [x] Add "Upgrade" button (link to /app/upgrade)
- [x] Show premium badge (for premium users)

### 8.2 Baby Management Integration
- [x] Use `useAbilities({ babyCount })` in Home.tsx
- [x] Check `canCreateBaby()` before showing AddBabyDialog
- [x] Disable "Add Baby" button if not allowed
- [x] Show tooltip with reason (need credits or premium)
- [x] In AddBabyDialog, use `executeWithAbility` to handle credit deduction
- [x] Show "Costs 15 credits" badge if credits required

### 8.3 Photo Uploader Integration
- [x] Use `useAbilities({ monthlyPhotoCount })` in PhotoUploader
- [x] Check `canUploadPhoto()` before allowing upload
- [x] Show "X/10 photos used" progress indicator
- [x] When at limit, show "Need 1 credit to upload 10 more photos" message
- [x] Disable upload button if not allowed and no credits
- [x] On upload, use `executeWithAbility` to handle credit deduction
- [x] Show "This upload will cost 1 credit" warning before upload

### 8.4 Video Upload Integration
- [x] Use `canUploadVideo()` in PhotoUploader
- [x] Filter out video files if not allowed
- [x] Show "Videos require 2 credits or premium" tooltip
- [x] If allowed with credits, show "Uploading video will cost 2 credits"
- [x] On video upload, use `executeWithAbility` to deduct 2 credits

### 8.5 Storage Quota Integration
- [x] Calculate total storage used (sum of photo.file_size)
- [x] Use `getStorageInfo()` in Settings or Photo Gallery
- [x] Display storage meter with usage percentage
- [x] Show warning when >90% full: "Storage almost full. Upgrade to get 10GB."
- [x] Block uploads when at quota: "Storage full. Delete photos or upgrade."
- [x] Link to Upgrade page

### 8.6 Month Navigation Integration
- [x] Use `canAccessMonth(monthNumber)` in month navigation
- [x] Show months 1-12 enabled for free tier
- [x] Show lock icon on months 13+ for free tier
- [x] Tooltip: "Premium subscription unlocks all months"
- [x] Clicking locked month shows upgrade modal

### 8.7 Analytics Dashboard Integration
- [x] Check `canViewAnalytics()` before rendering analytics
- [x] If not allowed, show upgrade prompt
- [x] "Analytics dashboard requires premium subscription"
- [x] Link to Upgrade page

---

## Phase 9: Admin Panel

### 9.1 Payment Review Interface
- [x] Create admin-only page `/admin/payments`
- [x] Fetch all pending payment_transactions
- [x] Display table with columns:
  - User email
  - Transaction type (credits, subscription, lifetime)
  - Amount
  - Currency
  - Payment method
  - Payment proof (image preview)
  - Submission date
  - Actions (Approve, Reject)
- [x] Implement image preview modal (click proof to enlarge)

### 9.2 Approval Actions
- [x] Create `approvePayment` mutation
  - Update payment_transactions status to "completed"
  - If type = "credits": Trigger purchase-credits edge function
  - If type = "subscription" or "lifetime": Update subscription record
  - Show success toast
  - Refresh pending payments list
- [x] Create `rejectPayment` mutation
  - Update payment_transactions status to "rejected"
  - Add admin_notes field (reason for rejection)
  - Show rejection form with reason textarea
  - Refresh pending payments list
- [x] Handle edge function errors (retry mechanism)

### 9.3 User Subscription Management
- [x] Create admin view for user subscriptions
- [x] Search users by email
- [x] Display user's current tier, status, credits balance
- [x] Manual actions:
  - Grant credits (call edge function directly)
  - Change tier (update subscription record)
  - Extend subscription (update end_date)
- [x] View credit transaction history
- [x] View payment transaction history

---

## Phase 10: Testing & Quality Assurance

### 10.1 Unit Tests
- [x] Test `createAbilityFor` with different user contexts
  - Free tier with 0 credits, 0 babies → can create first baby
  - Free tier with 1 baby, 10 credits → cannot create second baby
  - Free tier with 1 baby, 20 credits → can create second baby
  - Premium tier → can do everything
- [x] Test `getRequiredCredits` for each action
- [x] Test `hasStorageAvailable` with different quotas and usage
- [x] Test `formatStorageSize` for different byte values

### 10.2 Integration Tests
- [x] Test credit purchase flow end-to-end
  - Submit payment proof
  - Admin approves
  - Credits granted
  - Balance updated in UI
- [x] Test subscription upgrade flow
  - Submit payment for Family subscription
  - Admin approves
  - Tier updated to "family"
  - Features unlocked
- [x] Test credit spending flow
  - User with 15 credits creates second baby
  - Credits deducted
  - Baby created
  - Balance updated
- [x] Test feature gate enforcement
  - Free user with 0 credits cannot upload video
  - Free user with 5 credits can upload video (costs 2)
  - Premium user can upload unlimited videos

### 10.3 Edge Case Tests
- [x] Test double payment submission (idempotency)
- [x] Test credit deduction failure after action succeeds
- [x] Test payment approval while user is online (real-time update)
- [x] Test pending credits exclusion (user cannot spend pending credits)
- [x] Test storage quota enforcement (blocks upload when at limit)
- [x] Test subscription expiration (downgrade to free tier)

---

## Phase 11: Analytics & Monitoring

### 11.1 PostHog Event Tracking
- [x] Track "viewed_upgrade_page" (with tier info)
- [x] Track "credit_purchase_initiated" (package, amount, currency)
- [x] Track "subscription_upgrade_initiated" (tier, billing, currency)
- [x] Track "credit_purchase_submitted" (paymentId, credits)
- [x] Track "subscription_upgrade_submitted" (paymentId, tier)
- [x] Track "payment_approved" (admin action)
- [x] Track "payment_rejected" (admin action)
- [x] Track "credits_spent" (action, amount, description)
- [x] Track "feature_gate_hit" (action, subject, tier, credits, reason)

### 11.2 Revenue Metrics
- [x] Dashboard showing:
  - Total revenue (sum of completed payments)
  - Monthly recurring revenue (active Family subscriptions)
  - Credit revenue (total credits purchased)
  - Conversion funnel (free → credits → subscription → lifetime)
- [x] Track average revenue per user (ARPU)
- [x] Track customer lifetime value (CLV)

### 11.3 Error Monitoring
- [x] Log edge function failures (credit grant/spend)
- [x] Log payment proof upload failures
- [x] Log admin approval errors
- [x] Alert on critical errors (credit granted but deduction failed)

---

## Phase 12: Documentation & Onboarding

### 12.1 User Documentation
- [x] Help page explaining credit system
  - How to buy credits
  - What credits can be used for
  - Credit costs for each feature
- [x] FAQ page
  - "How do credits work?"
  - "What happens if payment is rejected?"
  - "Can I get a refund?"
  - "How long does approval take?"
- [x] Subscription comparison table (Free vs Family vs Lifetime)

### 12.2 In-App Tooltips
- [x] Tooltip on credits balance badge: "Credits let you unlock premium features without subscription"
- [x] Tooltip on feature gates: "This feature requires X credits or premium subscription"
- [x] Tooltip on storage meter: "Upgrade to get more storage"

### 12.3 Email Notifications
- [x] Email when payment approved
  - Subject: "Your payment has been approved!"
  - Body: Credits granted or subscription activated
- [x] Email when payment rejected
  - Subject: "Payment verification needed"
  - Body: Reason for rejection, how to resubmit
- [x] Email when subscription about to expire
  - Subject: "Your subscription expires in 7 days"
  - Body: How to renew

---

## Summary

**Total Tasks:** 200+ tasks organized into 12 phases

**Implementation Status:** All tasks marked as complete (reverse-engineered from existing codebase)

**Key Achievements:**
- ✅ Four-tier pricing model (Free, Credits, Family, Lifetime)
- ✅ Manual payment verification via GCash/PayPal
- ✅ Atomic credit system with edge functions
- ✅ CASL-based feature gating with clear upgrade paths
- ✅ Multi-currency support (PHP, USD)
- ✅ Storage quota enforcement
- ✅ Admin approval workflow
- ✅ Comprehensive analytics tracking

**Next Steps (Future Enhancements):**
- [ ] Automated payment via Stripe/Xendit
- [ ] Recurring billing for Family subscription
- [ ] Self-service refunds
- [ ] Family sharing (multiple users per subscription)
- [ ] Gift codes/referral system

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
