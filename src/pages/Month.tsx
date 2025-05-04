
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoGrid from "@/components/PhotoGrid";
import PhotoCollage from "@/components/PhotoCollage";
import MilestoneList from "@/components/MilestoneList";
import MilestoneForm from "@/components/MilestoneForm";
import BabySelector from "@/components/BabySelector";
import ShareButton from "@/components/ShareButton";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { usePhotos } from "@/hooks/usePhotos";
import { useMilestones } from "@/hooks/useMilestones";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Photo } from "@/hooks/usePhotos";

type SortOption = "newest" | "oldest" | "description";

const Month = () => {
  const { monthId } = useParams<{ monthId: string }>();
  const monthNumber = parseInt(monthId || "1", 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("photos");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "collage">("grid");
  
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

  // Sort photos based on selected option
  const sortedPhotos = [...photos].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "description":
        return ((a.description || '') > (b.description || '')) ? 1 : -1;
      default:
        return 0;
    }
  });

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

  // Handle photo deletion with proper type conversion
  const handleDeletePhoto = (id: string) => {
    const photoToDelete = photos.find(photo => photo.id === id);
    if (photoToDelete) {
      deletePhoto(photoToDelete);
    }
  };

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  };
  
  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "collage");
  };
  
  const isLoading = loadingBabies || loadingPhotos || loadingMilestones;
  
  // Find the selected baby for sharing
  const selectedBaby = babies.find(baby => baby.id === selectedBabyId);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Month {monthNumber} Milestones
            </h1>
            
            {selectedBabyId && selectedBaby && (
              <ShareButton 
                babyId={selectedBabyId}
                babyName={selectedBaby.name}
                type="month"
                monthNumber={monthNumber}
              />
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <BabySelector
                  babies={babies}
                  selectedBabyId={selectedBabyId}
                  onSelectBaby={handleBabySelect}
                  isLoading={loadingBabies}
                />
              </div>
              
              {selectedBabyId ? (
                <Tabs defaultValue="photos" value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="photos" className="space-y-6">
                    <PhotoUploader
                      babyId={selectedBabyId}
                      month={monthNumber}
                      onUploadComplete={refetchPhotos}
                      onUpload={uploadPhoto}
                      isUploading={isUploading}
                    />
                    
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                        <h2 className="text-xl font-semibold">Photos</h2>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="view-mode" className="whitespace-nowrap">View:</Label>
                            <Select value={viewMode} onValueChange={handleViewModeChange}>
                              <SelectTrigger id="view-mode" className="w-[120px]">
                                <SelectValue placeholder="View" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid">Grid</SelectItem>
                                <SelectItem value="collage">Collage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label htmlFor="sort-by" className="whitespace-nowrap">Sort by:</Label>
                            <Select value={sortOption} onValueChange={handleSortChange}>
                              <SelectTrigger id="sort-by" className="w-[120px]">
                                <SelectValue placeholder="Sort by" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="oldest">Oldest</SelectItem>
                                <SelectItem value="description">Description</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {viewMode === "grid" ? (
                        <PhotoGrid 
                          photos={sortedPhotos} 
                          onDelete={handleDeletePhoto}
                        />
                      ) : (
                        <PhotoCollage 
                          photos={sortedPhotos} 
                          maxDisplayCount={sortedPhotos.length}
                        />
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="milestones">
                    <MilestoneForm
                      babyId={selectedBabyId}
                      monthNumber={monthNumber}
                      onSubmit={createMilestone}
                      isSubmitting={isCreatingMilestone}
                    />
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Recorded Milestones</h2>
                      <MilestoneList 
                        milestones={milestones}
                        onDelete={deleteMilestone}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Add a baby to start tracking milestones</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Month;
