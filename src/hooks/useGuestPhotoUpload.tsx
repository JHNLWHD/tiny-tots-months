import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type GuestPhoto = {
	id: string;
	event_id: string;
	storage_path: string;
	guest_name: string | null;
	created_at: string;
	url?: string;
};

export type GuestPhotoUpload = {
	file: File;
	guest_name?: string;
};

const EVENT_ID = "baby-jasmine-binyag";
const STORAGE_BUCKET = "baby_jasmine_binyag";

export const useGuestPhotoUpload = (isAuthenticated: boolean = false) => {
	const queryClient = useQueryClient();

	const uploadPhoto = useMutation({
		mutationFn: async (data: GuestPhotoUpload) => {
			const file = data.file;
			
			// Validate it's an image
			if (!file.type.startsWith("image/")) {
				throw new Error("Only image files are allowed");
			}

			const fileExt = file.name.split(".").pop();
			
			// Sanitize guest name for filename (remove special chars, limit length)
			const sanitizeName = (name: string): string => {
				return name
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, '') // Remove special characters
					.replace(/\s+/g, '-') // Replace spaces with hyphens
					.replace(/-+/g, '-') // Replace multiple hyphens with single
					.substring(0, 30); // Limit length
			};
			
			const guestNamePrefix = data.guest_name 
				? `${sanitizeName(data.guest_name)}-` 
				: '';
			
			const fileName = `${guestNamePrefix}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

			// Upload to storage
			const { error: uploadError } = await supabase.storage
				.from(STORAGE_BUCKET)
				.upload(fileName, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type,
				});

			if (uploadError) {
				throw uploadError;
			}
			
			return { storage_path: fileName, guest_name: data.guest_name || null };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["guest-photos", EVENT_ID],
			});
			toast("Upload Complete", {
				description: "Your photo was uploaded successfully!",
			});
		},
		onError: (error: Error) => {
			console.error("Upload error:", error);
			toast("Upload Error", {
				description: error.message || "Failed to upload photo",
				className: "bg-destructive text-destructive-foreground",
			});
		},
	});

	const fetchPhotos = async (): Promise<GuestPhoto[]> => {
		// List files from storage
		const { data: files, error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.list("", {
				limit: 100,
				sortBy: { column: "created_at", order: "desc" },
			});

		if (error) {
			console.error("Error fetching photos:", error);
			return [];
		}

		// Generate signed URLs for each photo and extract guest name from filename
		const photos = await Promise.all(
			(files || [])
				.filter((file) => !file.name.endsWith(".json")) // Exclude metadata files
				.map(async (file) => {
					const storagePath = file.name;
					const { data: signedUrlData } = await supabase.storage
						.from(STORAGE_BUCKET)
						.createSignedUrl(storagePath, 3600);

					// Extract guest name from filename
					// Format: {name}-{timestamp}-{random}.{ext}
					// Or: {timestamp}-{random}.{ext} (if no name)
					let guestName: string | null = null;
					const nameMatch = storagePath.match(/^([a-z0-9-]+?)-(\d+)-/);
					if (nameMatch && nameMatch[1]) {
						// Convert back from sanitized format
						const sanitized = nameMatch[1];
						// Check if it's actually a name (not just numbers/timestamp)
						// If it contains letters or is longer than typical timestamp prefix, it's likely a name
						if (sanitized.length > 3 && /[a-z]/.test(sanitized)) {
							guestName = sanitized
								.split('-')
								.map(word => word.charAt(0).toUpperCase() + word.slice(1))
								.join(' ');
						}
					}

					return {
						id: file.id || file.name,
						event_id: EVENT_ID,
						storage_path: storagePath,
						guest_name: guestName,
						created_at: file.created_at || new Date().toISOString(),
						url: signedUrlData?.signedUrl,
					} as GuestPhoto;
				}),
		);

		return photos;
	};

	const { data: photos = [], isLoading } = useQuery({
		queryKey: ["guest-photos", EVENT_ID],
		queryFn: fetchPhotos,
		enabled: isAuthenticated, // Only fetch when authenticated
		refetchInterval: isAuthenticated ? 30000 : false, // Refetch every 30 seconds when authenticated
	});

	return {
		uploadPhoto: uploadPhoto.mutate,
		isUploading: uploadPhoto.isPending,
		photos,
		isLoading,
	};
};

