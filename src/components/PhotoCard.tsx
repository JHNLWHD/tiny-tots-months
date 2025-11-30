import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Trash2 } from "lucide-react";
import React from "react";
import HeicImage from "./HeicImage";

export type Photo = {
	id: string;
	url?: string;
	description?: string | null;
	is_video: boolean;
	month_number?: number;
	created_at: string;
	storage_path?: string;
};

type PhotoCardProps = {
	photo: Photo;
	onClick?: (photo: Photo) => void;
	onDelete?: (photo: Photo) => void;
	showDeleteButton?: boolean;
	showMonthBadge?: boolean;
	className?: string;
};

const PhotoCard: React.FC<PhotoCardProps> = ({
	photo,
	onClick,
	onDelete,
	showDeleteButton = false,
	showMonthBadge = true,
	className = "",
}) => {
	const handleClick = () => {
		onClick?.(photo);
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete?.(photo);
	};

	return (
		<Card
			className={`group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-baby-purple/30 ${className}`}
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
							src={photo.url || "/placeholder.svg"}
							alt={photo.description || "Baby photo"}
							className="w-full h-full object-cover"
							loading="lazy"
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
				
				{showMonthBadge && photo.month_number && (
					<div className="absolute top-2 left-2 bg-baby-purple/90 text-white text-xs px-2 py-1 rounded-full">
						Month {photo.month_number}
					</div>
				)}

				{showDeleteButton && onDelete && (
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
