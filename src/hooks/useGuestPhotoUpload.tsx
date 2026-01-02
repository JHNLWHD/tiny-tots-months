import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect, useRef } from "react";

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

type FetchPhotosResult = {
	photos: GuestPhoto[];
	hasMorePages: boolean;
	filesFetched: number; // Number of files actually fetched from storage (before filtering)
};

export const useGuestPhotoUpload = (
	eventId: string,
	storageBucket: string,
	isAuthenticated: boolean = false,
	pageSize: number = 12
) => {
	const queryClient = useQueryClient();
	// Track generation number to invalidate in-flight loadMore operations on refresh
	const generationRef = useRef<number>(0);

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
					.from(storageBucket)
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
			// Increment generation to invalidate any in-flight loadMore operations
			generationRef.current += 1;
			// Invalidate queries to refresh the photo list
			queryClient.invalidateQueries({
				queryKey: ["guest-photos", eventId],
			});
			// Reset pagination state to trigger a fresh fetch
			setPaginationState({
				photos: [],
				isLoadingMore: false,
				hasMore: true,
				storageOffset: 0,
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

	// Helper function to get or generate signed URL
	// React Query will handle caching of the fetchPhotos result
	const getSignedUrl = useCallback(async (storagePath: string): Promise<string | undefined> => {
		// Generate signed URL with 2 hour expiry
		const { data: signedUrlData } = await supabase.storage
			.from(storageBucket)
			.createSignedUrl(storagePath, 7200);

		return signedUrlData?.signedUrl;
	}, [storageBucket]);

	// Helper function to extract guest name from filename
	const extractGuestName = (storagePath: string): string | null => {
		const nameMatch = storagePath.match(/^([a-z0-9-]+?)-(\d+)-/);
		if (nameMatch && nameMatch[1]) {
			const sanitized = nameMatch[1];
			if (sanitized.length > 3 && /[a-z]/.test(sanitized)) {
				return sanitized
					.split('-')
					.map(word => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ');
			}
		}
		return null;
	};

	// Fetch only the files needed for the current page (much faster!)
	const fetchPhotos = useCallback(async (offset: number = 0, limit: number = pageSize): Promise<FetchPhotosResult> => {
		try {
			// Fetch only the files we need for this page (much faster than fetching all)
			// We fetch a bit more than needed to check if there are more photos
			const fetchLimit = limit + 1; // Fetch one extra to check if there are more
			
			const { data: files, error } = await supabase.storage
				.from(storageBucket)
				.list("", {
					limit: fetchLimit,
					offset,
					sortBy: { column: "created_at", order: "desc" },
				});

			if (error) {
				console.error("Error fetching photos:", error);
				throw error;
			}

			// Filter out JSON files and empty files
			const validFiles = (files || []).filter((file) => 
				!file.name.endsWith(".json") && file.metadata && file.metadata.size && file.metadata.size > 0
			);

			// Check if there are more photos by checking if storage returned the full fetchLimit
			// If storage returns exactly fetchLimit files, there are more files available
			// We check the raw files count, not validFiles, because filtering might reduce the count
			const rawFilesCount = (files || []).length;
			const hasMorePages = rawFilesCount === fetchLimit;
			const pageFiles = hasMorePages ? validFiles.slice(0, limit) : validFiles;

			// Generate signed URLs in parallel for all photos in the current page
			// This is much faster than sequential generation
			const photos = await Promise.all(
				pageFiles.map(async (file) => {
					try {
						const storagePath = file.name;
						const url = await getSignedUrl(storagePath);
						const guestName = extractGuestName(storagePath);

						return {
							id: file.id || file.name,
							event_id: eventId,
							storage_path: storagePath,
							guest_name: guestName,
							created_at: file.created_at || new Date().toISOString(),
							url,
						} as GuestPhoto;
					} catch (error) {
						console.error(`Error processing photo ${file.name}:`, error);
						// Return photo without URL if URL generation fails
						return {
							id: file.id || file.name,
							event_id: eventId,
							storage_path: file.name,
							guest_name: extractGuestName(file.name),
							created_at: file.created_at || new Date().toISOString(),
							url: undefined,
						} as GuestPhoto;
					}
				}),
			);

			// Return the number of files actually fetched from storage (before filtering)
			// This is needed to correctly calculate the next offset
			const filesFetched = (files || []).length;

			return { photos, hasMorePages, filesFetched };
		} catch (error) {
			console.error("Error in fetchPhotos:", error);
			throw error;
		}
	}, [pageSize, eventId, storageBucket, getSignedUrl]);

	// Consolidated pagination state
	const [paginationState, setPaginationState] = useState({
		photos: [] as GuestPhoto[],
		isLoadingMore: false,
		hasMore: true,
		storageOffset: 0, // Number of files fetched from storage (before filtering)
	});

	// Fetch photos only after authentication (security requirement)
	// React Query handles caching automatically - no need for manual cache
	const { data: initialData, isLoading, isFetching, error: fetchError, refetch } = useQuery({
		queryKey: ["guest-photos", eventId, "initial"],
		queryFn: () => fetchPhotos(0, pageSize),
		enabled: isAuthenticated, // Only fetch when authenticated
		refetchInterval: isAuthenticated ? 30000 : false,
		retry: 2,
		retryDelay: 1000,
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
	});

	// Update state when initial data is loaded and preload images for faster display
	useEffect(() => {
		if (initialData) {
			setPaginationState({
				photos: initialData.photos,
				isLoadingMore: false,
				hasMore: initialData.hasMorePages,
				storageOffset: initialData.filesFetched,
			});
			
			// Preload images in browser cache for faster display
			// This happens AFTER authentication, so it's secure
			initialData.photos.forEach(photo => {
				if (photo.url) {
					const img = new Image();
					img.src = photo.url;
				}
			});
		}
		
		// Handle fetch errors
		if (fetchError) {
			console.error("Error fetching photos:", fetchError);
			toast("Error", {
				description: "Failed to load photos. Please try refreshing the page.",
				className: "bg-destructive text-destructive-foreground",
			});
		}
	}, [initialData, fetchError]);

	const loadMore = useCallback(async () => {
		if (paginationState.isLoadingMore || !paginationState.hasMore) return;

		// Capture the current generation at the start of the operation
		const currentGeneration = generationRef.current;
		
		setPaginationState(prev => ({ ...prev, isLoadingMore: true }));
		try {
			// Use storageOffset (number of files fetched from storage) instead of photos.length
			// This ensures we skip the correct number of files in storage, accounting for filtered files
			const result = await fetchPhotos(paginationState.storageOffset, pageSize);
			
			// Check if generation has changed (refresh happened during fetch)
			// If so, discard this stale result to prevent race condition
			if (generationRef.current !== currentGeneration) {
				console.log("loadMore result discarded: refresh occurred during fetch");
				return;
			}
			
			setPaginationState(prev => ({
				photos: [...prev.photos, ...result.photos],
				isLoadingMore: false,
				hasMore: result.hasMorePages,
				storageOffset: prev.storageOffset + result.filesFetched,
			}));
		} catch (error) {
			// Only show error if generation hasn't changed (refresh didn't happen)
			if (generationRef.current === currentGeneration) {
				console.error("Error loading more photos:", error);
				toast("Error", {
					description: "Failed to load more photos. Please try again.",
					className: "bg-destructive text-destructive-foreground",
				});
				setPaginationState(prev => ({ ...prev, isLoadingMore: false }));
			}
		}
	}, [paginationState.storageOffset, paginationState.isLoadingMore, paginationState.hasMore, pageSize, fetchPhotos]);

	// Reset loaded photos when authentication changes or eventId changes
	const prevEventIdRef = useRef<string>(eventId);
	useEffect(() => {
		const eventIdChanged = prevEventIdRef.current !== eventId;
		
		// Reset if authentication is lost or eventId changes
		if (!isAuthenticated || eventIdChanged) {
			// Increment generation to invalidate any in-flight loadMore operations
			generationRef.current += 1;
			setPaginationState({
				photos: [],
				isLoadingMore: false,
				hasMore: true,
				storageOffset: 0,
			});
		}
		
		// Update ref to track current eventId
		if (eventIdChanged) {
			prevEventIdRef.current = eventId;
		}
	}, [isAuthenticated, eventId]);

	const handleRefresh = useCallback(async () => {
		// Increment generation to invalidate any in-flight loadMore operations
		generationRef.current += 1;
		// Reset pagination state to trigger fresh fetch
		setPaginationState({
			photos: [],
			isLoadingMore: false,
			hasMore: true,
			storageOffset: 0,
		});
		// Refetch the query
		await refetch();
	}, [refetch]);

	return {
		uploadPhoto: uploadPhoto.mutate,
		isUploading: uploadPhoto.isPending,
		photos: paginationState.photos,
		isLoading: isLoading && paginationState.photos.length === 0,
		isLoadingMore: paginationState.isLoadingMore,
		loadMore,
		hasMore: paginationState.hasMore,
		refresh: handleRefresh,
		isRefreshing: isFetching,
	};
};

