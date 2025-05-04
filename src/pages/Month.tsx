
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import BabySelector from "@/components/BabySelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import PhotoSection from "@/components/month/PhotoSection";
import MilestoneSection from "@/components/month/MilestoneSection";
import MonthHeader from "@/components/month/MonthHeader";
import { useMonthPage } from "@/hooks/useMonthPage";

const Month = () => {
  const { monthId } = useParams<{ monthId: string }>();
  const monthNumber = parseInt(monthId || "1", 10);
  
  const {
    babies,
    selectedBabyId,
    selectedBaby,
    activeTab,
    photos,
    milestones,
    isLoading,
    loadingBabies,
    isUploading,
    isCreatingMilestone,
    handleBabySelect,
    handleTabChange,
    uploadPhoto,
    deletePhoto,
    createMilestone,
    deleteMilestone,
    refetchPhotos,
    loadingPhotos,
    loadingMilestones
  } = useMonthPage(monthNumber);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <MonthHeader 
            monthNumber={monthNumber} 
            selectedBaby={selectedBaby}
          />
          
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
                  
                  <TabsContent value="photos">
                    <PhotoSection 
                      babyId={selectedBabyId}
                      monthNumber={monthNumber}
                      photos={photos}
                      isUploading={isUploading}
                      uploadPhoto={uploadPhoto}
                      deletePhoto={deletePhoto}
                      refetchPhotos={refetchPhotos}
                      isLoading={loadingPhotos}
                    />
                  </TabsContent>
                  
                  <TabsContent value="milestones">
                    <MilestoneSection 
                      babyId={selectedBabyId}
                      monthNumber={monthNumber}
                      milestones={milestones}
                      isLoading={loadingMilestones}
                      createMilestone={createMilestone}
                      deleteMilestone={deleteMilestone}
                      isCreatingMilestone={isCreatingMilestone}
                    />
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
