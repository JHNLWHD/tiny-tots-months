import { toast } from "@/components/ui/sonner";
import { fileTypeFromBlob } from "file-type";

export interface FileValidationResult {
	isValid: boolean;
	isVideo: boolean;
	effectiveMimeType: string;
}

// Helper function to detect file type from extension as a fallback
const getMimeTypeFromExtension = (fileName: string): string => {
	const extension = fileName.split('.').pop()?.toLowerCase() || '';
	
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
	isPremium: boolean,
): Promise<FileValidationResult> => {
	if (!file) {
		console.log("File validation failed: No file provided");
		return { isValid: false, isVideo: false, effectiveMimeType: "" };
	}

	console.log(
		`Starting validation for file: ${file.name}, size: ${file.size} bytes`,
	);

	// Get the MIME type reported by the browser
	const reportedMimeType = file.type || "";
	console.log("Browser-reported MIME type:", reportedMimeType);

	// Try to detect file type from binary data for more accurate type detection
	let detectedMimeType = "";
	try {
		console.log("Detecting file type from binary data...");
		const fileTypeResult = await fileTypeFromBlob(file);
		if (fileTypeResult) {
			detectedMimeType = fileTypeResult.mime;
			console.log(
				"Successfully detected MIME type from binary:",
				detectedMimeType,
			);
		} else {
			console.log("fileTypeFromBlob returned null or undefined");
		}
	} catch (error) {
		console.error("Error detecting file type:", error);
	}

	// Get MIME type from file extension as fallback
	const extensionMimeType = getMimeTypeFromExtension(file.name);
	console.log("MIME type from extension:", extensionMimeType);

	// Use the most reliable MIME type available
	// Priority: detected > reported > extension
	const effectiveMimeType = detectedMimeType || reportedMimeType || extensionMimeType;

	console.log("File type determination:", {
		reportedMimeType,
		detectedMimeType,
		extensionMimeType,
		effectiveMimeType,
	});

	// Enhanced fallback for mobile: if no MIME type can be determined but file seems like an image
	if (!effectiveMimeType) {
		if (isLikelyImage(file)) {
			console.log("No MIME type detected, but file appears to be an image based on extension");
			// Default to JPEG for unknown image files - most common on mobile
			const fallbackMimeType = "image/jpeg";
			console.log(`Using fallback MIME type: ${fallbackMimeType}`);
			
			// Proceed with validation using the fallback
			return validateWithMimeType(file, fallbackMimeType, isPremium, true);
		}
		
		console.error("File validation failed: Could not determine file type and doesn't appear to be an image");
		toast("Invalid file", {
			description: "Could not determine file type. Please try selecting a different image.",
			className: "bg-destructive text-destructive-foreground",
		});
		return { isValid: false, isVideo: false, effectiveMimeType: "" };
	}

	return validateWithMimeType(file, effectiveMimeType, isPremium, false);
};

// Extracted validation logic to reuse for fallback scenarios
const validateWithMimeType = (
	file: File,
	mimeType: string,
	isPremium: boolean,
	isFallback: boolean
): FileValidationResult => {
	// Check if file is a video based on effective MIME type
	const isVideo = mimeType.startsWith("video/");
	console.log(`File is determined to be a ${isVideo ? "video" : "image"}${isFallback ? " (fallback detection)" : ""}`);

	// Check premium subscription for video uploads
	if (isVideo && !isPremium) {
		console.log(
			"Validation failed: Video upload attempted without premium subscription",
		);
		toast("Premium Required", {
			description: "Video uploads are only available for premium users",
			className: "bg-destructive text-destructive-foreground",
		});
		return { isValid: false, isVideo, effectiveMimeType: mimeType };
	}

	// Validate file size (max 50MB for videos, 10MB for images)
	const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
	if (file.size > maxSize) {
		console.log(
			`Validation failed: File too large (${file.size} bytes, max: ${maxSize} bytes)`,
		);
		toast(isVideo ? "Video too large" : "Image too large", {
			description: isVideo
				? "Maximum video size is 50MB"
				: "Maximum image size is 10MB",
			className: "bg-destructive text-destructive-foreground",
		});
		return { isValid: false, isVideo, effectiveMimeType: mimeType };
	}

	// Enhanced accepted file types including mobile-specific formats
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
		// For fallback scenarios, be more lenient with unknown image types
		if (isFallback && mimeType.startsWith("image/")) {
			console.log(`Accepting unknown image type in fallback mode: ${mimeType}`);
		} else {
			console.log(`Validation failed: Invalid file type (${mimeType})`);
			toast("Invalid file type", {
				description:
					"Please upload a JPG, PNG, GIF, WebP, HEIC, MP4, WebM or QuickTime file",
				className: "bg-destructive text-destructive-foreground",
			});
			return { isValid: false, isVideo, effectiveMimeType: mimeType };
		}
	}

	console.log("File validation passed successfully");
	return { isValid: true, isVideo, effectiveMimeType: mimeType };
};
