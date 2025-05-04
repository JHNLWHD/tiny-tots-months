
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import PhotoCollage from '@/components/PhotoCollage';
import { useBabyPhotos } from '@/hooks/useBabyPhotos';
import { useMilestones } from '@/hooks/useMilestones';
import { Milestone } from '@/hooks/useMilestones';

interface MonthCardProps {
  month: number;
  backgroundClass: string;
  babyId?: string; 
}

const MonthCard: React.FC<MonthCardProps> = ({ month, backgroundClass, babyId }) => {
  // Fetch photos for this baby and month if babyId is provided
  const { photos = [], isLoading: loadingPhotos } = useBabyPhotos(babyId);
  
  // Fetch milestones for this baby and month if babyId is provided
  const { milestones = [], isLoading: loadingMilestones } = useMilestones(babyId, month);
  
  // Filter photos for the current month
  const monthPhotos = photos.filter(photo => photo.month_number === month);
  
  // If we have photos for this month and a babyId, show the collage as background
  const hasPhotos = babyId && monthPhotos.length > 0;
  const hasMilestones = milestones.length > 0;

  console.log(`Month ${month}: hasPhotos=${hasPhotos}, photoCount=${monthPhotos.length}, milestonesCount=${milestones.length}, babyId=${babyId}`);

  return (
    <Link to={`/month/${month}`} className="block transition-transform hover:scale-105">
      <Card className={`month-card h-40 relative overflow-hidden ${!hasPhotos ? backgroundClass : ''}`}>
        {/* Show photo collage as background if we have photos */}
        {hasPhotos && (
          <div className="absolute inset-0 w-full h-full">
            <PhotoCollage 
              photos={monthPhotos} 
              maxDisplayCount={4}
              isBackground={true}
            />
          </div>
        )}
        
        {/* Overlay with month number and milestone indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">Month {month}</h2>
            {hasMilestones && (
              <div className="mt-2 px-2 py-1 bg-white/30 backdrop-blur-sm rounded-full inline-flex items-center">
                <span className="text-xs text-white font-medium">{milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default MonthCard;
