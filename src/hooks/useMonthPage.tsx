
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { usePhotos } from "@/hooks/usePhotos";
import { useMilestones } from "@/hooks/useMilestones";

export const useMonthPage = (monthNumber: number) => {
  const navigate = useNavigate();
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("photos");

  // Fetch all babies
  const { babies, loading: loadingBabies } = useBabyProfiles();
  
  // Fetch photos for selected baby and month
  const { 
    photos, 
    isLoading: loadingPhotos,
    uploadPhoto,
    deletePhoto,
    isUploading,
    refetch: refetchPhotos
  } = usePhotos(selectedBabyId || undefined, monthNumber);
  
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

  // Redirect if month number is invalid
  useEffect(() => {
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      navigate("/app");
    }
  }, [monthNumber, navigate]);
  
  const handleBabySelect = (babyId: string) => {
    setSelectedBabyId(babyId);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const isLoading = loadingBabies || loadingPhotos || loadingMilestones;
  
  // Find the selected baby for sharing
  const selectedBaby = babies.find(baby => baby.id === selectedBabyId);

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
