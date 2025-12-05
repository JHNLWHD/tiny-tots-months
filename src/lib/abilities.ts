import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';

// Define the actions users can perform
export type Actions = 
  | 'create'
  | 'read' 
  | 'update'
  | 'delete'
  | 'upload'
  | 'export'
  | 'access';

// Define the subjects (resources) users can act upon
export type Subjects = 
  | 'Baby'
  | 'Photo'
  | 'Video'
  | 'Milestone'
  | 'Month'
  | 'Template'
  | 'Export'
  | 'Analytics'
  | 'all';

// Define the ability type
export type AppAbility = MongoAbility<[Actions, Subjects]>;

// User context for ability creation
export type UserContext = {
  tier: 'free' | 'family' | 'lifetime';
  creditsBalance: number;
  babyCount: number;
  monthlyPhotoCount: number;
  monthNumber: number;
};

// Credit costs for various actions
export const CREDIT_COSTS = {
  EXTRA_BABY: 15,
  VIDEO_UPLOAD: 2,
  EXTRA_PHOTOS: 1, // per 10 photos
  PREMIUM_TEMPLATES: 3,
  EXPORT_FEATURES: 2,
} as const;

/**
 * Create abilities based on user's subscription tier and credits
 */
export function createAbilityFor(user: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Base permissions for all users
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
      // Free tier restrictions
      
      // Baby creation: First baby is free, additional babies require credits
      if (user.babyCount === 0) {
        can('create', 'Baby');
      } else if (user.creditsBalance >= CREDIT_COSTS.EXTRA_BABY) {
        can('create', 'Baby');
      } else {
        cannot('create', 'Baby').because('Additional baby profiles require premium subscription or 15 credits');
      }

      // Photo uploads: 10 photos per month for free, then credits required
      if (user.monthlyPhotoCount < 10) {
        can('upload', 'Photo');
      } else {
        const extraPhotosNeeded = Math.ceil((user.monthlyPhotoCount - 9) / 10);
        const creditsNeeded = extraPhotosNeeded * CREDIT_COSTS.EXTRA_PHOTOS;
        
        if (user.creditsBalance >= creditsNeeded) {
          can('upload', 'Photo');
        } else {
          cannot('upload', 'Photo').because(`Photo upload limit reached. Need ${creditsNeeded} credits or premium subscription`);
        }
      }

      // Video uploads: Premium or credits only
      if (user.creditsBalance >= CREDIT_COSTS.VIDEO_UPLOAD) {
        can('upload', 'Video');
      } else {
        cannot('upload', 'Video').because('Video uploads require premium subscription or 2 credits');
      }

      // Month access: All 12 months are free (enhanced from original 3)
      if (user.monthNumber <= 12) {
        can('access', 'Month');
      } else {
        cannot('access', 'Month').because('Month access beyond 12 months requires premium subscription');
      }

      // Premium templates: Credits required
      if (user.creditsBalance >= CREDIT_COSTS.PREMIUM_TEMPLATES) {
        can('create', 'Template');
      } else {
        cannot('create', 'Template').because('Premium templates require subscription or 3 credits');
      }

      // Export features: Credits required
      if (user.creditsBalance >= CREDIT_COSTS.EXPORT_FEATURES) {
        can('export', 'all');
      } else {
        cannot('export', 'all').because('Export features require premium subscription or 2 credits');
      }

      // Analytics: Premium only
      cannot('read', 'Analytics').because('Analytics dashboard requires premium subscription');
      break;
  }

  return build();
}

/**
 * Calculate credit requirements for specific actions based on user context
 */
export function getRequiredCredits(user: UserContext, action: Actions, subject: Subjects): number | null {
  // Only calculate credits for free tier users
  if (user.tier !== 'free') {
    return null;
  }

  switch (action) {
    case 'create':
      if (subject === 'Baby' && user.babyCount > 0) {
        return CREDIT_COSTS.EXTRA_BABY;
      }
      if (subject === 'Template') {
        return CREDIT_COSTS.PREMIUM_TEMPLATES;
      }
      break;
    
    case 'upload':
      if (subject === 'Video') {
        return CREDIT_COSTS.VIDEO_UPLOAD;
      }
      if (subject === 'Photo' && user.monthlyPhotoCount >= 10) {
        const extraPhotosNeeded = Math.ceil((user.monthlyPhotoCount - 9) / 10);
        return extraPhotosNeeded * CREDIT_COSTS.EXTRA_PHOTOS;
      }
      break;
    
    case 'export':
      return CREDIT_COSTS.EXPORT_FEATURES;
  }

  return null;
}

/**
 * Get the reason why an action is forbidden
 */
export function getForbiddenReason(ability: AppAbility, action: Actions, subject: Subjects): string | null {
  const rule = ability.relevantRuleFor(action, subject);
  return rule?.reason || null;
}

/**
 * Helper function to check abilities with detailed results
 */
export function checkAbility(ability: AppAbility, action: Actions, subject: Subjects, user?: UserContext) {
  const allowed = ability.can(action, subject);
  const creditsRequired = user ? getRequiredCredits(user, action, subject) : null;
  const reason = getForbiddenReason(ability, action, subject);

  return {
    allowed,
    creditsRequired,
    reason,
    requiresUpgrade: !allowed && !creditsRequired,
  };
}
