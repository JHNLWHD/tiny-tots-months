import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Photo } from "@/hooks/usePhotos";
import { Play, Trash2 } from "lucide-react";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import HeicImage from "./HeicImage";

interface PhotoGridProps {
	photos: Photo[];
	onDelete?: (id: string) => void;
	readOnly?: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
	photos,
	onDelete,
	readOnly = false,
}) => {
	const [selectedPhoto, setSelectedPhoto] = React.useState<Photo | null>(null);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [photoToDelete, setPhotoToDelete] = React.useState<Photo | null>(null);

	if (!photos || photos.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">No photos uploaded yet.</p>
			</div>
		);
	}

	const handlePhotoClick = (photo: Photo) => {
		setSelectedPhoto(photo);
		setIsDialogOpen(true);
	};

	const handleDeleteClick = (photo: Photo) => {
		setPhotoToDelete(photo);
	};

	const handleConfirmDelete = () => {
		if (photoToDelete && onDelete) {
			onDelete(photoToDelete.id);
		}
		setPhotoToDelete(null);
	};

	const handleCancelDelete = () => {
		setPhotoToDelete(null);
	};

	return (
		<>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{photos.map((photo) => (
					<Card
						key={photo.id}
						className="overflow-hidden group relative cursor-pointer"
						onClick={() => handlePhotoClick(photo)}
					>
						<div className="aspect-square relative">
							{photo.is_video ? (
								<div className="absolute inset-0 flex items-center justify-center bg-black/20">
									<Play className="h-8 w-8 text-white" />
								</div>
							) : null}

							<HeicImage
								src={photo.url || "/placeholder.svg"}
								alt={photo.description || "Baby photo"}
								className="w-full h-full object-cover"
								loading="lazy"
								onError={(e) => {
									console.error("Image failed to load:", photo.storage_path);
									const imgElement = e.currentTarget;
									imgElement.onerror = null; // Prevent infinite error loops
									imgElement.src = "/placeholder.svg"; // Fallback image
								}}
							/>

							{photo.description && (
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-xs truncate">
									{photo.description}
								</div>
							)}

							{!readOnly && onDelete && (
								<Button
									variant="destructive"
									size="icon"
									className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
									onClick={(e) => {
										e.stopPropagation();
										handleDeleteClick(photo);
									}}
								>
									<Trash2 size={16} />
								</Button>
							)}
						</div>
					</Card>
				))}
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogTrigger className="hidden">Open</DialogTrigger>
				<DialogContent className="max-w-3xl p-0 overflow-hidden">
					{selectedPhoto && (
						<div className="relative">
							{selectedPhoto.is_video ? (
								<VideoPlayer
									src={selectedPhoto.url || ""}
									className="w-full"
									onError={(e) => console.error("Video failed to load:", e)}
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
									<p className="text-foreground">{selectedPhoto.description}</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Photo</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this photo? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default PhotoGrid;
