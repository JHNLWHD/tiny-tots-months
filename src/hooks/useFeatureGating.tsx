import { useAbilities } from "./useAbilities";
import { createAbilityFor, checkAbility } from "@/lib/abilities";
import { useSubscription } from "./useSubscription";

export type FeatureGateResult = {
	allowed: boolean;
	reason?: string;
	creditsRequired?: number;
	upgradeRequired?: boolean;
};

export const useFeatureGating = () => {
	const abilities = useAbilities();
	const { tier, creditsBalance } = useSubscription();

	// Check if user can upload video
	const canUploadVideo = (): FeatureGateResult => {
		return abilities.canUploadVideo();
	};

	// Check if user can create additional baby profiles
	const canCreateBaby = (currentBabyCount: number): FeatureGateResult => {
		// Create abilities with specific baby count context
		const userContext = {
			tier: tier as 'free' | 'family' | 'lifetime',
			creditsBalance: creditsBalance || 0,
			babyCount: currentBabyCount,
			monthlyPhotoCount: 0,
			monthNumber: 1,
		};
		const tempAbility = createAbilityFor(userContext);
		return checkAbility(tempAbility, 'create', 'Baby', userContext);
	};

	// Check if user can upload more photos in a month
	const canUploadPhoto = (currentMonthPhotoCount: number): FeatureGateResult => {
		// Create abilities with specific photo count context
		const userContext = {
			tier: tier as 'free' | 'family' | 'lifetime',
			creditsBalance: creditsBalance || 0,
			babyCount: 0,
			monthlyPhotoCount: currentMonthPhotoCount,
			monthNumber: 1,
		};
		const tempAbility = createAbilityFor(userContext);
		return checkAbility(tempAbility, 'upload', 'Photo', userContext);
	};

	// Check if user can access month beyond free limit
	const canAccessMonth = (monthNumber: number): FeatureGateResult => {
		return abilities.canAccessMonth(monthNumber);
	};

	// Check if user can use premium milestone templates
	const canUsePremiumTemplates = (): FeatureGateResult => {
		return abilities.canUsePremiumTemplates();
	};

	// Check if user can export data
	const canExportData = (): FeatureGateResult => {
		return abilities.canExportData();
	};

	// Execute action with credit spending (delegated to abilities)
	const executeWithCredits = async (
		action: () => Promise<any>,
		creditsRequired: number,
		description: string
	): Promise<boolean> => {
		// This is now handled by the abilities system
		// We'll need to determine the specific action/subject for this
		// For now, maintain compatibility
		return abilities.executeWithAbility('create', 'all', action, description);
	};

	// Show upgrade prompt (delegated to abilities)
	const showUpgradePrompt = (reason: string, creditsRequired?: number) => {
		// Use the abilities system for consistent messaging
		abilities.showUpgradePrompt('create', 'all');
	};

	return {
		canUploadVideo,
		canCreateBaby,
		canUploadPhoto,
		canAccessMonth,
		canUsePremiumTemplates,
		canExportData,
		executeWithCredits,
		showUpgradePrompt,
		isPremium: abilities.isPremium,
		isFree: !abilities.isPremium,
		creditsBalance: abilities.creditsBalance,
		// Expose the abilities system for advanced usage
		abilities,
	};
};
