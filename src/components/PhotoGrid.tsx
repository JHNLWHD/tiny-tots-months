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
import React from "react";
import PhotoCard from "./PhotoCard";
import PhotoLightbox from "./PhotoLightbox";

type PhotoGridProps = {
	photos: Photo[];
	onDelete?: (id: string) => void;
	readOnly?: boolean;
	babyName?: string;
};

const PhotoGrid: React.FC<PhotoGridProps> = ({
	photos,
	onDelete,
	readOnly = false,
	babyName = "baby",
}) => {
	const [lightboxOpen, setLightboxOpen] = React.useState(false);
	const [lightboxIndex, setLightboxIndex] = React.useState(0);
	const [photoToDelete, setPhotoToDelete] = React.useState<Photo | null>(null);

	if (!photos || photos.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">No photos uploaded yet.</p>
			</div>
		);
	}

	const handlePhotoClick = (photo: Photo) => {
		const index = photos.findIndex(p => p.id === photo.id);
		setLightboxIndex(index);
		setLightboxOpen(true);
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
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
				{photos.map((photo) => (
					<PhotoCard
						key={photo.id}
						photo={photo}
						onClick={handlePhotoClick}
						onDelete={handleDeleteClick}
						showDeleteButton={!readOnly && !!onDelete}
						showMonthBadge={true}
					/>
				))}
			</div>

			<PhotoLightbox
				photos={photos}
				open={lightboxOpen}
				index={lightboxIndex}
				onClose={() => setLightboxOpen(false)}
				babyName={babyName}
				showCaptions={true}
				showDownload={true}
				showThumbnails={true}
			/>

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
