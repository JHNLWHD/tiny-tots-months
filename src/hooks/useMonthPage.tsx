import { validateFile } from "@/components/photoUploader/validateFile";
import { toast } from "@/components/ui/sonner";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useMilestones } from "@/hooks/useMilestones";
import { usePhotos } from "@/hooks/usePhotos";
import { useSubscription } from "@/hooks/useSubscription";
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

	// Image upload hook
	const { uploadImage, isUploading: isImageUploading } = useImageUpload();

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

		// Check subscription limits
		if (!isPremium && monthNumber > 3) {
			toast("Premium Required", {
				description:
					"Free users can only track up to 3 months. Upgrade to Premium for complete 12-month tracking.",
				className: "bg-destructive text-destructive-foreground",
			});
			navigate("/app");
			return;
		}
	}, [monthNumber, isPremium, navigate]);

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

		if (!isPremium) {
			if (!data.is_video && photos.length >= 5) {
				toast("Upload Limit Reached", {
					description:
						"Free users can upload maximum 5 photos per month. Upgrade to Premium for unlimited uploads.",
					className: "bg-destructive text-destructive-foreground",
				});
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
