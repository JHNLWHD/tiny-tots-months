import { WrappedCard } from "./WrappedCard";
import { Trophy, Calendar } from "lucide-react";
import type { WrappedStats } from "@/hooks/useBabyWrapped";
import type React from "react";

type TopMonthCardProps = {
	data: WrappedStats;
	isVisible?: boolean;
};

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export const TopMonthCard: React.FC<TopMonthCardProps> = ({
	data,
	isVisible = true,
}) => {
	if (!data.mostActiveMonth) {
		return (
			<WrappedCard isVisible={isVisible} className="flex flex-col items-center justify-center">
				<div className="text-center">
					<Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
					<p className="text-xl text-gray-500">No photos yet</p>
				</div>
			</WrappedCard>
		);
	}

	const topMonthData = data.monthDistribution.find(
		(d) => d.month === data.mostActiveMonth,
	);
	const monthName = monthNames[data.mostActiveMonth - 1] || `Month ${data.mostActiveMonth}`;

	return (
		<WrappedCard
			isVisible={isVisible}
			className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50"
		>
			<div className="text-center space-y-6">
				<div className="flex justify-center mb-4">
					<Trophy className="h-20 w-20 text-amber-500 animate-bounce" />
				</div>
				<h2 className="text-3xl md:text-4xl font-heading text-amber-700 mb-4">
					Most Active Month
				</h2>
				<div className="bg-white/90 rounded-2xl p-8 shadow-xl border-2 border-amber-200">
					<div className="text-6xl md:text-7xl font-bold text-amber-600 mb-2">
						{monthName}
					</div>
					<div className="text-2xl text-gray-700 mb-4">
						Month {data.mostActiveMonth}
					</div>
					<div className="grid grid-cols-2 gap-4 mt-6">
						<div className="bg-amber-50 rounded-lg p-4">
							<div className="text-3xl font-bold text-amber-700">
								{topMonthData?.photoCount || 0}
							</div>
							<div className="text-sm text-gray-600">Photos</div>
						</div>
						<div className="bg-amber-50 rounded-lg p-4">
							<div className="text-3xl font-bold text-amber-700">
								{topMonthData?.milestoneCount || 0}
							</div>
							<div className="text-sm text-gray-600">Milestones</div>
						</div>
					</div>
				</div>
			</div>
		</WrappedCard>
	);
};

