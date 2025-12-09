import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { 
  createAbilityFor, 
  checkAbility, 
  type Actions, 
  type Subjects, 
  type AppAbility,
  type UserContext 
} from '@/lib/abilities';
import { toast } from 'sonner';

export const useAbilities = (context?: Partial<UserContext>) => {
  const { 
    tier, 
    creditsBalance, 
    spendCredits, 
    isPremium 
  } = useSubscription();

  // Create user context with defaults
  const userContext: UserContext = useMemo(() => ({
    tier: tier as 'free' | 'family' | 'lifetime',
    creditsBalance: creditsBalance || 0,
    babyCount: context?.babyCount || 0,
    monthlyPhotoCount: context?.monthlyPhotoCount || 0,
    monthNumber: context?.monthNumber || 1,
  }), [tier, creditsBalance, context]);

  // Create abilities based on user context
  const ability: AppAbility = useMemo(() => {
    return createAbilityFor(userContext);
  }, [userContext]);

  // Check if user can perform an action
  const can = (action: Actions, subject: Subjects) => {
    return ability.can(action, subject);
  };

  // Check if user cannot perform an action
  const cannot = (action: Actions, subject: Subjects) => {
    return ability.cannot(action, subject);
  };

  // Get detailed ability check with credits and reasons
  const check = (action: Actions, subject: Subjects) => {
    return checkAbility(ability, action, subject, userContext);
  };

  // Execute an action, spending credits if required
  const executeWithAbility = async (
    action: Actions,
    subject: Subjects,
    executeFunction: () => Promise<any>,
    description?: string
  ): Promise<boolean> => {
    const abilityCheck = check(action, subject);

    if (!abilityCheck.allowed && !abilityCheck.creditsRequired) {
      // Action not allowed and no credits can help
      toast.error(abilityCheck.reason || 'Action not permitted');
      return false;
    }

    if (abilityCheck.creditsRequired) {
      // Action requires credits
      // First verify user has enough credits (without spending yet)
      if ((creditsBalance || 0) < abilityCheck.creditsRequired) {
        toast.error(`Insufficient credits. You need ${abilityCheck.creditsRequired} credits for this action.`);
        return false;
      }

      try {
        // Execute the action first - if this fails, credits are never deducted
        await executeFunction();

        // Action succeeded - now spend credits
        try {
          await spendCredits({
            amount: abilityCheck.creditsRequired!,
            description: description || `${action} ${subject}`
          });
          return true;
        } catch (creditError) {
          // Action succeeded but credit deduction failed - critical error
          console.error('Action succeeded but failed to deduct credits:', creditError);
          toast.error('Action completed but credit deduction failed. Please contact support.');
          return true;
        }
      } catch (error) {
        // Action failed - credits were never deducted, so no refund needed
        const actionError = error instanceof Error ? error : new Error(String(error));
        console.error('Error executing action with credits:', actionError);
        toast.error(actionError.message || 'Action failed. Please try again.');
        return false;
      }
    } else {
      // Action is allowed without credits
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

  // Show upgrade prompt with specific messaging
  const showUpgradePrompt = (action: Actions, subject: Subjects) => {
    const abilityCheck = check(action, subject);
    
    let message = abilityCheck.reason || 'This action requires an upgrade';
    
    if (abilityCheck.creditsRequired) {
      message += ` You need ${abilityCheck.creditsRequired} credits or can upgrade to premium.`;
    }

    toast.error(message, {
      action: {
        label: 'Upgrade',
        onClick: () => {
          window.location.href = '/app/upgrade';
        },
      },
    });
  };

  // Convenience methods for common checks
  const canCreateBaby = () => check('create', 'Baby');
  const canUploadPhoto = () => check('upload', 'Photo');
  const canUploadVideo = () => check('upload', 'Video');
  const canAccessMonth = (monthNumber: number) => {
    // Create temporary ability with specific month context
    const tempContext = { ...userContext, monthNumber };
    const tempAbility = createAbilityFor(tempContext);
    return checkAbility(tempAbility, 'access', 'Month', tempContext);
  };
  const canUsePremiumTemplates = () => check('create', 'Template');
  const canExportData = () => check('export', 'all');
  const canViewAnalytics = () => check('read', 'Analytics');

  return {
    // Core ability methods
    ability,
    can,
    cannot,
    check,
    executeWithAbility,
    showUpgradePrompt,

    // Convenience methods
    canCreateBaby,
    canUploadPhoto,
    canUploadVideo,
    canAccessMonth,
    canUsePremiumTemplates,
    canExportData,
    canViewAnalytics,

    // User context
    userContext,
    isPremium,
    creditsBalance,
  };
};
