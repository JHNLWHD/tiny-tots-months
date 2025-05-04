
import { toast } from '@/components/ui/sonner';

export interface FileValidationResult {
  isValid: boolean;
  isVideo: boolean;
}

export const validateFile = (file: File | null, isPremium: boolean): FileValidationResult => {
  if (!file) {
    return { isValid: false, isVideo: false };
  }

  // Check if file is a video
  const isVideo = file.type.startsWith('video/');
  
  // Check premium subscription for video uploads
  if (isVideo && !isPremium) {
    toast("Premium Required", {
      description: "Video uploads are only available for premium users",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo };
  }
  
  // Validate file size (max 50MB for videos, 10MB for images)
  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
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
    toast("Invalid file type", {
      description: "Please upload a JPG, PNG, GIF, WebP, MP4, WebM or QuickTime file",
      className: "bg-destructive text-destructive-foreground",
    });
    return { isValid: false, isVideo };
  }
  
  return { isValid: true, isVideo };
};
