# Subscription & Monetization System

## Problem
The app needs a sustainable revenue model that:
- Provides meaningful free tier to attract users
- Offers flexible payment options (one-time, subscription, micro-payments)
- Supports multiple currencies (PHP and USD)
- Handles payment verification (GCash proof of payment)
- Enforces feature limits based on subscription tier
- Tracks credit purchases and usage
- Enables admin approval workflow for payments

**Key Challenges:**
- Manual payment verification (no automated payment gateway initially)
- Multi-currency support (Philippines and International)
- Fair feature gating that encourages upgrades without frustrating free users
- Credit system complexity (purchase, spend, track balance)
- Subscription lifecycle management (pending, active, expired)

## Solution
A hybrid monetization model with four tiers and flexible payment options:

**Pricing Tiers:**
1. **Free Plan** - 1 baby, 12 months, 10 photos/month, 500MB storage
2. **Credit System** - Pay-as-you-go for extra features
3. **Family Subscription** - Monthly/Annual unlimited access
4. **Lifetime Premium** - One-time payment for lifetime access

**Payment System:**
- Manual payment via GCash (Philippines) / PayPal (International)
- Proof of payment upload
- Admin approval workflow
- Credit purchase and spending tracking
- Subscription upgrade requests

**Feature Gating:**
- CASL-based permissions system
- Tier-based feature access
- Credit-based alternative for free tier
- Storage quota enforcement

## Scope

### ✅ In Scope
- Four-tier pricing model
- Credit purchase and spending
- Subscription upgrades (Family, Lifetime)
- Payment proof upload
- Admin approval workflow
- Feature gating via CASL abilities
- Credit transaction history
- Storage quota tracking
- Multi-currency support (PHP, USD)
- GCash payment method
- Pending payment handling

### ❌ Out of Scope
- Automated payment gateways (Stripe, PayPal API)
- Recurring billing automation
- Subscription cancellation (lifetime/annual only)
- Refunds (manual process)
- Proration for upgrades
- Gift subscriptions
- Affiliate/referral system
- Volume discounts
- Enterprise pricing

### 🔮 Future Enhancements
- Automated payment via Stripe/PayPal API
- Recurring billing for Family Subscription
- Self-service subscription management
- Automatic refunds
- Family sharing (multiple users per subscription)
- Gift cards/codes
- Referral rewards
- Usage analytics dashboard

## Pricing Structure

### Free Plan - ₱0 / $0
**Features:**
- 1 baby profile
- Full 12 months tracking
- 10 photos per month
- 500MB storage
- Basic milestone suggestions
- Unlimited milestones (free feature)

**Limitations:**
- No videos
- No additional babies (15 credits to add)
- Limited photos (1 credit per 10 additional)

### Credit System
**Philippines Pricing:**
- 10 credits: ₱20
- 30 credits: ₱50
- 70 credits: ₱100

**International Pricing:**
- 10 credits: $0.50
- 30 credits: $1.25
- 70 credits: $2.50

**Credit Costs:**
- Extra baby profile: 15 credits
- Video upload: 2 credits each
- Extra photos: 1 credit per batch of 10
- Premium templates: 3 credits
- Export features: 2 credits

### Family Subscription
**Philippines:**
- Monthly: ₱99/month
- Annual: ₱999/year (save ₱189)

**International:**
- Monthly: $2.50/month
- Annual: $25/year (save $5)

**Features:**
- Unlimited babies
- Unlimited photos
- Unlimited videos
- 10GB storage
- All premium features

### Lifetime Premium
**Philippines:** ₱2,499 one-time  
**International:** $62 one-time

**Features:**
- All Family Subscription features
- Lifetime access (no expiration)
- Grandfathered pricing protection
- Priority feature access

## Success Metrics

### Revenue
- Monthly recurring revenue (MRR)
- Credit purchase volume
- Lifetime subscription conversions
- Average revenue per user (ARPU)

### Conversion
- Free → Paid conversion rate
- Credit → Subscription conversion
- Upgrade flow completion rate

### Engagement
- Credit usage rate (% of purchased credits spent)
- Feature adoption per tier
- Churn rate by tier

## Implementation Notes

### Database Schema
```sql
-- Subscription table
CREATE TABLE subscription (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  tier VARCHAR(20) DEFAULT 'free',
  status VARCHAR(20) CHECK (status IN ('free', 'pending', 'active')),
  currency VARCHAR(3) DEFAULT 'PHP',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  payment_transaction_id UUID
);

-- User credits
CREATE TABLE user_credits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  credits_balance INTEGER DEFAULT 0
);

-- Credit transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  amount INTEGER,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('purchase', 'spend', 'refund')),
  description TEXT,
  payment_transaction_id UUID
);

-- Payment transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  amount_in_cents INTEGER,
  currency VARCHAR(3),
  payment_method VARCHAR(50),
  transaction_type VARCHAR(50),
  status VARCHAR(20),
  payment_proof_url TEXT
);
```

### Key Components
- **useSubscription** - Main subscription hook
- **usePricing** - Currency and pricing logic
- **abilities.ts** - Feature gating rules
- **Upgrade.tsx** - Upgrade page
- **PaymentFlow** - Payment proof upload
- **Admin Panel** - Payment approval

---

**Status:** Production  
**Created:** 2026-03-08  
**Version:** 1.0
