import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Baby as BabyType } from "@/hooks/useBabyProfiles";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { Baby, Calendar, Plus, Share } from "lucide-react";
import type React from "react";

interface BabyListProps {
	babies: BabyType[];
	isLoading: boolean;
	onAddBaby: () => void;
	onSelectBaby: (baby: BabyType) => void;
	selectedBaby: BabyType | null;
}

const BabyList: React.FC<BabyListProps> = ({
	babies,
	isLoading,
	onAddBaby,
	onSelectBaby,
	selectedBaby,
}) => {
	const { isPremium } = useSubscription();

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 md:mb-8">
			<Card
				onClick={onAddBaby}
				className="p-4 sm:p-6 border-dashed border-2 border-gray-300 hover:border-baby-purple hover:bg-baby-purple/5 transition-colors cursor-pointer flex flex-col items-center justify-center h-48 sm:h-64 rounded-xl baby-card-shadow transform hover:scale-105 duration-300"
			>
				<div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-baby-purple/10 flex items-center justify-center mb-3 md:mb-4">
					<Plus className="h-6 sm:h-8 w-6 sm:w-8 text-baby-purple" />
				</div>
				<p className="text-base sm:text-lg font-medium text-gray-600 font-sans text-center">
					Add a Baby
				</p>
				<p className="text-xs sm:text-sm text-gray-500 text-center mt-2">
					{isPremium
						? "Add as many babies as you want"
						: "Free plan allows 1 baby"}
				</p>
			</Card>

			{isLoading ? (
				<Card className="p-6 h-48 sm:h-64 flex items-center justify-center rounded-xl baby-card-shadow">
					<div className="animate-pulse text-baby-purple font-heading text-lg sm:text-xl">
						Loading...
					</div>
				</Card>
			) : (
				babies.map((baby) => (
					<Card
						key={baby.id}
						className={`p-4 sm:p-6 h-48 sm:h-64 flex flex-col cursor-pointer hover:shadow-md transition-all rounded-xl baby-card-shadow transform hover:scale-105 duration-300 bg-gradient-to-br from-white to-baby-purple/5 ${
							selectedBaby?.id === baby.id
								? "ring-4 ring-baby-purple/50 border-2 border-baby-purple shadow-lg"
								: ""
						}`}
						onClick={() => onSelectBaby(baby)}
					>
						<div className="flex items-center mb-2 sm:mb-4">
							<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-baby-purple/20 flex items-center justify-center">
								<Baby className="h-5 sm:h-6 w-5 sm:w-6 text-baby-purple" />
							</div>
							<h2 className="text-lg sm:text-xl font-bold ml-2 truncate">
								{baby.name}
							</h2>
						</div>

						<div className="text-xs sm:text-sm text-gray-500 mb-2 bg-white/60 p-1.5 sm:p-2 rounded-lg">
							<p className="font-medium truncate">
								Birthdate:{" "}
								<span className="text-gray-600">
									{format(new Date(baby.date_of_birth), "MMM d, yyyy")}
								</span>
							</p>
							<p className="capitalize font-medium truncate">
								Gender:{" "}
								<span className="text-gray-600">
									{baby.gender || "Not specified"}
								</span>
							</p>
						</div>

						<div className="mt-auto flex flex-col gap-2">
							<Button
								className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-baby-purple text-white rounded-lg flex items-center justify-center hover:bg-baby-purple/90 shadow-md text-xs sm:text-sm"
								onClick={(e) => {
									e.stopPropagation();
									onSelectBaby(baby);
								}}
							>
								<Calendar className="mr-1.5 h-3 sm:h-4 w-3 sm:w-4" />
								View Milestones
							</Button>
						</div>
					</Card>
				))
			)}
		</div>
	);
};

export default BabyList;
