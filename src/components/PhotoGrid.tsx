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
import { useTogglePhotoFavorite } from "@/hooks/useTogglePhotoFavorite";
import type { Photo } from "@/hooks/usePhotos";
import { type FC, useState } from "react";
import PhotoCard from "./PhotoCard";
import PhotoLightbox from "./PhotoLightbox";

type PhotoGridProps = {
	babyId: string;
	monthNumber: number;
	photos: Photo[];
	onDelete?: (id: string) => void;
	babyName?: string;
};

const PhotoGrid: FC<PhotoGridProps> = ({
	babyId,
	monthNumber,
	photos,
	onDelete: onDeleteById,
	babyName = "baby",
}) => {
	const { mutate: toggleFavorite } = useTogglePhotoFavorite();

	const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
	const [lightboxIndex, setLightboxIndex] = useState<number>(0);
	const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

	const openDeleteDialog = (photo: Photo) => {
		if (!onDeleteById) return;
		setPhotoToDelete(photo);
	};

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

	const handleToggleFavorite = (photo: Photo) => {
		toggleFavorite(photo);
	};

	const handleConfirmDelete = () => {
		if (photoToDelete && onDeleteById) {
			onDeleteById(photoToDelete.id);
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
						onDelete={onDeleteById ? openDeleteDialog : undefined}
						onToggleFavorite={handleToggleFavorite}
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

			<AlertDialog
				open={!!photoToDelete}
				onOpenChange={(open) => {
					if (!open) setPhotoToDelete(null);
				}}
			>
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
