
import React from "react";
import ShareButton from "@/components/ShareButton";
import { Baby } from "@/hooks/useBabyProfiles";

interface MonthHeaderProps {
  monthNumber: number;
  selectedBaby: Baby | undefined;
}

const MonthHeader: React.FC<MonthHeaderProps> = ({ monthNumber, selectedBaby }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
        Month {monthNumber} Milestones
      </h1>
      
      {selectedBaby && (
        <div className="w-full sm:w-auto">
          <ShareButton 
            babyId={selectedBaby.id}
            babyName={selectedBaby.name}
            type="month"
            monthNumber={monthNumber}
          />
        </div>
      )}
    </div>
  );
};

export default MonthHeader;
