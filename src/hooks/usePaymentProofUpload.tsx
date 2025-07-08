import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UploadOptions {
	description?: string;
	onProgress?: (progress: number) => void;
	onSuccess?: (storagePath: string) => void;
	onError?: (error: Error) => void;
}

export const usePaymentProofUpload = () => {
	const { user } = useAuth();
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<Error | null>(null);

	const resetState = () => {
		setIsUploading(false);
		setProgress(0);
		setError(null);
	};

	const uploadPaymentProof = async (
		file: File,
		options: UploadOptions,
	): Promise<string | null> => {
		if (!user) {
			const authError = new Error("User not authenticated");
			setError(authError);
			options.onError?.(authError);
			toast.error("You must be logged in to upload files");
			return null;
		}

		if (!file) {
			const fileError = new Error("No file selected");
			setError(fileError);
			options.onError?.(fileError);
			toast.error("No file selected for upload");
			return null;
		}

		// Validate file size (max 100MB to match Supabase config)
		if (file.size > 100 * 1024 * 1024) {
			const sizeError = new Error("File too large");
			setError(sizeError);
			options.onError?.(sizeError);
			toast.error("Maximum file size is 100MB");
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
			"image/tiff"
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
			
			if (imageExtensions.includes(extension)) {
				isValidFileType = true;
				isHeicFormat = extension === 'heic' || extension === 'heif';
			}
		}

		if (!isValidFileType) {
			const typeError = new Error("Invalid file type");
			setError(typeError);
			options.onError?.(typeError);
			toast.error("Please upload a JPG, PNG, GIF, WebP, HEIC, HEIF, BMP or TIFF file");
			return null;
		}

		if (isHeicFormat) {
			toast.info("HEIC/HEIF Format Detected", {
				description: "Uploading Apple HEIC/HEIF format. This may have limited compatibility on some devices.",
			});
		}

		try {
			setIsUploading(true);
			setProgress(0);
			setError(null);

			// Generate file path specifically for payment proofs (no baby_id association)
			const fileExt = file.name.split(".").pop();
			const fileName = `payment_proofs/${user.id}/${uuidv4()}.${fileExt}`;

			// Custom upload function that tracks progress
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
				console.error("Storage upload error:", uploadError);
				// Special handling for HEIC/HEIF upload errors
				if (isHeicFormat && uploadError.message?.includes('mime')) {
					throw new Error("HEIC/HEIF format not supported by storage. Please convert to JPEG or PNG.");
				}
				throw uploadError;
			}

			// Successfully uploaded the file
			options.onSuccess?.(fileName);

			toast.success(
				isHeicFormat 
					? "Your HEIC/HEIF payment proof was uploaded successfully" 
					: "Your payment proof was uploaded successfully"
			);

			return fileName;
		} catch (err) {
			console.error("Payment proof upload error:", err);
			const uploadError =
				err instanceof Error ? err : new Error("Upload failed");
			setError(uploadError);
			options.onError?.(uploadError);

			// Special error message for HEIC/HEIF issues
			const errorMessage = isHeicFormat && uploadError.message?.includes('not supported')
				? "HEIC/HEIF upload failed. Please convert to JPEG or PNG for better compatibility."
				: uploadError.message || "Failed to upload payment proof";

			toast.error(errorMessage);
			return null;
		} finally {
			setIsUploading(false);
		}
	};

	return {
		uploadPaymentProof,
		isUploading,
		progress,
		error,
		resetUploadState: resetState,
	};
};
