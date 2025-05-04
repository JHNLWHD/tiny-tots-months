
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Baby } from '@/hooks/useBabyProfiles';
import { Photo } from '@/hooks/usePhotos';
import { Milestone } from '@/hooks/useMilestones';

export const useSharedData = (shareToken: string) => {
  // Fetch the share link details
  const { data: shareLink, isLoading: loadingShareLink } = useQuery({
    queryKey: ['shareLink', shareToken],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('shared_link')
          .select('*')
          .eq('share_token', shareToken)
          .maybeSingle(); // Using maybeSingle() instead of single()
          
        if (error) {
          console.error('Error fetching share link:', error);
          throw error;
        }
        
        if (!data) {
          console.error('Share link not found for token:', shareToken);
          return null;
        }
        
        return data;
      } catch (error) {
        console.error('Error in shareLink query:', error);
        return null;
      }
    },
    enabled: !!shareToken
  });

  // Fetch baby data based on the share link
  const { data: baby, isLoading: loadingBaby } = useQuery({
    queryKey: ['sharedBaby', shareLink?.baby_id],
    queryFn: async () => {
      try {
        if (!shareLink?.baby_id) return null;
        
        const { data, error } = await supabase
          .from('baby')
          .select('*')
          .eq('id', shareLink.baby_id)
          .maybeSingle(); // Using maybeSingle() instead of single()
          
        if (error) {
          console.error('Error fetching baby data:', error);
          throw error;
        }
        
        if (!data) {
          console.error('Baby not found for id:', shareLink.baby_id);
          return null;
        }
        
        return data as Baby;
      } catch (error) {
        console.error('Error in sharedBaby query:', error);
        return null;
      }
    },
    enabled: !!shareLink?.baby_id
  });

  // Fetch photos for the specific baby and month (if month is specified)
  const { data: photos, isLoading: loadingPhotos } = useQuery({
    queryKey: ['sharedPhotos', shareLink?.baby_id, shareLink?.month_number],
    queryFn: async () => {
      try {
        if (!shareLink?.baby_id) return [];
        
        let query = supabase
          .from('photo')
          .select('*')
          .eq('baby_id', shareLink.baby_id);
          
        if (shareLink?.month_number) {
          query = query.eq('month_number', shareLink.month_number);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching photos:', error);
          throw error;
        }
        
        // Generate signed URLs for each photo
        return await Promise.all((data || []).map(async (photo: any) => {
          try {
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
      } catch (error) {
        console.error('Error in sharedPhotos query:', error);
        return [];
      }
    },
    enabled: !!shareLink?.baby_id
  });

  // Fetch milestones for the specific baby and month (if month is specified)
  const { data: milestones, isLoading: loadingMilestones } = useQuery({
    queryKey: ['sharedMilestones', shareLink?.baby_id, shareLink?.month_number],
    queryFn: async () => {
      try {
        if (!shareLink?.baby_id) return [];
        
        let query = supabase
          .from('milestone')
          .select('*')
          .eq('baby_id', shareLink.baby_id);
          
        if (shareLink?.month_number) {
          query = query.eq('month_number', shareLink.month_number);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching milestones:', error);
          throw error;
        }
        
        return data as Milestone[];
      } catch (error) {
        console.error('Error in sharedMilestones query:', error);
        return [];
      }
    },
    enabled: !!shareLink?.baby_id
  });

  return {
    shareLink,
    baby,
    photos: photos || [],
    milestones: milestones || [],
    isLoading: loadingShareLink || loadingBaby || loadingPhotos || loadingMilestones
  };
};
