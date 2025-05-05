
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Photo } from "@/types/photo";

export const useFetchPhotos = (babyId?: string, monthNumber?: number) => {
  const { user } = useAuth();
  
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

  return {
    photos,
    isLoading,
    refetch
  };
};
