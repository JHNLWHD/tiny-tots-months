
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
      const { data, error } = await supabase
        .from('shared_link')
        .select('*')
        .eq('share_token', shareToken)
        .single();
        
      if (error) {
        console.error('Error fetching share link:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!shareToken
  });

  // Fetch baby data based on the share link
  const { data: baby, isLoading: loadingBaby } = useQuery({
    queryKey: ['sharedBaby', shareLink?.baby_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('baby')
        .select('*')
        .eq('id', shareLink?.baby_id)
        .single();
        
      if (error) {
        console.error('Error fetching baby data:', error);
        throw error;
      }
      
      return data as Baby;
    },
    enabled: !!shareLink?.baby_id
  });

  // Fetch photos for the specific baby and month (if month is specified)
  const { data: photos, isLoading: loadingPhotos } = useQuery({
    queryKey: ['sharedPhotos', shareLink?.baby_id, shareLink?.month_number],
    queryFn: async () => {
      let query = supabase
        .from('photo')
        .select('*')
        .eq('baby_id', shareLink?.baby_id);
        
      if (shareLink?.month_number) {
        query = query.eq('month_number', shareLink.month_number);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching photos:', error);
        throw error;
      }
      
      return data as Photo[];
    },
    enabled: !!shareLink?.baby_id
  });

  // Fetch milestones for the specific baby and month (if month is specified)
  const { data: milestones, isLoading: loadingMilestones } = useQuery({
    queryKey: ['sharedMilestones', shareLink?.baby_id, shareLink?.month_number],
    queryFn: async () => {
      let query = supabase
        .from('milestone')
        .select('*')
        .eq('baby_id', shareLink?.baby_id);
        
      if (shareLink?.month_number) {
        query = query.eq('month_number', shareLink.month_number);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }
      
      return data as Milestone[];
    },
    enabled: !!shareLink?.baby_id
  });

  return {
    shareLink,
    baby,
    photos,
    milestones,
    isLoading: loadingShareLink || loadingBaby || loadingPhotos || loadingMilestones
  };
};
