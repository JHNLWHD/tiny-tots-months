import { WrappedCard } from "./WrappedCard";
import { ArrowRight, Calendar } from "lucide-react";
import type { WrappedStats } from "@/hooks/useBabyWrapped";
import { getMonthNameFromMonthNumber } from "@/utils/monthUtils";
import type React from "react";

type TimelineCardProps = {
	data: WrappedStats;
	isCurrentCard?: boolean;
};

export const TimelineCard: React.FC<TimelineCardProps> = ({
	data,
	isCurrentCard = false,
}) => {
	if (!data.firstPhoto || !data.latestPhoto) {
		return (
			<WrappedCard className="flex flex-col items-center justify-center">
				<div className="text-center">
					<Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
					<p className="text-xl text-gray-500">Not enough photos to compare</p>
				</div>
			</WrappedCard>
		);
	}

	const firstDate = new Date(data.firstPhoto.created_at);
	const latestDate = new Date(data.latestPhoto.created_at);
	const daysDiff = Math.floor(
		(latestDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	const firstMonthName = getMonthNameFromMonthNumber(
		data.babyBirthDate,
		data.firstPhoto.month_number,
	);
	const latestMonthName = getMonthNameFromMonthNumber(
		data.babyBirthDate,
		data.latestPhoto.month_number,
	);

	return (
		<WrappedCard className="flex flex-col">
			<h2 className="text-3xl font-heading text-baby-purple mb-6 text-center">
				Growth Journey
			</h2>
			<p className="text-gray-600 mb-8 text-center">
				From first photo to latest memory
			</p>

			<div className="flex flex-col md:flex-row items-center justify-center gap-8">
				{/* First Photo */}
				<div className="flex-1 max-w-md">
					<div className="bg-white/80 rounded-xl p-4 shadow-lg border border-baby-purple/20">
						{data.firstPhoto.url ? (
							<img
								src={data.firstPhoto.url}
								alt="First photo"
								className="w-full h-64 object-cover rounded-lg mb-4"
								loading="eager"
								fetchPriority="high"
								decoding="async"
							/>
						) : (
							<div className="w-full h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
								<Calendar className="h-12 w-12 text-gray-400" />
							</div>
						)}
						<div className="text-center">
							<div className="text-sm font-semibold text-baby-purple mb-1">
								First Photo
							</div>
							<div className="text-xs text-gray-600">
								{firstMonthName}
							</div>
						</div>
					</div>
				</div>

				{/* Arrow */}
				<div className="hidden md:block">
					<ArrowRight className="h-12 w-12 text-baby-purple" />
				</div>
				<div className="md:hidden">
					<ArrowRight className="h-12 w-12 text-baby-purple rotate-90" />
				</div>

				{/* Latest Photo */}
				<div className="flex-1 max-w-md">
					<div className="bg-white/80 rounded-xl p-4 shadow-lg border border-baby-purple/20">
						{data.latestPhoto.url ? (
							<img
								src={data.latestPhoto.url}
								alt="Latest photo"
								className="w-full h-64 object-cover rounded-lg mb-4"
								loading="eager"
								fetchPriority="high"
								decoding="async"
							/>
						) : (
							<div className="w-full h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
								<Calendar className="h-12 w-12 text-gray-400" />
							</div>
						)}
						<div className="text-center">
							<div className="text-sm font-semibold text-baby-purple mb-1">
								Latest Photo
							</div>
							<div className="text-xs text-gray-600">
								{latestMonthName}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-8 text-center">
				<div className="inline-block bg-baby-purple/10 rounded-full px-6 py-3">
					<span className="text-lg font-semibold text-baby-purple">
						{daysDiff} days of memories
					</span>
				</div>
			</div>
		</WrappedCard>
	);
};

