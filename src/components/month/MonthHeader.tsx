
import React from "react";
import ShareButton from "@/components/ShareButton";
import { Baby } from "@/hooks/useBabyProfiles";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

interface MonthHeaderProps {
  monthNumber: number;
  selectedBaby: Baby | undefined;
}

const MonthHeader: React.FC<MonthHeaderProps> = ({ monthNumber, selectedBaby }) => {
  return (
    <div className="space-y-3 mb-6">
      <Breadcrumb className="animate-fade-in">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/app" className="flex items-center text-gray-500 hover:text-baby-purple transition-colors">
                <Home className="h-3.5 w-3.5 mr-1" />
                <span>Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="text-baby-purple font-medium">
              Month {monthNumber}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-baby-purple to-baby-blue animate-fade-in">
          Month {monthNumber} Milestones
        </h1>
        
        {selectedBaby && (
          <div className="w-full sm:w-auto animate-fade-in">
            <ShareButton 
              babyId={selectedBaby.id}
              babyName={selectedBaby.name}
              type="month"
              monthNumber={monthNumber}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthHeader;
