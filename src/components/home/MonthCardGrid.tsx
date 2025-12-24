import MonthCard from "@/components/MonthCard";
import { useIsMobile } from "@/hooks/useIsMobile.tsx";
import type React from "react";

type MonthCardGridProps = {
	babyId?: string;
	babyName?: string;
	showGrid: boolean;
};

const MonthCardGrid: React.FC<MonthCardGridProps> = ({
	babyId,
	babyName,
	showGrid,
}) => {
	const monthlyBackgroundClasses = [
		"bg-gradient-to-br from-indigo-100 to-indigo-200",
		"bg-gradient-to-br from-violet-100 to-violet-200",
		"bg-gradient-to-br from-purple-100 to-purple-200",
		"bg-gradient-to-br from-blue-100 to-blue-200",
		"bg-gradient-to-br from-sky-100 to-sky-200",
		"bg-gradient-to-br from-cyan-100 to-cyan-200",
		"bg-gradient-to-br from-teal-100 to-teal-200",
		"bg-gradient-to-br from-emerald-100 to-emerald-200",
		"bg-gradient-to-br from-green-100 to-green-200",
		"bg-gradient-to-br from-lime-100 to-lime-200",
		"bg-gradient-to-br from-yellow-100 to-yellow-200",
		"bg-gradient-to-br from-amber-100 to-amber-200",
	];

	if (!showGrid) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Month Timeline Card */}
			<div className="p-6 border-2 border-baby-purple/20 hover:border-baby-purple/40 transition-colors rounded-xl bg-white shadow-sm">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<div>
						<h2 className="text-2xl font-heading text-baby-purple flex items-center gap-2 mb-2">
							<span className="text-2xl sm:text-3xl">📅</span>
							{babyName ? `${babyName}'s Timeline` : "Monthly Timeline"}
						</h2>
						<p className="text-gray-600">
							Track milestones and memories month by month
						</p>
					</div>
				</div>
				
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
					{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
						<MonthCard
							key={month}
							month={month}
							backgroundClass={
								monthlyBackgroundClasses[
									(month - 1) % monthlyBackgroundClasses.length
								]
							}
							babyId={babyId}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default MonthCardGrid;
