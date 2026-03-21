import { toast } from "@/components/ui/sonner";
import {
	PHOTO_QUERY_GC_MS,
	PHOTO_QUERY_STALE_MS,
} from "@/constants/photoQueryCache";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Photo } from "@/types/photo";
import { enrichPhotosWithSignedUrls } from "@/utils/enrichPhotoWithSignedUrls";
import { useQuery } from "@tanstack/react-query";

/** Month photos load in full so caption/favorite filters and sort modes stay correct. */
export const useFetchPhotos = (babyId?: string, monthNumber?: number) => {
	const { user } = useAuth();

	const enabled = !!user && !!babyId && !!monthNumber;

	const fetchPhotos = async (): Promise<Photo[]> => {
		if (!user || !babyId || !monthNumber) return [];

		const { data, error } = await supabase
			.from("photo")
			.select("*")
			.eq("baby_id", babyId)
			.eq("month_number", monthNumber)
			.order("created_at", { ascending: false })
			.order("id", { ascending: false });

		if (error) {
			console.error("Error fetching photos:", error);
			toast("Error loading photos", {
				description: "Failed to load photo data",
				className: "bg-destructive text-destructive-foreground",
			});
			throw error;
		}

		return enrichPhotosWithSignedUrls(data ?? []);
	};

	const {
		data: photos = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["photos", babyId, monthNumber],
		queryFn: fetchPhotos,
		enabled,
		staleTime: PHOTO_QUERY_STALE_MS,
		gcTime: PHOTO_QUERY_GC_MS,
	});

	return {
		photos,
		isLoading,
		refetch,
	};
};
