# Tiny Tots Milestones - Pricing Migration Guide

## Overview

This guide outlines the migration from the original two-tier pricing model (Free + Premium ₱500) to the new hybrid pricing structure with four tiers: Free, Credits, Family Subscription, and Lifetime Premium.

## New Pricing Structure

### 1. Enhanced Free Plan
- **Price**: ₱0 forever
- **Features**: 
  - 1 baby profile
  - Full 12 months tracking (upgraded from 3 months)
  - 10 photos per month (upgraded from 5)
  - Basic milestone suggestions
  - Export/download features

### 2. Credit System
- **Philippines**: ₱20 (10 credits), ₱50 (30 credits), ₱100 (70 credits)
- **International**: $0.50 (10 credits), $1.25 (30 credits), $2.50 (70 credits)
- **Usage**:
  - Extra baby profile: 15 credits
  - Video upload: 2 credits each
  - Extra photos: 1 credit per 10 photos
  - Premium templates: 3 credits
  - Export features: 2 credits

### 3. Family Subscription
- **Philippines**: ₱99/month or ₱999/year
- **International**: $2.50/month or $25/year
- **Features**: Unlimited everything + premium features

### 4. Lifetime Premium
- **Philippines**: ₱2,499 one-time
- **International**: $62 one-time
- **Features**: All Family Subscription features, lifetime access

## Migration Strategy

### Current Premium Users (₱500 paid)
- **New Tier**: Lifetime Premium
- **Rationale**: They paid ₱500, new lifetime is ₱2,499 - massive value upgrade
- **Bonus**: 50 credits for early adoption
- **Communication**: "You're getting a huge upgrade at no extra cost!"

### Current Pending Users
- **New Tier**: Lifetime Premium (once payment verified)
- **Rationale**: They intended to pay for premium, honor their commitment
- **Bonus**: 25 credits
- **Communication**: "Your payment is being processed for Lifetime Premium"

### Current Free Users
- **New Tier**: Enhanced Free Plan
- **Rationale**: Better free experience to encourage engagement
- **Bonus**: 10 welcome credits to try premium features
- **Communication**: "Your free plan just got much better!"

## Database Changes Required

### 1. Update `subscription` table
```sql
ALTER TABLE subscription 
ADD COLUMN tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN currency VARCHAR(3) DEFAULT 'PHP';

-- Update existing records
UPDATE subscription SET tier = 'lifetime' WHERE status = 'premium';
UPDATE subscription SET tier = 'free' WHERE status = 'free';
```

### 2. Create `user_credits` table
```sql
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Create `credit_transactions` table
```sql
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Migration Timeline

### Phase 1: Preparation (1 week before)
1. **Database Updates**: Deploy schema changes
2. **Code Deployment**: Deploy new pricing logic (feature flagged)
3. **Testing**: Run migration tests on staging environment
4. **Communication**: Send announcement email to all users

### Phase 2: Migration Day
1. **Pre-migration**: Final readiness check
2. **Migration**: Execute user migrations (estimated 30 minutes)
3. **Verification**: Verify migration results
4. **Activation**: Enable new pricing features
5. **Communication**: Send completion emails

### Phase 3: Post-Migration (1 week after)
1. **Monitoring**: Track user engagement and issues
2. **Support**: Handle user questions and concerns
3. **Analytics**: Monitor conversion rates and feature usage
4. **Optimization**: Adjust based on user feedback

## Communication Plan

### 1. Pre-Migration Announcement
- **Timeline**: 1 week before migration
- **Audience**: All users
- **Content**: Explain changes, benefits, and timeline
- **Channels**: Email, in-app notification, website banner

### 2. Migration Day Notification
- **Timeline**: Day of migration
- **Audience**: All users
- **Content**: "Migration in progress" status
- **Channels**: In-app notification, status page

### 3. Migration Complete Confirmation
- **Timeline**: Immediately after migration
- **Audience**: All users
- **Content**: Personalized upgrade details and next steps
- **Channels**: Email, in-app notification

### 4. Welcome Credits Notification
- **Timeline**: 24 hours after migration
- **Audience**: Users who received credits
- **Content**: How to use credits, feature explanations
- **Channels**: Email, in-app tutorial

## Risk Mitigation

### Technical Risks
1. **Database Migration Failure**
   - Mitigation: Full database backup before migration
   - Rollback: Restore from backup if needed

2. **User Data Loss**
   - Mitigation: Preserve all existing data, only add new fields
   - Rollback: No data deletion during migration

3. **Payment Processing Issues**
   - Mitigation: Maintain existing payment proofs and status
   - Rollback: Manual verification process if needed

### Business Risks
1. **User Confusion**
   - Mitigation: Clear communication and help documentation
   - Response: Dedicated support during migration week

2. **Revenue Impact**
   - Mitigation: Existing premium users get better value
   - Monitoring: Track conversion rates and user feedback

3. **Feature Adoption**
   - Mitigation: Welcome credits encourage feature trial
   - Support: In-app tutorials and help guides

## Success Metrics

### Technical Metrics
- Migration completion rate: Target 99%+
- Data integrity: 100% data preservation
- System uptime: <1 hour downtime maximum

### Business Metrics
- User satisfaction: Survey score >4.0/5.0
- Feature adoption: >50% of credit recipients use credits within 30 days
- Revenue impact: Maintain or increase monthly revenue
- Support tickets: <5% increase in support volume

### User Experience Metrics
- Free plan engagement: Increase in monthly active users
- Premium conversion: Track credit-to-subscription conversion
- Retention: Maintain 90%+ user retention post-migration

## Support Preparation

### FAQ Preparation
1. **"Why did my plan change?"**
   - Answer: Explain automatic upgrade benefits

2. **"How do credits work?"**
   - Answer: Provide credit usage guide with examples

3. **"Can I get a refund?"**
   - Answer: Explain value upgrade and no additional charges

4. **"What happens to my existing data?"**
   - Answer: Confirm all data is preserved and enhanced

### Support Team Training
- New pricing structure overview
- Migration process explanation
- Credit system functionality
- Escalation procedures for complex issues

## Post-Migration Optimization

### Week 1: Immediate Response
- Monitor user feedback and support tickets
- Address any technical issues quickly
- Collect user sentiment data

### Month 1: Feature Adoption
- Analyze credit usage patterns
- Optimize credit pricing based on usage
- Improve onboarding for new features

### Month 3: Long-term Impact
- Evaluate revenue impact
- Assess user retention and engagement
- Plan future pricing optimizations

## Rollback Plan

### Immediate Rollback (if needed within 24 hours)
1. Restore database from pre-migration backup
2. Revert code to previous version
3. Communicate issue to users
4. Investigate and fix problems

### Partial Rollback (if specific issues arise)
1. Identify affected users
2. Manual correction of user accounts
3. Targeted communication to affected users
4. Implement fixes for future migrations

## Conclusion

This migration represents a significant improvement in value for all users while establishing a sustainable pricing model for future growth. The key to success is clear communication, careful technical execution, and responsive support during the transition period.

For technical implementation details, see the migration utilities in `/src/utils/userMigration.ts` and the admin dashboard at `/src/components/admin/MigrationDashboard.tsx`.

