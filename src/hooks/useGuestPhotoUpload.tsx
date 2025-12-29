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
		mutationFn: async (data: GuestPhotoUpload | GuestPhotoUpload[]) => {
			// Normalize to array
			const uploads = Array.isArray(data) ? data : [data];
			
			if (uploads.length === 0) {
				throw new Error("No files to upload");
			}

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

			// Upload all files in parallel
			const uploadPromises = uploads.map(async (uploadData) => {
				const file = uploadData.file;
				
				// Validate it's an image
				if (!file.type.startsWith("image/")) {
					throw new Error(`"${file.name}" is not an image file`);
				}

				const fileExt = file.name.split(".").pop();
				const guestNamePrefix = uploadData.guest_name 
					? `${sanitizeName(uploadData.guest_name)}-` 
					: '';
				
				// Use unique timestamp per file to avoid collisions
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
					throw new Error(`Failed to upload "${file.name}": ${uploadError.message}`);
				}
				
				return { storage_path: fileName, guest_name: uploadData.guest_name || null };
			});

			// Use allSettled to handle partial failures gracefully
			const results = await Promise.allSettled(uploadPromises);
			
			const successful: Array<{ storage_path: string; guest_name: string | null }> = [];
			const failed: Array<{ file: string; error: string }> = [];

			results.forEach((result, index) => {
				if (result.status === "fulfilled") {
					successful.push(result.value);
				} else {
					failed.push({
						file: uploads[index].file.name,
						error: result.reason?.message || "Unknown error",
					});
				}
			});

			// If all failed, throw an error
			if (successful.length === 0) {
				const errorMessages = failed.map(f => `${f.file}: ${f.error}`).join("; ");
				throw new Error(`All uploads failed: ${errorMessages}`);
			}

			// Return results with success/failure info
			return {
				successful,
				failed,
				total: uploads.length,
			};
		},
		onSuccess: (result) => {
			queryClient.invalidateQueries({
				queryKey: ["guest-photos", EVENT_ID],
			});
			
			const { successful, failed, total } = result;
			if (failed.length === 0) {
				// All successful
				if (total === 1) {
					toast("Upload Complete", {
						description: "Your photo was uploaded successfully!",
					});
				} else {
					toast("Upload Complete", {
						description: `All ${total} photos were uploaded successfully!`,
					});
				}
			} else {
				// Partial success
				toast("Upload Partially Complete", {
					description: `${successful.length} of ${total} photos uploaded successfully. ${failed.length} failed.`,
					className: "bg-yellow-500 text-white",
				});
			}
		},
		onError: (error: Error) => {
			console.error("Upload error:", error);
			toast("Upload Error", {
				description: error.message || "Failed to upload photos",
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
				.filter((file) => !file.name.endsWith(".json") && file.metadata.size > 0)
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

