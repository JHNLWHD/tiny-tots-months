
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
        className="p-6 border-dashed border-2 border-gray-300 hover:border-baby-purple hover:bg-baby-purple/5 transition-colors cursor-pointer flex flex-col items-center justify-center h-64 rounded-xl baby-card-shadow transform hover:scale-105 duration-300"
      >
        <div className="w-16 h-16 rounded-full bg-baby-purple/10 flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-baby-purple" />
        </div>
        <p className="text-lg font-medium text-gray-600 font-bubblegum">Add a Baby</p>
        <p className="text-sm text-gray-500 text-center mt-2">
          {isPremium ? 'Add as many babies as you want' : 'Free plan allows 1 baby'}
        </p>
      </Card>
      
      {isLoading ? (
        <Card className="p-6 h-64 flex items-center justify-center rounded-xl baby-card-shadow">
          <div className="animate-pulse text-baby-purple font-bubblegum text-xl">Loading...</div>
        </Card>
      ) : (
        babies.map((baby: any) => (
          <Card 
            key={baby.id} 
            className={`p-6 h-64 flex flex-col cursor-pointer hover:shadow-md transition-all rounded-xl baby-card-shadow transform hover:scale-105 duration-300 bg-gradient-to-br from-white to-baby-purple/5 ${selectedBaby?.id === baby.id ? 'ring-2 ring-baby-purple' : ''}`}
            onClick={() => onSelectBaby(baby)}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-baby-purple/20 flex items-center justify-center">
                <Baby className="h-6 w-6 text-baby-purple" />
              </div>
              <h2 className="text-xl font-bold ml-2">{baby.name}</h2>
            </div>
            
            <div className="text-sm text-gray-500 mb-2 bg-white/60 p-2 rounded-lg">
              <p className="font-medium">Birthdate: <span className="text-gray-600">{format(new Date(baby.date_of_birth), 'MMMM d, yyyy')}</span></p>
              <p className="capitalize font-medium">Gender: <span className="text-gray-600">{baby.gender || 'Not specified'}</span></p>
            </div>
            
            <div className="mt-auto flex flex-col gap-2">
              <Button 
                className="w-full px-4 py-2 bg-baby-purple text-white rounded-lg flex items-center justify-center hover:bg-baby-purple/90 shadow-md"
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
                className="w-full border-baby-purple/30 text-baby-purple hover:bg-baby-purple/10 hover:text-baby-purple" 
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
