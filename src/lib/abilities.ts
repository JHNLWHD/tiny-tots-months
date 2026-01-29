import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { ONE_KB, ONE_MB, ONE_GB } from '@/components/photoUploader/validateFile';

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
  storageUsedBytes?: number; // Total storage used by user in bytes
};

// Credit costs for various actions
export const CREDIT_COSTS = {
  EXTRA_BABY: 15,
  VIDEO_UPLOAD: 2,
  EXTRA_PHOTOS: 1, // per 10 photos
  PREMIUM_TEMPLATES: 3,
  EXPORT_FEATURES: 2,
} as const;

// Storage quotas in bytes per tier
export const STORAGE_QUOTAS = {
  FREE: 500 * ONE_MB,     // 500MB
  FAMILY: 10 * ONE_GB,    // 10GB
  LIFETIME: 25 * ONE_GB,  // 25GB
} as const;

// Helper to get storage quota for a tier
export function getStorageQuotaForTier(tier: 'free' | 'family' | 'lifetime'): number {
  switch (tier) {
    case 'lifetime':
      return STORAGE_QUOTAS.LIFETIME;
    case 'family':
      return STORAGE_QUOTAS.FAMILY;
    case 'free':
    default:
      return STORAGE_QUOTAS.FREE;
  }
}

// Format bytes to human-readable string
export function formatStorageSize(bytes: number): string {
  if (bytes >= ONE_GB) {
    return `${(bytes / ONE_GB).toFixed(1)}GB`;
  }
  if (bytes >= ONE_MB) {
    return `${(bytes / ONE_MB).toFixed(0)}MB`;
  }
  return `${(bytes / ONE_KB).toFixed(0)}KB`;
}

// Check if user has storage space available for a file of given size
export function hasStorageAvailable(user: UserContext, fileSizeBytes: number): boolean {
  const quota = getStorageQuotaForTier(user.tier);
  const currentUsage = user.storageUsedBytes || 0;
  return (currentUsage + fileSizeBytes) <= quota;
}

// Get remaining storage space for user
export function getRemainingStorage(user: UserContext): number {
  const quota = getStorageQuotaForTier(user.tier);
  const currentUsage = user.storageUsedBytes || 0;
  return Math.max(0, quota - currentUsage);
}

// Get storage usage percentage
export function getStorageUsagePercent(user: UserContext): number {
  const quota = getStorageQuotaForTier(user.tier);
  const currentUsage = user.storageUsedBytes || 0;
  return Math.min(100, Math.round((currentUsage / quota) * 100));
}

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

      // Photo uploads: 10 photos per month for free, then credits required per batch of 10
      if (user.monthlyPhotoCount < 10) {
        can('upload', 'Photo');
      } else {
        // Check if entering a new batch (photos 11, 21, 31, etc.)
        const nextPhotoNumber = user.monthlyPhotoCount + 1;
        const enteringNewBatch = nextPhotoNumber % 10 === 1;
        
        if (enteringNewBatch) {
          // Need 1 credit to enter the new batch
          if (user.creditsBalance >= CREDIT_COSTS.EXTRA_PHOTOS) {
            can('upload', 'Photo');
          } else {
            cannot('upload', 'Photo').because(`Photo upload limit reached. Need ${CREDIT_COSTS.EXTRA_PHOTOS} credit to upload more photos (1 credit per 10 photos) or premium subscription`);
          }
        } else {
          // Already in a batch, can upload without additional credits
          can('upload', 'Photo');
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
        // Charge 1 credit only when entering a new batch of 10 photos
        // Photos 1-10: free
        // Photos 11-20: 1 credit (charged once when uploading photo 11)
        // Photos 21-30: 1 credit (charged once when uploading photo 21)
        // etc.
        // We charge when (monthlyPhotoCount + 1) % 10 === 1 (i.e., uploading photo 11, 21, 31, etc.)
        const nextPhotoNumber = user.monthlyPhotoCount + 1;
        if (nextPhotoNumber % 10 === 1) {
          return CREDIT_COSTS.EXTRA_PHOTOS;
        }
        // If we're already in a batch (photos 12-20, 22-30, etc.), no additional charge
        return 0;
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
 * Helper function to check if credits are required (non-null and greater than 0)
 */
export function hasCreditsRequired(creditsRequired: number | null): boolean {
  return creditsRequired !== null && creditsRequired > 0;
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
    requiresUpgrade: !allowed && creditsRequired === null,
  };
}
