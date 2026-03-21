import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Photo } from "@/types/photo";
import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

export const useTogglePhotoFavorite = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (photo: Photo) => {
			const next = !(photo.is_favorite ?? false);
			const { error } = await supabase
				.from("photo")
				.update({ is_favorite: next })
				.eq("id", photo.id);
			if (error) throw error;
		},
		onMutate: async (photo: Photo) => {
			const favorite = !(photo.is_favorite ?? false);
			const { baby_id: bid, month_number: month, id } = photo;

			const monthKey = ["photos", bid, month] as const;
			const galleryPagesKey = ["photos", "gallery", bid, "pages"] as const;

			await queryClient.cancelQueries({ queryKey: ["photos"] });

			const previousMonth = queryClient.getQueryData<Photo[]>(monthKey);
			const previousGalleryPages =
				queryClient.getQueryData<InfiniteData<Photo[]>>(galleryPagesKey);

			const mapRow = (p: Photo) =>
				p.id === id ? { ...p, is_favorite: favorite } : p;

			queryClient.setQueryData<Photo[]>(monthKey, (old) =>
				old?.map(mapRow) ?? old,
			);
			queryClient.setQueryData<InfiniteData<Photo[]>>(galleryPagesKey, (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) => page.map(mapRow)),
				};
			});

			return {
				rollback: () => {
					queryClient.setQueryData(monthKey, previousMonth);
					queryClient.setQueryData(galleryPagesKey, previousGalleryPages);
				},
			};
		},
		onError: (_err, _photo, ctx) => {
			toast("Error", {
				description: "Could not update favorite",
				className: "bg-destructive text-destructive-foreground",
			});
			ctx?.rollback();
		},
		onSettled: (_data, _error, photo: Photo) => {
			queryClient.invalidateQueries({ queryKey: ["photos", photo.baby_id] });
			queryClient.invalidateQueries({
				queryKey: ["photos", "gallery", photo.baby_id],
			});
		},
	});
};
