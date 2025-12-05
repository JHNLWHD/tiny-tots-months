import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type BabyStats = {
	photoCount: number;
	milestoneCount: number;
	monthsTracked: number;
	progressPercentage: number;
};

export const useBabyStats = (babyId?: string) => {
	const { user } = useAuth();

	const fetchStats = async (): Promise<BabyStats> => {
		if (!user || !babyId) {
			return {
				photoCount: 0,
				milestoneCount: 0,
				monthsTracked: 0,
				progressPercentage: 0,
			};
		}

		// Fetch all photos for the baby
		const { data: photos, error: photosError } = await supabase
			.from("photo")
			.select("month_number")
			.eq("baby_id", babyId);

		if (photosError) {
			console.error("Error fetching photos for stats:", photosError);
		}

		// Fetch all milestones for the baby
		const { data: milestones, error: milestonesError } = await supabase
			.from("milestone")
			.select("month_number")
			.eq("baby_id", babyId);

		if (milestonesError) {
			console.error("Error fetching milestones for stats:", milestonesError);
		}

		// Calculate months with content (photos or milestones)
		const monthsWithContent = new Set<number>();
		
		(photos || []).forEach((photo) => {
			if (photo.month_number && photo.month_number >= 1 && photo.month_number <= 12) {
				monthsWithContent.add(photo.month_number);
			}
		});

		(milestones || []).forEach((milestone) => {
			if (milestone.month_number && milestone.month_number >= 1 && milestone.month_number <= 12) {
				monthsWithContent.add(milestone.month_number);
			}
		});

		const photoCount = (photos || []).length;
		const milestoneCount = (milestones || []).length;
		const monthsTracked = monthsWithContent.size;
		const progressPercentage = (monthsTracked / 12) * 100;

		return {
			photoCount,
			milestoneCount,
			monthsTracked,
			progressPercentage,
		};
	};

	const {
		data: stats,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["babyStats", babyId],
		queryFn: fetchStats,
		enabled: !!user && !!babyId,
	});

	return {
		stats: stats || {
			photoCount: 0,
			milestoneCount: 0,
			monthsTracked: 0,
			progressPercentage: 0,
		},
		isLoading,
		error,
	};
};

