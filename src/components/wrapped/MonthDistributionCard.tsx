import { WrappedCard } from "./WrappedCard";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import type { WrappedStats } from "@/hooks/useBabyWrapped";
import type React from "react";

type MonthDistributionCardProps = {
	data: WrappedStats;
	isVisible?: boolean;
};

const colors = [
	"#8b5cf6",
	"#7c3aed",
	"#6d28d9",
	"#5b21b6",
	"#4c1d95",
	"#3b1784",
	"#2d1466",
	"#1e0f47",
	"#0f0729",
	"#8b5cf6",
	"#7c3aed",
	"#6d28d9",
];

export const MonthDistributionCard: React.FC<MonthDistributionCardProps> = ({
	data,
	isVisible = true,
}) => {
	const chartData = data.monthDistribution.map((dist) => ({
		name: `Month ${dist.month}`,
		photos: dist.photoCount,
		milestones: dist.milestoneCount,
	}));

	return (
		<WrappedCard className="flex flex-col">
			<div className="flex items-center gap-3 mb-6">
				<BarChart3 className="h-8 w-8 text-baby-purple" />
				<h2 className="text-3xl font-heading text-baby-purple">
					Month by Month
				</h2>
			</div>
			<p className="text-gray-600 mb-8">
				Your photo activity throughout {data.babyName}'s first year
			</p>

			<div className="flex-1 flex items-center justify-center">
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData}>
						<XAxis
							dataKey="name"
							tick={{ fontSize: 12 }}
							angle={-45}
							textAnchor="end"
							height={80}
						/>
						<YAxis tick={{ fontSize: 12 }} />
						<Bar dataKey="photos" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</WrappedCard>
	);
};

