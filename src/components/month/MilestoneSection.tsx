
import React from "react";
import { Loader2 } from "lucide-react";
import MilestoneList from "@/components/MilestoneList";
import MilestoneForm from "@/components/MilestoneForm";
import { CreateMilestoneData, Milestone } from "@/hooks/useMilestones";

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
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MilestoneForm
        babyId={babyId}
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
    </div>
  );
};

export default MilestoneSection;
