import { validateFile } from "@/components/photoUploader/validateFile";
import { toast } from "@/components/ui/sonner";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { useMilestones } from "@/hooks/useMilestones";
import { usePhotos } from "@/hooks/usePhotos";
import { useSubscription } from "@/hooks/useSubscription";
import { useAbilities } from "@/hooks/useAbilities";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useMonthPage = (monthNumber: number, initialBabyId?: string) => {
	const navigate = useNavigate();
	const [selectedBabyId, setSelectedBabyId] = useState<string | null>(
		initialBabyId || null,
	);
	const [activeTab, setActiveTab] = useState("photos");

	// Get subscription status
	const { isPremium } = useSubscription();

	// Fetch all babies
	const { babies, loading: loadingBabies } = useBabyProfiles();

	// Fetch photos for selected baby and month
	const {
		photos,
		isLoading: loadingPhotos,
		deletePhoto,
		refetch: refetchPhotos,
		uploadPhoto: uploadPhotoApi,
		isUploading,
	} = usePhotos(selectedBabyId || undefined, monthNumber);

	// Get abilities with photo count context
	const abilities = useAbilities({ 
		monthNumber,
		monthlyPhotoCount: photos.length 
	});

	// Fetch milestones for selected baby and month
	const {
		milestones,
		isLoading: loadingMilestones,
		createMilestone,
		deleteMilestone,
		isCreating: isCreatingMilestone,
		refetch: refetchMilestones,
	} = useMilestones(selectedBabyId || undefined, monthNumber);

	useEffect(() => {
		if (babies.length > 0) {
			if (!selectedBabyId) {
				setSelectedBabyId(babies[0].id);
			} else if (!babies.some((baby) => baby.id === selectedBabyId)) {
				setSelectedBabyId(babies[0].id);
			}
		}
	}, [babies, selectedBabyId]);

	// Redirect if month number is invalid or exceeds limits based on subscription
	useEffect(() => {
		// Basic validation for month number
		if (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
			navigate("/app");
			return;
		}

		// Check access using CASL abilities
		const accessCheck = abilities.canAccessMonth(monthNumber);
		if (!accessCheck.allowed) {
			abilities.showUpgradePrompt('access', 'Month');
			navigate("/app");
			return;
		}
	}, [monthNumber, abilities, navigate]);

	const handleBabySelect = (babyId: string) => {
		setSelectedBabyId(babyId);
		navigate(`/app/month/${babyId}/${monthNumber}`);
	};

	const handleTabChange = (value: string) => {
		setActiveTab(value);
	};

	const isLoading = loadingBabies || loadingPhotos || loadingMilestones;

	// Find the selected baby for sharing
	const selectedBaby = babies.find((baby) => baby.id === selectedBabyId);

	const uploadPhoto = async (data) => {
		if (!selectedBabyId) {
			console.error("Cannot upload: No baby selected");
			return null;
		}

		// Check photo upload permissions using CASL abilities
		const photoAbilityCheck = abilities.check('upload', 'Photo');
		if (!photoAbilityCheck.allowed) {
			if (photoAbilityCheck.creditsRequired) {
				// Try to execute with credits using abilities system
				const success = await abilities.executeWithAbility(
					'upload',
					'Photo',
					async () => {
						return await uploadPhotoApi({
							file: data.file,
							baby_id: selectedBabyId,
							month_number: monthNumber,
							description: data.description,
							is_video: data.is_video,
						});
					},
					`Photo upload for month ${monthNumber}`
				);
				return success ? "success" : null;
			} else {
				abilities.showUpgradePrompt('upload', 'Photo');
				return null;
			}
		}

		try {
			const result = await uploadPhotoApi({
				file: data.file,
				baby_id: selectedBabyId,
				month_number: monthNumber,
				description: data.description,
				is_video: data.is_video,
			});
			return result;
		} catch (error) {
			console.error("Upload failed in useMonthPage:", error);
			return null;
		}
	};

	return {
		babies,
		selectedBabyId,
		selectedBaby,
		activeTab,
		photos,
		milestones,
		isLoading,
		loadingBabies,
		loadingPhotos,
		loadingMilestones,
		isUploading,
		isCreatingMilestone,
		isPremium,
		handleBabySelect,
		handleTabChange,
		uploadPhoto,
		deletePhoto,
		createMilestone,
		deleteMilestone,
		refetchPhotos,
		refetchMilestones,
	};
};
