
import React from 'react';
import { Milestone } from '@/hooks/useMilestones';
import MilestoneDisplay from '@/components/MilestoneDisplay';
import { Star, Award, Heart, MapPin } from 'lucide-react';

interface MilestoneListProps {
  milestones: Milestone[];
  onDelete?: (id: string) => void;
}

const MilestoneList: React.FC<MilestoneListProps> = ({ milestones, onDelete }) => {
  // Array of milestone icons to cycle through
  const icons = [
    <Star className="h-5 w-5" />,
    <Award className="h-5 w-5" />,
    <Heart className="h-5 w-5" />,
    <MapPin className="h-5 w-5" />,
  ];
  
  if (milestones.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No milestones recorded yet for this month.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <MilestoneDisplay
          key={milestone.id}
          title={`Milestone ${index + 1}`}
          description={milestone.milestone_text}
          icon={icons[index % icons.length]}
        />
      ))}
    </div>
  );
};

export default MilestoneList;
