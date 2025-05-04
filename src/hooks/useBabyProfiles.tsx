// Import the analytics tracking function
import { trackEvent } from '@/lib/analytics';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export type Baby = {
  id: string;
  created_at: string;
  name: string;
  date_of_birth: string;
  gender: string;
  user_id: string | undefined;
};

type CreateBabyData = {
  name: string;
  dateOfBirth: string;
  gender: string;
};

export function useBabyProfiles() {
  const { user } = useAuth();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBabies = async () => {
      setLoading(true);
      try {
        if (user) {
          const { data, error } = await supabase
            .from('baby')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching babies:', error);
            setError(error.message);
          } else {
            setBabies(data || []);
          }
        }
      } catch (err: any) {
        console.error('Unexpected error fetching babies:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBabies();
  }, [user]);

  const refetch = () => {
    if (user) {
      supabase
        .from('baby')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error refetching babies:', error);
            setError(error.message);
          } else {
            setBabies(data || []);
          }
          setLoading(false);
        });
    }
  };
  
  const createBaby = (data: CreateBabyData, options?: { onSuccess?: () => void, onError?: (err: Error) => void }) => {
    setCreating(true);
    
    const newBaby = {
      ...data,
      user_id: user?.id,
    };
    
    supabase
      .from('baby')
      .insert([newBaby])
      .select()
      .then(({ data: newBabyData, error }) => {
        if (error) {
          console.error('Error creating baby:', error);
          setError(error.message);
          
          // Track error event
          trackEvent('baby_creation_failed', {
            error_message: error.message
          });
          
          options?.onError?.(new Error(error.message));
        } else {
          console.log('Baby created:', newBabyData);
          
          // Track successful baby creation
          trackEvent('baby_created', {
            baby_name: data.name,
            baby_gender: data.gender
          });
          
          refetch();
          options?.onSuccess?.();
        }
      })
      .finally(() => {
        setCreating(false);
      });
  };

  return {
    babies,
    loading,
    error,
    createBaby,
  };
}
