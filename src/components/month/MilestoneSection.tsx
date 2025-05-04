
import React from "react";
import { Loader2 } from "lucide-react";
import MilestoneList from "@/components/MilestoneList";
import MilestoneForm from "@/components/MilestoneForm";
import { CreateMilestoneData, Milestone } from "@/hooks/useMilestones";
import MilestoneDisplay from "@/components/MilestoneDisplay";
import { Star } from "lucide-react";

interface MilestoneSectionProps {
  babyId: string;
  monthNumber: number;
  milestones: Milestone[];
  isLoading: boolean;
  createMilestone: (data: CreateMilestoneData) => void;
  deleteMilestone: (id: string) => void;
  isCreatingMilestone: boolean;
}

const MilestoneSection: React.FC<MilestoneSectionProps> = ({
  babyId,
  monthNumber,
  milestones,
  isLoading,
  createMilestone,
  deleteMilestone,
  isCreatingMilestone
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6 sm:py-8">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const hasMilestones = milestones && milestones.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {hasMilestones && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {milestones.length} Milestone{milestones.length !== 1 ? 's' : ''} Recorded
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {milestones.slice(0, 4).map((milestone) => (
              <MilestoneDisplay 
                key={milestone.id}
                title={milestone.milestone_text.split('\n')[0] || 'Milestone'}
                description={milestone.milestone_text}
                icon={<Star className="h-4 sm:h-5 w-4 sm:w-5" />}
              />
            ))}
          </div>
          
          {/* If we have more than 4 milestones, show the rest in a list */}
          {milestones.length > 4 && (
            <div className="mt-4 sm:mt-6">
              <h3 className="text-sm sm:text-md font-medium mb-2">Additional Milestones</h3>
              <MilestoneList 
                milestones={milestones.slice(4)}
                onDelete={deleteMilestone}
              />
            </div>
          )}
        </div>
      )}
      
      <MilestoneForm
        babyId={babyId}
        monthNumber={monthNumber}
        onSubmit={createMilestone}
        isSubmitting={isCreatingMilestone}
      />
      
      {!hasMilestones && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">No Milestones Recorded Yet</h2>
          <p className="text-gray-500 text-center py-4">
            Add your baby's first milestone using the form above.
          </p>
        </div>
      )}
    </div>
  );
};

export default MilestoneSection;
