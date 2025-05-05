
import { toast } from '@/components/ui/sonner';

export interface FileValidationResult {
  isValid: boolean;
  isVideo: boolean;
}

export const validateFile = (file: File | null, isPremium: boolean): FileValidationResult => {
  if (!file) {
    console.log("File validation failed: No file provided");
    return { isValid: false, isVideo: false };
  }

  // Safety check for file.type
  if (!file.type) {
    console.error("File validation failed: File type is undefined");
    toast("Invalid file", {
      description: "File type cannot be determined",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo: false };
  }

  // Check if file is a video
  const isVideo = file.type.startsWith('video/');
  console.log(`Validating file: ${file.name}, type: ${file.type}, size: ${file.size}, isVideo: ${isVideo}`);
  
  // Check premium subscription for video uploads
  if (isVideo && !isPremium) {
    console.log("Validation failed: Video upload attempted without premium subscription");
    toast("Premium Required", {
      description: "Video uploads are only available for premium users",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo };
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
    return { isValid: false, isVideo };
  }
  
  // Validate file type
  const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const acceptedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  const acceptedTypes = [...acceptedImageTypes, ...acceptedVideoTypes];
  
  if (!acceptedTypes.includes(file.type)) {
    console.log(`Validation failed: Invalid file type (${file.type})`);
    toast("Invalid file type", {
      description: "Please upload a JPG, PNG, GIF, WebP, MP4, WebM or QuickTime file",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo };
  }
  
  console.log("File validation passed successfully");
  return { isValid: true, isVideo };
};
