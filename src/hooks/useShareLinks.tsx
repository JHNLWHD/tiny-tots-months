
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/sonner';

export interface ShareLink {
  id: string;
  user_id: string;
  baby_id: string | null;
  month_number: number | null;
  share_token: string;
  expires_at: string | null;
  created_at: string;
}

export type ShareType = 'baby' | 'month';

export const useShareLinks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all share links for the current user
  const { data: shareLinks = [], isLoading: loadingShareLinks } = useQuery({
    queryKey: ['shareLinks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        console.log('Fetching share links for user:', user.id);
        const { data, error } = await supabase
          .from('shared_link')
          .select('*')
          .eq('user_id', user.id)  // Make sure we're only getting the current user's links
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching share links:', error);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} share links for user`);
        return data as ShareLink[];
      } catch (error) {
        console.error('Error in shareLinks query:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get existing share link
  const getShareLink = (babyId: string | undefined, monthNumber?: number) => {
    if (!babyId || !shareLinks) return null;
    
    const link = shareLinks.find(link => 
      link.baby_id === babyId && 
      (monthNumber ? link.month_number === monthNumber : link.month_number === null)
    );
    
    console.log('Found existing link for babyId:', babyId, 'monthNumber:', monthNumber, ':', link || 'none');
    return link;
  };

  // Generate a new share link
  const generateShareLinkMutation = useMutation({
    mutationFn: async ({ babyId, type, monthNumber }: { babyId: string; type: ShareType; monthNumber?: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Check if share link already exists
      const existingLink = getShareLink(babyId, type === 'month' ? monthNumber : undefined);
      
      if (existingLink) {
        console.log('Using existing share token:', existingLink.share_token);
        return existingLink.share_token;
      }

      // Generate a new unique token
      const shareToken = uuidv4();
      console.log('Generated new share token:', shareToken);
      
      try {
        console.log('Creating new share link in database with token:', shareToken);
        // Insert the new share link
        const { data, error } = await supabase
          .from('shared_link')
          .insert({
            user_id: user.id,
            baby_id: babyId,
            month_number: type === 'month' ? monthNumber : null,
            share_token: shareToken
          })
          .select('*')
          .maybeSingle();
          
        if (error) {
          console.error('Error generating share link:', error);
          throw error;
        }
        
        if (!data) {
          console.error('Failed to create share link - no data returned');
          throw new Error('Failed to create share link');
        }
        
        console.log('Successfully created share link with ID:', data.id);
        return data.share_token;
      } catch (error) {
        console.error('Error in generateShareLinkMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shareLinks', user?.id] });
    },
    onError: (error) => {
      toast("Failed to generate share link", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  });

  // Generate a new share link (wrapper for mutation)
  const generateShareLink = async (babyId: string, type: ShareType, monthNumber?: number): Promise<string> => {
    setIsGenerating(true);
    try {
      console.log('Generating share link for babyId:', babyId, 'type:', type, 'monthNumber:', monthNumber);
      return await generateShareLinkMutation.mutateAsync({ babyId, type, monthNumber });
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete a share link
  const deleteShareLink = useMutation({
    mutationFn: async (linkId: string) => {
      try {
        console.log('Deleting share link with ID:', linkId);
        const { error } = await supabase
          .from('shared_link')
          .delete()
          .eq('id', linkId);
          
        if (error) {
          console.error('Error deleting share link:', error);
          throw error;
        }
        
        console.log('Successfully deleted share link');
      } catch (error) {
        console.error('Error in deleteShareLink:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shareLinks', user?.id] });
      toast("Link deleted", {
        description: "Share link has been deleted successfully."
      });
    },
    onError: (error) => {
      toast("Failed to delete link", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  });

  return {
    shareLinks,
    loadingShareLinks,
    isGenerating: isGenerating || generateShareLinkMutation.isPending,
    generateShareLink,
    getShareLink,
    deleteShareLink
  };
};
