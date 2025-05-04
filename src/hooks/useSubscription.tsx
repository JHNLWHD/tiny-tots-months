
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const SUBSCRIPTION_STATUS = {
  FREE: "free",
  PREMIUM: "premium"
};

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Function to fetch user's subscription
  const fetchSubscription = async (): Promise<Subscription | null> => {
    if (!user) return null;
    
    console.log("Fetching subscription for user:", user.id);
    
    // First, check if user already has a subscription
    const { data, error } = await supabase
      .from("subscription")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching subscription:", error);
      throw error;
    }
    
    return data;
  };

  // Query to fetch subscription
  const { 
    data: subscription, 
    isLoading: loading, 
    refetch,
    isError
  } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: fetchSubscription,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Check if user has premium subscription
  const isPremium = subscription?.status === SUBSCRIPTION_STATUS.PREMIUM;
  
  // Mutation to upgrade to premium
  const upgradeToPremium = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Upgrading subscription to premium for user:", user.id);
      
      // Use upsert to handle both creation and update
      const { data, error } = await supabase
        .from("subscription")
        .upsert({
          user_id: user.id,
          status: SUBSCRIPTION_STATUS.PREMIUM,
          start_date: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (error) {
        console.error("Upgrade error:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
      toast.success("Your subscription has been upgraded to Premium!");
    },
    onError: (error: any) => {
      console.error("Error upgrading subscription:", error);
      toast.error(`Subscription upgrade failed: ${error.message || 'Please try again later'}`);
    },
  });

  return {
    subscription,
    loading,
    isPremium,
    upgradeToPremium: upgradeToPremium.mutate,
    isUpgrading: upgradeToPremium.isPending,
    refetch
  };
};
