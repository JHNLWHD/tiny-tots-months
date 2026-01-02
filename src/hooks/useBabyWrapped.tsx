import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/types/photo";
import type { Milestone } from "@/hooks/useMilestones";

export type WrappedStats = {
	totalPhotos: number;
	totalMilestones: number;
	mostActiveMonth: number | null;
	monthDistribution: { month: number; photoCount: number; milestoneCount: number }[];
	firstPhoto: Photo | null;
	latestPhoto: Photo | null;
	completionPercentage: number;
	monthsWithContent: number;
	photosByMonth: Record<number, Photo[]>;
	milestonesByMonth: Record<number, Milestone[]>;
	babyName: string;
	babyBirthDate: string;
};

export const useBabyWrapped = (babyId?: string) => {
	const { user } = useAuth();

	const fetchWrappedData = async (): Promise<WrappedStats> => {
		if (!user || !babyId) {
			return {
				totalPhotos: 0,
				totalMilestones: 0,
				mostActiveMonth: null,
				monthDistribution: [],
				firstPhoto: null,
				latestPhoto: null,
				completionPercentage: 0,
				monthsWithContent: 0,
				photosByMonth: {},
				milestonesByMonth: {},
				babyName: "",
				babyBirthDate: "",
			};
		}

		// Fetch baby info
		const { data: babyData, error: babyError } = await supabase
			.from("baby")
			.select("name, date_of_birth")
			.eq("id", babyId)
			.single();

		if (babyError || !babyData) {
			throw new Error("Failed to fetch baby data");
		}

		// Fetch all photos for the baby (first year: months 1-12)
		const { data: photosData, error: photosError } = await supabase
			.from("photo")
			.select("*")
			.eq("baby_id", babyId)
			.in("month_number", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
			.order("created_at", { ascending: true });

		if (photosError) {
			console.error("Error fetching photos for wrapped:", photosError);
		}

		// Fetch all milestones for the baby
		const { data: milestonesData, error: milestonesError } = await supabase
			.from("milestone")
			.select("*")
			.eq("baby_id", babyId)
			.in("month_number", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
			.order("created_at", { ascending: true });

		if (milestonesError) {
			console.error("Error fetching milestones for wrapped:", milestonesError);
		}

		const photos = photosData || [];
		const milestones = milestonesData || [];

		// Generate signed URLs for photos
		// Using 1 hour expiry to ensure URLs remain valid during the wrapped viewing session
		const photosWithUrls = await Promise.all(
			photos.map(async (photo) => {
				try {
					// Validate storage_path exists
					if (!photo.storage_path) {
						console.warn(`Photo ${photo.id} has no storage_path`);
						return photo as Photo;
					}

					// Create signed URL with 1 hour expiry
					const { data: signedUrlData, error: signedUrlError } =
						await supabase.storage
							.from("baby_images")
							.createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

					if (signedUrlError) {
						console.error(
							`Failed to create signed URL for photo ${photo.id}:`,
							signedUrlError,
						);
						throw signedUrlError;
					}

					if (!signedUrlData?.signedUrl) {
						console.warn(`No signed URL returned for photo ${photo.id}`);
						return photo as Photo;
					}

					return {
						...photo,
						url: signedUrlData.signedUrl,
					} as Photo;
				} catch (err) {
					console.error(
						`Failed to create signed URL for photo ${photo.id}:`,
						err,
						`Storage path: ${photo.storage_path}`,
					);
					// Return photo without URL - component will show placeholder
					return photo as Photo;
				}
			}),
		);

		// Calculate month distribution
		const monthDistribution = Array.from({ length: 12 }, (_, i) => i + 1).map(
			(month) => ({
				month,
				photoCount: photosWithUrls.filter((p) => p.month_number === month).length,
				milestoneCount: milestones.filter((m) => m.month_number === month).length,
			}),
		);

		// Find most active month (month with most photos)
		const mostActiveMonth =
			monthDistribution.reduce(
				(max, current) =>
					current.photoCount > max.photoCount ? current : max,
				monthDistribution[0] || { month: 0, photoCount: 0, milestoneCount: 0 },
			).month || null;

		// Get first and latest photos
		const firstPhoto = photosWithUrls.length > 0 ? photosWithUrls[0] : null;
		const latestPhoto =
			photosWithUrls.length > 0 ? photosWithUrls[photosWithUrls.length - 1] : null;

		// Calculate months with content
		const monthsWithContent = new Set<number>();
		photosWithUrls.forEach((photo) => {
			if (photo.month_number >= 1 && photo.month_number <= 12) {
				monthsWithContent.add(photo.month_number);
			}
		});
		milestones.forEach((milestone) => {
			if (milestone.month_number >= 1 && milestone.month_number <= 12) {
				monthsWithContent.add(milestone.month_number);
			}
		});

		const completionPercentage = (monthsWithContent.size / 12) * 100;

		// Group photos and milestones by month
		const photosByMonth: Record<number, Photo[]> = {};
		const milestonesByMonth: Record<number, Milestone[]> = {};

		photosWithUrls.forEach((photo) => {
			if (!photosByMonth[photo.month_number]) {
				photosByMonth[photo.month_number] = [];
			}
			photosByMonth[photo.month_number].push(photo);
		});

		milestones.forEach((milestone) => {
			if (!milestonesByMonth[milestone.month_number]) {
				milestonesByMonth[milestone.month_number] = [];
			}
			milestonesByMonth[milestone.month_number].push(milestone);
		});

		return {
			totalPhotos: photosWithUrls.length,
			totalMilestones: milestones.length,
			mostActiveMonth,
			monthDistribution,
			firstPhoto,
			latestPhoto,
			completionPercentage,
			monthsWithContent: monthsWithContent.size,
			photosByMonth,
			milestonesByMonth,
			babyName: babyData.name,
			babyBirthDate: babyData.date_of_birth,
		};
	};

	const {
		data: wrappedData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["babyWrapped", babyId],
		queryFn: fetchWrappedData,
		enabled: !!user && !!babyId,
	});

	return {
		wrappedData: wrappedData || {
			totalPhotos: 0,
			totalMilestones: 0,
			mostActiveMonth: null,
			monthDistribution: [],
			firstPhoto: null,
			latestPhoto: null,
			completionPercentage: 0,
			monthsWithContent: 0,
			photosByMonth: {},
			milestonesByMonth: {},
			babyName: "",
			babyBirthDate: "",
		},
		isLoading,
		error,
	};
};

