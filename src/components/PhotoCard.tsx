import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Play, Trash2 } from "lucide-react";
import type { FC, MouseEvent } from "react";
import type { Photo } from "@/types/photo";
import HeicImage from "./HeicImage";
import type { ImageSize } from "@/utils/supabaseImageTransform";

type PhotoCardProps = {
	photo: Photo;
	onClick?: (photo: Photo) => void;
	/** User clicked delete on the card (parent opens confirm or deletes). */
	onDelete?: (photo: Photo) => void;
	showMonthBadge?: boolean;
	onToggleFavorite?: (photo: Photo) => void;
	/** Compare mode: highlight when selected */
	compareSelected?: boolean;
	className?: string;
	/** Image size preset for optimization (default: "preview") */
	imageSize?: ImageSize;
};

const PhotoCard: FC<PhotoCardProps> = ({
	photo,
	onClick,
	onDelete,
	showMonthBadge = true,
	onToggleFavorite,
	compareSelected = false,
	className = "",
	imageSize = "preview" as ImageSize,
}) => {
	const handleClick = () => {
		onClick?.(photo);
	};

	const handleDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onDelete?.(photo);
	};

	const handleFavoriteClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onToggleFavorite?.(photo);
	};

	const gridSrc = photo.url || "/placeholder.svg";
	const useTransform = !photo.is_video;

	return (
		<Card
			className={`group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-baby-purple/30 ${
				compareSelected ? "ring-2 ring-baby-purple ring-offset-2" : ""
			} ${className}`}
			onClick={handleClick}
		>
			<div className="relative aspect-square bg-gray-100">
				{photo.is_video ? (
					<div className="relative w-full h-full">
						<video
							src={photo.url}
							className="w-full h-full object-cover"
							preload="metadata"
						/>
						<div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<Play className="h-8 w-8 text-white" />
						</div>
						<div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
							<Play className="h-3 w-3 text-white" />
						</div>
					</div>
				) : (
					<div className="relative w-full h-full">
						<HeicImage
							src={gridSrc}
							alt={photo.description || "Baby photo"}
							className="w-full h-full object-cover"
							loading="lazy"
							size={useTransform ? imageSize : undefined}
							onError={(e) => {
								console.error("Image failed to load:", photo.storage_path);
								const imgElement = e.currentTarget;
								imgElement.onerror = null;
								imgElement.src = "/placeholder.svg";
							}}
						/>
						<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<Play className="h-8 w-8 text-white opacity-0" />
						</div>
					</div>
				)}
				
				{showMonthBadge && (
					<div className="absolute top-2 left-2 bg-baby-purple/90 text-white text-xs px-2 py-1 rounded-full">
						Month {photo.month_number}
					</div>
				)}

				{onToggleFavorite && (
					<Button
						type="button"
						variant="secondary"
						size="icon"
						className="absolute bottom-2 right-2 z-10 h-9 w-9 rounded-full bg-white/90 shadow hover:bg-white"
						onClick={handleFavoriteClick}
						aria-label={photo.is_favorite ? "Remove favorite" : "Add favorite"}
					>
						<Heart
							size={18}
							className={
								photo.is_favorite
									? "fill-red-500 text-red-500"
									: "text-gray-600"
							}
						/>
					</Button>
				)}

				{onDelete && (
					<Button
						variant="destructive"
						size="icon"
						className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
						onClick={handleDeleteClick}
					>
						<Trash2 size={16} />
					</Button>
				)}
			</div>
			
			<div className="p-3 bg-white">
				<div className="min-h-[2.5rem] mb-2 flex items-start">
					{photo.description ? (
						<p className="text-sm text-gray-800 font-medium line-clamp-2">
							{photo.description}
						</p>
					) : (
						<p className="text-sm text-gray-400 italic">
							No description
						</p>
					)}
				</div>
				<div className="flex items-center justify-between text-xs text-gray-500">
					<span>
						{new Date(photo.created_at).toLocaleDateString()}
					</span>
					{photo.is_video && (
						<span className="flex items-center gap-1">
							<Play className="h-3 w-3" />
							Video
						</span>
					)}
				</div>
			</div>
		</Card>
	);
};

export default PhotoCard;
