
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
    
    // First, check if user already has a subscription
    const { data, error } = await supabase
      .from("subscription")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription status");
      throw error;
    }
    
    // If no subscription exists, create a free one
    if (!data) {
      console.log("No subscription found, creating a free subscription");
      const { data: newSubscription, error: createError } = await supabase
        .from("subscription")
        .insert({
          user_id: user.id,
          status: SUBSCRIPTION_STATUS.FREE
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating subscription:", createError);
        toast.error("Failed to create subscription");
        throw createError;
      }
      
      return newSubscription;
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
  });
  
  // Check if user has premium subscription
  const isPremium = subscription?.status === SUBSCRIPTION_STATUS.PREMIUM;
  
  // Mutation to upgrade to premium
  const upgradeToPremium = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Upgrading subscription to premium for user:", user.id);
      
      // Check if subscription exists first
      const { data: existingSub } = await supabase
        .from("subscription")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      // Use upsert to either update existing or create new
      const { data, error } = await supabase
        .from("subscription")
        .upsert({
          user_id: user.id,
          status: SUBSCRIPTION_STATUS.PREMIUM,
          start_date: new Date().toISOString(),
          ...(existingSub?.id ? { id: existingSub.id } : {}) // Include ID if updating
        })
        .select()
        .single();
        
      if (error) {
        console.error("Upgrade error details:", error);
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
      toast.error("Failed to upgrade subscription");
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
