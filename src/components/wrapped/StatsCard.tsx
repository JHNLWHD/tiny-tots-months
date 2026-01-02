import { WrappedCard } from "./WrappedCard";
import { Sparkles, Camera, Target, TrendingUp } from "lucide-react";
import type { WrappedStats } from "@/hooks/useBabyWrapped";
import type React from "react";

type StatsCardProps = {
	data: WrappedStats;
};

export const StatsCard: React.FC<StatsCardProps> = ({ data }) => {
	return (
		<WrappedCard className="flex flex-col items-center justify-center">
			<div className="text-center space-y-6">
				<div className="flex justify-center mb-4">
					<Sparkles className="h-16 w-16 text-baby-purple animate-pulse" />
				</div>
				<h2 className="text-4xl md:text-5xl font-heading text-baby-purple mb-2">
					{data.babyName}'s First Year
				</h2>
				<p className="text-xl text-gray-600 mb-8">Here's what you captured!</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
					<div className="bg-white/80 rounded-xl p-6 shadow-lg border border-baby-purple/20">
						<div className="flex items-center justify-center mb-3">
							<Camera className="h-8 w-8 text-baby-purple" />
						</div>
						<div className="text-4xl font-bold text-baby-purple mb-1">
							{data.totalPhotos}
						</div>
						<div className="text-sm text-gray-600">Photos Captured</div>
					</div>

					<div className="bg-white/80 rounded-xl p-6 shadow-lg border border-baby-purple/20">
						<div className="flex items-center justify-center mb-3">
							<Target className="h-8 w-8 text-baby-purple" />
						</div>
						<div className="text-4xl font-bold text-baby-purple mb-1">
							{data.totalMilestones}
						</div>
						<div className="text-sm text-gray-600">Milestones Recorded</div>
					</div>

					<div className="bg-white/80 rounded-xl p-6 shadow-lg border border-baby-purple/20">
						<div className="flex items-center justify-center mb-3">
							<TrendingUp className="h-8 w-8 text-baby-purple" />
						</div>
						<div className="text-4xl font-bold text-baby-purple mb-1">
							{Math.round(data.completionPercentage)}%
						</div>
						<div className="text-sm text-gray-600">Year Complete</div>
					</div>
				</div>
			</div>
		</WrappedCard>
	);
};

