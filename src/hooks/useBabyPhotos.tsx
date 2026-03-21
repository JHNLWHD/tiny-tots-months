import {
	PHOTO_QUERY_GC_MS,
	PHOTO_QUERY_STALE_MS,
} from "@/constants/photoQueryCache";
import type { Photo } from "@/types/photo";
import { supabase } from "@/integrations/supabase/client";
import { enrichPhotosWithSignedUrls } from "@/utils/enrichPhotoWithSignedUrls";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 24;

export const useBabyPhotos = (babyId: string) => {
	const query = useInfiniteQuery({
		queryKey: ["photos", "gallery", babyId, "pages"],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) => {
			const from = pageParam as number;
			const { data, error } = await supabase
				.from("photo")
				.select("*")
				.eq("baby_id", babyId)
				.order("created_at", { ascending: false })
				.order("id", { ascending: false })
				.range(from, from + PAGE_SIZE - 1);
			if (error) throw error;
			return enrichPhotosWithSignedUrls(data ?? []);
		},
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < PAGE_SIZE) return undefined;
			return allPages.reduce((sum, p) => sum + p.length, 0);
		},
		enabled: !!babyId,
		staleTime: PHOTO_QUERY_STALE_MS,
		gcTime: PHOTO_QUERY_GC_MS,
	});

	const photos: Photo[] = query.data?.pages.flat() ?? [];

	return {
		photos,
		isLoading: query.isLoading,
		error: query.error,
		fetchNextPage: query.fetchNextPage,
		hasNextPage: query.hasNextPage ?? false,
		isFetchingNextPage: query.isFetchingNextPage,
	};
};
