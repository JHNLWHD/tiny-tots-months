
import React from 'react';
import { Baby, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddBaby: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddBaby }) => {
  return (
    <div className="text-center py-16 px-4 bg-gradient-to-b from-baby-purple/5 to-white rounded-xl my-8">
      <div className="w-20 h-20 bg-baby-purple/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
        <Baby className="h-10 w-10 text-baby-purple" />
      </div>
      <h2 className="text-3xl font-bold text-gray-700 mb-4 font-bubblegum">No Babies Added Yet</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Add your first baby to start tracking their milestones and capturing precious memories!
      </p>
      <Button 
        onClick={onAddBaby}
        className="bg-baby-purple hover:bg-baby-purple/90 text-white px-6 py-2 rounded-full shadow-md transition-all hover:scale-105"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Your First Baby
      </Button>
    </div>
  );
};

export default EmptyState;
