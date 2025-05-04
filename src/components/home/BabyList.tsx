
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, Calendar, Share, Plus } from 'lucide-react';
import { Baby as BabyType } from '@/hooks/useBabyProfiles';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';

interface BabyListProps {
  babies: BabyType[];
  isLoading: boolean;
  onAddBaby: () => void;
  onShareBaby: (baby: BabyType) => void;
  onSelectBaby: (baby: BabyType) => void;
  selectedBaby: BabyType | null;
}

const BabyList: React.FC<BabyListProps> = ({ 
  babies, 
  isLoading, 
  onAddBaby, 
  onShareBaby, 
  onSelectBaby,
  selectedBaby 
}) => {
  const { isPremium } = useSubscription();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card 
        onClick={onAddBaby}
        className="p-6 border-dashed border-2 border-gray-300 hover:border-baby-purple hover:bg-baby-purple/5 transition-colors cursor-pointer flex flex-col items-center justify-center h-64"
      >
        <Plus className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-600">Add a Baby</p>
        <p className="text-sm text-gray-500 text-center mt-2">
          {isPremium ? 'Add as many babies as you want' : 'Free plan allows 1 baby'}
        </p>
      </Card>
      
      {isLoading ? (
        <Card className="p-6 h-64 flex items-center justify-center">
          <div className="animate-pulse text-baby-purple">Loading...</div>
        </Card>
      ) : (
        babies.map((baby: any) => (
          <Card 
            key={baby.id} 
            className={`p-6 h-64 flex flex-col cursor-pointer hover:shadow-md transition-all ${selectedBaby?.id === baby.id ? 'ring-2 ring-baby-purple' : ''}`}
            onClick={() => onSelectBaby(baby)}
          >
            <div className="flex items-center mb-4">
              <Baby className="h-8 w-8 text-baby-purple mr-2" />
              <h2 className="text-xl font-bold">{baby.name}</h2>
            </div>
            
            <div className="text-sm text-gray-500 mb-2">
              <p>Birthdate: {format(new Date(baby.date_of_birth), 'MMMM d, yyyy')}</p>
              <p className="capitalize">Gender: {baby.gender || 'Not specified'}</p>
            </div>
            
            <div className="mt-auto flex flex-col gap-2">
              <Button 
                className="w-full px-4 py-2 bg-baby-purple text-white rounded-lg flex items-center justify-center hover:bg-baby-purple/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBaby(baby);
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                View Milestones
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={(e) => {
                  e.stopPropagation();
                  onShareBaby(baby);
                }}
              >
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default BabyList;
