import type { Photo } from "@/types/photo";
import { supabase } from "@/integrations/supabase/client";
import { enrichPhotosWithSignedUrls } from "@/utils/enrichPhotoWithSignedUrls";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;
const LARGE_THRESHOLD = 500;

export const useBabyPhotos = (babyId: string) => {
	const countQuery = useQuery({
		queryKey: ["photos", "gallery", babyId, "count"],
		queryFn: async () => {
			const { count, error } = await supabase
				.from("photo")
				.select("*", { count: "exact", head: true })
				.eq("baby_id", babyId);
			if (error) throw error;
			return count ?? 0;
		},
		enabled: !!babyId,
	});

	const count = countQuery.data;
	const countReady = countQuery.isSuccess;

	const smallListQuery = useQuery({
		queryKey: ["photos", "gallery", babyId, "all"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("photo")
				.select("*")
				.eq("baby_id", babyId)
				.order("created_at", { ascending: false })
				.order("id", { ascending: false })
				.limit(LARGE_THRESHOLD);
			if (error) throw error;
			return enrichPhotosWithSignedUrls(data ?? []);
		},
		enabled: !!babyId && countReady && count <= LARGE_THRESHOLD,
	});

	const pagedQuery = useInfiniteQuery({
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
		enabled: !!babyId && countReady && count > LARGE_THRESHOLD,
	});

	const usePaged = count !== undefined && count > LARGE_THRESHOLD;
	const photos: Photo[] = usePaged
		? (pagedQuery.data?.pages.flat() ?? [])
		: (smallListQuery.data ?? []);

	const isLoading =
		countQuery.isLoading ||
		(usePaged ? pagedQuery.isLoading : smallListQuery.isLoading);

	return {
		photos,
		isLoading,
		error: countQuery.error ?? smallListQuery.error ?? pagedQuery.error,
		totalCount: count,
		fetchNextPage: pagedQuery.fetchNextPage,
		hasNextPage: pagedQuery.hasNextPage ?? false,
		isFetchingNextPage: pagedQuery.isFetchingNextPage,
	};
};
