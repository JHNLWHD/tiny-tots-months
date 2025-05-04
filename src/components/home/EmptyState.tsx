
import React from 'react';
import { Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddBaby: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddBaby }) => {
  return (
    <div className="text-center py-12">
      <Baby className="h-16 w-16 text-baby-purple/50 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">No Babies Added Yet</h2>
      <p className="text-gray-500 mb-6">
        Add your first baby to start tracking their milestones and memories.
      </p>
      <Button onClick={onAddBaby}>
        <Plus className="mr-2 h-4 w-4" />
        Add Your First Baby
      </Button>
    </div>
  );
};

export default EmptyState;
