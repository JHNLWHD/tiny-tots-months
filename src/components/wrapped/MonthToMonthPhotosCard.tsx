import { WrappedCard } from "./WrappedCard";
import { Calendar, Image } from "lucide-react";
import type { WrappedStats } from "@/hooks/useBabyWrapped";
import { getMonthNameFromMonthNumber } from "@/utils/monthUtils";
import type React from "react";
import { useState } from "react";

type MonthToMonthPhotosCardProps = {
	data: WrappedStats;
	isCurrentCard?: boolean;
};

export const MonthToMonthPhotosCard: React.FC<MonthToMonthPhotosCardProps> = ({
	data,
	isCurrentCard = false,
}) => {
	// Track which images have failed to load
	const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

	const handleImageError = (photoId: string) => {
		setFailedImages((prev) => new Set(prev).add(photoId));
	};


	// Get months that have photos (not videos) with valid URLs
	const monthsWithPhotos = Array.from({ length: 12 }, (_, i) => i + 1).filter(
		(month) => {
			const monthPhotos = data.photosByMonth[month] || [];
			// Only include months that have at least one photo (not video) with a valid URL
			return monthPhotos.some((photo) => photo.url && !photo.is_video);
		},
	);

	if (monthsWithPhotos.length === 0) {
		return (
			<WrappedCard className="flex flex-col items-center justify-center">
				<div className="text-center">
					<Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
					<p className="text-xl text-gray-500">No photos to display</p>
				</div>
			</WrappedCard>
		);
	}

	return (
		<WrappedCard className="flex flex-col">
			<div className="flex items-center gap-3 mb-6">
				<Calendar className="h-8 w-8 text-baby-purple" />
				<h2 className="text-3xl font-heading text-baby-purple">
					Month to Month
				</h2>
			</div>
			<p className="text-gray-600 mb-8">
				Your journey through {data.babyName}'s first year
			</p>

			<div className="flex-1 overflow-y-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{monthsWithPhotos.map((month) => {
						const monthPhotos = data.photosByMonth[month] || [];
						// Only process up to 4 photos (not videos) with valid URLs
						const displayPhotos: typeof monthPhotos = [];
						let totalPhotosWithUrls = 0;
						
						for (const photo of monthPhotos) {
							if (photo.url && !photo.is_video) {
								totalPhotosWithUrls++;
								if (displayPhotos.length < 4) {
									displayPhotos.push(photo);
								}
							}
						}
						
						const remainingCount = totalPhotosWithUrls - displayPhotos.length;

						return (
							<div
								key={month}
								className="bg-white/80 rounded-xl p-4 shadow-lg border border-baby-purple/20 hover:shadow-xl transition-shadow"
							>
								<div className="mb-3">
									<h3 className="text-lg font-semibold text-baby-purple mb-1">
										{getMonthNameFromMonthNumber(data.babyBirthDate, month)}
									</h3>
									<p className="text-sm text-gray-600">
										{totalPhotosWithUrls} {totalPhotosWithUrls === 1 ? "photo" : "photos"}
									</p>
								</div>

								{displayPhotos.length === 1 ? (
									// Single photo - full width
									<div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
										{!failedImages.has(displayPhotos[0].id) ? (
											<img
												src={displayPhotos[0].url}
												alt={`${getMonthNameFromMonthNumber(data.babyBirthDate, month)} photo`}
												className="w-full h-full object-cover"
												loading="lazy"
												decoding="async"
												onError={() => handleImageError(displayPhotos[0].id)}
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<Image className="h-12 w-12 text-gray-400" />
											</div>
										)}
									</div>
								) : displayPhotos.length === 2 ? (
									// Two photos - side by side
									<div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
										{displayPhotos.map((photo, idx) => (
											<div
												key={photo.id}
												className="relative aspect-square bg-gray-100"
											>
												{!failedImages.has(photo.id) ? (
													<img
														src={photo.url}
														alt={`${getMonthNameFromMonthNumber(data.babyBirthDate, month)} photo ${idx + 1}`}
														className="w-full h-full object-cover"
														loading="lazy"
														decoding="async"
														onError={() => handleImageError(photo.id)}
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<Image className="h-8 w-8 text-gray-400" />
													</div>
												)}
											</div>
										))}
									</div>
								) : displayPhotos.length === 3 ? (
									// Three photos - one large, two small
									<div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
										{displayPhotos.map((photo, idx) => (
											<div
												key={photo.id}
												className={`relative bg-gray-100 ${
													idx === 0 ? "row-span-2 aspect-square" : "aspect-square"
												}`}
											>
												{!failedImages.has(photo.id) ? (
													<img
														src={photo.url}
														alt={`${getMonthNameFromMonthNumber(data.babyBirthDate, month)} photo ${idx + 1}`}
														className="w-full h-full object-cover"
														loading="lazy"
														decoding="async"
														onError={() => handleImageError(photo.id)}
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<Image className="h-8 w-8 text-gray-400" />
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									// Four or more photos - 2x2 grid
									<div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
										{displayPhotos.map((photo, idx) => (
											<div
												key={photo.id}
												className="relative aspect-square bg-gray-100"
											>
												{!failedImages.has(photo.id) ? (
													<img
														src={photo.url}
														alt={`${getMonthNameFromMonthNumber(data.babyBirthDate, month)} photo ${idx + 1}`}
														className="w-full h-full object-cover"
														loading="lazy"
														decoding="async"
														onError={() => handleImageError(photo.id)}
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<Image className="h-8 w-8 text-gray-400" />
													</div>
												)}
												{idx === 3 && remainingCount > 0 && (
													<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold text-sm">
														+{remainingCount}
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</WrappedCard>
	);
};

