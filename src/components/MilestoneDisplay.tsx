
import React from 'react';
import { Card } from '@/components/ui/card';

interface MilestoneDisplayProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const MilestoneDisplay: React.FC<MilestoneDisplayProps> = ({ title, description, icon }) => {
  return (
    <Card className="p-6 bg-white/80 rounded-xl shadow-sm mb-4">
      <div className="flex items-start gap-4">
        {icon && <div className="text-blue-400 mt-1">{icon}</div>}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default MilestoneDisplay;
