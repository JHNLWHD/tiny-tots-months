
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { usePhotos } from "@/hooks/usePhotos";
import { useMilestones } from "@/hooks/useMilestones";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/components/ui/sonner";

export const useMonthPage = (monthNumber: number, initialBabyId?: string) => {
  const navigate = useNavigate();
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(initialBabyId || null);
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
    isUploading
  } = usePhotos(selectedBabyId || undefined, monthNumber);
  
  // Image upload hook
  const { 
    uploadImage, 
    isUploading: isImageUploading 
  } = useImageUpload();
  
  // Fetch milestones for selected baby and month
  const { 
    milestones, 
    isLoading: loadingMilestones,
    createMilestone,
    deleteMilestone,
    isCreating: isCreatingMilestone,
    refetch: refetchMilestones
  } = useMilestones(selectedBabyId || undefined, monthNumber);

  // Set the first baby as selected when babies load if no initial baby ID is provided
  useEffect(() => {
    if (babies.length > 0) {
      if (!selectedBabyId) {
        setSelectedBabyId(babies[0].id);
      } else if (!babies.some(baby => baby.id === selectedBabyId)) {
        // If the selected baby ID is not in the list of babies, select the first one
        setSelectedBabyId(babies[0].id);
      }
    }
  }, [babies, selectedBabyId]);

  // Redirect if month number is invalid or exceeds limits based on subscription
  useEffect(() => {
    // Basic validation for month number
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      navigate("/app");
      return;
    }
    
    // Check subscription limits
    if (!isPremium && monthNumber > 3) {
      toast("Premium Required", {
        description: "Free users can only track up to 3 months. Upgrade to Premium for complete 12-month tracking.",
        className: "bg-destructive text-destructive-foreground",
      });
      navigate("/app");
      return;
    }
  }, [monthNumber, isPremium, navigate]);
  
  const handleBabySelect = (babyId: string) => {
    setSelectedBabyId(babyId);
    // Update URL when baby is selected
    navigate(`/app/month/${babyId}/${monthNumber}`);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const isLoading = loadingBabies || loadingPhotos || loadingMilestones;
  
  // Find the selected baby for sharing
  const selectedBaby = babies.find(baby => baby.id === selectedBabyId);
  
  const uploadPhoto = async (file: File, description?: string) => {
    if (!selectedBabyId) return null;
    
    // Check if file is a video
    const isVideo = file.type.startsWith('video/');
    
    // Check premium status for video uploads
    if (isVideo && !isPremium) {
      toast("Premium Feature", {
        description: "Video uploads are only available for premium users. Please upgrade to premium to upload videos.",
        className: "bg-destructive text-destructive-foreground",
      });
      return null;
    }
    
    // Check photo upload limits for free users
    if (!isPremium) {
      if (photos.length >= 5) {
        toast("Upload Limit Reached", {
          description: "Free users can upload maximum 5 photos per month. Upgrade to Premium for unlimited uploads.",
          className: "bg-destructive text-destructive-foreground",
        });
        return null;
      }
    }
    
    // Check file size for videos (max 50MB)
    if (isVideo && file.size > 50 * 1024 * 1024) {
      toast("File Too Large", {
        description: "Video files must be under 50MB. Please compress your video or upload a shorter clip.",
        className: "bg-destructive text-destructive-foreground",
      });
      return null;
    }
    
    return await uploadPhotoApi({
      file: file,
      baby_id: selectedBabyId,
      month_number: monthNumber,
      description
    });
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
    refetchMilestones
  };
};
