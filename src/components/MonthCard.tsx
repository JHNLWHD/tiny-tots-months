
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

interface MonthCardProps {
  month: number;
  backgroundClass: string;
}

const MonthCard: React.FC<MonthCardProps> = ({ month, backgroundClass }) => {
  return (
    <Link to={`/month/${month}`} className="block transition-transform hover:scale-105">
      <Card className={`month-card h-40 flex items-center justify-center ${backgroundClass} border-2 border-white/50`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-md">Month {month}</h2>
        </div>
      </Card>
    </Link>
  );
};

export default MonthCard;
