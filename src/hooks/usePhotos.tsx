import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";

export interface Photo {
  id: string;
  baby_id: string;
  user_id: string;
  month_number: number;
  storage_path: string;
  description: string | null;
  is_video: boolean;
  created_at: string;
  updated_at: string;
  url?: string; // URL for the actual image from storage
}

export interface CreatePhotoData {
  baby_id: string;
  month_number: number;
  description?: string;
  file: File;
  is_video?: boolean; // Make is_video optional with a default in the mutation
}

export const usePhotos = (babyId?: string, monthNumber?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const fetchPhotos = async (): Promise<Photo[]> => {
    if (!user || !babyId || !monthNumber) return [];
    
    // First fetch the photo records
    const { data, error } = await supabase
      .from("photo")
      .select("*")
      .eq("baby_id", babyId)
      .eq("month_number", monthNumber);

    if (error) {
      console.error("Error fetching photos:", error);
      toast("Error loading photos", {
        description: "Failed to load photo data",
        className: "bg-destructive text-destructive-foreground",
      });
      throw error;
    }
    
    // Generate signed URLs for each photo that expire after 1 hour
    return await Promise.all((data || []).map(async (photo) => {
      try {
        // Create a signed URL with a 1-hour expiry
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('baby_images')
          .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry
        
        if (signedUrlError) {
          console.error("Error generating signed URL:", signedUrlError);
          throw signedUrlError;
        }
        
        return {
          ...photo,
          url: signedUrlData?.signedUrl
        };
      } catch (err) {
        console.error("Failed to get signed URL for photo:", photo.id, err);
        return photo; // Return the photo without a URL if we fail to get a signed URL
      }
    }));
  };

  const { data: photos = [], isLoading, refetch } = useQuery({
    queryKey: ['photos', babyId, monthNumber],
    queryFn: fetchPhotos,
    enabled: !!user && !!babyId && !!monthNumber,
  });

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

  const deletePhotoMutation = useMutation({
    mutationFn: async (photo: Photo) => {
      // 1. Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('baby_images')
        .remove([photo.storage_path]);
        
      if (storageError) throw storageError;
      
      // 2. Delete the record from the database
      const { error: dbError } = await supabase
        .from('photo')
        .delete()
        .eq('id', photo.id);
        
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', babyId, monthNumber] });
      toast("Success", {
        description: "File deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting file:", error);
      toast("Error", {
        description: "Failed to delete file",
        className: "bg-destructive text-destructive-foreground",
      });
    },
  });

  return {
    photos,
    isLoading,
    refetch,
    uploadPhoto: uploadPhotoMutation.mutate,
    deletePhoto: deletePhotoMutation.mutate,
    isUploading: uploadPhotoMutation.isPending,
    isDeleting: deletePhotoMutation.isPending,
  };
};
