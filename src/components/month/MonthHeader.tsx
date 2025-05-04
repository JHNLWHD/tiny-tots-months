
import React from "react";
import ShareButton from "@/components/ShareButton";
import { Baby } from "@/hooks/useBabyProfiles";

interface MonthHeaderProps {
  monthNumber: number;
  selectedBaby: Baby | undefined;
}

const MonthHeader: React.FC<MonthHeaderProps> = ({ monthNumber, selectedBaby }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        Month {monthNumber} Milestones
      </h1>
      
      {selectedBaby && (
        <ShareButton 
          babyId={selectedBaby.id}
          babyName={selectedBaby.name}
          type="month"
          monthNumber={monthNumber}
        />
      )}
    </div>
  );
};

export default MonthHeader;
