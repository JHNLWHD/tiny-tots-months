
import React from 'react';
import MonthCard from '@/components/MonthCard';

interface MonthCardGridProps {
  babyId?: string;
  showGrid: boolean;
}

const MonthCardGrid: React.FC<MonthCardGridProps> = ({ babyId, showGrid }) => {
  // Monthly background colors for the month cards
  const monthlyBackgroundClasses = [
    'bg-baby-blue/20', 'bg-baby-purple/20', 'bg-baby-pink/20', 'bg-baby-green/20',
    'bg-amber-100', 'bg-yellow-100', 'bg-orange-100', 'bg-rose-100',
    'bg-teal-100', 'bg-sky-100', 'bg-indigo-100', 'bg-violet-100',
  ];
  
  if (!showGrid) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Monthly Milestones</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <MonthCard 
            key={month}
            month={month}
            backgroundClass={monthlyBackgroundClasses[(month - 1) % monthlyBackgroundClasses.length]}
            babyId={babyId}
          />
        ))}
      </div>
    </div>
  );
};

export default MonthCardGrid;
