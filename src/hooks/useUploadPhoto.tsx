
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";
import { CreatePhotoData } from "@/types/photo";

export const useUploadPhoto = (babyId?: string, monthNumber?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, baby_id, month_number, description, is_video }: CreatePhotoData) => {
      if (!user) throw new Error("User not authenticated");

      // Trust the is_video parameter passed from the component
      const isVideoFile = is_video === true;

      console.log("Starting file upload process with file:", {
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
        isVideo: isVideoFile
      });

      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${baby_id}/${month_number}/${uuidv4()}.${fileExt}`;
      
      console.log(`Uploading ${isVideoFile ? 'video' : 'photo'} to path: ${fileName}`);
      
      try {
        const { error: uploadError, data: uploadResult } = await supabase.storage
          .from('baby_images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw uploadError;
        }
        
        console.log("File successfully uploaded to storage:", uploadResult);
        
        // 2. Create record in the photo table
        console.log("Creating database record for the uploaded file with isVideo:", isVideoFile);
        const { error: insertError, data: photo } = await supabase
          .from('photo')
          .insert({
            baby_id,
            user_id: user.id,
            month_number,
            storage_path: fileName,
            description: description || null,
            is_video: isVideoFile
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("Database insert error:", insertError);
          // If record creation fails, clean up the uploaded file
          await supabase.storage
            .from('baby_images')
            .remove([fileName]);
          throw insertError;
        }
        
        console.log("Database record created successfully:", photo);
        return photo;
      } catch (error) {
        console.error("Upload process failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Upload mutation completed successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['photos', babyId, monthNumber] });
      toast("Success", {
        description: "File uploaded successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error uploading file (mutation error handler):", error);
      toast("Error", {
        description: `Failed to upload file: ${error.message || "Unknown error"}`,
        className: "bg-destructive text-destructive-foreground",
      });
    },
  });

  return {
    uploadPhoto: uploadPhotoMutation.mutate,
    isUploading: uploadPhotoMutation.isPending,
  };
};
