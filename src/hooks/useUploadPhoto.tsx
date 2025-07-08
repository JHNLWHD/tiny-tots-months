import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { CreatePhotoData } from "@/types/photo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

export const useUploadPhoto = (babyId?: string, monthNumber?: number) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const uploadPhotoMutation = useMutation({
		mutationFn: async ({
			file,
			baby_id,
			month_number,
			description,
			is_video,
		}: CreatePhotoData) => {
			if (!user) throw new Error("User not authenticated");

			const isVideoFile = is_video === true;

			const fileExt = file.name.split(".").pop();
			const fileName = `${user.id}/${baby_id}/${month_number}/${uuidv4()}.${fileExt}`;

			try {
				const { error: uploadError, data: uploadResult } =
					await supabase.storage.from("baby_images").upload(fileName, file, {
						cacheControl: "3600",
						upsert: false,
					});

				if (uploadError) {
					console.error("Storage upload error:", uploadError);
					throw uploadError;
				}

				const { error: insertError, data: photo } = await supabase
					.from("photo")
					.insert({
						baby_id,
						user_id: user.id,
						month_number,
						storage_path: fileName,
						description: description || null,
						is_video: isVideoFile,
					})
					.select()
					.single();

				if (insertError) {
					console.error("Database insert error:", insertError);
					await supabase.storage.from("baby_images").remove([fileName]);
					throw insertError;
				}

				return photo;
			} catch (error) {
				console.error("Upload process failed:", error);
				throw error;
			}
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["photos", babyId, monthNumber],
			});
			toast("Success", {
				description: "File uploaded successfully",
			});
		},
		onError: (error) => {
			console.error("Error uploading file (mutation error handler):", error);
			toast("Error", {
				description: `Failed to upload file: ${error.message || "Unknown error"}`,
				className: "bg-destructive text-destructive-foreground",
			});
		},
	});

	return {
		uploadPhoto: uploadPhotoMutation.mutate,
		isUploading: uploadPhotoMutation.isPending,
	};
};
