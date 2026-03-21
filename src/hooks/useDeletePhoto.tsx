import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Photo } from "@/types/photo";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeletePhoto = (babyId?: string, monthNumber?: number) => {
	const queryClient = useQueryClient();

	const deletePhotoMutation = useMutation({
		mutationFn: async (photo: Photo) => {
			const paths = [photo.storage_path];
			const { error: storageError } = await supabase.storage
				.from("baby_images")
				.remove(paths);

			if (storageError) throw storageError;

			// Delete the record from the database
			const { error: dbError } = await supabase
				.from("photo")
				.delete()
				.eq("id", photo.id);

			if (dbError) throw dbError;
		},
		onSuccess: (_data, photo) => {
			queryClient.invalidateQueries({
				queryKey: ["photos", babyId, monthNumber],
			});
			if (photo?.baby_id) {
				queryClient.invalidateQueries({
					queryKey: ["photos", "gallery", photo.baby_id],
				});
			}
			toast("Success", {
				description: "File deleted successfully",
			});
		},
		onError: (error) => {
			console.error("Error deleting file:", error);
			toast("Error", {
				description: "Failed to delete file",
				className: "bg-destructive text-destructive-foreground",
			});
		},
	});

	return {
		deletePhoto: deletePhotoMutation.mutate,
		isDeleting: deletePhotoMutation.isPending,
	};
};
