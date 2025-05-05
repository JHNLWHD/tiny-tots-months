
import { toast } from '@/components/ui/sonner';
import { fileTypeFromBlob } from 'file-type';

export interface FileValidationResult {
  isValid: boolean;
  isVideo: boolean;
  effectiveMimeType: string;
}

export const validateFile = async (file: File | null, isPremium: boolean): Promise<FileValidationResult> => {
  if (!file) {
    console.log("File validation failed: No file provided");
    return { isValid: false, isVideo: false, effectiveMimeType: '' };
  }

  console.log(`Starting validation for file: ${file.name}, size: ${file.size} bytes`);
  
  // Get the MIME type reported by the browser
  const reportedMimeType = file.type || '';
  console.log("Browser-reported MIME type:", reportedMimeType);
  
  // Try to detect file type from binary data for more accurate type detection
  let detectedMimeType = '';
  try {
    console.log("Detecting file type from binary data...");
    const fileTypeResult = await fileTypeFromBlob(file);
    if (fileTypeResult) {
      detectedMimeType = fileTypeResult.mime;
      console.log("Successfully detected MIME type from binary:", detectedMimeType);
    } else {
      console.log("fileTypeFromBlob returned null or undefined");
    }
  } catch (error) {
    console.error("Error detecting file type:", error);
  }
  
  // Use detected MIME type if available, otherwise fall back to browser-reported type
  const effectiveMimeType = detectedMimeType || reportedMimeType;
  
  console.log("File type determination:", {
    reportedMimeType,
    detectedMimeType,
    effectiveMimeType
  });
  
  if (!effectiveMimeType) {
    console.error("File validation failed: Could not determine file type");
    toast("Invalid file", {
      description: "Could not determine file type",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo: false, effectiveMimeType: '' };
  }

  // Check if file is a video based on effective MIME type
  const isVideo = effectiveMimeType.startsWith('video/');
  console.log(`File is determined to be a ${isVideo ? 'video' : 'image'}`);
  
  // Check premium subscription for video uploads
  if (isVideo && !isPremium) {
    console.log("Validation failed: Video upload attempted without premium subscription");
    toast("Premium Required", {
      description: "Video uploads are only available for premium users",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo, effectiveMimeType };
  }
  
  // Validate file size (max 50MB for videos, 10MB for images)
  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    console.log(`Validation failed: File too large (${file.size} bytes, max: ${maxSize} bytes)`);
    toast(isVideo ? "Video too large" : "Image too large", {
      description: isVideo 
        ? "Maximum video size is 50MB" 
        : "Maximum image size is 10MB",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo, effectiveMimeType };
  }
  
  // Define accepted file types based on detected MIME type
  const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const acceptedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  const acceptedTypes = [...acceptedImageTypes, ...acceptedVideoTypes];
  
  if (!acceptedTypes.includes(effectiveMimeType)) {
    console.log(`Validation failed: Invalid file type (${effectiveMimeType})`);
    toast("Invalid file type", {
      description: "Please upload a JPG, PNG, GIF, WebP, MP4, WebM or QuickTime file",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo, effectiveMimeType };
  }
  
  console.log("File validation passed successfully");
  return { isValid: true, isVideo, effectiveMimeType };
};
