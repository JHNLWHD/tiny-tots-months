
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Baby } from '@/hooks/useBabyProfiles';
import { Photo } from '@/hooks/usePhotos';
import { Milestone } from '@/hooks/useMilestones';
import { useState, useEffect } from 'react';

export const useSharedData = (shareToken: string) => {
  const [notFound, setNotFound] = useState(false);

  // Log the token for debugging purposes
  useEffect(() => {
    console.log('Attempting to fetch shared data for token:', shareToken);
  }, [shareToken]);

  // Fetch the share link details
  const { data: shareLink, isLoading: loadingShareLink, error: shareLinkError } = useQuery({
    queryKey: ['shareLink', shareToken],
    queryFn: async () => {
      try {
        console.log('Fetching share link for token:', shareToken);
        const { data, error } = await supabase
          .from('shared_link')
          .select('*')
          .eq('share_token', shareToken)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching share link:', error);
          throw error;
        }
        
        if (!data) {
          console.error('Share link not found for token:', shareToken);
          setNotFound(true);
          return null;
        }
        
        console.log('Successfully found share link:', data);
        return data;
      } catch (error) {
        console.error('Error in shareLink query:', error);
        return null;
      }
    },
    enabled: !!shareToken,
    retry: false // Don't retry if the share link doesn't exist
  });

  // Fetch baby data based on the share link
  const { data: baby, isLoading: loadingBaby } = useQuery({
    queryKey: ['sharedBaby', shareLink?.baby_id],
    queryFn: async () => {
      try {
        if (!shareLink?.baby_id) return null;
        
        console.log('Fetching baby data for ID:', shareLink.baby_id);
        const { data, error } = await supabase
          .from('baby')
          .select('*')
          .eq('id', shareLink.baby_id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching baby data:', error);
          throw error;
        }
        
        if (!data) {
          console.error('Baby not found for id:', shareLink.baby_id);
          return null;
        }
        
        console.log('Successfully found baby data:', data);
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
        
        console.log('Fetching photos for baby ID:', shareLink.baby_id, 'and month:', shareLink.month_number || 'all months');
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
        const photosWithUrls = await Promise.all((data || []).map(async (photo: any) => {
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

        console.log(`Successfully fetched ${photosWithUrls.length} photos`);
        return photosWithUrls;
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
        
        console.log('Fetching milestones for baby ID:', shareLink.baby_id, 'and month:', shareLink.month_number || 'all months');
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
        
        console.log(`Successfully fetched ${data?.length || 0} milestones`);
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
    isLoading: loadingShareLink || loadingBaby || loadingPhotos || loadingMilestones,
    notFound: notFound || shareLinkError !== null,
    error: shareLinkError
  };
};
