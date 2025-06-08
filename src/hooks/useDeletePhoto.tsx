import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Photo } from "@/types/photo";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeletePhoto = (babyId?: string, monthNumber?: number) => {
	const queryClient = useQueryClient();

	const deletePhotoMutation = useMutation({
		mutationFn: async (photo: Photo) => {
			// 1. Delete the file from storage
			const { error: storageError } = await supabase.storage
				.from("baby_images")
				.remove([photo.storage_path]);

			if (storageError) throw storageError;

			// 2. Delete the record from the database
			const { error: dbError } = await supabase
				.from("photo")
				.delete()
				.eq("id", photo.id);

			if (dbError) throw dbError;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["photos", babyId, monthNumber],
			});
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
