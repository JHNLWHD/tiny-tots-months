import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import PhotoCard from "@/components/PhotoCard";
import PhotoCompareDialog from "@/components/PhotoCompareDialog";
import PhotoLightbox from "@/components/PhotoLightbox";
import { useBabyPhotos } from "@/hooks/useBabyPhotos";
import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { useTogglePhotoFavorite } from "@/hooks/useTogglePhotoFavorite";
import type { Photo } from "@/types/photo";
import {
	ArrowLeft,
	Calendar,
	Camera,
	Filter,
	GitCompare,
	Grid3X3,
	List,
	Loader2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const BabyGallery = () => {
	const { babyId } = useParams<{ babyId: string }>();
	const { babies } = useBabyProfiles();
	const {
		photos = [],
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useBabyPhotos(babyId || "");

	const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
	const [filterMonth, setFilterMonth] = useState<string>("all");
	const [filterType, setFilterType] = useState<string>("all");
	const [favoriteFilter, setFavoriteFilter] = useState<"all" | "favorites">(
		"all",
	);
	const [captionInput, setCaptionInput] = useState("");
	const [debouncedCaption, setDebouncedCaption] = useState("");

	useEffect(() => {
		const t = setTimeout(() => setDebouncedCaption(captionInput), 300);
		return () => clearTimeout(t);
	}, [captionInput]);

	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const [compareMode, setCompareMode] = useState(false);
	const [compareA, setCompareA] = useState<Photo | null>(null);
	const [compareB, setCompareB] = useState<Photo | null>(null);
	const [compareDialogOpen, setCompareDialogOpen] = useState(false);

	const { mutate: toggleFavorite } = useTogglePhotoFavorite();

	const baby = babies.find((b) => b.id === babyId);

	const filteredPhotos = useMemo(() => {
		let filtered = photos;

		if (filterMonth !== "all") {
			const monthNum = parseInt(filterMonth, 10);
			filtered = filtered.filter((photo) => photo.month_number === monthNum);
		}

		if (filterType === "photos") {
			filtered = filtered.filter((photo) => !photo.is_video);
		} else if (filterType === "videos") {
			filtered = filtered.filter((photo) => photo.is_video);
		}

		if (favoriteFilter === "favorites") {
			filtered = filtered.filter((photo) => photo.is_favorite);
		}

		const q = debouncedCaption.trim().toLowerCase();
		if (q) {
			filtered = filtered.filter((photo) =>
				(photo.description || "").toLowerCase().includes(q),
			);
		}

		return filtered.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		);
	}, [photos, filterMonth, filterType, favoriteFilter, debouncedCaption]);

	const photosByMonth = useMemo(() => {
		const grouped: { [key: number]: Photo[] } = {};
		filteredPhotos.forEach((photo) => {
			const month = photo.month_number || 0;
			if (!grouped[month]) grouped[month] = [];
			grouped[month].push(photo);
		});
		return grouped;
	}, [filteredPhotos]);

	const openLightbox = (index: number) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	};

	const handleCardClick = (photo: Photo) => {
		if (compareMode) {
			if (!compareA || compareA.id === photo.id) {
				setCompareA(compareA?.id === photo.id ? null : photo);
				return;
			}
			if (!compareB || compareB.id === photo.id) {
				setCompareB(compareB?.id === photo.id ? null : photo);
				return;
			}
			setCompareB(photo);
			return;
		}
		const index = filteredPhotos.findIndex((p) => p.id === photo.id);
		if (index >= 0) openLightbox(index);
	};

	const exitCompareMode = () => {
		setCompareMode(false);
		setCompareA(null);
		setCompareB(null);
		setCompareDialogOpen(false);
	};

	const getMonthName = (monthNum: number) => {
		if (monthNum === 0) return "Unassigned";
		return `Month ${monthNum}`;
	};

	if (isLoading) {
		return (
			<div className="w-full px-4 sm:px-6 lg:px-8 py-6">
				<div className="animate-pulse space-y-6">
					<div className="h-8 bg-gray-200 rounded w-1/3"></div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!baby) {
		return (
			<div className="w-full px-4 sm:px-6 lg:px-8 py-6 text-center">
				<h1 className="text-2xl font-heading text-gray-800 mb-4">
					Baby not found
				</h1>
				<Link to="/app" className="text-baby-purple hover:underline">
					← Back to App
				</Link>
			</div>
		);
	}

	const filtersActive =
		filterMonth !== "all" ||
		filterType !== "all" ||
		favoriteFilter === "favorites" ||
		debouncedCaption.trim() !== "";

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
			<div className="flex items-center gap-4">
				<Link
					to="/app"
					className="p-2 hover:bg-gray-100 rounded-full transition-colors"
				>
					<ArrowLeft className="h-5 w-5 text-gray-600" />
				</Link>
				<div>
					<h1 className="text-3xl font-heading text-baby-purple">
						{baby.name}'s Gallery
					</h1>
					<p className="text-gray-600">
						{filteredPhotos.length}{" "}
						{filteredPhotos.length === 1 ? "item" : "items"} • Born{" "}
						{new Date(baby.date_of_birth).toLocaleDateString()}
					</p>
				</div>
			</div>

			<Card className="p-4 border-baby-purple/20 space-y-4">
				<div className="flex flex-col gap-3">
					<div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-gray-600 shrink-0" />
							<span className="text-sm font-medium text-gray-700">Filters</span>
						</div>

						<Select value={filterMonth} onValueChange={setFilterMonth}>
							<SelectTrigger className="w-[140px]">
								<SelectValue placeholder="Month" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Months</SelectItem>
								{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
									<SelectItem key={month} value={month.toString()}>
										Month {month}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={filterType} onValueChange={setFilterType}>
							<SelectTrigger className="w-[140px]">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Media</SelectItem>
								<SelectItem value="photos">Photos Only</SelectItem>
								<SelectItem value="videos">Videos Only</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={favoriteFilter}
							onValueChange={(v) =>
								setFavoriteFilter(v as "all" | "favorites")
							}
						>
							<SelectTrigger className="w-[140px]">
								<SelectValue placeholder="Favorites" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All items</SelectItem>
								<SelectItem value="favorites">Favorites only</SelectItem>
							</SelectContent>
						</Select>

						<div className="flex-1 min-w-[200px] max-w-md">
							<Input
								placeholder="Search captions…"
								value={captionInput}
								onChange={(e) => setCaptionInput(e.target.value)}
								aria-label="Search photo captions"
							/>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center sm:justify-between">
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant={compareMode ? "default" : "outline"}
								size="sm"
								onClick={() =>
									compareMode ? exitCompareMode() : setCompareMode(true)
								}
								className={
									compareMode ? "bg-baby-purple hover:bg-baby-purple/90" : ""
								}
							>
								<GitCompare className="h-4 w-4 mr-2" />
								{compareMode ? "Exit compare" : "Compare"}
							</Button>
							{compareMode && (
								<>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										disabled={!compareA || !compareB}
										onClick={() => setCompareDialogOpen(true)}
									>
										View side-by-side
									</Button>
									<span className="text-xs text-gray-600 self-center">
										Tap photos to pick two (purple ring).
									</span>
								</>
							)}
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant={viewMode === "grid" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("grid")}
								className={
									viewMode === "grid" ? "bg-baby-purple hover:bg-baby-purple/90" : ""
								}
							>
								<Grid3X3 className="h-4 w-4 mr-2" />
								Grid
							</Button>
							<Button
								variant={viewMode === "timeline" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("timeline")}
								className={
									viewMode === "timeline"
										? "bg-baby-purple hover:bg-baby-purple/90"
										: ""
								}
							>
								<List className="h-4 w-4 mr-2" />
								Timeline
							</Button>
						</div>
					</div>
				</div>
			</Card>

			{filteredPhotos.length === 0 ? (
				<Card className="p-12 text-center border-baby-purple/20">
					<div className="w-16 h-16 bg-baby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<Camera className="h-8 w-8 text-baby-purple" />
					</div>
					<h3 className="font-heading text-xl text-gray-700 mb-2">
						No media found
					</h3>
					<p className="text-gray-500 mb-6">
						{filtersActive
							? "Try adjusting filters, search, or favorites."
							: `Start uploading photos and videos for ${baby.name}!`}
					</p>
					<Link to={`/app/month/${babyId}/1`}>
						<Button className="bg-baby-purple hover:bg-baby-purple/90">
							<Camera className="h-4 w-4 mr-2" />
							Add Photos
						</Button>
					</Link>
				</Card>
			) : viewMode === "grid" ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
					{filteredPhotos.map((photo) => (
						<PhotoCard
							key={photo.id}
							photo={photo}
							onClick={handleCardClick}
							showMonthBadge={true}
							onToggleFavorite={(p) => toggleFavorite(p)}
							compareSelected={
								compareMode &&
								(compareA?.id === photo.id || compareB?.id === photo.id)
							}
						/>
					))}
				</div>
			) : (
				<div className="space-y-8">
					{Object.entries(photosByMonth)
						.sort(([a], [b]) => parseInt(b, 10) - parseInt(a, 10))
						.map(([month, monthPhotos]) => (
							<Card key={month} className="p-6 border-baby-purple/20">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 bg-baby-purple/20 rounded-full flex items-center justify-center">
										<Calendar className="h-5 w-5 text-baby-purple" />
									</div>
									<div>
										<h3 className="font-heading text-xl text-baby-purple">
											{getMonthName(parseInt(month, 10))}
										</h3>
										<p className="text-gray-500 text-sm">
											{monthPhotos.length}{" "}
											{monthPhotos.length === 1 ? "item" : "items"}
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{monthPhotos.map((photo) => (
											<PhotoCard
												key={photo.id}
												photo={photo}
												onClick={handleCardClick}
												showMonthBadge={false}
												onToggleFavorite={(p) => toggleFavorite(p)}
												compareSelected={
													compareMode &&
													(compareA?.id === photo.id ||
														compareB?.id === photo.id)
												}
											/>
									))}
								</div>
							</Card>
						))}
				</div>
			)}

			{hasNextPage && (
				<div className="flex justify-center pt-2">
					<Button
						type="button"
						variant="outline"
						disabled={isFetchingNextPage}
						onClick={() => fetchNextPage()}
					>
						{isFetchingNextPage ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Loading…
							</>
						) : (
							"Load more photos"
						)}
					</Button>
				</div>
			)}

			<PhotoLightbox
				photos={filteredPhotos}
				open={lightboxOpen}
				index={lightboxIndex}
				onClose={() => setLightboxOpen(false)}
				babyName={baby?.name || "baby"}
				showCaptions={true}
				showDownload={true}
				showThumbnails={true}
			/>

			<PhotoCompareDialog
				open={compareDialogOpen}
				onOpenChange={setCompareDialogOpen}
				left={compareA}
				right={compareB}
			/>
		</div>
	);
};

export default BabyGallery;
