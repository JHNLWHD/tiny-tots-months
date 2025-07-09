import type { Photo } from "@/types/photo";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useBabyPhotos = (babyId: string) => {
    const fetchPhotosWithUrls = async (): Promise<Photo[]> => {
        if (!babyId) return [];

        // Fetch photo records for the baby
        const { data, error } = await supabase
            .from("photo")
            .select("*")
            .eq("baby_id", babyId)
            .order("month_number", { ascending: true });

        if (error) {
            throw error;
        }

        // Generate signed URLs for each photo so we have a `url` property available
        return await Promise.all(
            (data || []).map(async (photo) => {
                try {
                    const { data: signedUrlData, error: signedUrlError } =
                        await supabase.storage
                            .from("baby_images")
                            .createSignedUrl(photo.storage_path, 3600); // 1-hour expiry

                    if (signedUrlError) {
                        throw signedUrlError;
                    }

                    return {
                        ...photo,
                        url: signedUrlData?.signedUrl,
                    } as Photo;
                } catch (err) {
                    console.error("Failed to create signed URL for photo:", photo.id, err);
                    return photo as Photo; // Return photo without a URL if signing fails
                }
            })
        );
    };

    const {
        data: photos = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["photos", babyId],
        queryFn: fetchPhotosWithUrls,
        enabled: !!babyId,
    });

    return {
        photos,
        isLoading,
        error,
    };
};
