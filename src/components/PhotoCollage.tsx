import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Photo } from "@/hooks/usePhotos";
import { Play } from "lucide-react";
import React from "react";
import HeicImage from "./HeicImage";

interface PhotoCollageProps {
	photos: Photo[];
	title?: string;
	maxDisplayCount?: number;
	isBackground?: boolean;
}

const PhotoCollage: React.FC<PhotoCollageProps> = ({
	photos,
	title,
	maxDisplayCount = 5,
	isBackground = false,
}) => {
	const [selectedPhoto, setSelectedPhoto] = React.useState<Photo | null>(null);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);

	// Filter out photos with no URLs (failed to get signed URL)
	const validPhotos = photos.filter((p) => p.url);

	// Limit the number of photos to display
	const displayPhotos = validPhotos.slice(0, maxDisplayCount);
	const remainingCount = validPhotos.length - maxDisplayCount;

	if (!validPhotos || validPhotos.length === 0) {
		return (
			<div
				className={`${isBackground ? "h-full w-full bg-gray-200" : "text-center py-6"}`}
			>
				{!isBackground && <p className="text-gray-500">No photos available.</p>}
			</div>
		);
	}

	const handlePhotoClick = (photo: Photo) => {
		if (isBackground) return; // Don't open dialog if used as background
		setSelectedPhoto(photo);
		setIsDialogOpen(true);
	};

	// For background mode, show a collage of up to maxDisplayCount photos
	if (isBackground && validPhotos.length > 0) {
		return (
			<div className="h-full w-full grid grid-cols-2 grid-rows-2 gap-0.5 absolute inset-0">
				{displayPhotos.map((photo, idx) => (
					<div key={photo.id} className="relative w-full h-full">
						<HeicImage
							src={photo.url}
							alt="Background"
							className="w-full h-full object-cover"
							style={{
								borderRadius:
									idx === 0
										? "0.75rem 0 0 0"
										: idx === 1
											? "0 0.75rem 0 0"
											: idx === 2
												? "0 0 0 0.75rem"
												: "0 0 0.75rem 0",
							}}
						/>
					</div>
				))}
			</div>
		);
	}

	return (
		<>
			<div className="h-full w-full">
				{title && !isBackground && (
					<h3 className="font-medium text-lg">{title}</h3>
				)}
				<div
					className={`grid grid-cols-3 gap-0.5 h-full ${isBackground ? "absolute inset-0" : ""}`}
				>
					{displayPhotos.map((photo, index) => (
						<button
							key={photo.id}
							type="button"
							className={`overflow-hidden h-full ${
								index === 0 ? "col-span-2 row-span-2" : ""
							}`}
							onClick={(e) => {
								e.preventDefault();
								handlePhotoClick(photo);
							}}
							aria-label={photo.description || "Photo"}
						>
							<div className="h-full relative">
								{photo.is_video && !isBackground ? (
									<div className="absolute inset-0 flex items-center justify-center bg-black/20">
										<Play className="h-8 w-8 text-white" />
									</div>
								) : null}

								<HeicImage
									src={photo.url || "/placeholder.svg"}
									alt={photo.description || "Baby photo"}
									className={`w-full h-full object-cover ${isBackground ? "opacity-100" : ""}`}
									loading="lazy"
									onError={(e) => {
										const imgElement = e.currentTarget;
										imgElement.onerror = null;
										imgElement.src = "/placeholder.svg";
									}}
								/>

								{index === 4 && remainingCount > 0 && !isBackground && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-xl">
										+{remainingCount} more
									</div>
								)}
							</div>
						</button>
					))}
				</div>
			</div>

			{!isBackground && (
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogContent className="max-w-3xl p-0 overflow-hidden">
						<DialogTitle className="sr-only">Photo View</DialogTitle>
						<DialogDescription className="sr-only">
							View full photo
						</DialogDescription>
						{selectedPhoto && (
							<div className="relative">
								{selectedPhoto.is_video ? (
									<video
										controls
										className="w-full h-auto"
										src={selectedPhoto.url || ""}
									/>
								) : (
									<HeicImage
										src={selectedPhoto.url || "/placeholder.svg"}
										alt={selectedPhoto.description || "Baby photo"}
										className="w-full h-auto"
									/>
								)}

								{selectedPhoto.description && (
									<div className="p-4 bg-background">
										<p className="text-foreground">
											{selectedPhoto.description}
										</p>
									</div>
								)}
							</div>
						)}
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

export default PhotoCollage;
