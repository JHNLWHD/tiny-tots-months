
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { usePhotos } from "@/hooks/usePhotos";
import { useMilestones } from "@/hooks/useMilestones";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/components/ui/sonner";

export const useMonthPage = (monthNumber: number) => {
  const navigate = useNavigate();
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
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
    refetch: refetchPhotos
  } = usePhotos(selectedBabyId || undefined, monthNumber);
  
  // Image upload hook
  const { 
    uploadImage, 
    isUploading 
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

  // Set the first baby as selected when babies load
  useEffect(() => {
    if (babies.length > 0 && !selectedBabyId) {
      setSelectedBabyId(babies[0].id);
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
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const isLoading = loadingBabies || loadingPhotos || loadingMilestones;
  
  // Find the selected baby for sharing
  const selectedBaby = babies.find(baby => baby.id === selectedBabyId);
  
  const uploadPhoto = async (file: File, description?: string) => {
    if (!selectedBabyId) return null;
    
    // Check photo upload limits for free users
    if (!isPremium) {
      if (photos.length >= 5) {
        toast("Upload Limit Reached", {
          description: "Free users can upload maximum 5 photos per month. Upgrade to Premium for unlimited uploads.",
          className: "bg-destructive text-destructive-foreground",
        });
        return null;
      }
      
      // Check if uploading a video (only allowed for premium users)
      if (file.type.startsWith('video/')) {
        toast("Premium Required", {
          description: "Video uploads are only available for Premium users.",
          className: "bg-destructive text-destructive-foreground",
        });
        return null;
      }
    }
    
    return await uploadImage(file, {
      babyId: selectedBabyId,
      monthNumber: monthNumber,
      description,
      onSuccess: () => {
        refetchPhotos();
      }
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
