
import React from 'react';
import MonthCard from '@/components/MonthCard';

interface MonthCardGridProps {
  babyId?: string;
  showGrid: boolean;
}

const MonthCardGrid: React.FC<MonthCardGridProps> = ({ babyId, showGrid }) => {
  // Monthly background classes with gradients for the month cards
  const monthlyBackgroundClasses = [
    'bg-gradient-to-br from-blue-100 to-blue-200',
    'bg-gradient-to-br from-purple-100 to-purple-200',
    'bg-gradient-to-br from-pink-100 to-pink-200',
    'bg-gradient-to-br from-green-100 to-green-200',
    'bg-gradient-to-br from-amber-100 to-amber-200',
    'bg-gradient-to-br from-yellow-100 to-orange-100',
    'bg-gradient-to-br from-orange-100 to-red-100',
    'bg-gradient-to-br from-rose-100 to-pink-100',
    'bg-gradient-to-br from-teal-100 to-cyan-100',
    'bg-gradient-to-br from-sky-100 to-blue-100',
    'bg-gradient-to-br from-indigo-100 to-violet-100',
    'bg-gradient-to-br from-violet-100 to-fuchsia-100',
  ];
  
  if (!showGrid) {
    return null;
  }

  return (
    <div className="mt-12 bg-white/50 p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-8 font-bubblegum text-baby-purple inline-flex items-center">
        <span className="text-3xl mr-2">📅</span> Monthly Milestones
      </h2>
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
