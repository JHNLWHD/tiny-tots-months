import { toast } from "@/components/ui/sonner";
import { fileTypeFromBlob } from "file-type";

// File size constants
export const ONE_KB = 1024;
export const ONE_MB = ONE_KB * ONE_KB;  // 1,048,576 bytes
export const ONE_GB = ONE_MB * ONE_KB;  // 1,073,741,824 bytes

export const FILE_SIZE_LIMITS = {
	IMAGE_MAX_SIZE: 10 * ONE_MB,  // 10MB
	VIDEO_MAX_SIZE: 20 * ONE_MB,  // 20MB
} as const;

export type FileValidationResult = {
	isValid: boolean;
	isVideo: boolean;
	effectiveMimeType: string;
};

// Helper function to extract file extension from a filename or path
export const getFileExtension = (fileName: string): string => {
	if (!fileName) return '';
	
	const pathWithoutQuery = fileName.split('?')[0];
	const extension = pathWithoutQuery.split('.').pop()?.toLowerCase() || '';
	const isValidExtension = extension && extension.length > 0 && extension.length <= 5;
	
	if (isValidExtension) {
		return extension;
	}
	
	return '';
};

// Helper function to detect file type from extension as a fallback
const getMimeTypeFromExtension = (fileName: string): string => {
	const extension = getFileExtension(fileName);
	
	const extensionMap: Record<string, string> = {
		// Image formats
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'png': 'image/png',
		'gif': 'image/gif',
		'webp': 'image/webp',
		'heic': 'image/heic',
		'heif': 'image/heif',
		'bmp': 'image/bmp',
		'tiff': 'image/tiff',
		'tif': 'image/tiff',
		// Video formats
		'mp4': 'video/mp4',
		'mov': 'video/quicktime',
		'qt': 'video/quicktime',
		'webm': 'video/webm',
		'avi': 'video/avi',
		'm4v': 'video/mp4'
	};
	
	return extensionMap[extension] || '';
};

// Check if the file is likely an image based on various indicators
const isLikelyImage = (file: File): boolean => {
	// Check file extension
	const extension = file.name.split('.').pop()?.toLowerCase() || '';
	const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'tif'];
	
	if (imageExtensions.includes(extension)) {
		return true;
	}
	
	// Check if any MIME type indicates it's an image
	if (file.type && file.type.startsWith('image/')) {
		return true;
	}
	
	return false;
};

export const validateFile = async (
	file: File | null,
	canUploadVideo: boolean,
): Promise<FileValidationResult> => {
	if (!file) {
		return { isValid: false, isVideo: false, effectiveMimeType: "" };
	}

	const reportedMimeType = file.type || "";

	let detectedMimeType = "";
	try {
		const fileTypeResult = await fileTypeFromBlob(file);
		if (fileTypeResult) {
			detectedMimeType = fileTypeResult.mime;
		}
	} catch (error) {
		console.error("Error detecting file type:", error);
	}

	const extensionMimeType = getMimeTypeFromExtension(file.name);

	// Priority: detected > reported > extension
	const effectiveMimeType = detectedMimeType || reportedMimeType || extensionMimeType;

	// Enhanced fallback for mobile: if no MIME type can be determined but file seems like an image
	if (!effectiveMimeType) {
		if (isLikelyImage(file)) {
			const fallbackMimeType = "image/jpeg";
			
			return validateWithMimeType(file, fallbackMimeType, canUploadVideo, true);
		}
		
		console.error("File validation failed: Could not determine file type and doesn't appear to be an image");
		toast("Invalid file", {
			description: "Could not determine file type. Please try selecting a different image.",
			className: "bg-destructive text-destructive-foreground",
		});
		return { isValid: false, isVideo: false, effectiveMimeType: "" };
	}

	return validateWithMimeType(file, effectiveMimeType, canUploadVideo, false);
};

// Extracted validation logic to reuse for fallback scenarios
const validateWithMimeType = (
	file: File,
	mimeType: string,
	canUploadVideo: boolean,
	isFallback: boolean
): FileValidationResult => {
	const isVideo = mimeType.startsWith("video/");

	if (isVideo && !canUploadVideo) {
		toast("Premium Required", {
			description: "Video uploads require premium subscription or credits",
			className: "bg-destructive text-destructive-foreground",
		});
		return { isValid: false, isVideo, effectiveMimeType: mimeType };
	}

	const maxSize = isVideo ? FILE_SIZE_LIMITS.VIDEO_MAX_SIZE : FILE_SIZE_LIMITS.IMAGE_MAX_SIZE;
	if (file.size > maxSize) {
		const maxSizeMB = maxSize / ONE_MB;
		toast(isVideo ? "Video too large" : "Image too large", {
			description: `Maximum ${isVideo ? "video" : "image"} size is ${maxSizeMB}MB`,
			className: "bg-destructive text-destructive-foreground",
		});
		return { isValid: false, isVideo, effectiveMimeType: mimeType };
	}

	const acceptedImageTypes = [
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
	const acceptedVideoTypes = [
		"video/mp4", 
		"video/quicktime", 
		"video/webm",
		"video/avi",
		"video/x-msvideo" // Alternative AVI MIME type
	];
	const acceptedTypes = [...acceptedImageTypes, ...acceptedVideoTypes];

	if (!acceptedTypes.includes(mimeType)) {
		if (isFallback && mimeType.startsWith("image/")) {
			// Accept unknown image types in fallback mode
		} else {
			toast("Invalid file type", {
				description:
					"Please upload a JPG, PNG, GIF, WebP, HEIC, MP4, WebM or QuickTime file",
				className: "bg-destructive text-destructive-foreground",
			});
			return { isValid: false, isVideo, effectiveMimeType: mimeType };
		}
	}

	return { isValid: true, isVideo, effectiveMimeType: mimeType };
};
