
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";

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
  
  const fetchSubscription = async (): Promise<Subscription | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("subscription")
      .select("*")
      .eq("user_id", user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching subscription:", error);
      toast("Error", {
        description: "Failed to load subscription status",
        className: "bg-destructive text-destructive-foreground",
      });
      throw error;
    }
    
    // If no subscription exists, create a free one
    if (!data) {
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
        toast("Error", {
          description: "Failed to create subscription",
          className: "bg-destructive text-destructive-foreground",
        });
        throw createError;
      }
      
      return newSubscription;
    }
    
    return data;
  };

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
  
  const isPremium = subscription?.status === SUBSCRIPTION_STATUS.PREMIUM;
  
  const upgradeToPremium = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("subscription")
        .upsert({
          user_id: user.id,
          status: SUBSCRIPTION_STATUS.PREMIUM,
          start_date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
      toast("Success", {
        description: "Your subscription has been upgraded to Premium!",
      });
    },
    onError: (error: any) => {
      console.error("Error upgrading subscription:", error);
      toast("Error", {
        description: "Failed to upgrade subscription",
        className: "bg-destructive text-destructive-foreground",
      });
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
