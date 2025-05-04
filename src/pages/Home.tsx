import { useState } from "react";
import Layout from "@/components/Layout";
import MonthCard from "@/components/MonthCard";
import BabyCard from "@/components/BabyCard";
import BabyForm from "@/components/BabyForm";
import PhotoCollage from "@/components/PhotoCollage";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { useBabyPhotos } from "@/hooks/useBabyPhotos";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const backgroundColors = [
  "bg-baby-blue",
  "bg-baby-pink",
  "bg-baby-mint",
  "bg-baby-yellow",
  "bg-baby-peach",
  "bg-baby-purple",
];

const Home = () => {
  const [showBabyForm, setShowBabyForm] = useState(false);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const { babies, loading, deleteBaby, isDeleting } = useBabyProfiles();
  
  // Generate months 1-12
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const { photos: selectedBabyPhotos, isLoading: loadingPhotos } = useBabyPhotos(
    selectedBabyId || undefined
  );

  const handleCreateBaby = () => {
    setShowBabyForm(true);
  };

  const handleCloseForm = () => {
    setShowBabyForm(false);
  };

  const handleBabySelect = (babyId: string) => {
    setSelectedBabyId(babyId === selectedBabyId ? null : babyId);
  };

  // Debug log to check the selected baby and photo count
  console.log(`Selected baby: ${selectedBabyId}, Photos count: ${selectedBabyPhotos?.length || 0}`);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {babies.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Welcome to Tiny Tots Milestones!</h2>
                <p className="text-gray-500 mb-8">Start tracking your baby's precious moments by creating a baby profile.</p>
                <Button onClick={handleCreateBaby} className="gap-2">
                  <PlusCircle size={18} />
                  Add Your First Baby
                </Button>
              </div>
            ) : (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Your Babies</h1>
                  <Button onClick={handleCreateBaby} className="gap-2">
                    <PlusCircle size={18} />
                    Add Baby
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
                  {babies.map((baby, index) => (
                    <BabyCard
                      key={baby.id}
                      baby={baby}
                      onDelete={deleteBaby}
                      backgroundClass={backgroundColors[index % backgroundColors.length]}
                      onClick={() => handleBabySelect(baby.id)}
                      isSelected={baby.id === selectedBabyId}
                    />
                  ))}
                </div>
                
                {selectedBabyId && (
                  <div className="mb-12 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4">
                      {babies.find(b => b.id === selectedBabyId)?.name}'s Photos
                    </h2>
                    
                    {loadingPhotos ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                    ) : selectedBabyPhotos.length > 0 ? (
                      <PhotoCollage photos={selectedBabyPhotos} maxDisplayCount={10} />
                    ) : (
                      <p className="text-gray-500 text-center py-6">
                        No photos uploaded yet. Add photos in the monthly milestones section.
                      </p>
                    )}
                  </div>
                )}
                
                <Separator className="my-8" />
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 mt-8">Monthly Milestones</h2>
                <p className="text-gray-600 mb-6">Track your baby's special moments month by month</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {months.map((month) => (
                    <MonthCard
                      key={month}
                      month={month}
                      backgroundClass={backgroundColors[month % backgroundColors.length]}
                      babyId={selectedBabyId || undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <BabyForm 
        isOpen={showBabyForm} 
        onClose={handleCloseForm} 
      />
    </Layout>
  );
};

export default Home;
