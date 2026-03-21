import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackFileUploadError, trackDatabaseError } from "@/lib/analytics";
import { providerCodeFromUnknown, UploadFailedError } from "@/lib/uploadErrors";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePhotoData } from "@/types/photo";
import { compressImage } from "@/utils/imageCompressor";
import { FILE_SIZE_LIMITS } from "@/components/photoUploader/validateFile";

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

	const uploadImageLogic = async (
		file: File,
		uploadOptions: UploadOptions,
	): Promise<UploadResult> => {
		const ctx = {
			babyId: uploadOptions.babyId,
			monthNumber: uploadOptions.monthNumber,
			fileType: file?.type || "unknown",
			fileSize: file?.size ?? 0,
		};

		if (!user) {
			const authError = new UploadFailedError(
				"User not authenticated",
				"auth",
			);
			trackFileUploadError(authError, ctx.fileType, ctx.fileSize, "auth");
			throw authError;
		}

		if (!file) {
			const fileError = new UploadFailedError("No file selected", "validation");
			trackFileUploadError(fileError, "unknown", 0, "validation");
			throw fileError;
		}

		const monthNum = Math.max(1, uploadOptions.monthNumber);

		const isVideoFile =
			file.type.startsWith("video/") ||
			!!file.name.toLowerCase().match(/\.(mp4|mov|qt|webm|avi|m4v)$/);
		const maxFileSize = isVideoFile
			? FILE_SIZE_LIMITS.VIDEO_MAX_SIZE
			: FILE_SIZE_LIMITS.IMAGE_MAX_SIZE;
		if (file.size > maxFileSize) {
			const sizeError = new UploadFailedError("File too large", "validation");
			trackFileUploadError(sizeError, file.type, file.size, "validation");
			throw sizeError;
		}

		const acceptedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/heic",
			"image/heif",
			"image/bmp",
			"image/tiff",
			"video/mp4",
			"video/quicktime",
			"video/webm",
			"video/avi",
			"video/x-msvideo",
		];

		let isValidFileType = false;
		let isHeicFormat = false;

		if (acceptedTypes.includes(file.type)) {
			isValidFileType = true;
			isHeicFormat = file.type === "image/heic" || file.type === "image/heif";
		} else if (!file.type || file.type === "") {
			const extension = file.name.split(".").pop()?.toLowerCase() || "";
			const imageExtensions = [
				"jpg",
				"jpeg",
				"png",
				"gif",
				"webp",
				"heic",
				"heif",
				"bmp",
				"tiff",
				"tif",
			];
			const videoExtensions = ["mp4", "mov", "qt", "webm", "avi", "m4v"];

			if (
				imageExtensions.includes(extension) ||
				videoExtensions.includes(extension)
			) {
				isValidFileType = true;
				isHeicFormat = extension === "heic" || extension === "heif";
			}
		}

		if (!isValidFileType) {
			const typeError = new UploadFailedError("Invalid file type", "validation");
			trackFileUploadError(typeError, file.type, file.size, "validation");
			throw typeError;
		}

		if (isHeicFormat) {
			toast("HEIC/HEIF Format Detected", {
				description: "Converting and optimizing for upload...",
			});
		}

		setProgress(0);
		uploadOptions.onProgress?.(0);

		const isVideo =
			file.type.startsWith("video/") ||
			!!file.name.toLowerCase().match(/\.(mp4|mov|qt|webm|avi|m4v)$/);

		let fileToUpload = file;
		if (!isVideo) {
			try {
				toast("Optimizing image...", {
					description: "Compressing for faster upload and storage savings",
				});
				fileToUpload = await compressImage(file);
			} catch (compressionError) {
				console.warn("Image compression failed, uploading original:", compressionError);
			}
		}

		const fileExt = fileToUpload.name.split(".").pop();
		const fileName = `${user.id}/${uploadOptions.babyId}/${monthNum}/${uuidv4()}.${fileExt}`;

		const uploadOptionsConfig: { contentType: string } = {
			contentType: fileToUpload.type,
		};

		const { error: uploadError } = await supabase.storage
			.from("baby_images")
			.upload(fileName, fileToUpload, uploadOptionsConfig);

		setProgress(100);
		uploadOptions.onProgress?.(100);

		if (uploadError) {
			const code = providerCodeFromUnknown(uploadError);
			if (isHeicFormat && uploadError.message?.includes("mime")) {
				const heicError = new UploadFailedError(
					"HEIC/HEIF format not supported by storage. Please convert to JPEG or PNG.",
					"storage",
					code,
				);
				trackFileUploadError(heicError, file.type, file.size, "storage", {
					provider_code: code,
				});
				throw heicError;
			}
			const storageErr = new UploadFailedError(
				uploadError.message || "Storage upload failed",
				"storage",
				code,
			);
			trackFileUploadError(storageErr, file.type, file.size, "storage", {
				provider_code: code,
			});
			throw storageErr;
		}

		const { error: insertError, data: photo } = await supabase
			.from("photo")
			.insert({
				baby_id: uploadOptions.babyId,
				user_id: user.id,
				month_number: monthNum,
				storage_path: fileName,
				description: uploadOptions.description || null,
				is_video: isVideo,
				file_size: fileToUpload.size,
			})
			.select()
			.single();

		if (insertError) {
			await supabase.storage.from("baby_images").remove([fileName]);
			const code = providerCodeFromUnknown(insertError);
			const dbErr = new UploadFailedError(
				insertError.message || "Failed to save photo",
				"database",
				code,
			);
			trackDatabaseError(dbErr, "insert", "photo", user.id, {
				provider_code: code,
			});
			throw dbErr;
		}

		const { data: signedUrlData } = await supabase.storage
			.from("baby_images")
			.createSignedUrl(fileName, 3600);

		return {
			...photo,
			url: signedUrlData?.signedUrl,
		};
	};

	const uploadPhotoMutation = useMutation({
		mutationFn: async (data: CreatePhotoData) => {
			const result = await uploadImageLogic(data.file, {
				babyId: data.baby_id,
				monthNumber: data.month_number,
				description: data.description,
			});
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["photos", babyId, monthNumber],
			});
			if (babyId) {
				queryClient.invalidateQueries({
					queryKey: ["photos", "gallery", babyId],
				});
			}
			toast("Upload Complete", {
				description: "Your file was uploaded successfully",
			});
		},
	});

	const uploadImage = async (
		file: File,
		options: UploadOptions,
	): Promise<UploadResult | null> => {
		try {
			const result = await uploadImageLogic(file, options);

			options.onSuccess?.(result);

			toast("Upload Complete", {
				description:
					options.description?.includes("HEIC") ||
					options.description?.includes("HEIF")
						? "Your HEIC/HEIF file was uploaded successfully"
						: "Your file was uploaded successfully",
			});

			return result;
		} catch (err) {
			console.error("Upload error:", err);
			const uploadError =
				err instanceof Error ? err : new Error("Upload failed");

			options.onError?.(
				uploadError instanceof Error ? uploadError : new Error("Upload failed"),
			);

			if (uploadError.message === "Upload failed") {
				trackFileUploadError(uploadError, file.type, file.size, "processing");
			}

			const extension = file.name.split(".").pop()?.toLowerCase() || "";
			const isHeicFormat =
				extension === "heic" ||
				extension === "heif" ||
				file.type === "image/heic" ||
				file.type === "image/heif";
			const errorMessage =
				isHeicFormat && uploadError.message?.includes("not supported")
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
		uploadImage,
		isUploading: uploadPhotoMutation.isPending,
		progress,
		error: uploadPhotoMutation.error,
		resetUploadState: resetState,

		uploadPhoto: uploadPhotoMutation.mutateAsync,
	};
};
