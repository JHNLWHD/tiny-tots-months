import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Photo } from "@/types/photo";
import { useQuery } from "@tanstack/react-query";
import { enrichPhotosWithSignedUrls } from "@/utils/enrichPhotoWithSignedUrls";
import type { ImageSize } from "@/utils/supabaseImageTransform";

export const useFetchPhotos = (
	babyId?: string,
	monthNumber?: number,
	imageSize?: ImageSize
) => {
	const { user } = useAuth();

	const fetchPhotos = async (): Promise<Photo[]> => {
		if (!user || !babyId || !monthNumber) return [];

		// First fetch the photo records
		const { data, error } = await supabase
			.from("photo")
			.select("*")
			.eq("baby_id", babyId)
			.eq("month_number", monthNumber);

		if (error) {
			console.error("Error fetching photos:", error);
			toast("Error loading photos", {
				description: "Failed to load photo data",
				className: "bg-destructive text-destructive-foreground",
			});
			throw error;
		}

		return enrichPhotosWithSignedUrls(data ?? [], imageSize);
	};

	const {
		data: photos = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["photos", babyId, monthNumber],
		queryFn: fetchPhotos,
		enabled: !!user && !!babyId && !!monthNumber,
	});

	return {
		photos,
		isLoading,
		refetch,
	};
};
