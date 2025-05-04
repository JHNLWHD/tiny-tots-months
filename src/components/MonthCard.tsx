
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import PhotoCollage from '@/components/PhotoCollage';
import { useBabyPhotos } from '@/hooks/useBabyPhotos';

interface MonthCardProps {
  month: number;
  backgroundClass: string;
  babyId?: string; // Add babyId as an optional prop
}

const MonthCard: React.FC<MonthCardProps> = ({ month, backgroundClass, babyId }) => {
  // Fetch photos for this baby and month if babyId is provided
  const { photos = [], isLoading } = useBabyPhotos(babyId);
  
  // Filter photos for the current month
  const monthPhotos = photos.filter(photo => photo.month === month);
  
  // If we have photos for this month and a babyId, show the collage as background
  const hasPhotos = babyId && monthPhotos.length > 0;

  return (
    <Link to={`/month/${month}`} className="block transition-transform hover:scale-105">
      <Card className={`month-card h-40 relative overflow-hidden ${!hasPhotos ? backgroundClass : 'border-2 border-white/50'}`}>
        {/* Show photo collage as background if we have photos */}
        {hasPhotos && (
          <div className="absolute inset-0 w-full h-full opacity-70">
            <PhotoCollage 
              photos={monthPhotos} 
              maxDisplayCount={4}
            />
          </div>
        )}
        
        {/* Overlay with month number */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">Month {month}</h2>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default MonthCard;
