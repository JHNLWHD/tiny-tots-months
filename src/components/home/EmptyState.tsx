import { Button } from "@/components/ui/button";
import { Baby, Plus } from "lucide-react";
import type React from "react";

interface EmptyStateProps {
	onAddBaby: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddBaby }) => {
	return (
		<div className="text-center py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-b from-baby-purple/5 to-white rounded-xl my-6 sm:my-8">
			<div className="w-16 sm:w-20 h-16 sm:h-20 bg-baby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-float">
				<Baby className="h-8 sm:h-10 w-8 sm:w-10 text-baby-purple" />
			</div>
			<h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-3 sm:mb-4 font-bubblegum">
				No Babies Added Yet
			</h2>
			<p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
				Add your first baby to start tracking their milestones and capturing
				precious memories!
			</p>
			<Button
				onClick={onAddBaby}
				className="bg-baby-purple hover:bg-baby-purple/90 text-white px-5 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-md transition-all hover:scale-105 text-sm sm:text-base"
			>
				<Plus className="mr-1.5 sm:mr-2 h-4 w-4" />
				Add Your First Baby
			</Button>
		</div>
	);
};

export default EmptyState;
