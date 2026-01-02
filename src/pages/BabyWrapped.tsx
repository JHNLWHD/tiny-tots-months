import { useParams, useNavigate, Link } from "react-router-dom";
import { useBabyWrapped } from "@/hooks/useBabyWrapped";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { StatsCard } from "@/components/wrapped/StatsCard";
import { TimelineCard } from "@/components/wrapped/TimelineCard";
import { MilestoneHighlightsCard } from "@/components/wrapped/MilestoneHighlightsCard";
import { MonthToMonthPhotosCard } from "@/components/wrapped/MonthToMonthPhotosCard";
import { ShareableCard } from "@/components/wrapped/ShareableCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

// Helper function to preload images
const preloadImage = (url: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = reject;
		img.src = url;
	});
};

const BabyWrapped = () => {
	const { babyId } = useParams<{ babyId: string }>();
	const navigate = useNavigate();
	const { wrappedData, isLoading, error } = useBabyWrapped(babyId);
	const { babies } = useBabyProfiles();
	const [currentCardIndex, setCurrentCardIndex] = useState(0);

	const baby = babies.find((b) => b.id === babyId);

	// Card components in order - memoized to avoid recreation on every render
	const cards = useMemo(
		() => [
			{
				component: (
					<ShareableCard fileName={`${wrappedData.babyName}-stats`}>
						<StatsCard data={wrappedData} />
					</ShareableCard>
				),
			},
			{
				component: (
					<ShareableCard fileName={`${wrappedData.babyName}-timeline`}>
						<TimelineCard
							data={wrappedData}
							isCurrentCard={currentCardIndex === 1}
						/>
					</ShareableCard>
				),
			},
			{
				component: (
					<ShareableCard fileName={`${wrappedData.babyName}-milestones`}>
						<MilestoneHighlightsCard data={wrappedData} />
					</ShareableCard>
				),
			},
			{
				component: (
					<ShareableCard fileName={`${wrappedData.babyName}-month-to-month`}>
						<MonthToMonthPhotosCard
							data={wrappedData}
							isCurrentCard={currentCardIndex === 3}
						/>
					</ShareableCard>
				),
			},
		],
		[wrappedData, currentCardIndex],
	);

	// Preload ALL images when wrapped data loads
	// This ensures images are ready when cards are shown
	useEffect(() => {
		if (isLoading || wrappedData.totalPhotos === 0) return;

		const imagesToPreload: string[] = [];

		// Timeline card images (index 1)
		if (wrappedData.firstPhoto?.url) {
			imagesToPreload.push(wrappedData.firstPhoto.url);
		}
		if (wrappedData.latestPhoto?.url) {
			imagesToPreload.push(wrappedData.latestPhoto.url);
		}

		// Month-to-month card images (index 3)
		// Preload up to 4 photos per month (the ones that will be displayed)
		Object.values(wrappedData.photosByMonth).forEach((monthPhotos) => {
			monthPhotos.slice(0, 4).forEach((photo) => {
				if (photo.url) {
					imagesToPreload.push(photo.url);
				}
			});
		});

		// Preload all images in parallel
		if (imagesToPreload.length > 0) {
			// Preload in batches to avoid overwhelming the browser
			const batchSize = 10;
			for (let i = 0; i < imagesToPreload.length; i += batchSize) {
				const batch = imagesToPreload.slice(i, i + batchSize);
				Promise.allSettled(batch.map(preloadImage)).catch(() => {
					// Silently fail - images will load normally if preload fails
				});
			}
		}
	}, [isLoading, wrappedData.totalPhotos, wrappedData.firstPhoto, wrappedData.latestPhoto, wrappedData.photosByMonth]);

	// Auto-advance cards (optional - can be removed if manual navigation is preferred)
	useEffect(() => {
		if (isLoading || wrappedData.totalPhotos === 0) return;

		const totalCards = 4; // Fixed number of cards
		const timer = setTimeout(() => {
			setCurrentCardIndex((prev) => {
				if (prev < totalCards - 1) {
					return prev + 1;
				}
				return prev;
			});
		}, 5000); // 5 seconds per card

		return () => clearTimeout(timer);
	}, [currentCardIndex, isLoading, wrappedData.totalPhotos]);

	const handleNext = () => {
		if (currentCardIndex < cards.length - 1) {
			setCurrentCardIndex(currentCardIndex + 1);
		}
	};

	const handlePrevious = () => {
		if (currentCardIndex > 0) {
			setCurrentCardIndex(currentCardIndex - 1);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-12 w-12 text-baby-purple animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Loading your wrapped...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">Error loading wrapped data</p>
					<Button onClick={() => navigate("/app")}>Go Back</Button>
				</div>
			</div>
		);
	}

	if (!baby) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600 mb-4">Baby not found</p>
					<Button onClick={() => navigate("/app")}>Go Back</Button>
				</div>
			</div>
		);
	}

	if (wrappedData.totalPhotos === 0 && wrappedData.totalMilestones === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center max-w-md">
					<p className="text-2xl font-heading text-baby-purple mb-4">
						No data yet
					</p>
					<p className="text-gray-600 mb-6">
						Start adding photos and milestones to generate your wrapped!
					</p>
					<Button onClick={() => navigate("/app")}>Go Back</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white py-8">
			<div className="container mx-auto px-4">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<Link to="/app">
						<Button variant="ghost" className="flex items-center gap-2">
							<ArrowLeft className="h-4 w-4" />
							Back
						</Button>
					</Link>
					<div className="text-center">
						<h1 className="text-3xl md:text-4xl font-heading text-baby-purple">
							{baby.name}'s First Year Wrapped
						</h1>
						<p className="text-gray-600 mt-2">
							Card {currentCardIndex + 1} of {cards.length}
						</p>
					</div>
					<div className="w-20" /> {/* Spacer for centering */}
				</div>

				{/* Card Display */}
				<div className="max-w-5xl mx-auto mb-8">
					{cards[currentCardIndex]?.component}
				</div>

				{/* Navigation */}
				<div className="max-w-5xl mx-auto flex items-center justify-center gap-4">
					<Button
						variant="outline"
						onClick={handlePrevious}
						disabled={currentCardIndex === 0}
						className="flex items-center gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Previous
					</Button>

					{/* Dots indicator */}
					<div className="flex gap-2">
						{cards.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentCardIndex(index)}
								className={`w-2 h-2 rounded-full transition-all ${
									index === currentCardIndex
										? "bg-baby-purple w-8"
										: "bg-gray-300 hover:bg-gray-400"
								}`}
								aria-label={`Go to card ${index + 1}`}
							/>
						))}
					</div>

					<Button
						variant="outline"
						onClick={handleNext}
						disabled={currentCardIndex === cards.length - 1}
						className="flex items-center gap-2"
					>
						Next
						<ArrowLeft className="h-4 w-4 rotate-180" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default BabyWrapped;

