import PhotoCollage from "@/components/PhotoCollage";
import { Card } from "@/components/ui/card";
import { useBabyPhotos } from "@/hooks/useBabyPhotos";
import { useIsMobile } from "@/hooks/useIsMobile.tsx";
import { useMilestones } from "@/hooks/useMilestones";
import { Star } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

type MonthCardProps = {
	month: number;
	backgroundClass: string;
	babyId?: string;
};

const MonthCard: React.FC<MonthCardProps> = ({
	month,
	backgroundClass,
	babyId,
}) => {
	const isMobile = useIsMobile();

	// Fetch photos for this baby and month if babyId is provided
	const { photos = [], isLoading: loadingPhotos } = useBabyPhotos(babyId);

	// Fetch milestones for this baby and month if babyId is provided
	const { milestones = [], isLoading: loadingMilestones } = useMilestones(
		babyId,
		month,
	);

	// Filter photos for the current month
	const monthPhotos = photos.filter(
		(photo) => photo.month_number === month && !photo.is_video,
	);

	// If we have photos for this month and a babyId, show the collage as background
	const hasPhotos = babyId && monthPhotos.length > 0;
	const hasMilestones = milestones.length > 0;

	// Function to get an emoji for each month
	const getMonthEmoji = (month: number) => {
		const emojis = [
			"🍼",
			"🧸",
			"🎈",
			"🦄",
			"🌈",
			"🪁",
			"🎠",
			"🎪",
			"🌟",
			"🎂",
			"🎁",
			"👶",
		];
		return emojis[month - 1] || "👶";
	};

	// Adjust height based on screen size
	const cardHeight = isMobile ? "h-28 sm:h-32 md:h-36 lg:h-40" : "h-40";

	return (
		<Link
			to={babyId ? `/app/month/${babyId}/${month}` : "/app/month/1"}
			className="block transition-transform hover:scale-105"
		>
			<Card
				className={`month-card ${cardHeight} relative overflow-hidden rounded-xl shadow-lg ${!hasPhotos ? backgroundClass : ""}`}
			>
				{/* Show photo collage as background if we have photos */}
				{hasPhotos && (
					<div className="absolute inset-0 w-full h-full">
						<PhotoCollage
							photos={monthPhotos}
							maxDisplayCount={4}
							isBackground={true}
						/>
					</div>
				)}

				{/* Overlay with month number and milestone indicator */}
				<div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
					<div className="text-center transform hover:scale-110 transition-transform">
						<div className="text-2xl sm:text-3xl md:text-4xl mb-0.5 md:mb-1">
							{getMonthEmoji(month)}
						</div>
						<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md font-heading">
							Month {month}
						</h2>
						{hasMilestones && (
							<div className="mt-1 md:mt-2 px-2 md:px-3 py-0.5 md:py-1 bg-white/40 backdrop-blur-sm rounded-full inline-flex items-center">
								<Star className="h-2.5 md:h-3 w-2.5 md:w-3 text-yellow-300 mr-0.5 md:mr-1" />
								<span className="text-[10px] md:text-xs text-white font-medium">
									{milestones.length} milestone
									{milestones.length !== 1 ? "s" : ""}
								</span>
							</div>
						)}
					</div>
				</div>
			</Card>
		</Link>
	);
};

export default MonthCard;
