import { WrappedCard } from "./WrappedCard";
import { Star, Sparkles } from "lucide-react";
import type { WrappedStats } from "@/hooks/useBabyWrapped";
import { getMonthNameFromMonthNumber } from "@/utils/monthUtils";
import type React from "react";

type MilestoneHighlightsCardProps = {
	data: WrappedStats;
};

export const MilestoneHighlightsCard: React.FC<MilestoneHighlightsCardProps> = ({
	data,
}) => {

	// Get top 5 milestones (by month, showing variety)
	const allMilestones = Object.entries(data.milestonesByMonth)
		.flatMap(([month, milestones]) =>
			milestones.map((m) => ({ ...m, monthNumber: parseInt(month) })),
		)
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
		.slice(0, 5);

	if (allMilestones.length === 0) {
		return (
			<WrappedCard className="flex flex-col items-center justify-center">
				<div className="text-center">
					<Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
					<p className="text-xl text-gray-500">No milestones recorded yet</p>
				</div>
			</WrappedCard>
		);
	}

	return (
		<WrappedCard className="flex flex-col">
			<div className="flex items-center gap-3 mb-6">
				<Sparkles className="h-8 w-8 text-baby-purple" />
				<h2 className="text-3xl font-heading text-baby-purple">
					Milestone Highlights
				</h2>
			</div>
			<p className="text-gray-600 mb-8">
				Special moments from {data.babyName}'s first year
			</p>

			<div className="space-y-4 flex-1 overflow-y-auto">
				{allMilestones.map((milestone, index) => (
					<div
						key={milestone.id}
						className="bg-white/80 rounded-xl p-6 shadow-lg border border-baby-purple/20 hover:shadow-xl transition-shadow"
					>
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0">
								<div className="w-12 h-12 bg-baby-purple/20 rounded-full flex items-center justify-center">
									<Star className="h-6 w-6 text-baby-purple" />
								</div>
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-sm font-semibold text-baby-purple">
										Month {milestone.monthNumber}
									</span>
									<span className="text-xs text-gray-500">
										{getMonthNameFromMonthNumber(data.babyBirthDate, milestone.monthNumber)}
									</span>
								</div>
								<p className="text-gray-800">{milestone.milestone_text}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</WrappedCard>
	);
};

