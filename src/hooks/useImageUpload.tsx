
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';

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
  
  const uploadImage = async (file: File, options: UploadOptions): Promise<UploadResult | null> => {
    if (!user) {
      const authError = new Error("User not authenticated");
      setError(authError);
      options.onError?.(authError);
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
      toast("Upload Error", {
        description: "No file selected for upload",
        className: "bg-destructive text-destructive-foreground",
      });
      return null;
    }
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      const sizeError = new Error("File too large");
      setError(sizeError);
      options.onError?.(sizeError);
      toast("File too large", {
        description: "Maximum file size is 50MB",
        className: "bg-destructive text-destructive-foreground",
      });
      return null;
    }
    
    // Validate file type
    const acceptedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp', 
      'video/mp4', 
      'video/quicktime'
    ];
    
    if (!acceptedTypes.includes(file.type)) {
      const typeError = new Error("Invalid file type");
      setError(typeError);
      options.onError?.(typeError);
      toast("Invalid file type", {
        description: "Please upload a JPG, PNG, GIF, WebP, MP4 or QuickTime file",
        className: "bg-destructive text-destructive-foreground",
      });
      return null;
    }
    
    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);
      
      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${options.babyId}/${options.monthNumber}/${uuidv4()}.${fileExt}`;
      const isVideo = file.type.startsWith('video/');
      
      // Create a custom upload function that tracks progress
      const uploadWithProgress = async () => {
        // Read file as array buffer
        const arrayBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        
        // Upload file without progress tracking
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('baby_images')
          .upload(fileName, file);
          
        // Simulate progress manually
        setProgress(100);
        options.onProgress?.(100);
        
        return { uploadError, uploadData };
      };
      
      const { uploadError, uploadData } = await uploadWithProgress();

      if (uploadError) {
        throw uploadError;
      }
      
      // Create record in the photo table
      const { error: insertError, data: photo } = await supabase
        .from('photo')
        .insert({
          baby_id: options.babyId,
          user_id: user.id,
          month_number: options.monthNumber,
          storage_path: fileName,
          description: options.description || null,
          is_video: isVideo
        })
        .select()
        .single();
        
      if (insertError) {
        // If record creation fails, clean up the uploaded file
        await supabase.storage
          .from('baby_images')
          .remove([fileName]);
        throw insertError;
      }
      
      // Create a signed URL for immediate use
      const { data: signedUrlData } = await supabase.storage
        .from('baby_images')
        .createSignedUrl(fileName, 3600);
        
      const result = {
        ...photo,
        url: signedUrlData?.signedUrl
      };
      
      options.onSuccess?.(result);
      
      toast("Upload Complete", {
        description: "Your file was uploaded successfully",
      });
      
      return result;
    } catch (err) {
      console.error("Upload error:", err);
      const uploadError = err instanceof Error ? err : new Error("Upload failed");
      setError(uploadError);
      options.onError?.(uploadError);
      
      toast("Upload Error", {
        description: uploadError.message || "Failed to upload file",
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
