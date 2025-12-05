import { Card } from "@/components/ui/card";
import { useBabyPhotos } from "@/hooks/useBabyPhotos";
import { useMilestones } from "@/hooks/useMilestones";
import { Baby } from "@/hooks/useBabyProfiles";
import { CheckCircle2, Circle, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";

type ProgressData = {
	totalMonths: number;
	completedMonths: number;
	totalMilestones: number;
	completedMilestones: number;
	totalPhotos: number;
	monthsWithContent: number[];
};

type ProgressIndicatorProps = {
	selectedBaby?: Baby;
	showDetailed?: boolean;
};

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
	selectedBaby,
	showDetailed = false,
}) => {
	// Fetch real data for the selected baby
	const { photos = [], isLoading: loadingPhotos } = useBabyPhotos(selectedBaby?.id);
	
	// Fetch milestones for all months (hooks must be called at top level)
	const monthlyMilestones = [
		useMilestones(selectedBaby?.id, 1),
		useMilestones(selectedBaby?.id, 2),
		useMilestones(selectedBaby?.id, 3),
		useMilestones(selectedBaby?.id, 4),
		useMilestones(selectedBaby?.id, 5),
		useMilestones(selectedBaby?.id, 6),
		useMilestones(selectedBaby?.id, 7),
		useMilestones(selectedBaby?.id, 8),
		useMilestones(selectedBaby?.id, 9),
		useMilestones(selectedBaby?.id, 10),
		useMilestones(selectedBaby?.id, 11),
		useMilestones(selectedBaby?.id, 12),
	];
	
	// Aggregate all milestones
	const allMilestones = useMemo(() => {
		return monthlyMilestones.flatMap(monthData => monthData.milestones || []);
	}, [
		monthlyMilestones[0].milestones,
		monthlyMilestones[1].milestones,
		monthlyMilestones[2].milestones,
		monthlyMilestones[3].milestones,
		monthlyMilestones[4].milestones,
		monthlyMilestones[5].milestones,
		monthlyMilestones[6].milestones,
		monthlyMilestones[7].milestones,
		monthlyMilestones[8].milestones,
		monthlyMilestones[9].milestones,
		monthlyMilestones[10].milestones,
		monthlyMilestones[11].milestones,
	]);

	// Calculate real progress data
	const data: ProgressData = useMemo(() => {
		if (!selectedBaby || loadingPhotos) {
			return {
				totalMonths: 12,
				completedMonths: 0,
				totalMilestones: 0,
				completedMilestones: 0,
				totalPhotos: 0,
				monthsWithContent: [],
			};
		}

		// Calculate months with content (photos or milestones)
		const monthsWithContent = new Set<number>();
		
		// Add months that have photos
		photos.forEach(photo => {
			if (photo.month_number && photo.month_number >= 1 && photo.month_number <= 12) {
				monthsWithContent.add(photo.month_number);
			}
		});

		// Add months that have milestones
		allMilestones.forEach(milestone => {
			if (milestone.month_number && milestone.month_number >= 1 && milestone.month_number <= 12) {
				monthsWithContent.add(milestone.month_number);
			}
		});

		const completedMonths = monthsWithContent.size;
		const totalPhotos = photos.length;
		const completedMilestones = allMilestones.length;

		return {
			totalMonths: 12,
			completedMonths,
			totalMilestones: completedMilestones > 0 ? completedMilestones : 36, // Use actual or estimated
			completedMilestones,
			totalPhotos,
			monthsWithContent: Array.from(monthsWithContent).sort((a, b) => a - b),
		};
	}, [selectedBaby, photos, allMilestones, loadingPhotos]);

	const monthProgress = data.totalMonths > 0 ? (data.completedMonths / data.totalMonths) * 100 : 0;
	const milestoneProgress = data.totalMilestones > 0 ? (data.completedMilestones / data.totalMilestones) * 100 : 0;
	const photoProgress = data.totalPhotos > 0 ? Math.min((data.totalPhotos / 60) * 100, 100) : 0; // Assume 60 photos is 100%

	if (!selectedBaby) {
		return null;
	}

	const ProgressBar: React.FC<{ progress: number; color?: string }> = ({ 
		progress, 
		color = "bg-baby-purple" 
	}) => (
		<div className="w-full bg-gray-200 rounded-full h-2">
			<div
				className={`${color} h-2 rounded-full transition-all duration-500 ease-out`}
				style={{ width: `${Math.min(progress, 100)}%` }}
			/>
		</div>
	);

	const CircularProgress: React.FC<{ progress: number; size?: number }> = ({ 
		progress, 
		size = 60 
	}) => {
		const radius = (size - 8) / 2;
		const circumference = radius * 2 * Math.PI;
		const strokeDasharray = circumference;
		const strokeDashoffset = circumference - (progress / 100) * circumference;

		return (
			<div className="relative" style={{ width: size, height: size }}>
				<svg
					width={size}
					height={size}
					className="transform -rotate-90"
				>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="currentColor"
						strokeWidth="4"
						fill="none"
						className="text-gray-200"
					/>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="currentColor"
						strokeWidth="4"
						fill="none"
						strokeDasharray={strokeDasharray}
						strokeDashoffset={strokeDashoffset}
						className="text-baby-purple transition-all duration-500 ease-out"
						strokeLinecap="round"
					/>
				</svg>
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-sm font-bold text-baby-purple">
						{Math.round(progress)}%
					</span>
				</div>
			</div>
		);
	};

	if (showDetailed) {
		return (
			<Card className="p-6 border-2 border-baby-purple/20">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-heading text-baby-purple flex items-center gap-2">
						<TrendingUp className="h-6 w-6" />
						{selectedBaby.name}'s Progress
					</h2>
					<CircularProgress progress={monthProgress} />
				</div>

				<div className="space-y-6">
					{/* Month Progress */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<h3 className="font-medium text-gray-800">Months Documented</h3>
							<span className="text-sm text-gray-600">
								{data.completedMonths} of {data.totalMonths}
							</span>
						</div>
						<ProgressBar progress={monthProgress} />
					</div>

					{/* Milestone Progress */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<h3 className="font-medium text-gray-800">Milestones Recorded</h3>
							<span className="text-sm text-gray-600">
								{data.completedMilestones} milestones
							</span>
						</div>
						<ProgressBar progress={milestoneProgress} color="bg-green-500" />
					</div>

					{/* Photos */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<h3 className="font-medium text-gray-800">Photos Uploaded</h3>
							<span className="text-sm text-gray-600">
								{data.totalPhotos} photos
							</span>
						</div>
						<ProgressBar progress={photoProgress} color="bg-blue-500" />
					</div>

					{/* Month Grid */}
					<div>
						<h3 className="font-medium text-gray-800 mb-3">Monthly Progress</h3>
						<div className="grid grid-cols-6 gap-2">
							{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
								const hasContent = data.monthsWithContent.includes(month);
								return (
									<div
										key={month}
										className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
											hasContent
												? "bg-baby-purple text-white"
												: "bg-gray-100 text-gray-400"
										}`}
									>
										{month}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</Card>
		);
	}

	// Compact version
	return (
		<Card className="p-4 border border-baby-purple/20">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<CircularProgress progress={monthProgress} size={40} />
					<div>
						<h3 className="font-medium text-gray-800">
							{selectedBaby.name}'s Progress
						</h3>
						<p className="text-sm text-gray-600">
							{data.completedMonths} of {data.totalMonths} months
						</p>
					</div>
				</div>
				
				<div className="flex items-center gap-4 text-sm">
					<div className="text-center">
						<div className="font-bold text-baby-purple">
							{data.completedMilestones}
						</div>
						<div className="text-gray-500">Milestones</div>
					</div>
					<div className="text-center">
						<div className="font-bold text-blue-600">
							{data.totalPhotos}
						</div>
						<div className="text-gray-500">Photos</div>
					</div>
				</div>
			</div>
		</Card>
	);
};

export default ProgressIndicator;
