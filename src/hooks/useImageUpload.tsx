import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackFileUploadError, trackDatabaseError, ErrorCategory, ErrorSeverity } from "@/lib/analytics";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface UploadOptions {
	babyId: string;
	monthNumber: number;
	description?: string;
	onProgress?: (progress: number) => void;
	onSuccess?: (data: UploadResult) => void;
	onError?: (error: Error) => void;
}

export interface UploadResult {
	id: string;
	url?: string;
	storage_path: string;
	is_video: boolean;
}

export const useImageUpload = () => {
	const { user } = useAuth();
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<Error | null>(null);

	const resetState = () => {
		setIsUploading(false);
		setProgress(0);
		setError(null);
	};

	const uploadImage = async (
		file: File,
		options: UploadOptions,
	): Promise<UploadResult | null> => {
		if (!user) {
			const authError = new Error("User not authenticated");
			setError(authError);
			options.onError?.(authError);
			trackFileUploadError(authError, file?.type || "unknown", file?.size || 0, "validation");
			toast("Authentication Error", {
				description: "You must be logged in to upload files",
				className: "bg-destructive text-destructive-foreground",
			});
			return null;
		}

		if (!file) {
			const fileError = new Error("No file selected");
			setError(fileError);
			options.onError?.(fileError);
			trackFileUploadError(fileError, "unknown", 0, "validation");
			toast("Upload Error", {
				description: "No file selected for upload",
				className: "bg-destructive text-destructive-foreground",
			});
			return null;
		}

		// Ensure month number is at least 1 to satisfy database constraint
		const monthNumber = Math.max(1, options.monthNumber);

		// Validate file size (max 100MB to match Supabase config)
		if (file.size > 100 * 1024 * 1024) {
			const sizeError = new Error("File too large");
			setError(sizeError);
			options.onError?.(sizeError);
			trackFileUploadError(sizeError, file.type, file.size, "validation");
			toast("File too large", {
				description: "Maximum file size is 100MB",
				className: "bg-destructive text-destructive-foreground",
			});
			return null;
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
			setError(typeError);
			options.onError?.(typeError);
			trackFileUploadError(typeError, file.type, file.size, "validation");
			toast("Invalid file type", {
				description:
					"Please upload a JPG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, MP4, WebM or QuickTime file",
				className: "bg-destructive text-destructive-foreground",
			});
			return null;
		}

		if (isHeicFormat) {
			toast("HEIC/HEIF Format Detected", {
				description: "Uploading Apple HEIC/HEIF format. This may have limited compatibility on some devices.",
			});
		}

		try {
			setIsUploading(true);
			setProgress(0);
			setError(null);

			// Generate file path
			const fileExt = file.name.split(".").pop();
			const fileName = `${user.id}/${options.babyId}/${monthNumber}/${uuidv4()}.${fileExt}`;
			const isVideo = file.type.startsWith("video/") || 
							 !!fileName.toLowerCase().match(/\.(mp4|mov|qt|webm|avi|m4v)$/);

			const uploadWithProgress = async () => {
				const uploadOptions: any = {};
				if (isHeicFormat) {
					uploadOptions.contentType = file.type || (fileExt?.toLowerCase() === 'heic' ? 'image/heic' : 'image/heif');
				}

				const { error: uploadError, data: uploadData } = await supabase.storage
					.from("baby_images")
					.upload(fileName, file, uploadOptions);

				setProgress(100);
				options.onProgress?.(100);

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
					baby_id: options.babyId,
					user_id: user.id,
					month_number: monthNumber,
					storage_path: fileName,
					description: options.description || null,
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

			options.onSuccess?.(result);

			toast("Upload Complete", {
				description: isHeicFormat 
					? "Your HEIC/HEIF file was uploaded successfully" 
					: "Your file was uploaded successfully",
			});

			return result;
		} catch (err) {
			console.error("Upload error:", err);
			const uploadError =
				err instanceof Error ? err : new Error("Upload failed");
			setError(uploadError);
			options.onError?.(uploadError);

			// Track the error if it hasn't been tracked yet
			if (uploadError.message === "Upload failed") {
				trackFileUploadError(uploadError, file.type, file.size, "processing");
			}

			// Special error message for HEIC/HEIF issues
			const errorMessage = isHeicFormat && uploadError.message?.includes('not supported')
				? "HEIC/HEIF upload failed. Please convert to JPEG or PNG for better compatibility."
				: uploadError.message || "Failed to upload file";

			toast("Upload Error", {
				description: errorMessage,
				className: "bg-destructive text-destructive-foreground",
			});
			return null;
		} finally {
			setIsUploading(false);
		}
	};

	return {
		uploadImage,
		isUploading,
		progress,
		error,
		resetUploadState: resetState,
	};
};
