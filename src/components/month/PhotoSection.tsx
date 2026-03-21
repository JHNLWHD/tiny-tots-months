import PhotoCollage from "@/components/PhotoCollage";
import PhotoGrid from "@/components/PhotoGrid";
import PhotoUploader from "@/components/PhotoUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Photo } from "@/hooks/usePhotos";
import type { CreatePhotoData } from "@/types/photo";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

type SortOption = "newest" | "oldest" | "description";
type ViewMode = "grid" | "collage";

type PhotoSectionProps = {
	babyId: string;
	monthNumber: number;
	photos: Photo[];
	isUploading: boolean;
	uploadPhoto: (data: CreatePhotoData) => Promise<unknown>;
	deletePhoto: (photo: Photo) => void;
	refetchPhotos: () => void;
	isLoading: boolean;
};

const PhotoSection: React.FC<PhotoSectionProps> = ({
	babyId,
	monthNumber,
	photos,
	isUploading,
	uploadPhoto,
	deletePhoto,
	refetchPhotos,
	isLoading,
}) => {
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [captionInput, setCaptionInput] = useState("");
	const [debouncedCaption, setDebouncedCaption] = useState("");
	const [favoriteFilter, setFavoriteFilter] = useState<"all" | "favorites">(
		"all",
	);

	useEffect(() => {
		const t = setTimeout(() => setDebouncedCaption(captionInput), 300);
		return () => clearTimeout(t);
	}, [captionInput]);

	const filteredPhotos = useMemo(() => {
		let list = photos;
		if (favoriteFilter === "favorites") {
			list = list.filter((p) => p.is_favorite);
		}
		const q = debouncedCaption.trim().toLowerCase();
		if (q) {
			list = list.filter((p) =>
				(p.description || "").toLowerCase().includes(q),
			);
		}
		return list;
	}, [photos, favoriteFilter, debouncedCaption]);

	const sortedPhotos = useMemo(
		() =>
			[...filteredPhotos].sort((a, b) => {
				switch (sortOption) {
					case "newest":
						return (
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime()
						);
					case "oldest":
						return (
							new Date(a.created_at).getTime() -
							new Date(b.created_at).getTime()
						);
					case "description":
						return (a.description || "") > (b.description || "") ? 1 : -1;
					default:
						return 0;
				}
			}),
		[filteredPhotos, sortOption],
	);

	const handleSortChange = (value: string) => {
		setSortOption(value as SortOption);
	};

	const handleViewModeChange = (value: string) => {
		setViewMode(value as ViewMode);
	};

	const handleDeletePhoto = (id: string) => {
		const photoToDelete = photos.find((photo) => photo.id === id);
		if (photoToDelete) {
			deletePhoto(photoToDelete);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-6 sm:py-8">
				<Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-500" />
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			<PhotoUploader
				babyId={babyId}
				month={monthNumber}
				onUploadComplete={refetchPhotos}
				onUpload={uploadPhoto}
				isUploading={isUploading}
			/>

			<div>
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3">
					<h2 className="text-lg sm:text-xl font-semibold">Photos</h2>

					<div className="flex flex-col gap-3 w-full sm:w-auto">
						<div className="flex flex-col sm:flex-row gap-3 sm:flex-wrap">
							<div className="flex items-center gap-2 min-w-0 flex-1 max-w-md">
								<Label htmlFor="month-photo-search" className="sr-only">
									Search captions
								</Label>
								<Input
									id="month-photo-search"
									placeholder="Search captions…"
									value={captionInput}
									onChange={(e) => setCaptionInput(e.target.value)}
									className="h-8 sm:h-10 text-sm"
								/>
							</div>
							<div className="flex items-center gap-2">
								<Label htmlFor="favorites-filter" className="whitespace-nowrap text-sm">
									Show:
								</Label>
								<Select
									value={favoriteFilter}
									onValueChange={(v) =>
										setFavoriteFilter(v as "all" | "favorites")
									}
								>
									<SelectTrigger
										id="favorites-filter"
										className="w-[130px] h-8 sm:h-10 text-xs sm:text-sm"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="favorites">Favorites</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<div className="flex items-center gap-2">
								<Label htmlFor="view-mode" className="whitespace-nowrap text-sm">
									View:
								</Label>
								<Select value={viewMode} onValueChange={handleViewModeChange}>
									<SelectTrigger
										id="view-mode"
										className="w-[100px] sm:w-[120px] h-8 sm:h-10 text-xs sm:text-sm"
									>
										<SelectValue placeholder="View" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="grid">Grid</SelectItem>
										<SelectItem value="collage">Collage</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center gap-2">
								<Label htmlFor="sort-by" className="whitespace-nowrap text-sm">
									Sort by:
								</Label>
								<Select value={sortOption} onValueChange={handleSortChange}>
									<SelectTrigger
										id="sort-by"
										className="w-[100px] sm:w-[120px] h-8 sm:h-10 text-xs sm:text-sm"
									>
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="newest">Newest</SelectItem>
										<SelectItem value="oldest">Oldest</SelectItem>
										<SelectItem value="description">Description</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</div>

				{viewMode === "grid" ? (
					<PhotoGrid
						babyId={babyId}
						monthNumber={monthNumber}
						photos={sortedPhotos}
						onDelete={handleDeletePhoto}
					/>
				) : (
					<PhotoCollage
						photos={sortedPhotos}
						maxDisplayCount={sortedPhotos.length}
					/>
				)}
			</div>
		</div>
	);
};

export default PhotoSection;
