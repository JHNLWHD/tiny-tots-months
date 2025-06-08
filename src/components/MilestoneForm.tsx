import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CreateMilestoneData } from "@/hooks/useMilestones";
import { trackEvent } from "@/lib/analytics";
import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface MilestoneFormProps {
	babyId: string;
	monthNumber: number;
	onSubmit: (data: CreateMilestoneData) => void;
	isSubmitting: boolean;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
	babyId,
	monthNumber,
	onSubmit,
	isSubmitting,
}) => {
	const [milestoneText, setMilestoneText] = useState("");

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

	return (
		<Card className="p-4 bg-white/90 rounded-xl mb-6">
			<form onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div>
						<label
							htmlFor="milestone"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Add New Milestone
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
