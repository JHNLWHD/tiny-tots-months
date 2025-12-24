import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackFileUploadError, trackDatabaseError, ErrorCategory, ErrorSeverity } from "@/lib/analytics";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePhotoData } from "@/types/photo";

type UploadOptions = {
	babyId: string;
	monthNumber: number;
	description?: string;
	onProgress?: (progress: number) => void;
	onSuccess?: (data: UploadResult) => void;
	onError?: (error: Error) => void;
};

export type UploadResult = {
	id: string;
	url?: string;
	storage_path: string;
	is_video: boolean;
};

export const useImageUpload = (babyId?: string, monthNumber?: number) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [progress, setProgress] = useState(0);

	// Validation and upload logic extracted into a reusable function
	const uploadImageLogic = async (
		file: File,
		uploadOptions: UploadOptions,
	): Promise<UploadResult> => {
		if (!user) {
			const authError = new Error("User not authenticated");
			trackFileUploadError(authError, file?.type || "unknown", file?.size || 0, "validation");
			throw authError;
		}

		if (!file) {
			const fileError = new Error("No file selected");
			trackFileUploadError(fileError, "unknown", 0, "validation");
			throw fileError;
		}

		// Ensure month number is at least 1 to satisfy database constraint
		const monthNumber = Math.max(1, uploadOptions.monthNumber);

		// Validate file size (max 100MB to match Supabase config)
		if (file.size > 100 * 1024 * 1024) {
			const sizeError = new Error("File too large");
			trackFileUploadError(sizeError, file.type, file.size, "validation");
			throw sizeError;
		}

		// Validate file type - enhanced for mobile compatibility including HEIC/HEIF
		const acceptedTypes = [
			"image/jpeg",
			"image/jpg", // Sometimes reported as jpg instead of jpeg
			"image/png",
			"image/gif",
			"image/webp",
			"image/heic", // iOS HEIF format
			"image/heif", // High Efficiency Image Format
			"image/bmp",
			"image/tiff",
			"video/mp4",
			"video/quicktime",
			"video/webm",
			"video/avi",
			"video/x-msvideo" // Alternative AVI MIME type
		];

		// Enhanced validation for mobile devices
		let isValidFileType = false;
		let isHeicFormat = false;
		
		if (acceptedTypes.includes(file.type)) {
			isValidFileType = true;
			isHeicFormat = file.type === "image/heic" || file.type === "image/heif";
		} else if (!file.type || file.type === "") {
			// Mobile devices sometimes don't set MIME type properly
			// Check file extension as fallback
			const extension = file.name.split('.').pop()?.toLowerCase() || '';
			const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'tif'];
			const videoExtensions = ['mp4', 'mov', 'qt', 'webm', 'avi', 'm4v'];
			
			if (imageExtensions.includes(extension) || videoExtensions.includes(extension)) {
				isValidFileType = true;
				isHeicFormat = extension === 'heic' || extension === 'heif';
			}
		}

		if (!isValidFileType) {
			const typeError = new Error("Invalid file type");
			trackFileUploadError(typeError, file.type, file.size, "validation");
			throw typeError;
		}

		if (isHeicFormat) {
			toast("HEIC/HEIF Format Detected", {
				description: "Uploading Apple HEIC/HEIF format. This may have limited compatibility on some devices.",
			});
		}

		setProgress(0);
		uploadOptions.onProgress?.(0);

		// Generate file path
		const fileExt = file.name.split(".").pop();
		const fileName = `${user.id}/${uploadOptions.babyId}/${monthNumber}/${uuidv4()}.${fileExt}`;
		const isVideo = file.type.startsWith("video/") || 
						 !!fileName.toLowerCase().match(/\.(mp4|mov|qt|webm|avi|m4v)$/);

		const uploadWithProgress = async () => {
			const uploadOptionsConfig: any = {};
			if (isHeicFormat) {
				uploadOptionsConfig.contentType = file.type || (fileExt?.toLowerCase() === 'heic' ? 'image/heic' : 'image/heif');
			}

			const { error: uploadError, data: uploadData } = await supabase.storage
				.from("baby_images")
				.upload(fileName, file, uploadOptionsConfig);

			setProgress(100);
			uploadOptions.onProgress?.(100);

			return { uploadError, uploadData };
		};

		const { uploadError, uploadData } = await uploadWithProgress();

		if (uploadError) {
			if (isHeicFormat && uploadError.message?.includes('mime')) {
				const heicError = new Error("HEIC/HEIF format not supported by storage. Please convert to JPEG or PNG.");
				trackFileUploadError(heicError, file.type, file.size, "upload");
				throw heicError;
			}
			trackFileUploadError(uploadError, file.type, file.size, "upload");
			throw uploadError;
		}

		const { error: insertError, data: photo } = await supabase
			.from("photo")
			.insert({
				baby_id: uploadOptions.babyId,
				user_id: user.id,
				month_number: monthNumber,
				storage_path: fileName,
				description: uploadOptions.description || null,
				is_video: isVideo,
			})
			.select()
			.single();

		if (insertError) {
			await supabase.storage.from("baby_images").remove([fileName]);
			trackDatabaseError(insertError, "insert", "photo", user.id);
			throw insertError;
		}

		const { data: signedUrlData } = await supabase.storage
			.from("baby_images")
			.createSignedUrl(fileName, 3600);

		const result = {
			...photo,
			url: signedUrlData?.signedUrl,
		};

		return result;
	};

	// React Query mutation for the new interface
	const uploadPhotoMutation = useMutation({
		mutationFn: async (data: CreatePhotoData) => {
			const result = await uploadImageLogic(data.file, {
				babyId: data.baby_id,
				monthNumber: data.month_number,
				description: data.description,
			});
			return result;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["photos", babyId, monthNumber],
			});
			toast("Upload Complete", {
				description: "Your file was uploaded successfully",
			});
		},
		onError: (error: Error) => {
			console.error("Upload error:", error);
			toast("Upload Error", {
				description: error.message || "Failed to upload file",
				className: "bg-destructive text-destructive-foreground",
			});
		},
	});

	// Legacy interface for backward compatibility
	const uploadImage = async (
		file: File,
		options: UploadOptions,
	): Promise<UploadResult | null> => {
		try {
			const result = await uploadImageLogic(file, options);
			
			options.onSuccess?.(result);

			toast("Upload Complete", {
				description: options.description?.includes('HEIC') || options.description?.includes('HEIF')
					? "Your HEIC/HEIF file was uploaded successfully" 
					: "Your file was uploaded successfully",
			});

			return result;
		} catch (err) {
			console.error("Upload error:", err);
			const uploadError = err instanceof Error ? err : new Error("Upload failed");
			
			options.onError?.(uploadError);

			// Track the error if it hasn't been tracked yet
			if (uploadError.message === "Upload failed") {
				trackFileUploadError(uploadError, file.type, file.size, "processing");
			}

			// Special error message for HEIC/HEIF issues
			const extension = file.name.split('.').pop()?.toLowerCase() || '';
			const isHeicFormat = extension === 'heic' || extension === 'heif' || file.type === "image/heic" || file.type === "image/heif";
			const errorMessage = isHeicFormat && uploadError.message?.includes('not supported')
				? "HEIC/HEIF upload failed. Please convert to JPEG or PNG for better compatibility."
				: uploadError.message || "Failed to upload file";

			toast("Upload Error", {
				description: errorMessage,
				className: "bg-destructive text-destructive-foreground",
			});
			return null;
		} finally {
			setProgress(0);
		}
	};

	const resetState = () => {
		setProgress(0);
	};

	return {
		// Legacy interface (backward compatibility)
		uploadImage,
		isUploading: uploadPhotoMutation.isPending,
		progress,
		error: uploadPhotoMutation.error,
		resetUploadState: resetState,
		
		// New React Query interface
		uploadPhoto: uploadPhotoMutation.mutate,
	};
};
