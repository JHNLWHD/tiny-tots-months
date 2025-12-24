import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CreateMilestoneData, Milestone } from "@/hooks/useMilestones";
import { trackEvent } from "@/lib/analytics";
import { getAvailableSuggestions } from "@/lib/milestoneSuggestions";
import { Plus, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface MilestoneFormProps {
	babyId: string;
	monthNumber: number;
	onSubmit: (data: CreateMilestoneData) => void;
	isSubmitting: boolean;
	existingMilestones?: Milestone[];
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
	babyId,
	monthNumber,
	onSubmit,
	isSubmitting,
	existingMilestones = [],
}) => {
	const [milestoneText, setMilestoneText] = useState("");

	const availableSuggestions = getAvailableSuggestions(
		monthNumber,
		existingMilestones,
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!milestoneText.trim()) return;

		const milestoneData = {
			baby_id: babyId,
			milestone_text: milestoneText.trim(),
			month_number: monthNumber,
		};

		// Track milestone creation
		trackEvent("milestone_created", {
			baby_id: babyId,
			month_number: monthNumber,
			text_length: milestoneText.trim().length,
		});

		onSubmit(milestoneData);
		setMilestoneText("");
	};

	const handleSuggestionClick = (suggestion: string) => {
		const milestoneData = {
			baby_id: babyId,
			milestone_text: suggestion,
			month_number: monthNumber,
		};

		// Track milestone creation from suggestion
		trackEvent("milestone_created", {
			baby_id: babyId,
			month_number: monthNumber,
			text_length: suggestion.length,
			source: "suggestion",
		});

		onSubmit(milestoneData);
	};

	return (
		<Card className="p-4 bg-white/90 rounded-xl mb-6">
			{/* Suggested Milestones Section */}
			{availableSuggestions.length > 0 && (
				<div className="mb-6 pb-6 border-b border-gray-200">
					<div className="flex items-center gap-2 mb-3">
						<Sparkles className="h-4 w-4 text-blue-500" />
						<label className="text-sm font-medium text-gray-700">
							Suggested Milestones
						</label>
					</div>
					<div className="flex flex-wrap gap-2">
						{availableSuggestions.map((suggestion, index) => (
							<Button
								key={index}
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleSuggestionClick(suggestion)}
								disabled={isSubmitting}
								className="text-xs sm:text-sm h-auto py-2 px-3 whitespace-normal text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
							>
								{suggestion}
							</Button>
						))}
					</div>
					<p className="text-xs text-gray-500 mt-2">
						Click any suggestion to add it quickly
					</p>
				</div>
			)}

			{/* Custom Milestone Form */}
			<form onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div>
						<label
							htmlFor="milestone"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{availableSuggestions.length > 0
								? "Or Add Custom Milestone"
								: "Add New Milestone"}
						</label>
						<Textarea
							id="milestone"
							placeholder="Describe a new milestone..."
							value={milestoneText}
							onChange={(e) => setMilestoneText(e.target.value)}
							className="w-full min-h-[100px]"
						/>
					</div>

					<Button
						type="submit"
						className="w-full flex items-center justify-center gap-2"
						disabled={isSubmitting || !milestoneText.trim()}
					>
						<Plus size={16} />
						{isSubmitting ? "Adding..." : "Add Milestone"}
					</Button>
				</div>
			</form>
		</Card>
	);
};

export default MilestoneForm;
