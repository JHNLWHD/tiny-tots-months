import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Baby as BabyType } from "@/hooks/useBabyProfiles";
import { useBabyStats } from "@/hooks/useBabyStats";
import { format } from "date-fns";
import { Baby, Calendar, Plus, Star, TrendingUp, MoreVertical, Trash2 } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

interface BabyListProps {
	babies: BabyType[];
	isLoading: boolean;
	onAddBaby: () => void;
	onSelectBaby: (baby: BabyType) => void;
	onDeleteBaby?: (baby: BabyType) => void;
	selectedBaby: BabyType | null;
}

interface BabyCardProps {
	baby: BabyType;
	selectedBaby: BabyType | null;
	onSelectBaby: (baby: BabyType) => void;
	onDeleteBaby?: (baby: BabyType) => void;
}

const BabyCard: React.FC<BabyCardProps> = ({
	baby,
	selectedBaby,
	onSelectBaby,
	onDeleteBaby,
}) => {
	const { stats, isLoading: isLoadingStats } = useBabyStats(baby.id);

	return (
		<Card
			className={`p-5 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
				selectedBaby?.id === baby.id
					? "ring-3 ring-baby-purple/50 border-2 border-baby-purple bg-gradient-to-br from-baby-purple/5 to-baby-blue/5 shadow-lg"
					: "border border-gray-200 hover:border-baby-purple/30 bg-white"
			}`}
			onClick={() => onSelectBaby(baby)}
		>
			{/* Baby Header */}
			<div className="flex items-center gap-3 mb-4">
				<div className={`w-12 h-12 rounded-full flex items-center justify-center ${
					selectedBaby?.id === baby.id
						? "bg-baby-purple/20"
						: "bg-gray-100"
				}`}>
					<Baby className={`h-6 w-6 ${
						selectedBaby?.id === baby.id
							? "text-baby-purple"
							: "text-gray-600"
					}`} />
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-heading text-lg text-gray-800 truncate">
						{baby.name}
					</h3>
					<p className="text-sm text-gray-500">
						{format(new Date(baby.date_of_birth), "MMM d, yyyy")}
					</p>
				</div>
				{onDeleteBaby && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 hover:bg-gray-100"
								onClick={(e) => e.stopPropagation()}
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onDeleteBaby(baby);
								}}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Baby
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{/* Progress Indicators */}
			<div className="mb-4 space-y-2">
				<div className="flex justify-between items-center text-sm">
					<span className="text-gray-600">Progress</span>
					{isLoadingStats ? (
						<span className="text-gray-400 text-xs">Loading...</span>
					) : (
						<span className="text-baby-purple font-medium">
							{stats.monthsTracked}/12 months
						</span>
					)}
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className="bg-baby-purple h-2 rounded-full transition-all duration-500"
						style={{ 
							width: isLoadingStats 
								? "0%" 
								: `${Math.min(stats.progressPercentage, 100)}%` 
						}}
					/>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="flex justify-between items-center text-xs text-gray-500 mb-4">
				<div className="flex items-center gap-1">
					<Star className="h-3 w-3" />
					{isLoadingStats ? (
						<span className="text-gray-400">...</span>
					) : (
						<span>{stats.milestoneCount} milestone{stats.milestoneCount !== 1 ? 's' : ''}</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Calendar className="h-3 w-3" />
					{isLoadingStats ? (
						<span className="text-gray-400">...</span>
					) : (
						<span>{stats.photoCount} photo{stats.photoCount !== 1 ? 's' : ''}</span>
					)}
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-2">
				<Button
					size="sm"
					asChild
					className={`flex-1 text-xs ${
						selectedBaby?.id === baby.id
							? "bg-baby-purple hover:bg-baby-purple/90 text-white"
							: "bg-gray-100 hover:bg-baby-purple/10 text-gray-700 hover:text-baby-purple"
					}`}
				>
					<Link 
						to={`/app/baby/${baby.id}/gallery`}
						onClick={(e) => e.stopPropagation()}
					>
						<Calendar className="h-3 w-3 mr-1" />
						View Gallery
					</Link>
				</Button>
				<Button
					size="sm"
					variant="outline"
					className="border-baby-purple/30 text-baby-purple hover:bg-baby-purple/10 text-xs"
					onClick={(e) => {
						e.stopPropagation();
						onSelectBaby(baby);
					}}
				>
					<TrendingUp className="h-3 w-3" />
				</Button>
			</div>
		</Card>
	);
};

const BabyList: React.FC<BabyListProps> = ({
	babies,
	isLoading,
	onAddBaby,
	onSelectBaby,
	onDeleteBaby,
	selectedBaby,
}) => {

	return (
		<div className="space-y-6">
			{/* Navigation-focused baby selector */}
			<Card className="p-6 border-2 border-baby-purple/20 hover:border-baby-purple/40 transition-colors">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-heading text-baby-purple flex items-center gap-2">
						<Baby className="h-7 w-7" />
						Your Babies
					</h2>
					<Button
						onClick={onAddBaby}
						className="bg-baby-purple hover:bg-baby-purple/90 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Baby
					</Button>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="h-32 bg-gray-200 rounded-xl"></div>
							</div>
						))}
					</div>
				) : babies.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{babies.map((baby) => (
							<BabyCard
								key={baby.id}
								baby={baby}
								selectedBaby={selectedBaby}
								onSelectBaby={onSelectBaby}
								onDeleteBaby={onDeleteBaby}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<div className="w-20 h-20 bg-baby-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
							<Baby className="h-10 w-10 text-baby-purple" />
						</div>
						<h3 className="font-heading text-xl text-gray-700 mb-3">
							No babies added yet
						</h3>
						<p className="text-gray-500 mb-6 max-w-md mx-auto">
							Start your journey by adding your first baby profile. Track their milestones, upload photos, and create lasting memories!
						</p>
						<Button
							onClick={onAddBaby}
							className="bg-baby-purple hover:bg-baby-purple/90 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
						>
							<Plus className="h-5 w-5 mr-2" />
							Add Your First Baby
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
};

export default BabyList;
