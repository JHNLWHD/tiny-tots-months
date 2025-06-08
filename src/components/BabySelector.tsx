import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Baby } from "@/hooks/useBabyProfiles";
import { format, parseISO } from "date-fns";
import type React from "react";

interface BabySelectorProps {
	babies: Baby[];
	selectedBabyId: string | null;
	onSelectBaby: (babyId: string) => void;
	isLoading?: boolean;
}

const BabySelector: React.FC<BabySelectorProps> = ({
	babies,
	selectedBabyId,
	onSelectBaby,
	isLoading = false,
}) => {
	if (babies.length === 0) {
		return (
			<div className="text-center py-2">
				<p className="text-sm text-gray-500">
					No babies added yet. Add a baby to track milestones.
				</p>
			</div>
		);
	}

	return (
		<div className="w-full max-w-xs">
			<Select
				disabled={isLoading}
				value={selectedBabyId || undefined}
				onValueChange={onSelectBaby}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select a baby" />
				</SelectTrigger>
				<SelectContent>
					{babies.map((baby) => (
						<SelectItem key={baby.id} value={baby.id}>
							{baby.name} (Born:{" "}
							{format(parseISO(baby.date_of_birth), "MMM d, yyyy")})
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export default BabySelector;
