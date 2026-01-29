import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type StorageUsageData = {
	totalBytes: number;
	photoCount: number;
	videoCount: number;
};

type PhotoRecord = {
	file_size?: number | null;
	is_video?: boolean | null;
};

/**
 * Hook to fetch the current user's storage usage
 * Used for enforcing storage quotas before uploads
 */
export const useStorageUsage = () => {
	const { user } = useAuth();

	const query = useQuery({
		queryKey: ["storage-usage", user?.id],
		queryFn: async (): Promise<StorageUsageData> => {
			if (!user?.id) {
				return { totalBytes: 0, photoCount: 0, videoCount: 0 };
			}

			// Aggregate file sizes from photo table
			const { data, error } = await supabase
				.from("photo")
				.select("*")
				.eq("user_id", user.id);

			if (error) {
				console.error("Error fetching storage usage:", error);
				return { totalBytes: 0, photoCount: 0, videoCount: 0 };
			}

			// Calculate total bytes (handles both pre and post-migration)
			// Pre-migration: file_size won't exist, defaults to 0
			// Post-migration: file_size will contain actual sizes
			const totalBytes = data?.reduce((sum, photo: PhotoRecord) => {
				return sum + (photo.file_size || 0);
			}, 0) || 0;
			
			const photoCount = data?.filter((p: PhotoRecord) => !p.is_video).length || 0;
			const videoCount = data?.filter((p: PhotoRecord) => p.is_video).length || 0;

			return {
				totalBytes,
				photoCount,
				videoCount,
			};
		},
		enabled: !!user?.id,
		staleTime: 30 * 1000, // Consider fresh for 30 seconds
		refetchOnWindowFocus: false,
	});

	return {
		storageUsage: query.data,
		storageUsedBytes: query.data?.totalBytes || 0,
		photoCount: query.data?.photoCount || 0,
		videoCount: query.data?.videoCount || 0,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
};
