
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Photo } from "@/hooks/usePhotos";

export const useBabyPhotos = (babyId?: string) => {
  const { user } = useAuth();
  
  const fetchAllBabyPhotos = async (): Promise<Photo[]> => {
    if (!user || !babyId) return [];
    
    console.log(`Fetching photos for baby: ${babyId}`);
    
    // Fetch all photos for the baby across all months
    const { data, error } = await supabase
      .from("photo")
      .select("*")
      .eq("baby_id", babyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching baby photos:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} photos for baby ${babyId}`);
    
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

  const { 
    data: photos = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['babyPhotos', babyId],
    queryFn: fetchAllBabyPhotos,
    enabled: !!user && !!babyId,
  });

  return {
    photos,
    isLoading,
    refetch,
  };
};
